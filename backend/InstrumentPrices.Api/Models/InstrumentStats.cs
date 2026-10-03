namespace InstrumentPrices.Api.Models;

/// <param name="TotalReturnPercent">(last / first − 1) × 100.</param>
/// <param name="DailyVolatilityPercent">Sample standard deviation of day-over-day returns, × 100.</param>
/// <param name="MaxDrawdownPercent">Largest peak-to-trough decline, × 100. Zero or negative (e.g. −12.5 = a 12.5% drop).</param>
public sealed record InstrumentStats(
    double TotalReturnPercent,
    double DailyVolatilityPercent,
    double MaxDrawdownPercent);
