namespace PM.Domain.Common;

public record FieldChange(string FieldName, string? OldValue, string? NewValue);
