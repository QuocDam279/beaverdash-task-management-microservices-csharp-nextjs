using System.Threading.Tasks;
using Identity.Application.Features.Auth.Queries;
using Identity.Application.Features.Auth.Commands;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Identity.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ISender _sender;

    public AuthController(ISender sender)
    {
        _sender = sender;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginQuery query)
    {
        var token = await _sender.Send(query);

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized(new { Error = "Invalid credentials." });
        }

        return Ok(new { Token = token });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginCommand command)
    {
        var response = await _sender.Send(command);

        if (response == null)
        {
            return BadRequest(new { Error = "Invalid Google ID token." });
        }

        return Ok(response);
    }
}
