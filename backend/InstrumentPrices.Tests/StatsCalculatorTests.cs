using InstrumentPrices.Api.Services;

namespace InstrumentPrices.Tests;

// Expected values were worked out by hand and cross-checked with an independent Python script
// (statistics.stdev for sample volatility), not derived from this implementation.
public class StatsCalculatorTests
{
    private const int Precision = 6;

    [Fact]
    public void TotalReturn_IsLastOverFirstMinusOne()
    {
        Assert.Equal(20.0, StatsCalculator.TotalReturnPercent(Prices(100, 110, 99, 120)), Precision);
    }

    [Fact]
    public void TotalReturn_IsNegativeWhenPriceFalls()
    {
        Assert.Equal(-25.0, StatsCalculator.TotalReturnPercent(Prices(200, 180, 150)), Precision);
    }

    [Fact]
    public void DailyVolatility_IsSampleStdDevOfDailyReturns()
    {
        // Returns: +10%, -10%, +21.2121...%; sample stdev = 15.8109...%
        Assert.Equal(15.8109043207, StatsCalculator.DailyVolatilityPercent(Prices(100, 110, 99, 120)), Precision);
    }

    [Fact]
    public void DailyVolatility_IsZeroForConstantGrowthRate()
    {
        // Prices rise steadily so stdev of raw prices is large, but every daily return is +10%.
        Assert.Equal(0.0, StatsCalculator.DailyVolatilityPercent(Prices(100, 110, 121)), Precision);
    }

    [Fact]
    public void DailyVolatility_IsZeroWhenFewerThanTwoReturns()
    {
        Assert.Equal(0.0, StatsCalculator.DailyVolatilityPercent(Prices(100, 150)), Precision);
        Assert.Equal(0.0, StatsCalculator.DailyVolatilityPercent(Prices(100)), Precision);
    }

    [Fact]
    public void MaxDrawdown_MeasuresPeakToTrough()
    {
        // Peak 110 -> trough 99 = -10%.
        Assert.Equal(-10.0, StatsCalculator.MaxDrawdownPercent(Prices(100, 110, 99, 120)), Precision);
    }

    [Fact]
    public void MaxDrawdown_UsesRunningPeakNotGlobalMaxMinusMin()
    {
        // Global min (90) comes before global max (200), so naive (min - max) / max = -55% is wrong.
        // Real drawdowns: 100 -> 90 = -10%, 200 -> 150 = -25%.
        Assert.Equal(-25.0, StatsCalculator.MaxDrawdownPercent(Prices(100, 90, 200, 150, 180)), Precision);
    }

    [Fact]
    public void MaxDrawdown_IsZeroForMonotonicallyRisingSeries()
    {
        Assert.Equal(0.0, StatsCalculator.MaxDrawdownPercent(Prices(100, 105, 110, 120)), Precision);
    }

    [Fact]
    public void SinglePrice_HasZeroStats()
    {
        var stats = StatsCalculator.Compute(Prices(100));

        Assert.Equal(0.0, stats.TotalReturnPercent, Precision);
        Assert.Equal(0.0, stats.DailyVolatilityPercent, Precision);
        Assert.Equal(0.0, stats.MaxDrawdownPercent, Precision);
    }

    [Fact]
    public void EmptySeries_Throws()
    {
        Assert.Throws<ArgumentException>(() => StatsCalculator.Compute(Prices()));
    }

    [Fact]
    public void NonPositivePrice_Throws()
    {
        Assert.Throws<ArgumentException>(() => StatsCalculator.Compute(Prices(100, 0, 110)));
    }

    private static IReadOnlyList<decimal> Prices(params decimal[] values) => values;
}
