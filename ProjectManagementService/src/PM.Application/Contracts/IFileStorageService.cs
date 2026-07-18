using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace PM.Application.Contracts;

public interface IFileStorageService
{
    /// <summary>
    /// Uploads a file to remote storage and returns the public URL.
    /// </summary>
    /// <param name="file">The file to upload.</param>
    /// <param name="folder">The folder name inside the bucket (e.g. "attachments", "project-documents", "chat-attachments").</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The public URL of the uploaded file.</returns>
    Task<string> UploadFileAsync(IFormFile file, string folder, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a file from remote storage using its public URL or relative path.
    /// </summary>
    /// <param name="fileUrl">The public URL of the file to delete.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>True if deletion succeeded, false otherwise.</returns>
    Task<bool> DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default);
}
