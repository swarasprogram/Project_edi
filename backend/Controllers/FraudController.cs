using Microsoft.AspNetCore.Mvc;
using ProjectEdi.Api.Models;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ProjectEdi.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FraudController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public FraudController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        [HttpPost("score")]
        public async Task<ActionResult<FraudResponse>> Score([FromBody] FraudRequest request)
        {
            var client = _httpClientFactory.CreateClient("FraudModelClient");

            var json = JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // send to Python FastAPI
            var response = await client.PostAsync("fraud/score", content);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Error calling fraud model service");
            }

            var responseJson = await response.Content.ReadAsStringAsync();

            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            };

            var fraudResponse = JsonSerializer.Deserialize<FraudResponse>(responseJson, options);

            if (fraudResponse == null)
            {
                return StatusCode(500, "Failed to parse fraud model response");
            }

            return Ok(fraudResponse);
        }
    }
}