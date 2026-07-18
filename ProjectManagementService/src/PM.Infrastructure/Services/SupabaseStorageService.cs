using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using PM.Application.Contracts;

namespace PM.Infrastructure.Services;

public class SupabaseStorageService : IFileStorageService
{
    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _serviceKey;
    private const string BucketName = "uploads";

    public SupabaseStorageService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL") ?? string.Empty;
        _serviceKey = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_KEY") ?? string.Empty;
    }

    public async Task<string> UploadFileAsync(IFormFile file, string folder, CancellationToken cancellationToken = default)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Tệp tải lên không hợp lệ.");

        if (string.IsNullOrEmpty(_supabaseUrl) || string.IsNullOrEmpty(_serviceKey))
            throw new InvalidOperationException("Supabase URL hoặc Service Role Key chưa được cấu hình.");

        // Generate a unique file name using Guid.CreateVersion7()
        string uniqueFileName = $"{Guid.CreateVersion7()}_{Path.GetFileName(file.FileName)}";
        string cleanedFolder = folder.Trim('/');
        string objectPath = $"{cleanedFolder}/{uniqueFileName}";

        // Construct request URL
        string requestUrl = $"{_supabaseUrl.TrimEnd('/')}/storage/v1/object/{BucketName}/{objectPath}";

        using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);
        request.Headers.Add("ApiKey", _serviceKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);

        using var stream = file.OpenReadStream();
        using var streamContent = new StreamContent(stream);
        streamContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType ?? "application/octet-stream");
        request.Content = streamContent;

        var response = await _httpClient.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            string errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Tải tệp lên Supabase Storage thất bại. Status: {response.StatusCode}, Chi tiết: {errorContent}");
        }

        // Return public URL
        return $"{_supabaseUrl.TrimEnd('/')}/storage/v1/object/public/{BucketName}/{objectPath}";
    }

    public async Task<bool> DeleteFileAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrEmpty(fileUrl))
            return false;

        if (string.IsNullOrEmpty(_supabaseUrl) || string.IsNullOrEmpty(_serviceKey))
            throw new InvalidOperationException("Supabase URL hoặc Service Role Key chưa được cấu hình.");

        // Extract relative path from public URL
        string marker = $"/{BucketName}/";
        int index = fileUrl.IndexOf(marker, StringComparison.OrdinalIgnoreCase);
        if (index == -1)
            return false;

        string objectPath = fileUrl.Substring(index + marker.Length);
        string requestUrl = $"{_supabaseUrl.TrimEnd('/')}/storage/v1/object/{BucketName}/{objectPath}";

        using var request = new HttpRequestMessage(HttpMethod.Delete, requestUrl);
        request.Headers.Add("ApiKey", _serviceKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceKey);

        var response = await _httpClient.SendAsync(request, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}
