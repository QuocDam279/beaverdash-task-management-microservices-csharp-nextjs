using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Teams.Commands;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly IMediator _mediator;

    public TeamsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTeam([FromBody] CreateTeamCommand command)
    {
        var teamId = await _mediator.Send(command);
        
        return StatusCode(201, new { Id = teamId });
    }

    [HttpPost("{id}/members")]
    public async Task<IActionResult> AddTeamMember(Guid id, [FromBody] AddTeamMemberDto request)
    {
        var command = new AddTeamMemberCommand
        {
            TeamId = id,
            UserId = request.UserId,
            RequestingUserId = request.RequestingUserId
        };

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeamById(System.Guid id, [FromQuery] System.Guid requestingUserId)
    {
        var query = new PM.Application.Features.Teams.Queries.GetTeamById.GetTeamByIdQuery(id, requestingUserId);
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound(new { Message = "Team không tồn tại." });

        return Ok(result);
    }

    [HttpPut("{id}/members/{userId}/role")]
    public async Task<IActionResult> UpdateTeamMemberRole(System.Guid id, System.Guid userId, [FromBody] UpdateTeamMemberRoleDto request)
    {
        var command = new UpdateTeamMemberRoleCommand
        {
            TeamId = id,
            TargetUserId = userId,
            NewRole = request.NewRole,
            RequestingUserId = request.RequestingUserId
        };

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}/members/{userId}")]
    public async Task<IActionResult> RemoveTeamMember(System.Guid id, System.Guid userId, [FromBody] PM.Application.Features.Teams.Commands.RemoveTeamMemberDto request)
    {
        var command = new PM.Application.Features.Teams.Commands.RemoveTeamMemberCommand
        {
            TeamId = id,
            TargetUserId = userId,
            RequestingUserId = request.RequestingUserId
        };

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateTeam(System.Guid id, [FromBody] PM.Application.Features.Teams.Commands.UpdateTeamDto request)
    {
        var command = new PM.Application.Features.Teams.Commands.UpdateTeamCommand
        {
            TeamId = id,
            Name = request.Name,
            Description = request.Description,
            RequestingUserId = request.RequestingUserId
        };

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTeam(System.Guid id, [FromBody] PM.Application.Features.Teams.Commands.DeleteTeamDto request)
    {
        var command = new PM.Application.Features.Teams.Commands.DeleteTeamCommand
        {
            TeamId = id,
            RequestingUserId = request.RequestingUserId
        };

        await _mediator.Send(command);
        return NoContent();
    }

    [HttpGet("{id}/projects")]
    public async Task<IActionResult> GetTeamProjects(System.Guid id)
    {
        var query = new PM.Application.Features.Teams.Queries.GetTeamProjects.GetTeamProjectsQuery(id);
        var result = await _mediator.Send(query);
        return Ok(result);
    }
}
