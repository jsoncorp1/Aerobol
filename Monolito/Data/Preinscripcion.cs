namespace Aerobol.Data;

public class Preinscripcion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "pending";
    public DateTime? AttendedAt { get; set; }
    public string? AttendedBy { get; set; }
    public string Datos { get; set; } = "{}";
}
