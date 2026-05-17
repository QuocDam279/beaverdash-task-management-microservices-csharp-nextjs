using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.BoardColumns.Commands;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardColumnsController : ControllerBase
{
    private readonly ISender _sender;

    public BoardColumnsController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost]
    public async Task<IActionResult> CreateBoardColumn([FromBody] CreateBoardColumnCommand command)
    {
        var columnId = await _sender.Send(command);
        return StatusCode(201, new { Id = columnId });
    }
}
