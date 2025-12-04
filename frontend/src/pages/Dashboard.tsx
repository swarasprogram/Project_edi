import { useEffect, useState } from "react";
import { Activity, Users, ShieldAlert, Cpu, ArrowRight } from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { Card, CardHeader, CardTitle } from "@/components/shared/Card";
import { fetchDashboardSummary, DashboardSummary } from "../api/dashboardApi";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardSummary();
        setSummary(data);
      } catch (err) {
        console.error("Failed to load dashboard summary", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const alertsToday = summary?.totalAlertsToday ?? 0;
  const activeCustomers = summary?.activeCustomers ?? 0;
  const systemHealth = summary?.systemHealth ?? 0;
  const aiAccuracy = summary?.aiAccuracy ?? 0;
  const flaggedToday = summary?.flaggedToday ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back to AI Banking Intelligence Suite
        </p>
        {error && (
          <p className="text-xs text-destructive mt-1">
            {error}
          </p>
        )}
      </div>

      {/* Top KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Alerts Today"
          value={
            loading
              ? "..."
              : alertsToday.toString()
          }
          icon={ShieldAlert}
          trend={{ value: -12, isPositive: false }}
          accentColor="destructive"
        />
        <KPICard
          title="Active Customers"
          value={
            loading
              ? "..."
              : activeCustomers.toLocaleString()
          }
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          accentColor="primary"
        />
        <KPICard
          title="System Health"
          value={
            loading
              ? "..."
              : `${systemHealth.toFixed(1)}%`
          }
          subtitle="All services operational"
          icon={Activity}
          accentColor="accent"
        />
        <KPICard
          title="AI Accuracy"
          value={
            loading
              ? "..."
              : `${aiAccuracy.toFixed(1)}%`
          }
          subtitle="Across all models"
          icon={Cpu}
          accentColor="accent"
        />
      </div>

      {/* Intelligence modules grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Audit & Fraud */}
        <Card className="card-banking">
          <div className="flex justify-between items-start gap-2 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Audit & Fraud Detection
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Monitor suspicious transactions and risk scores
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Flagged Today</p>
                <p className="text-lg font-semibold">
                  {loading ? "..." : flaggedToday}
                </p>
              </div>
            </div>
            <a
              href="/fraud"
              className="inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              Open <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </div>
        </Card>

        {/* Sentiment CRM */}
        <Card className="card-banking">
          <div className="flex justify-between items-start gap-2 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Sentiment Analysis CRM
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Track customer messages and sentiment insights
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Pending Messages</p>
                {/* Still static for now until you have a real NLP backend */}
                <p className="text-lg font-semibold">156</p>
              </div>
            </div>
            <a
              href="/sentiment"
              className="inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              Open <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </div>
        </Card>

        {/* Loan Prediction */}
        <Card className="card-banking">
          <div className="flex justify-between items-start gap-2 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Loan Prediction
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Predict default risk and cross-sell opportunities
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Predictions Today</p>
                {/* Static until you hook up the loan model */}
                <p className="text-lg font-semibold">89</p>
              </div>
            </div>
            <a
              href="/loan"
              className="inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              Open <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </div>
        </Card>

        {/* Chatbot */}
        <Card className="card-banking">
          <div className="flex justify-between items-start gap-2 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                AI Chatbot Assistant
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Conversational AI for banking queries
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">Queries Handled</p>
                <p className="text-lg font-semibold">1.2K</p>
              </div>
            </div>
            <a
              href="/chatbot"
              className="inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              Open <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </div>
        </Card>

        {/* Regulation NLP */}
        <Card className="card-banking">
          <div className="flex justify-between items-start gap-2 p-5">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Regulation NLP Monitor
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Compliance and regulatory risk scanning
              </p>
              <div className="mt-3">
                <p className="text-xs text-muted-foreground">High Risk Flags</p>
                <p className="text-lg font-semibold">5</p>
              </div>
            </div>
            <a
              href="/regulation"
              className="inline-flex items-center text-xs font-medium text-primary hover:underline"
            >
              Open <ArrowRight className="w-3 h-3 ml-1" />
            </a>
          </div>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Alerts</CardTitle>
            <p className="text-xs text-muted-foreground">
              Last few high-risk transactions from the fraud model
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {summary?.recentAlerts.length ?? 0} alerts
          </span>
        </CardHeader>

        <div className="divide-y">
          {(summary?.recentAlerts ?? []).map((alert) => (
            <div
              key={`${alert.transactionId}-${alert.date}`}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="chip bg-destructive/10 text-destructive border-destructive/20">
                    Fraud
                  </span>
                  <span className="text-sm font-medium">
                    {alert.message}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {alert.transactionId} · {alert.date}
                </div>
              </div>
              <span className="badge-risk-high">
                Risk {alert.riskScore}
              </span>
            </div>
          ))}

          {!loading && (summary?.recentAlerts.length ?? 0) === 0 && (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              No recent alerts from the model yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}