using System.Threading.Tasks;
using Identity.Application.Features.Users.Commands;
using Identity.Application.Features.Users.Queries.GetUserByEmail;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly ISender _sender;

    public UsersController(ISender sender)
    {
        _sender = sender;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserByEmail([FromQuery] string email)
    {
        var query = new GetUserByEmailQuery(email);
        var result = await _sender.Send(query);
        if (result == null)
        {
            return NotFound(new { Error = "User not found." });
        }
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
    {
        var userId = await _sender.Send(command);
        return StatusCode(201, new { Id = userId });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserDto request)
    {
        var command = new UpdateUserCommand(id, request.Email, request.DisplayName, request.Avatar);
        var success = await _sender.Send(command);
        if (!success)
        {
            return NotFound(new { Error = "User not found." });
        }
        return NoContent();
    }
}

public record UpdateUserDto(string Email, string DisplayName, string? Avatar);
