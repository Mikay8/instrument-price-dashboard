using InstrumentPrices.Api.Models;

namespace InstrumentPrices.Api.Services;

/// <summary>
/// Immutable in-memory store, built once at startup. Each instrument's stats are computed
/// here so requests only do a dictionary lookup, and the prices and stats endpoints share
/// the same loaded series.
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

        Tickers = _instruments.Keys.OrderBy(t => t, StringComparer.Ordinal).ToList();
    }

    public IReadOnlyList<string> Tickers { get; }

    /// <summary>Case-insensitive lookup; the returned instrument carries the canonical ticker.</summary>
    public bool TryGet(string ticker, out Instrument instrument) =>
        _instruments.TryGetValue(ticker, out instrument!);

    public static MarketDataStore LoadFromFile(string path)
    {
        using var reader = new StreamReader(path);
        return new MarketDataStore(MarketDataCsvParser.Parse(reader));
    }
}
