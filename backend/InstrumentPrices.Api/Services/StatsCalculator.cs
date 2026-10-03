using InstrumentPrices.Api.Models;

namespace InstrumentPrices.Api.Services;

/// <summary>
/// Pure functions over a date-ordered price series. All results are percentages.
/// </summary>
public static class StatsCalculator
{
    public static InstrumentStats Compute(IReadOnlyList<decimal> prices) =>
        new(TotalReturnPercent(prices), DailyVolatilityPercent(prices), MaxDrawdownPercent(prices));

    /// <summary>(last / first − 1) × 100.</summary>
    public static double TotalReturnPercent(IReadOnlyList<decimal> prices)
    {
        EnsureValid(prices);
        return (double)(prices[^1] / prices[0] - 1m) * 100;
    }

    /// <summary>
    /// Sample standard deviation (n − 1) of day-over-day simple returns, × 100.
    /// This is the volatility of returns, not of raw prices. Needs at least two returns
    /// (three prices) to be defined; returns 0 for shorter series.
    /// </summary>
    public static double DailyVolatilityPercent(IReadOnlyList<decimal> prices)
    {
        EnsureValid(prices);
        if (prices.Count < 3)
        {
            return 0;
        }

        var returns = new double[prices.Count - 1];
        for (var i = 1; i < prices.Count; i++)
        {
            returns[i - 1] = (double)(prices[i] / prices[i - 1]) - 1;
        }

        var mean = returns.Average();
        var sumSquaredDeviations = returns.Sum(r => (r - mean) * (r - mean));
        return Math.Sqrt(sumSquaredDeviations / (returns.Length - 1)) * 100;
    }

    /// <summary>
    /// Largest peak-to-trough decline, × 100, as a value ≤ 0. Tracks the running peak so the
    /// trough is always measured against a peak that came before it (unlike max − min).
    /// </summary>
    public static double MaxDrawdownPercent(IReadOnlyList<decimal> prices)
    {
        EnsureValid(prices);

        var peak = prices[0];
        var maxDrawdown = 0m;
        foreach (var price in prices)
        {
            if (price > peak)
            {
                peak = price;
            }

            var drawdown = price / peak - 1m;
            if (drawdown < maxDrawdown)
            {
                maxDrawdown = drawdown;
            }
        }

        return (double)maxDrawdown * 100;
    }

    private static void EnsureValid(IReadOnlyList<decimal> prices)
    {
        if (prices.Count == 0)
        {
            throw new ArgumentException("Price series must not be empty.", nameof(prices));
        }

        if (prices.Any(p => p <= 0))
        {
            throw new ArgumentException("Prices must be positive.", nameof(prices));
        }
    }
}
