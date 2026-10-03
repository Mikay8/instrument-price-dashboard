namespace InstrumentPrices.Api.Models;

public sealed record PriceSeriesResponse(string Ticker, IReadOnlyList<PricePoint> Prices);

public sealed record StatsResponse(
    string Ticker,
    DateOnly StartDate,
    DateOnly EndDate,
    double TotalReturnPercent,
    double DailyVolatilityPercent,
    double MaxDrawdownPercent);
