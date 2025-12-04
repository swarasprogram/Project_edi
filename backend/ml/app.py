from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np

# 👇 FastAPI app
app = FastAPI(title="Fraud Model Service")

# Load model (fraud_iforest.pkl must be in the same folder)
pipeline = joblib.load("fraud_iforest.pkl")


# ---------- Request model for single scoring ----------
class FraudRequest(BaseModel):
    amount: float
    tranction_type: str       # keep spelling to match frontend/.NET
    merchant_country: str
    payment_mode: int         # 1 - Cash, 2 - Clearing, 3 - Transfer
    time_stamp: str           # ISO string "2025-12-04T14:30:00"


def build_df(req: FraudRequest) -> pd.DataFrame:
    ts = pd.to_datetime(req.time_stamp)
    return pd.DataFrame(
        {
            "Amount": [req.amount],
            "Transaction_Type": [req.tranction_type],
            "Merchant_Country": [req.merchant_country],
            "Payment_Mode": [req.payment_mode],
            "Hour": [ts.hour],
            "DayOfWeek": [ts.dayofweek],
        }
    )


def score_to_risk(decision_score: float) -> int:
    """
    Convert a single IsolationForest decision_function score into a 0–100 risk score.
    Higher = higher fraud risk.
    """
    clipped = max(-0.5, min(0.5, decision_score))
    normalized = (0.5 - clipped) / 1.0  # 0 (safe) → 1 (risky)
    return int(normalized * 100)


@app.get("/")
def root():
    return {"status": "ok", "service": "fraud-model"}


@app.post("/fraud/score")
def fraud_score(req: FraudRequest):
    df = build_df(req)

    pred = pipeline.predict(df)[0]               # -1 anomaly, 1 normal
    decision = float(pipeline.decision_function(df)[0])

    risk_score = score_to_risk(decision)

    if risk_score >= 80:
        risk_level = "HIGH"
    elif risk_score >= 50:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    return {
        "fraud_probability": risk_score / 100.0,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "is_anomaly": bool(pred == -1),
        "raw_decision_score": decision,
    }


# ---------- helpers for bulk ----------
def score_array_to_risk(decision_scores: np.ndarray) -> np.ndarray:
    clipped = np.clip(decision_scores, -0.5, 0.5)
    normalized = (0.5 - clipped) / 1.0
    return (normalized * 100).astype(int)


def _normalize_name(s: str) -> str:
    """Lowercase + remove spaces/underscores/etc so we can match messy column names."""
    return "".join(ch.lower() for ch in str(s) if ch.isalnum())


def find_column(df: pd.DataFrame, candidates: list[str], desc: str) -> str:
    """
    Find a column whose normalized name matches any of the candidate names.
    Raises HTTPException if not found.
    """
    norm_map = {_normalize_name(c): c for c in df.columns}
    for cand in candidates:
        key = _normalize_name(cand)
        if key in norm_map:
            return norm_map[key]
    raise HTTPException(
        status_code=500,
        detail=f"Could not find {desc}. Tried {candidates}. Actual cols: {list(df.columns)}",
    )


# ---------- Bulk endpoint ----------
@app.get("/transactions")
def get_flagged_transactions():
    """
    Return a list of high-risk transactions scored by the Isolation Forest model.
    Used by the React 'Recent Flagged Transactions' table.
    """

    try:
        xls = pd.ExcelFile("Data.xlsx")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to open Data.xlsx: {e}")

    print("Sheet names in Data.xlsx:", xls.sheet_names)

    # 1) Find the sheet that looks like it has transactions
    tx_df = None
    tx_sheet = None

    for sheet in xls.sheet_names:
        tmp = xls.parse(sheet)
        cols_norm = [_normalize_name(c) for c in tmp.columns]
        # look for something like "transactionid" or the typo "tranctiontype"
        if any("transactionid" in c for c in cols_norm) or any(
            "tranctiontype" in c for c in cols_norm
        ):
            tx_df = tmp
            tx_sheet = sheet
            break

    if tx_df is None:
        # fallback: just use the last sheet, but complain loudly
        tx_sheet = xls.sheet_names[-1]
        tx_df = xls.parse(tx_sheet)
        print("WARNING: falling back to sheet:", tx_sheet)

    df = tx_df
    print("Using sheet:", tx_sheet)
    print("Columns in chosen sheet:", list(df.columns))

    # 2) Map messy column names to logical ones
    tx_col = find_column(
        df,
        ["Transaction Id", "Transaction_Id", "Txn_Id", "TransactionID"],
        "transaction id",
    )
    ts_col = find_column(
        df,
        ["Time_Stamp", "Time Stamp", "Timestamp", "TimeStamp"],
        "timestamp",
    )
    amount_col = find_column(df, ["Amount", "amount"], "amount")
    type_col = find_column(
        df, ["Transaction_Type", "Tranction Type", "Type"], "transaction type"
    )
    country_col = find_column(
        df, ["Merchant_Country", "Merchant Country ", "Country"], "merchant country"
    )
    pay_col = find_column(
        df,
        [
            "Payment_Mode",
            "Payment Mode (1- Cash, 2- Clearing ,3-Transfer)",
            "PaymentMode",
        ],
        "payment mode",
    )

    # 3) Build features
    df["Time_Stamp_std"] = pd.to_datetime(df[ts_col], errors="coerce")

    # If some timestamps are NaT, fill with a default (so model doesn't crash)
    df["Time_Stamp_std"].fillna(method="ffill", inplace=True)
    df["Time_Stamp_std"].fillna(df["Time_Stamp_std"].iloc[0], inplace=True)

    df["Hour_std"] = df["Time_Stamp_std"].dt.hour
    df["DayOfWeek_std"] = df["Time_Stamp_std"].dt.dayofweek

    X = pd.DataFrame(
        {
            "Amount": df[amount_col],
            "Transaction_Type": df[type_col],
            "Merchant_Country": df[country_col],
            "Payment_Mode": df[pay_col],
            "Hour": df["Hour_std"],
            "DayOfWeek": df["DayOfWeek_std"],
        }
    )

    # 4) Run through pipeline
    decision_scores = pipeline.decision_function(X)
    risk_scores = score_array_to_risk(decision_scores)
    df["riskScore"] = risk_scores

    # 5) Top N by risk
    TOP_N = 50
    top = df.sort_values("riskScore", ascending=False).head(TOP_N).copy()

    # 6) Map to frontend format
    results = []
    for idx, row in top.iterrows():
        tx_val = row.get(tx_col, idx)
        try:
            tx_int = int(tx_val)
            tx_id = f"TXN{tx_int:04d}"
        except Exception:
            tx_id = f"TXN{idx:04d}"

        amount = float(row[amount_col])
        risk = int(row["riskScore"])

        if risk >= 80:
            status = "Blocked"
        elif risk >= 50:
            status = "Under Review"
        else:
            status = "Cleared"

        results.append(
            {
                "id": tx_id,
                "date": row["Time_Stamp_std"].strftime("%Y-%m-%d %H:%M"),
                "customer": f"Customer {idx % 50 + 1}",
                "amount": amount,
                "channel": row[type_col],
                "riskScore": risk,
                "status": status,
            }
        )

    return results