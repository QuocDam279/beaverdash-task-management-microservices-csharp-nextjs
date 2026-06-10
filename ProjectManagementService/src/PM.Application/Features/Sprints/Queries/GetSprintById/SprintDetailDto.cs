using System;
using System.Collections.Generic;
using PM.Application.Features.Sprints.Queries.GetBacklog;

namespace PM.Application.Features.Sprints.Queries.GetSprintById;

public class SprintDetailDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string Name { get; set; } = null!;
    public string? Goal { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int TaskCount { get; set; }
    public int CompletedTaskCount { get; set; }
    public List<BacklogTaskDto> Tasks { get; set; } = new();
}
