using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using PM.Application.Contracts;

namespace PM.Infrastructure.Services;

/// <summary>
/// Client gửi Webhook sang AIAssistant Service (Python FastAPI).
/// Bọc trong try-catch để không làm sập PM Service nếu Python service chưa chạy.
/// </summary>
public class AIAssistantServiceClient : IAIAssistantServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AIAssistantServiceClient> _logger;

    public AIAssistantServiceClient(HttpClient httpClient, ILogger<AIAssistantServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task SyncProjectAsync(Guid projectId, string name, string? description, string? status)
    {
        try
        {
            var payload = new
            {
                id = projectId,
                name,
                description,
                status
            };

            var response = await _httpClient.PostAsJsonAsync("/api/v1/webhooks/projects", payload);
            response.EnsureSuccessStatusCode();
            _logger.LogInformation("Đồng bộ dự án {ProjectId} sang AIAssistant thành công.", projectId);
        }
        catch (Exception ex)
        {
            // Không throw để không ảnh hưởng logic PM Service chính
            _logger.LogWarning(ex, "Không thể đồng bộ dự án {ProjectId} sang AIAssistant Service.", projectId);
        }
    }

    public async Task SyncProjectMembersAsync(Guid projectId, List<Guid> memberUserIds)
    {
        try
        {
            var payload = new
            {
                member_user_ids = memberUserIds
            };

            var response = await _httpClient.PostAsJsonAsync($"/api/v1/webhooks/projects/{projectId}/members", payload);
            response.EnsureSuccessStatusCode();
            _logger.LogInformation("Đồng bộ {Count} thành viên dự án {ProjectId} sang AIAssistant thành công.", memberUserIds.Count, projectId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Không thể đồng bộ thành viên dự án {ProjectId} sang AIAssistant Service.", projectId);
        }
    }
}
