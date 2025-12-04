using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ProjectEdi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly HttpClient _client;

        public DashboardController(IHttpClientFactory httpClientFactory)
        {
            _client = httpClientFactory.CreateClient("FraudModelClient");
        }

        // Match Python /transactions output
        public class FraudTransactionDto
        {
            public string Id { get; set; } = string.Empty;
            public string Date { get; set; } = string.Empty;
            public string Customer { get; set; } = string.Empty;
            public double Amount { get; set; }
            public string Channel { get; set; } = string.Empty;
            public int RiskScore { get; set; }
            public string Status { get; set; } = string.Empty;
        }

        public class RecentAlertDto
        {
            public string TransactionId { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string Date { get; set; } = string.Empty;
            public int RiskScore { get; set; }
        }

        public class DashboardSummaryDto
        {
            public int TotalAlertsToday { get; set; }
            public int FlaggedToday { get; set; }
            public int ActiveCustomers { get; set; }
            public double SystemHealth { get; set; }
            public double AiAccuracy { get; set; }
            public List<RecentAlertDto> RecentAlerts { get; set; } = new();
        }

        private class ParsedTxn
        {
            public FraudTransactionDto Raw { get; set; } = default!;
            public DateTime ParsedDate { get; set; }
        }

        [HttpGet("summary")]
        public async Task<ActionResult<DashboardSummaryDto>> GetSummary()
        {
            try
            {
                // 1) Pull transactions from Python
                var response = await _client.GetAsync("transactions");
                var body = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    // Bubble up what the Python service returned
                    return StatusCode((int)response.StatusCode, body);
                }

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };

                var txns = JsonSerializer.Deserialize<List<FraudTransactionDto>>(body, options)
                           ?? new List<FraudTransactionDto>();

                var today = DateTime.UtcNow.Date;

                // Safely parse dates once and carry both raw + parsed date around
                var parsedTxns = txns.Select(t =>
                {
                    DateTime dt;
                    if (!DateTime.TryParse(t.Date, out dt))
                    {
                        // If parsing fails, just treat it as "old" so it won't count for 'today'
                        dt = today.AddYears(-10);
                    }

                    return new ParsedTxn
                    {
                        Raw = t,
                        ParsedDate = dt
                    };
                }).ToList();

                // ------------- basic metrics (you can tune thresholds) -------------

                // Alerts "today" = risk score above threshold AND date == today
                var alertsToday = parsedTxns
                    .Where(t => t.ParsedDate.Date == today && t.Raw.RiskScore >= 60)
                    .ToList();

                int totalAlertsToday = alertsToday.Count;
                int flaggedToday = totalAlertsToday;

                // Active customers in last 30 days
                int activeCustomers = parsedTxns
                    .Where(t => t.ParsedDate >= today.AddDays(-30))
                    .Select(t => t.Raw.Customer)
                    .Distinct()
                    .Count();

                // Simple demo numbers – swap to real logic later if you get more data
                double systemHealth = 99.8;
                double aiAccuracy = 94.2;

                // Recent alerts = top 3 highest-risk & most recent transactions
                var recentAlerts = parsedTxns
                    .OrderByDescending(t => t.Raw.RiskScore)
                    .ThenByDescending(t => t.ParsedDate)
                    .Take(3)
                    .Select(t => new RecentAlertDto
                    {
                        TransactionId = t.Raw.Id,
                        Date = t.ParsedDate.ToString("yyyy-MM-dd HH:mm"),
                        RiskScore = t.Raw.RiskScore,
                        Message = $"High-risk transaction detected – ₹{t.Raw.Amount:N0}"
                    })
                    .ToList();

                var dto = new DashboardSummaryDto
                {
                    TotalAlertsToday = totalAlertsToday,
                    FlaggedToday = flaggedToday,
                    ActiveCustomers = activeCustomers,
                    SystemHealth = systemHealth,
                    AiAccuracy = aiAccuracy,
                    RecentAlerts = recentAlerts
                };

                return Ok(dto);
            }
            catch (Exception ex)
            {
                // If anything blows up, at least return a 500 with some info
                return StatusCode(500, $"Error building dashboard summary: {ex.Message}");
            }
        }
    }
}