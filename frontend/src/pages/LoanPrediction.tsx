import { useState } from "react";
import {
  TrendingUp,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { loanProducts } from "@/data/mockData";

interface FormData {
  gender: string;
  maritalStatus: string;
  dependents: string;
  education: string;
  selfEmployed: string;
  applicantIncome: string;
  coapplicantIncome: string;
  loanAmount: string;
  loanTerm: string;
  creditHistory: string;
  dti: string;
  purpose: string;
  propertyArea: string;
  interestRate: string;
  installment: string;
}

interface PredictionResult {
  defaultProbability: number;
  riskBucket: "Low" | "Medium" | "High";
  recommendations: typeof loanProducts;
  factors: { factor: string; impact: string; isPositive: boolean }[];
}

export default function LoanPrediction() {
  const [formData, setFormData] = useState<FormData>({
    gender: "",
    maritalStatus: "",
    dependents: "",
    education: "",
    selfEmployed: "",
    applicantIncome: "",
    coapplicantIncome: "",
    loanAmount: "",
    loanTerm: "",
    creditHistory: "",
    dti: "",
    purpose: "",
    propertyArea: "",
    interestRate: "",
    installment: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<FormData> = {};
    if (!formData.applicantIncome) newErrors.applicantIncome = "Required";
    if (!formData.loanAmount) newErrors.loanAmount = "Required";
    if (!formData.loanTerm) newErrors.loanTerm = "Required";
    if (!formData.creditHistory) newErrors.creditHistory = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock result
    const prob = Math.floor(Math.random() * 60) + 20;
    setResult({
      defaultProbability: prob,
      riskBucket: prob > 70 ? "High" : prob > 40 ? "Medium" : "Low",
      recommendations: loanProducts.slice(0, 3),
      factors: [
        { factor: "High Debt-to-Income Ratio", impact: "+15% risk", isPositive: false },
        { factor: "Good Credit History", impact: "-10% risk", isPositive: true },
        { factor: "Stable Income", impact: "-8% risk", isPositive: true },
        { factor: "Short Loan Term", impact: "-5% risk", isPositive: true },
      ],
    });
    setIsLoading(false);
  };

  const handleReset = () => {
    setFormData({
      gender: "",
      maritalStatus: "",
      dependents: "",
      education: "",
      selfEmployed: "",
      applicantIncome: "",
      coapplicantIncome: "",
      loanAmount: "",
      loanTerm: "",
      creditHistory: "",
      dti: "",
      purpose: "",
      propertyArea: "",
      interestRate: "",
      installment: "",
    });
    setErrors({});
    setResult(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">Loan Prediction & Cross-Sell System</h1>
        <p className="text-muted-foreground mt-2">
          Predict default risk and identify best loan products for your customers
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          {/* Form Section */}
          <div className="space-y-6">
            {/* Personal Details */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                  1
                </span>
                Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange("gender", e.target.value)}
                    className="input-banking"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Marital Status</label>
                  <select
                    value={formData.maritalStatus}
                    onChange={(e) => handleChange("maritalStatus", e.target.value)}
                    className="input-banking"
                  >
                    <option value="">Select</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Dependents</label>
                  <select
                    value={formData.dependents}
                    onChange={(e) => handleChange("dependents", e.target.value)}
                    className="input-banking"
                  >
                    <option value="">Select</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3+">3+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Education</label>
                  <select
                    value={formData.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                    className="input-banking"
                  >
                    <option value="">Select</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Not Graduate">Not Graduate</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Self Employed</label>
                  <select
                    value={formData.selfEmployed}
                    onChange={(e) => handleChange("selfEmployed", e.target.value)}
                    className="input-banking"
                  >
                    <option value="">Select</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Details */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                  2
                </span>
                Financial Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Applicant Income (₹) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.applicantIncome}
                    onChange={(e) => handleChange("applicantIncome", e.target.value)}
                    placeholder="e.g., 50000"
                    className={`input-banking ${errors.applicantIncome ? "border-destructive" : ""}`}
                  />
                  {errors.applicantIncome && (
                    <p className="text-xs text-destructive mt-1">{errors.applicantIncome}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Co-Applicant Income (₹)</label>
                  <input
                    type="number"
                    value={formData.coapplicantIncome}
                    onChange={(e) => handleChange("coapplicantIncome", e.target.value)}
                    placeholder="e.g., 25000"
                    className="input-banking"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Loan Amount (₹) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.loanAmount}
                    onChange={(e) => handleChange("loanAmount", e.target.value)}
                    placeholder="e.g., 500000"
                    className={`input-banking ${errors.loanAmount ? "border-destructive" : ""}`}
                  />
                  {errors.loanAmount && (
                    <p className="text-xs text-destructive mt-1">{errors.loanAmount}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Loan Term (months) <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.loanTerm}
                    onChange={(e) => handleChange("loanTerm", e.target.value)}
                    placeholder="e.g., 360"
                    className={`input-banking ${errors.loanTerm ? "border-destructive" : ""}`}
                  />
                  {errors.loanTerm && (
                    <p className="text-xs text-destructive mt-1">{errors.loanTerm}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">
                    Credit History <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.creditHistory}
                    onChange={(e) => handleChange("creditHistory", e.target.value)}
                    className={`input-banking ${errors.creditHistory ? "border-destructive" : ""}`}
                  >
                    <option value="">Select</option>
                    <option value="1">Good (1)</option>
                    <option value="0">Bad (0)</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                  {errors.creditHistory && (
                    <p className="text-xs text-destructive mt-1">{errors.creditHistory}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Debt-to-Income Ratio (%)</label>
                  <input
                    type="number"
                    value={formData.dti}
                    onChange={(e) => handleChange("dti", e.target.value)}
                    placeholder="e.g., 35"
                    className="input-banking"
                  />
                </div>
              </div>
            </div>

            {/* Loan Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center">
                  3
                </span>
                Loan Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Purpose of Loan</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => handleChange("purpose", e.target.value)}
                    className="input-banking"
                  >
                    <option value="">Select</option>
                    <option value="Home">Home</option>
                    <option value="Car">Car</option>
                    <option value="Education">Education</option>
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Property Area</label>
                  <select
                    value={formData.propertyArea}
                    onChange={(e) => handleChange("propertyArea", e.target.value)}
                    className="input-banking"
                  >
                    <option value="">Select</option>
                    <option value="Urban">Urban</option>
                    <option value="Semi-Urban">Semi-Urban</option>
                    <option value="Rural">Rural</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => handleChange("interestRate", e.target.value)}
                    placeholder="e.g., 8.5"
                    className="input-banking"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block">Installment (₹)</label>
                  <input
                    type="number"
                    value={formData.installment}
                    onChange={(e) => handleChange("installment", e.target.value)}
                    placeholder="e.g., 15000"
                    className="input-banking"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Scoring...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Get Prediction
                  </>
                )}
              </button>
              <button onClick={handleReset} className="btn-outline">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </Card>

        {/* Results Section */}
        {result && (
          <div className="mt-6 space-y-4 animate-slide-up">
            {/* Main Result */}
            <Card className={`border-2 ${result.riskBucket === "High" ? "border-destructive/30 bg-destructive/5" : result.riskBucket === "Medium" ? "border-warning/30 bg-warning/5" : "border-success/30 bg-success/5"}`}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {result.riskBucket === "High" ? (
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-success" />
                  )}
                  <span className="text-lg font-medium text-muted-foreground">Default Probability</span>
                </div>
                <p className="text-5xl font-bold text-foreground mb-2">{result.defaultProbability}%</p>
                <Badge
                  variant={result.riskBucket === "High" ? "destructive" : result.riskBucket === "Medium" ? "warning" : "success"}
                  size="md"
                >
                  {result.riskBucket} Risk
                </Badge>

                <div className="mt-4 max-w-md mx-auto">
                  <ProgressBar
                    value={result.defaultProbability}
                    color={result.riskBucket === "High" ? "destructive" : result.riskBucket === "Medium" ? "warning" : "success"}
                    size="lg"
                  />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Recommended Products
                  </CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {result.recommendations.map((product, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-muted/50 flex items-center justify-between hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rate: {product.interestRate} • Max: {product.maxAmount}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="success">{product.acceptance}%</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Est. acceptance</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Risk Factors */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" />
                    Top Risk Factors
                  </CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  {result.factors.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${f.isPositive ? "bg-success/10" : "bg-destructive/10"}`}
                      >
                        {f.isPositive ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{f.factor}</p>
                      </div>
                      <span
                        className={`text-sm font-medium ${f.isPositive ? "text-success" : "text-destructive"}`}
                      >
                        {f.impact}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
