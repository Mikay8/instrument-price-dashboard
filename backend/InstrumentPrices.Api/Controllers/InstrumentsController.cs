using InstrumentPrices.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InstrumentPrices.Api.Controllers;

[ApiController]
[Route("api/instruments")]
public sealed class InstrumentsController : ControllerBase
{
    private readonly MarketDataStore _store;

    public InstrumentsController(MarketDataStore store) => _store = store;

    /// <summary>All tickers, sorted alphabetically.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<string>> GetInstruments() => Ok(_store.Tickers);
}
