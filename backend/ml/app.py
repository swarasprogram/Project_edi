from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from datetime import datetime
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
    # clip to [-0.5, 0.5] to avoid extreme values
    clipped = max(-0.5, min(0.5, decision_score))
    # IF: normal → higher decision score, anomalies → lower
    # we flip that logic into a "risk" score
    normalized = (0.5 - clipped) / 1.0  # 0 (safe) → 1 (risky)
    return int(normalized * 100)


# ---------- Health check ----------
@app.get("/")
def root():
    return {"status": "ok", "service": "fraud-model"}


# ---------- Single-transaction scoring (used by Live Fraud Risk Scoring card) ----------
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


# ---------- Helper for bulk scoring ----------
def score_array_to_risk(decision_scores: np.ndarray) -> np.ndarray:
    """
    Vectorized version of score_to_risk for a numpy array of decision scores.
    """
    # clip
    clipped = np.clip(decision_scores, -0.5, 0.5)
    normalized = (0.5 - clipped) / 1.0  # 0–1, higher = more risky
    return (normalized * 100).astype(int)


# ---------- Bulk endpoint: score full dataset & return flagged transactions ----------
@app.get("/transactions")
def get_flagged_transactions():
    """
    Return a list of suspicious transactions scored by the Isolation Forest model.
    Used by the React 'Recent Flagged Transactions' table.
    """

    # 1) Load raw data (first sheet of Data.xlsx)
    df = pd.read_excel("Data.xlsx")

    # Expecting columns: Transaction Id, Time_Stamp, Amount,
    #                    Transaction_Type, Merchant_Country, Payment_Mode

    # Ensure timestamp is datetime
    df["Time_Stamp"] = pd.to_datetime(df["Time_Stamp"])

    # 2) Feature engineering to match training
    df["Hour"] = df["Time_Stamp"].dt.hour
    df["DayOfWeek"] = df["Time_Stamp"].dt.dayofweek

    feature_cols = [
        "Amount",
        "Transaction_Type",
        "Merchant_Country",
        "Payment_Mode",
        "Hour",
        "DayOfWeek",
    ]
    X = df[feature_cols]

    # 3) Run through pipeline
    decision_scores = pipeline.decision_function(X)
    preds = pipeline.predict(X)  # -1 = anomaly, 1 = normal
    risk_scores = score_array_to_risk(decision_scores)

    df["riskScore"] = risk_scores
    df["is_anomaly"] = preds == -1

    # 4) Keep only suspicious ones (you can change this to return all if you want)
    flagged = df[df["is_anomaly"]].copy()

    # 5) Map to frontend row format
    results = []
    for idx, row in flagged.iterrows():
        tx_id = row.get("Transaction Id", idx)
        amount = float(row["Amount"])

        # simple status rules for demo
        risk = int(row["riskScore"])
        if risk >= 80:
            status = "Blocked"
        elif risk >= 50:
            status = "Under Review"
        else:
            status = "Cleared"

        results.append(
            {
                "id": f"TXN{int(tx_id):04d}" if pd.notnull(tx_id) else f"TXN{idx:04d}",
                "date": row["Time_Stamp"].strftime("%Y-%m-%d %H:%M"),
                "customer": f"Customer {idx % 50 + 1}",  # synthetic label for UI
                "amount": amount,
                "channel": row["Transaction_Type"],
                "riskScore": risk,
                "status": status,
            }
        )

    return results