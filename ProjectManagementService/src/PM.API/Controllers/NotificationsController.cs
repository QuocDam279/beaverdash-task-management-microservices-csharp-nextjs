using MediatR;
using Microsoft.AspNetCore.Mvc;
using PM.Application.Features.Notifications.Commands;
using PM.Application.Features.Notifications.Queries;
using System;
using System.Threading.Tasks;

namespace PM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications([FromQuery] Guid requestingUserId)
    {
        // Dùng [FromQuery] để nhận ID của người giả lập (thay cho JWT token)
        var query = new GetMyNotificationsQuery(requestingUserId);
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, [FromBody] MarkNotificationAsReadDto request)
    {
        var command = new MarkNotificationAsReadCommand
        {
            NotificationId = id,
            RequestingUserId = request.RequestingUserId
        };

        var success = await _mediator.Send(command);

        if (!success)
            return NotFound(new { Message = "Thông báo không tồn tại." });

        return NoContent();
    }
}
