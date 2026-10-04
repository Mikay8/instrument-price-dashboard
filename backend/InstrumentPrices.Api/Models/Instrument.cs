namespace InstrumentPrices.Api.Models;

/// <summary>A ticker's full price series (sorted by date) and its stats, computed once at load.</summary>
public sealed record Instrument(string Ticker, IReadOnlyList<PricePoint> Prices, InstrumentStats Stats);
