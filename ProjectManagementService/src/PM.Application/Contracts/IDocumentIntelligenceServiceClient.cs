namespace PM.Application.Contracts;

/// <summary>
/// Interface giao tiếp với DocumentIntelligence Service qua Webhook.
/// Dùng để đồng bộ dữ liệu dự án và thành viên sang Python service.
/// </summary>
public interface IDocumentIntelligenceServiceClient
{
    /// <summary>
    /// Đồng bộ thông tin dự án sang DocumentIntelligence Service.
    /// </summary>
    Task SyncProjectAsync(Guid projectId, string name, string? description, string? status);

    /// <summary>
    /// Đồng bộ danh sách thành viên của dự án sang DocumentIntelligence Service.
    /// </summary>
    Task SyncProjectMembersAsync(Guid projectId, List<Guid> memberUserIds);
}
