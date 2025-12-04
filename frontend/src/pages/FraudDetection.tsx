import { useState, useEffect } from "react";
import { scoreTransaction, FraudScoreResponse } from "../api/fraudApi";
import {
  Shield,
  AlertTriangle,
  Users,
  TrendingUp,
  Search,
  Filter,
  X,
  MapPin,
  Smartphone,
  Clock,
} from "lucide-react";
import { KPICard } from "@/components/shared/KPICard";
import { Card, CardHeader, CardTitle } from "@/components/shared/Card";
import { RiskBadge, StatusBadge } from "@/components/shared/Badge";
import {
  transactionDetails,
  riskDistribution,
  fraudAlertsOverTime,
} from "@/data/mockData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

// Type for rows coming from backend
type FraudTableRow = {
  id: string;
  date: string;
  customer: string;
  amount: number;
  channel: string;
  riskScore: number;
  status: string;
};

export default function FraudDetection() {
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("All");
  const [minRiskScore, setMinRiskScore] = useState(0);

  // 🔥 Dynamic table rows loaded from backend
  const [rows, setRows] = useState<FraudTableRow[]>([]);

  useEffect(() => {
    fetch("http://localhost:5200/api/fraud/transactions")
      .then((r) => r.json())
      .then((data) => {
        console.log("Loaded transactions:", data);
        setRows(data);
      })
      .catch((err) => console.error("Failed to load transactions", err));
  }, []);

  // Live model scoring state
  const [liveAmount, setLiveAmount] = useState(50000);
  const [liveType, setLiveType] = useState("Debit");
  const [liveCountry, setLiveCountry] = useState("India");
  const [livePaymentMode, setLivePaymentMode] = useState(3);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<FraudScoreResponse | null>(null);

  const filteredTransactions = rows.filter((txn) => {
    const matchesSearch =
      txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = channelFilter === "All" || txn.channel === channelFilter;
    const matchesRisk = txn.riskScore >= minRiskScore;
    return matchesSearch && matchesChannel && matchesRisk;
  });

  const selectedTxn = rows.find((t) => t.id === selectedTransaction);
  // still using mock details for now
  const txnDetails = selectedTransaction ? transactionDetails.TXN001 : null;

  const handleLiveScore = async () => {
    try {
      setLiveLoading(true);
      setLiveError(null);
      setLiveResult(null);

      const payload = {
        amount: liveAmount,
        tranctionType: liveType,
        merchantCountry: liveCountry,
        paymentMode: livePaymentMode,
        timeStamp: new Date().toISOString(),
      };

      const data = await scoreTransaction(payload);
      setLiveResult(data);
    } catch (err) {
      console.error(err);
      setLiveError("Failed to score transaction. Check backend services are running.");
    } finally {
      setLiveLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit & Fraud Detection</h1>
        <p className="text-muted-foreground mt-1">
          Monitor suspicious transactions and risk insights from AI models
        </p>
      </div>

      {/* KPI Cards (still using demo numbers for now) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Transactions Today"
          value="1,676"
          icon={TrendingUp}
          trend={{ value: 8.5, isPositive: true }}
          accentColor="primary"
        />
        <KPICard
          title="Flagged as Suspicious"
          value="23"
          icon={AlertTriangle}
          trend={{ value: 15, isPositive: false }}
          accentColor="destructive"
        />
        <KPICard
          title="High-Risk Clients"
          value="12"
          icon={Users}
          accentColor="warning"
        />
        <KPICard
          title="Average Risk Score"
          value="34.2"
          subtitle="Out of 100"
          icon={Shield}
          accentColor="accent"
        />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Transaction ID or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-banking pl-10"
            />
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="input-banking w-auto min-w-[140px]"
          >
            <option value="All">All Channels</option>
            <option value="UPI">UPI</option>
            <option value="NEFT">NEFT</option>
            <option value="IMPS">IMPS</option>
            <option value="Card">Card</option>
          </select>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Min Risk:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={minRiskScore}
              onChange={(e) => setMinRiskScore(Number(e.target.value))}
              className="w-24 accent-primary"
            />
            <span className="text-sm font-medium w-8">{minRiskScore}</span>
          </div>
        </div>
      </Card>

      {/* Live Model Scoring */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Live Fraud Risk Scoring</h3>
              <p className="text-xs text-muted-foreground">
                Send a sample transaction to the ML model and see its risk classification.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Amount (₹)</p>
              <input
                type="number"
                value={liveAmount}
                onChange={(e) => setLiveAmount(Number(e.target.value))}
                className="input-banking"
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Type</p>
              <select
                value={liveType}
                onChange={(e) => setLiveType(e.target.value)}
                className="input-banking"
              >
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Merchant Country</p>
              <input
                type="text"
                value={liveCountry}
                onChange={(e) => setLiveCountry(e.target.value)}
                className="input-banking"
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Payment Mode (1-Cash, 2-Clearing, 3-Transfer)
              </p>
              <input
                type="number"
                value={livePaymentMode}
                onChange={(e) => setLivePaymentMode(Number(e.target.value))}
                className="input-banking"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLiveScore}
              disabled={liveLoading}
              className="btn-primary"
            >
              {liveLoading ? "Scoring..." : "Score with AI Model"}
            </button>

            {liveError && (
              <span className="text-xs text-destructive">{liveError}</span>
            )}
          </div>

          {liveResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Risk Score</p>
                <p className="font-semibold">{liveResult.riskScore} / 100</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fraud Probability</p>
                <p className="font-semibold">
                  {(liveResult.fraudProbability * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Risk Level</p>
                <p className="font-semibold">{liveResult.riskLevel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Anomaly</p>
                <p className="font-semibold">
                  {liveResult.isAnomaly ? "Suspicious 🚨" : "Normal ✅"}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Transactions Table */}
        <div className="xl:col-span-2">
          <Card padding="none">
            <CardHeader className="p-5 border-b border-border">
              <CardTitle>Recent Flagged Transactions</CardTitle>
              <span className="text-sm text-muted-foreground">
                {filteredTransactions.length} transactions
              </span>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="table-banking">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Date & Time</th>
                    <th>Customer</th>
                    <th>Amount (₹)</th>
                    <th>Channel</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((txn) => (
                    <tr
                      key={txn.id}
                      onClick={() => setSelectedTransaction(txn.id)}
                      className={txn.id === selectedTransaction ? "bg-primary/5" : ""}
                    >
                      <td className="font-mono text-sm">{txn.id}</td>
                      <td className="text-muted-foreground">{txn.date}</td>
                      <td className="font-medium">{txn.customer}</td>
                      <td className="font-medium">₹{txn.amount.toLocaleString()}</td>
                      <td>
                        <span className="chip">{txn.channel}</span>
                      </td>
                      <td>
                        <RiskBadge score={txn.riskScore} />
                      </td>
                      <td>
                        <StatusBadge status={txn.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Charts (still using mock data) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="band" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts (Last 7 Days)</CardTitle>
            </CardHeader>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={fraudAlertsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="alerts"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--destructive))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      {/* Transaction Detail Drawer */}
      {selectedTransaction && selectedTxn && txnDetails && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-card border-l border-border shadow-elevated z-50 animate-slide-in-left overflow-y-auto">
          <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
            <h3 className="font-semibold">Transaction Details</h3>
            <button
              onClick={() => setSelectedTransaction(null)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg">{selectedTxn.id}</span>
                <RiskBadge score={selectedTxn.riskScore} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-bold text-xl">
                    ₹{selectedTxn.amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Channel</p>
                  <p className="font-medium">{selectedTxn.channel}</p>
                </div>
              </div>
            </div>

            {/* Sender/Receiver (still mock details) */}
            <Card className="bg-muted/30">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Sender</p>
                  <p className="font-medium">{txnDetails.sender}</p>
                  <p className="text-sm text-muted-foreground">
                    {txnDetails.senderAccount}
                  </p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">Receiver</p>
                  <p className="font-medium">{txnDetails.receiver}</p>
                  <p className="text-sm text-muted-foreground">
                    {txnDetails.receiverAccount}
                  </p>
                </div>
              </div>
            </Card>

            {/* Additional Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{txnDetails.geoLocation}</span>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{txnDetails.deviceInfo}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{selectedTxn.date}</span>
              </div>
            </div>

            {/* Risk Explanation */}
            <Card className="bg-destructive/5 border-destructive/20">
              <h4 className="font-medium text-destructive mb-2">Risk Explanation</h4>
              <p className="text-sm text-muted-foreground">
                {txnDetails.riskExplanation}
              </p>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button className="btn-primary w-full">
                <AlertTriangle className="w-4 h-4" />
                Mark as Fraud
              </button>
              <button className="btn-secondary w-full">Mark as Safe</button>
              <button className="btn-outline w-full">Assign to Auditor</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}