using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Aerobol.Data;

public class AerobolDbContext(DbContextOptions<AerobolDbContext> options)
    : IdentityDbContext<IdentityUser>(options)
{
    public DbSet<Preinscripcion> Preinscripciones => Set<Preinscripcion>();
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        // El futuro esquema de Aerobol queda separado de las tablas existentes.
        builder.HasDefaultSchema("aerobol");
        builder.Entity<Preinscripcion>().Property(x => x.Datos).HasColumnType("jsonb");
        builder.Entity<Preinscripcion>().Property(x => x.Status).HasMaxLength(20);
        builder.Entity<Preinscripcion>().HasIndex(x => x.CreatedAt);
        builder.Entity<Preinscripcion>().ToTable("Preinscripciones", table =>
            table.HasCheckConstraint("CK_Preinscripciones_Status", "\"Status\" IN ('pending','done')"));
    }
}
