using InstrumentPrices.Api.Json;
using InstrumentPrices.Api.Services;

const string FrontendCorsPolicy = "Frontend";

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new DateOnlyJsonConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
    options.MapType<DateOnly>(() => new() { Type = "string", Format = "date" }));

builder.Services.AddSingleton(_ =>
{
    var configuredPath = builder.Configuration["MarketData:CsvPath"]
        ?? throw new InvalidOperationException("MarketData:CsvPath is not configured.");
    var path = Path.IsPathRooted(configuredPath)
        ? configuredPath
        : Path.Combine(AppContext.BaseDirectory, configuredPath);
    return MarketDataStore.LoadFromFile(path);
});

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
              .WithMethods("GET")
              .AllowAnyHeader());
});

var app = builder.Build();

// Load the CSV now so a missing or malformed file fails startup instead of the first request.
var store = app.Services.GetRequiredService<MarketDataStore>();
app.Logger.LogInformation("Loaded {Count} instruments from market data", store.Summaries.Count);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(FrontendCorsPolicy);

app.MapControllers();

app.Run();

// Exposes the entry point to WebApplicationFactory in integration tests.
public partial class Program { }
