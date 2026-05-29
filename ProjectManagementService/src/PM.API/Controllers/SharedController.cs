using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Projects.Project.Queries.GetSharedProjectOverview;
using PM.Application.Features.Projects.Project.Queries.GetSharedProjectBoard;
using PM.Application.Features.Projects.Project.Queries.GetSharedProjectActivities;
using PM.Application.Features.Tasks.TaskItem.Queries;
using System;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/shared")]
public class SharedController : ControllerBase
{
    private readonly IMediator _mediator;

    public SharedController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("projects/{shareToken}/overview")]
    public async Task<IActionResult> GetSharedProjectOverview(string shareToken)
    {
        var query = new GetSharedProjectOverviewQuery(shareToken);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Dự án chia sẻ không tồn tại hoặc đã bị khóa." });

        return Ok(result);
    }

    [HttpGet("projects/{shareToken}/board")]
    public async Task<IActionResult> GetSharedProjectBoard(string shareToken)
    {
        var query = new GetSharedProjectBoardQuery(shareToken);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Dự án chia sẻ không tồn tại hoặc đã bị khóa." });

        return Ok(result);
    }

    [HttpGet("projects/{shareToken}/activities")]
    public async Task<IActionResult> GetSharedProjectActivities(
        string shareToken,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? date = null)
    {
        var query = new GetSharedProjectActivitiesQuery(shareToken, page, pageSize, userId, date);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("tasks/{taskId}")]
    public async Task<IActionResult> GetSharedTaskDetails(Guid taskId, [FromQuery] string shareToken)
    {
        if (string.IsNullOrEmpty(shareToken))
            return BadRequest(new { Message = "Thiếu ShareToken." });

        var query = new GetSharedTaskDetailsQuery(taskId, shareToken);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Công việc không tồn tại hoặc dự án đã bị khóa." });

        return Ok(result);
    }

    [HttpGet("projects/{shareToken}/documents")]
    public async Task<IActionResult> GetSharedProjectDocuments(string shareToken)
    {
        var overviewQuery = new GetSharedProjectOverviewQuery(shareToken);
        var overview = await _mediator.Send(overviewQuery);

        if (overview == null)
            return NotFound(new { Message = "Dự án chia sẻ không tồn tại hoặc đã bị khóa." });

        var query = new PM.Application.Features.Projects.Project.Queries.ProjectDocuments.GetProjectDocumentsQuery(overview.Id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
