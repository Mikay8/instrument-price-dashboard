using System.Globalization;
using InstrumentPrices.Api.Models;

namespace InstrumentPrices.Api.Services;

/// <summary>
/// Parses the "date,ticker,price" CSV into per-ticker series sorted by date.
/// Fails loudly on malformed input so bad data never reaches the API.
/// </summary>
public static class MarketDataCsvParser
{
    private const string ExpectedHeader = "date,ticker,price";

    public static IReadOnlyDictionary<string, IReadOnlyList<PricePoint>> Parse(TextReader reader)
    {
        var header = reader.ReadLine();
        if (header is null || !string.Equals(header.Trim(), ExpectedHeader, StringComparison.OrdinalIgnoreCase))
        {
            throw new FormatException($"Expected CSV header '{ExpectedHeader}' but found '{header}'.");
        }

        var series = new Dictionary<string, List<PricePoint>>(StringComparer.OrdinalIgnoreCase);
        var lineNumber = 1;
        string? line;
        while ((line = reader.ReadLine()) is not null)
        {
            lineNumber++;
            if (string.IsNullOrWhiteSpace(line))
            {
                continue;
            }

            var fields = line.Split(',');
            if (fields.Length != 3)
            {
                throw new FormatException($"Line {lineNumber}: expected 3 fields but found {fields.Length}.");
            }

            if (!DateOnly.TryParseExact(fields[0].Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            {
                throw new FormatException($"Line {lineNumber}: invalid date '{fields[0]}'.");
            }

            var ticker = fields[1].Trim();
            if (ticker.Length == 0)
            {
                throw new FormatException($"Line {lineNumber}: ticker is empty.");
            }

            if (!decimal.TryParse(fields[2].Trim(), NumberStyles.Number, CultureInfo.InvariantCulture, out var price) || price <= 0)
            {
                throw new FormatException($"Line {lineNumber}: invalid price '{fields[2]}'.");
            }

            if (!series.TryGetValue(ticker, out var points))
            {
                points = new List<PricePoint>();
                series[ticker] = points;
            }

            points.Add(new PricePoint(date, price));
        }

        var result = new Dictionary<string, IReadOnlyList<PricePoint>>(StringComparer.OrdinalIgnoreCase);
        foreach (var (ticker, points) in series)
        {
            var sorted = points.OrderBy(p => p.Date).ToList();
            for (var i = 1; i < sorted.Count; i++)
            {
                if (sorted[i].Date == sorted[i - 1].Date)
                {
                    throw new FormatException($"Duplicate date {sorted[i].Date:yyyy-MM-dd} for ticker '{ticker}'.");
                }
            }

            result[ticker] = sorted;
        }

        return result;
    }
}
