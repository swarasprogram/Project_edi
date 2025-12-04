import { 
  Shield, 
  MessageSquareText, 
  TrendingUp, 
  Bot, 
  FileText,
  AlertTriangle,
  Users,
  Activity,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/shared/KPICard";
import { Card, CardHeader, CardTitle } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";

const modules = [
  {
    path: "/fraud-detection",
    title: "Audit & Fraud Detection",
    description: "Monitor suspicious transactions and risk scores",
    icon: Shield,
    stats: { label: "Flagged Today", value: "23" },
    color: "primary" as const,
  },
  {
    path: "/sentiment-crm",
    title: "Sentiment Analysis CRM",
    description: "Track customer messages and sentiment insights",
    icon: MessageSquareText,
    stats: { label: "Pending Messages", value: "156" },
    color: "accent" as const,
  },
  {
    path: "/loan-prediction",
    title: "Loan Prediction",
    description: "Predict default risk and cross-sell opportunities",
    icon: TrendingUp,
    stats: { label: "Predictions Today", value: "89" },
    color: "success" as const,
  },
  {
    path: "/chatbot",
    title: "AI Chatbot Assistant",
    description: "Conversational AI for banking queries",
    icon: Bot,
    stats: { label: "Queries Handled", value: "1.2K" },
    color: "warning" as const,
  },
  {
    path: "/regulation-monitor",
    title: "Regulation NLP Monitor",
    description: "Compliance and regulatory risk scanning",
    icon: FileText,
    stats: { label: "High Risk Flags", value: "5" },
    color: "destructive" as const,
  },
];

const recentAlerts = [
  { id: 1, type: "Fraud", message: "High-risk transaction detected - ₹2.5L", time: "2 mins ago" },
  { id: 2, type: "CRM", message: "Critical complaint from premium customer", time: "15 mins ago" },
  { id: 3, type: "Regulation", message: "New RBI circular requires attention", time: "1 hour ago" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to AI Banking Intelligence Suite</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Alerts Today"
          value="47"
          icon={AlertTriangle}
          trend={{ value: 12, isPositive: false }}
          accentColor="destructive"
        />
        <KPICard
          title="Active Customers"
          value="12,847"
          icon={Users}
          trend={{ value: 5.2, isPositive: true }}
          accentColor="primary"
        />
        <KPICard
          title="System Health"
          value="99.8%"
          subtitle="All services operational"
          icon={Activity}
          accentColor="success"
        />
        <KPICard
          title="AI Accuracy"
          value="94.2%"
          subtitle="Across all models"
          icon={Bot}
          accentColor="accent"
        />
      </div>

      {/* Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Intelligence Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Link
              key={module.path}
              to={module.path}
              className="card-banking p-5 group hover:shadow-elevated transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${module.color}/10`}>
                  <module.icon className={`w-6 h-6 text-${module.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {module.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground">{module.stats.label}</span>
                      <p className="font-bold text-foreground">{module.stats.value}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <Link to="/fraud-detection" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <div className="space-y-3">
          {recentAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse-soft" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={alert.type === "Fraud" ? "destructive" : alert.type === "CRM" ? "warning" : "default"}>
                    {alert.type}
                  </Badge>
                  <span className="text-sm text-foreground truncate">{alert.message}</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{alert.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
