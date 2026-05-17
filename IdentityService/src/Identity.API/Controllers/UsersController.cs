using System.Threading.Tasks;
using Identity.Application.Features.Users.Commands;
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

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserCommand command)
    {
        var userId = await _sender.Send(command);
        return StatusCode(201, new { Id = userId });
    }
}
