using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Projects.Project.Commands;
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
    public async Task<IActionResult> GetProjectActivities(Guid id)
    {
        var query = new PM.Application.Features.Projects.Project.Queries.GetProjectActivities.GetProjectActivitiesQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
