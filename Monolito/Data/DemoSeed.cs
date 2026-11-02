using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Aerobol.Data;

// Solo corre con Aerobol__ModoDemo=true. Todos los registros son ficticios.
public static class DemoSeed
{
    private static readonly (string Nombre, string Ciudad, string Carrera, string Edad, string Horario, string Inicio, string Fuente, string Origen, bool Atendido, double Horas)[] Registros =
    [
        ("Camila Rojas Demo", "La Paz", "Piloto Privado", "19", "Tarde", "Gestión 2027", "Instagram", "instagram", false, 2),
        ("Sebastián Vargas Demo", "Santa Cruz", "Piloto Comercial", "24", "Mañana", "Lo antes posible", "Facebook", "facebook", false, 5),
        ("Valentina Flores Demo", "Cochabamba", "Tripulante de Cabina (TCP)", "21", "Tarde", "Gestión 2027", "TikTok", "tiktok", false, 9),
        ("Luciana Méndez Demo", "Sucre", "Piloto Privado", "16", "Mañana", "Gestión 2027", "Instagram", "instagram", false, 20),
        ("Mateo Gutiérrez Demo", "Tarija", "Despachador de Vuelo", "27", "Noche", "Solo estoy averiguando", "Recomendación de alguien", "directo", false, 26),
        ("Daniela Quispe Demo", "Oruro", "Técnico en Mantenimiento Aeronáutico", "22", "Tarde", "Lo antes posible", "Facebook", "facebook", false, 34),
        ("Andrés Salazar Demo", "Santa Cruz", "Aún no sé", "17", "Noche", "Solo estoy averiguando", "TikTok", "tiktok", false, 50),
        ("Paola Mamani Demo", "Potosí", "Tripulante de Cabina (TCP)", "20", "Mañana", "Gestión 2027", "Otro", "directo", false, 75),
        ("Rodrigo Céspedes Demo", "Beni", "Piloto Comercial", "30", "Tarde", "Lo antes posible", "Facebook", "facebook", true, 100),
        ("Natalia Arce Demo", "La Paz", "Despachador de Vuelo", "25", "Mañana", "Gestión 2027", "Instagram", "instagram", true, 130),
        ("Gabriel Ortiz Demo", "Pando", "Piloto Privado", "18", "Noche", "Gestión 2027", "Recomendación de alguien", "directo", true, 170),
        ("Fernanda Rivero Demo", "Fuera de Bolivia", "Piloto Comercial", "28", "Tarde", "Lo antes posible", "Otro", "directo", true, 210)
    ];

    public static async Task RunAsync(IServiceProvider services, string email, string password)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AerobolDbContext>();
        await db.Database.OpenConnectionAsync();
        await MigrationHistory.AdoptAsync(db);
        await using (var count = new NpgsqlCommand("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'aerobol'", (NpgsqlConnection)db.Database.GetDbConnection()))
        {
            var existing = (long)(await count.ExecuteScalarAsync())!;
            if (existing > 0 && !(await db.Database.GetAppliedMigrationsAsync()).Any())
                throw new InvalidOperationException("Base anterior sin historial de migraciones: el modo demo no la modifica.");
        }
        await db.Database.MigrateAsync();

        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(83941027)");
        var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        if (!await roles.RoleExistsAsync("Administrador")) Check(await roles.CreateAsync(new IdentityRole("Administrador")));
        var users = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            // Sin bloqueo: la cuenta es pública y nadie debe poder dejarla fuera de la demo.
            user = new IdentityUser { UserName = email, Email = email, EmailConfirmed = true };
            Check(await users.CreateAsync(user, password));
            Check(await users.SetLockoutEnabledAsync(user, false));
            Check(await users.AddToRoleAsync(user, "Administrador"));
        }
        else if (!await users.CheckPasswordAsync(user, password))
            Check(await users.ResetPasswordAsync(user, await users.GeneratePasswordResetTokenAsync(user), password));

        if (!await db.Preinscripciones.AnyAsync())
        {
            var now = DateTime.UtcNow;
            var phone = 70000100;
            db.Preinscripciones.AddRange(Registros.Select(r =>
            {
                var created = now.AddHours(-r.Horas);
                var datos = new Dictionary<string, string>
                {
                    ["nombre"] = r.Nombre, ["whatsapp"] = "+591 " + phone++, ["ciudad"] = r.Ciudad, ["carrera"] = r.Carrera,
                    ["inicio"] = r.Inicio, ["edad"] = r.Edad, ["bachiller"] = int.Parse(r.Edad) < 18 ? "Este año" : "Sí",
                    ["horario_contacto"] = r.Horario, ["como_nos_conocio"] = r.Fuente, ["origen"] = r.Origen, ["privacidad"] = "true"
                };
                if (r.Origen != "directo") { datos["utm_source"] = r.Origen; datos["utm_campaign"] = "demo-admision-2027"; }
                if (int.Parse(r.Edad) < 18) { datos["tutor_nombre"] = "Tutor Demo"; datos["tutor_celular"] = "+591 70000099"; }
                return new Preinscripcion
                {
                    CreatedAt = created, Status = r.Atendido ? "done" : "pending", AttendedAt = r.Atendido ? created.AddHours(3) : null,
                    AttendedBy = r.Atendido ? email : null, Datos = System.Text.Json.JsonSerializer.Serialize(datos)
                };
            }));
            await db.SaveChangesAsync();
        }
        await transaction.CommitAsync();
    }

    private static void Check(IdentityResult result)
    {
        if (!result.Succeeded) throw new InvalidOperationException("No se pudo preparar la cuenta demo: " + string.Join(", ", result.Errors.Select(error => error.Code)));
    }
}
