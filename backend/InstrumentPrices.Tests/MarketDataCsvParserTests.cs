using InstrumentPrices.Api.Services;

namespace InstrumentPrices.Tests;

public class MarketDataCsvParserTests
{
    [Fact]
    public void Parse_GroupsByTickerAndSortsByDate()
    {
        var series = Parse(
            "date,ticker,price",
            "2026-06-24,AAA,11.5",
            "2026-06-23,AAA,10",
            "2026-06-23,BBB,200.25");

        Assert.Equal(2, series.Count);
        Assert.Equal(new[] { 10m, 11.5m }, series["AAA"].Select(p => p.Price));
        Assert.Equal(new DateOnly(2026, 6, 23), series["AAA"][0].Date);
        Assert.Equal(200.25m, series["BBB"].Single().Price);
    }

    [Fact]
    public void Parse_LookupIsCaseInsensitive()
    {
        var series = Parse("date,ticker,price", "2026-06-23,AAA,10");

        Assert.True(series.ContainsKey("aaa"));
    }

    [Theory]
    [InlineData("wrong,header,here")]
    [InlineData("")]
    public void Parse_RejectsBadHeader(string header)
    {
        Assert.Throws<FormatException>(() => Parse(header, "2026-06-23,AAA,10"));
    }

    [Theory]
    [InlineData("2026-06-23,AAA")]              // missing field
    [InlineData("06/23/2026,AAA,10")]           // wrong date format
    [InlineData("2026-06-23,,10")]              // empty ticker
    [InlineData("2026-06-23,AAA,abc")]          // non-numeric price
    [InlineData("2026-06-23,AAA,-5")]           // negative price
    [InlineData("2026-06-23,AAA,0")]            // zero price
    public void Parse_RejectsMalformedRow(string row)
    {
        var ex = Assert.Throws<FormatException>(() => Parse("date,ticker,price", row));
        Assert.Contains("Line 2", ex.Message);
    }

    [Fact]
    public void Parse_RejectsDuplicateDateForTicker()
    {
        Assert.Throws<FormatException>(() => Parse(
            "date,ticker,price",
            "2026-06-23,AAA,10",
            "2026-06-23,AAA,11"));
    }

    private static IReadOnlyDictionary<string, IReadOnlyList<Api.Models.PricePoint>> Parse(params string[] lines) =>
        MarketDataCsvParser.Parse(new StringReader(string.Join("\n", lines)));
}
