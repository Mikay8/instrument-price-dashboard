using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace InstrumentPrices.Api.Json;

/// <summary>System.Text.Json on .NET 6 has no built-in DateOnly support; serialize as ISO "yyyy-MM-dd".</summary>
public sealed class DateOnlyJsonConverter : JsonConverter<DateOnly>
{
    private const string Format = "yyyy-MM-dd";

    public override DateOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options) =>
        DateOnly.ParseExact(reader.GetString()!, Format, CultureInfo.InvariantCulture);

    public override void Write(Utf8JsonWriter writer, DateOnly value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToString(Format, CultureInfo.InvariantCulture));
}
