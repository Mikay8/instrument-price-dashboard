using InstrumentPrices.Api.Models;
using InstrumentPrices.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace InstrumentPrices.Api.Controllers;

[ApiController]
[Route("api/instruments")]
public sealed class InstrumentsController : ControllerBase
{
    private readonly MarketDataStore _store;

    public InstrumentsController(MarketDataStore store) => _store = store;

    /// <summary>All instruments with last price and total return %, sorted by ticker.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<InstrumentSummary>), StatusCodes.Status200OK)]
    public ActionResult<IReadOnlyList<InstrumentSummary>> GetInstruments() => Ok(_store.Summaries);
}
