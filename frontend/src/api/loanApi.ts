// frontend/src/api/loanApi.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:5200";

export type LoanScoreRequest = {
  loanAmount: number;
  tenureMonths: number;
  applicantIncome: number;
  creditScore: number;
  existingLoans: number;
};

export type LoanScoreResponse = {
  defaultProbability: number;
  riskScore: number;
  riskLevel: string;
};

export async function scoreLoan(payload: LoanScoreRequest) {
  const res = await axios.post<LoanScoreResponse>(
    `${API_BASE_URL}/api/loan/score`,
    payload
  );
  return res.data;
}