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

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateBoardColumn(Guid id, [FromBody] UpdateBoardColumnDto request)
    {
        var command = new UpdateBoardColumnCommand
        {
            BoardColumnId = id,
            Name = request.Name,
            Position = request.Position,
            WipLimit = request.WipLimit,
            IsDone = request.IsDone
        };

        var success = await _sender.Send(command);
        if (!success)
            return NotFound(new { Message = "Cột không tồn tại." });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoardColumn(Guid id, [FromQuery] Guid? moveTasksToColumnId)
    {
        var command = new DeleteBoardColumnCommand
        {
            BoardColumnId = id,
            MoveTasksToColumnId = moveTasksToColumnId
        };

        var success = await _sender.Send(command);
        if (!success)
            return NotFound(new { Message = "Cột không tồn tại." });

        return NoContent();
    }
}
