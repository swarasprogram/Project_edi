// backend/Models/LoanScoreRequest.cs
public class LoanScoreRequest
{
    public double ApplicantIncome { get; set; }
    public double LoanAmount { get; set; }
    public int TenureMonths { get; set; }
    public int CreditScore { get; set; }
    public int ExistingLoans { get; set; }
}

public class LoanScoreResponse
{
    public double DefaultProbability { get; set; }
    public int RiskScore { get; set; }
    public string RiskLevel { get; set; } = string.Empty;
}