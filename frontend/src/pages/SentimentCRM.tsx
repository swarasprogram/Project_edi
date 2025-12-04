import { useState } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  MessageSquare,
  ChevronRight,
  UserPlus,
  ArrowUpRight,
  FileText,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle } from "@/components/shared/Card";
import { KPICard } from "@/components/shared/KPICard";
import { SentimentBadge, Badge } from "@/components/shared/Badge";
import { SentimentBars, ProgressBar } from "@/components/shared/ProgressBar";
import { crmMessages, sentimentTrend, issueDistribution, agents } from "@/data/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Sub-components for nested routing
function MessagesInbox() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [issueFilter, setIssueFilter] = useState("All");

  const filteredMessages = crmMessages.filter((msg) => {
    const matchesSearch =
      msg.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSentiment = sentimentFilter === "All" || msg.sentiment === sentimentFilter;
    const matchesIssue = issueFilter === "All" || msg.issue === issueFilter;
    return matchesSearch && matchesSentiment && matchesIssue;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters */}
      <Card className="lg:col-span-1">
        <h3 className="font-semibold mb-4">Filters</h3>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-banking pl-10 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Sentiment</label>
            <div className="flex flex-wrap gap-2">
              {["All", "Positive", "Neutral", "Negative"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSentimentFilter(s)}
                  className={cn("chip", sentimentFilter === s && "active")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Issue Type</label>
            <select
              value={issueFilter}
              onChange={(e) => setIssueFilter(e.target.value)}
              className="input-banking text-sm"
            >
              <option value="All">All Issues</option>
              <option value="Card Declined">Card Issues</option>
              <option value="Loan Query">Loan Query</option>
              <option value="UPI Failure">UPI Failure</option>
              <option value="KYC">KYC</option>
              <option value="Account Issue">Account Issue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <div className="lg:col-span-3 space-y-3">
        {filteredMessages.map((msg) => (
          <Card
            key={msg.id}
            className="cursor-pointer hover:shadow-elevated transition-all"
            padding="none"
            onClick={() => navigate(`/sentiment-crm/message/${msg.id}`)}
          >
            <div className="p-4 flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-primary">{msg.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{msg.customer}</span>
                  <SentimentBadge sentiment={msg.sentiment as "Positive" | "Neutral" | "Negative"} />
                  <Badge>{msg.issue}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{msg.preview}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Confidence:</span>
                    <div className="w-16">
                      <ProgressBar value={msg.confidence} size="sm" color="primary" />
                    </div>
                    <span className="text-xs font-medium">{msg.confidence}%</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MessageDetail() {
  const [showAssign, setShowAssign] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);

  // For demo, always show first message
  const message = crmMessages[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Message Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">{message.avatar}</span>
            </div>
            <div>
              <h3 className="font-semibold">{message.customer}</h3>
              <p className="text-sm text-muted-foreground">{message.timestamp}</p>
            </div>
          </div>
        </CardHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-foreground leading-relaxed">
              {message.fullMessage.split(" ").map((word, i) => {
                const isHighlighted = message.highlightedWords.some(
                  (hw) => word.toLowerCase().includes(hw.toLowerCase())
                );
                return (
                  <span
                    key={i}
                    className={isHighlighted ? "bg-destructive/20 text-destructive px-0.5 rounded" : ""}
                  >
                    {word}{" "}
                  </span>
                );
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge>{message.issue}</Badge>
            <Badge variant="outline">{message.subIssue}</Badge>
          </div>
        </div>
      </Card>

      {/* AI Analysis & Actions */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Predicted:</span>
              <SentimentBadge sentiment={message.sentiment as "Positive" | "Neutral" | "Negative"} />
            </div>
            <SentimentBars
              positive={message.sentimentScores.positive}
              neutral={message.sentimentScores.neutral}
              negative={message.sentimentScores.negative}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Classification</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Issue</span>
              <span className="font-medium">{message.issue}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Sub-issue</span>
              <span className="font-medium">{message.subIssue}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <div className="relative">
              <button
                onClick={() => setShowAssign(!showAssign)}
                className="btn-secondary w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Assign
                </span>
                <ChevronRight className={cn("w-4 h-4 transition-transform", showAssign && "rotate-90")} />
              </button>
              {showAssign && (
                <div className="mt-2 p-2 bg-muted rounded-lg space-y-1">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-background transition-colors text-sm"
                    >
                      <span className="font-medium">{agent.name}</span>
                      <span className="text-muted-foreground ml-2">({agent.department})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button className="btn-outline w-full justify-start">
              <ArrowUpRight className="w-4 h-4" />
              Escalate
            </button>
            <button
              onClick={() => setShowNote(!showNote)}
              className="btn-outline w-full justify-start"
            >
              <FileText className="w-4 h-4" />
              Add Note
            </button>
            {showNote && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add your note here..."
                className="input-banking text-sm min-h-[80px]"
              />
            )}
            <button className="btn-primary w-full justify-start">
              <CheckCircle className="w-4 h-4" />
              Mark as Resolved
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))", "hsl(var(--destructive))", "hsl(var(--muted-foreground))"];

  const lowConfidenceMessages = crmMessages.filter((m) => m.confidence < 90);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Messages"
          value="515"
          icon={MessageSquare}
          trend={{ value: 12, isPositive: true }}
          accentColor="primary"
        />
        <KPICard
          title="% Negative"
          value="23%"
          icon={AlertCircle}
          trend={{ value: 5, isPositive: false }}
          accentColor="destructive"
        />
        <KPICard
          title="Avg Response Time"
          value="2.4 hrs"
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
          accentColor="accent"
        />
        <KPICard
          title="Open Critical Tickets"
          value="18"
          icon={TrendingUp}
          accentColor="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="positive" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))" }} />
                <Line type="monotone" dataKey="neutral" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                <Line type="monotone" dataKey="negative" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ fill: "hsl(var(--destructive))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Positive</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Neutral</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">Negative</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issue Distribution</CardTitle>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={issueDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ issue, percentage }) => `${issue} (${percentage}%)`}
                  labelLine={false}
                >
                  {issueDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Low Confidence Messages */}
      <Card>
        <CardHeader>
          <CardTitle>Low Confidence Predictions ({"<"}90%)</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="table-banking">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Message Preview</th>
                <th>Predicted Sentiment</th>
                <th>Confidence</th>
                <th>Issue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {lowConfidenceMessages.map((msg) => (
                <tr key={msg.id}>
                  <td className="font-medium">{msg.customer}</td>
                  <td className="text-muted-foreground max-w-xs truncate">{msg.preview}</td>
                  <td>
                    <SentimentBadge sentiment={msg.sentiment as "Positive" | "Neutral" | "Negative"} />
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <ProgressBar value={msg.confidence} size="sm" color="warning" />
                      <span className="text-sm font-medium">{msg.confidence}%</span>
                    </div>
                  </td>
                  <td>
                    <Badge>{msg.issue}</Badge>
                  </td>
                  <td>
                    <button className="btn-outline text-sm py-1 px-3">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// Main CRM Component with Tabs
export default function SentimentCRM() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sentiment Analysis CRM</h1>
        <p className="text-muted-foreground mt-1">
          Track customer messages, sentiment, and take action
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          <NavLink
            to="/sentiment-crm"
            end
            className={({ isActive }) =>
              cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )
            }
          >
            Messages Inbox
          </NavLink>
          <NavLink
            to="/sentiment-crm/message/MSG001"
            className={({ isActive }) =>
              cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )
            }
          >
            Message Detail
          </NavLink>
          <NavLink
            to="/sentiment-crm/dashboard"
            className={({ isActive }) =>
              cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )
            }
          >
            Manager Dashboard
          </NavLink>
        </nav>
      </div>

      {/* Nested Routes */}
      <Routes>
        <Route index element={<MessagesInbox />} />
        <Route path="message/:id" element={<MessageDetail />} />
        <Route path="dashboard" element={<ManagerDashboard />} />
      </Routes>
    </div>
  );
}
