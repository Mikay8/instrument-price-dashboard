using InstrumentPrices.Api.Models;

namespace InstrumentPrices.Api.Services;

/// <summary>
/// Immutable in-memory store, built once at startup. Each instrument's stats and the sorted
/// summary list are computed here so requests only do a lookup, and the instruments, prices
/// and stats endpoints all share the same loaded series.
/// </summary>
public sealed class MarketDataStore
{
    private readonly Dictionary<string, Instrument> _instruments;

    public MarketDataStore(IReadOnlyDictionary<string, IReadOnlyList<PricePoint>> series)
    {
        _instruments = new Dictionary<string, Instrument>(StringComparer.OrdinalIgnoreCase);
        foreach (var (ticker, prices) in series)
        {
            var stats = StatsCalculator.Compute(prices.Select(p => p.Price).ToList());
            _instruments[ticker] = new Instrument(ticker, prices, stats);
        }

        Summaries = _instruments.Values
            .OrderBy(i => i.Ticker, StringComparer.Ordinal)
            .Select(i => new InstrumentSummary(i.Ticker, i.Prices[^1].Price, i.Stats.TotalReturnPercent))
            .ToList();
    }

    /// <summary>Every instrument's ticker, last price and total return, sorted by ticker.</summary>
    public IReadOnlyList<InstrumentSummary> Summaries { get; }

    /// <summary>Case-insensitive lookup; the returned instrument carries the canonical ticker.</summary>
    public bool TryGet(string ticker, out Instrument instrument) =>
        _instruments.TryGetValue(ticker, out instrument!);

    public static MarketDataStore LoadFromFile(string path)
    {
        using var reader = new StreamReader(path);
        return new MarketDataStore(MarketDataCsvParser.Parse(reader));
    }
}
