using System.Text.RegularExpressions;
using InstrumentPrices.Api.Models;
using InstrumentPrices.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InstrumentPrices.Api.Controllers;

[ApiController]
[Route("api/prices/{ticker}")]
public sealed class PricesController : ControllerBase
{
    // Letters, digits, '.' and '-' (e.g. BRK.B, RDS-A); anything else is rejected before lookup.
    private static readonly Regex TickerPattern = new("^[A-Za-z0-9.-]{1,16}$", RegexOptions.Compiled);

    private readonly MarketDataStore _store;

    public PricesController(MarketDataStore store) => _store = store;

    /// <summary>The ticker's full price series, oldest first.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(PriceSeriesResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<PriceSeriesResponse> GetPrices(string ticker)
    {
        if (!TryResolve(ticker, out var instrument, out var error))
        {
            return error;
        }

        return new PriceSeriesResponse(instrument.Ticker, instrument.Prices);
    }

    /// <summary>Total return %, daily volatility % and max drawdown % over the full series.</summary>
    [HttpGet("stats")]
    [ProducesResponseType(typeof(StatsResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public ActionResult<StatsResponse> GetStats(string ticker)
    {
        if (!TryResolve(ticker, out var instrument, out var error))
        {
            return error;
        }

        var stats = instrument.Stats;
        return new StatsResponse(
            instrument.Ticker,
            instrument.Prices[0].Date,
            instrument.Prices[^1].Date,
            stats.TotalReturnPercent,
            stats.DailyVolatilityPercent,
            stats.MaxDrawdownPercent);
    }

    private bool TryResolve(string ticker, out Instrument instrument, out ActionResult error)
    {
        instrument = null!;
        error = null!;

        if (string.IsNullOrWhiteSpace(ticker) || !TickerPattern.IsMatch(ticker))
        {
            error = Problem(
                statusCode: StatusCodes.Status400BadRequest,
                title: "Invalid ticker",
                detail: "Ticker must be 1-16 characters: letters, digits, '.' or '-'.");
            return false;
        }

        if (!_store.TryGet(ticker, out instrument))
        {
            error = Problem(
                statusCode: StatusCodes.Status404NotFound,
                title: "Unknown ticker",
                detail: $"No price data for ticker '{ticker}'.");
            return false;
        }

        return true;
    }
}
