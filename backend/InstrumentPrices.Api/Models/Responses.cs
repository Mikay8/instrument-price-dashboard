namespace InstrumentPrices.Api.Models;

public sealed record PriceSeriesResponse(string Ticker, IReadOnlyList<PricePoint> Prices);

public sealed record StatsResponse(
    string Ticker,
    DateOnly StartDate,
    DateOnly EndDate,
    double TotalReturnPercent,
    double DailyVolatilityPercent,
    double MaxDrawdownPercent);

/// <summary>One row of the instrument list: enough to fill the sidebar without loading every series.</summary>
public sealed record InstrumentSummary(string Ticker, decimal LastPrice, double TotalReturnPercent);
