import axios from "axios";

const API_BASE_URL = "http://localhost:5200"; // your .NET backend port

export type FraudScoreRequest = {
  amount: number;
  tranctionType: string;
  merchantCountry: string;
  paymentMode: number;
  timeStamp: string;
};

export type FraudScoreResponse = {
  fraudProbability: number;
  riskScore: number;
  riskLevel: string;
  isAnomaly: boolean;
  rawDecisionScore: number;
};

export async function scoreTransaction(payload: FraudScoreRequest) {
  const res = await axios.post(`${API_BASE_URL}/api/fraud/score`, payload);

  const raw = res.data as any;

  // Handle both snake_case (from Python) and camelCase (if .NET transforms)
  const mapped: FraudScoreResponse = {
    fraudProbability:
      raw.fraudProbability ?? raw.fraud_probability ?? 0,
    riskScore:
      raw.riskScore ?? raw.risk_score ?? 0,
    riskLevel:
      raw.riskLevel ?? raw.risk_level ?? "UNKNOWN",
    isAnomaly:
      raw.isAnomaly ?? raw.is_anomaly ?? false,
    rawDecisionScore:
      raw.rawDecisionScore ?? raw.raw_decision_score ?? 0,
  };

  return mapped;
}