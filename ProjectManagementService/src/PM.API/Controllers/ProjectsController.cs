using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Projects.Project.Commands;
using PM.Domain.Enums;
using System;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProjectsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyProjects()
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetMyProjects.GetMyProjectsQuery();
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectCommand command)

    {
        var projectId = await _mediator.Send(command);
        return StatusCode(201, new { Id = projectId });
    }

    [HttpGet("{id}/board")]
    public async Task<IActionResult> GetProjectBoard(Guid id)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectBoard.GetProjectBoardQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Project not found." });

        return Ok(result);
    }

    [HttpGet("{id}/activities")]
    public async Task<IActionResult> GetProjectActivities(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectActivities.GetProjectActivitiesQuery(id, page, pageSize);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("{id}/overview")]
    public async Task<IActionResult> GetProjectOverview(Guid id)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectOverview.GetProjectOverviewQuery(id);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Dự án không tồn tại." });

        return Ok(result);
    }

    [HttpPatch("{id}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectDto request)
    {
        ProjectStatus? statusEnum = null;
        if (!string.IsNullOrEmpty(request.Status))
        {
            if (Enum.TryParse<ProjectStatus>(request.Status, true, out var parsedStatus))
            {
                statusEnum = parsedStatus;
            }
            else
            {
                return BadRequest(new { Message = $"Trạng thái '{request.Status}' không hợp lệ." });
            }
        }

        var command = new UpdateProjectCommand
        {
            ProjectId = id,
            Name = request.Name,
            Description = request.Description,
            Status = statusEnum,
            Progress = request.Progress,
            StartDate = request.StartDate,
            DueDate = request.DueDate
        };

        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Dự án không tồn tại." });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var command = new DeleteProjectCommand { ProjectId = id };
        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Dự án không tồn tại." });

        return NoContent();
    }
}
