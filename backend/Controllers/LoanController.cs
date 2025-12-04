// backend/Controllers/LoanController.cs
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;

[ApiController]
[Route("api/[controller]")]
public class LoanController : ControllerBase
{
    private readonly HttpClient _client;

    public LoanController(IHttpClientFactory httpClientFactory)
    {
        _client = httpClientFactory.CreateClient("FraudModelClient");
        // FraudModelClient should be configured to point to http://localhost:5050
    }

    [HttpPost("score")]
    public async Task<ActionResult<LoanScoreResponse>> Score([FromBody] LoanScoreRequest req)
    {
        // Forward to Python
        var pyResponse = await _client.PostAsJsonAsync("loan/score", new
        {
            applicantIncome = req.ApplicantIncome,
            loanAmount = req.LoanAmount,
            tenureMonths = req.TenureMonths,
            creditScore = req.CreditScore,
            existingLoans = req.ExistingLoans
        });

        var body = await pyResponse.Content.ReadAsStringAsync();

        if (!pyResponse.IsSuccessStatusCode)
        {
            return StatusCode((int)pyResponse.StatusCode, body);
        }

        var dto = System.Text.Json.JsonSerializer.Deserialize<LoanScoreResponse>(
            body,
            new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true }
        );

        if (dto == null) return StatusCode(500, "Invalid response from ML service");

        return Ok(dto);
    }
}