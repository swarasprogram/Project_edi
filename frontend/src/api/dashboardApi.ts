import axios from "axios";

const API_BASE_URL = "http://localhost:5200"; // .NET backend

export type RecentAlert = {
  transactionId: string;
  message: string;
  date: string;
  riskScore: number;
};

export type DashboardSummary = {
  totalAlertsToday: number;
  flaggedToday: number;
  activeCustomers: number;
  systemHealth: number;
  aiAccuracy: number;
  recentAlerts: RecentAlert[];
};

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await axios.get<DashboardSummary>(
    `${API_BASE_URL}/api/dashboard/summary`
  );
  return res.data;
}