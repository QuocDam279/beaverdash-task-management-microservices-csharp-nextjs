using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Search.Queries;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly IMediator _mediator;

    public SearchController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        var query = new GlobalSearchQuery(q);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
