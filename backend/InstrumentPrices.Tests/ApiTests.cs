using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace InstrumentPrices.Tests;

/// <summary>End-to-end tests against the real market_data.csv.</summary>
public class ApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiTests(WebApplicationFactory<Program> factory) => _client = factory.CreateClient();

    [Fact]
    public async Task Instruments_Returns200SortedTickers()
    {
        var tickers = await GetJson<string[]>("/api/instruments");

        Assert.Equal(200, tickers.Length);
        Assert.Equal("TICK0001", tickers[0]);
        Assert.Equal("TICK0200", tickers[^1]);
        Assert.Equal(tickers.OrderBy(t => t, StringComparer.Ordinal), tickers);
    }

    [Fact]
    public async Task Prices_ReturnsFull30DaySeriesOldestFirst()
    {
        using var doc = await GetJson<JsonDocument>("/api/prices/TICK0001");
        var root = doc.RootElement;
        var prices = root.GetProperty("prices");

        Assert.Equal("TICK0001", root.GetProperty("ticker").GetString());
        Assert.Equal(30, prices.GetArrayLength());
        Assert.Equal("2026-06-23", prices[0].GetProperty("date").GetString());
        Assert.Equal(190.34m, prices[0].GetProperty("price").GetDecimal());
        Assert.Equal("2026-08-03", prices[29].GetProperty("date").GetString());
        Assert.Equal(172.89m, prices[29].GetProperty("price").GetDecimal());
    }

    [Fact]
    public async Task Prices_LookupIsCaseInsensitiveAndReturnsCanonicalTicker()
    {
        using var doc = await GetJson<JsonDocument>("/api/prices/tick0001");

        Assert.Equal("TICK0001", doc.RootElement.GetProperty("ticker").GetString());
    }

    [Fact]
    public async Task Stats_MatchIndependentlyComputedValues()
    {
        // Reference values computed from the CSV with a separate Python script.
        using var doc = await GetJson<JsonDocument>("/api/prices/TICK0001/stats");
        var root = doc.RootElement;

        Assert.Equal("TICK0001", root.GetProperty("ticker").GetString());
        Assert.Equal("2026-06-23", root.GetProperty("startDate").GetString());
        Assert.Equal("2026-08-03", root.GetProperty("endDate").GetString());
        Assert.Equal(-9.1678049806, root.GetProperty("totalReturnPercent").GetDouble(), 6);
        Assert.Equal(1.5231653846, root.GetProperty("dailyVolatilityPercent").GetDouble(), 6);
        Assert.Equal(-13.3849387399, root.GetProperty("maxDrawdownPercent").GetDouble(), 6);
    }

    [Theory]
    [InlineData("/api/prices/NOPE")]
    [InlineData("/api/prices/NOPE/stats")]
    public async Task UnknownTicker_Returns404ProblemDetails(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData("/api/prices/%20")]
    [InlineData("/api/prices/TICK%3B0001")]
    [InlineData("/api/prices/TICK%3B0001/stats")]
    [InlineData("/api/prices/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")]
    public async Task MalformedTicker_Returns400ProblemDetails(string url)
    {
        var response = await _client.GetAsync(url);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    private async Task<T> GetJson<T>(string url)
    {
        var response = await _client.GetAsync(url);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStreamAsync();
        return (await JsonSerializer.DeserializeAsync<T>(body))!;
    }
}
