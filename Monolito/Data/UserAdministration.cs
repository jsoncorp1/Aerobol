using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Aerobol.Data;

public static class UserAdministration
{
    public static readonly string[] Roles = ["Administrador", "Vendedor"];
    public static bool AllowedRole(string? role) => Roles.Contains(role);
    public static bool MustKeepAdministrator(string currentRole, string? nextRole, int administratorCount)
        => currentRole == "Administrador" && nextRole != "Administrador" && administratorCount <= 1;

    public static void MapUserAdministration(this WebApplication app)
    {
        var group = app.MapGroup("/api/usuarios").RequireAuthorization(p => p.RequireRole("Administrador"));
        group.AddEndpointFilter(async (invocation, next) =>
        {
            var context = invocation.HttpContext;
            if (!HttpMethods.IsGet(context.Request.Method))
            {
                try { await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context); }
                catch (AntiforgeryValidationException) { return Results.BadRequest(new { message = "Recarga la página antes de continuar." }); }
            }
            return await next(invocation);
        });
        group.MapGet("", async (HttpContext context, UserManager<IdentityUser> users, AerobolDbContext db) =>
        {
            if (!int.TryParse(context.Request.Query["page"].FirstOrDefault() ?? "1", out var page) || page < 1 || page > 100000)
                return Results.BadRequest(new { message = "Página no válida." });
            var search = context.Request.Query["q"].ToString().Trim();
            if (search.Length > 120) return Results.BadRequest(new { message = "Búsqueda demasiado extensa." });
            var roleFilter = context.Request.Query["role"].ToString();
            if (roleFilter != "" && !AllowedRole(roleFilter)) return Results.BadRequest(new { message = "Rol no válido." });
            var summary = new {
                total = await users.Users.CountAsync(),
                administrators = await (from ur in db.UserRoles join role in db.Roles on ur.RoleId equals role.Id where role.Name == "Administrador" select ur.UserId).Distinct().CountAsync(),
                sellers = await (from ur in db.UserRoles join role in db.Roles on ur.RoleId equals role.Id where role.Name == "Vendedor" select ur.UserId).Distinct().CountAsync()
            };
            var query = users.Users.AsNoTracking();
            if (roleFilter != "") query = query.Where(u => db.UserRoles.Any(ur => ur.UserId == u.Id && db.Roles.Any(r => r.Id == ur.RoleId && r.Name == roleFilter)));
            if (search != "") { var normalized = users.NormalizeEmail(search); query = query.Where(u => u.NormalizedEmail != null && u.NormalizedEmail.Contains(normalized!)); }
            var total = await query.CountAsync();
            var rows = await query.OrderBy(u => u.Email).ThenBy(u => u.Id).Skip((page-1)*20).Take(20)
                .Select(u => new { u.Id, u.Email }).ToListAsync();
            var ids = rows.Select(u => u.Id).ToList();
            var roles = await (from ur in db.UserRoles join role in db.Roles on ur.RoleId equals role.Id where ids.Contains(ur.UserId) select new { ur.UserId, role.Name }).ToListAsync();
            return Results.Ok(new { total, summary, page, pageSize = 20, currentUserId = users.GetUserId(context.User), items = rows.Select(u => new { u.Id, u.Email, roles = roles.Where(r => r.UserId == u.Id).Select(r => r.Name).ToArray() }) });
        });
        group.MapPost("", async (UserCreate request, UserManager<IdentityUser> users, RoleManager<IdentityRole> roles, AerobolDbContext db) =>
        {
            if (!AllowedRole(request.Role) || string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254 || string.IsNullOrEmpty(request.Password) || request.Password.Length > 256)
                return Results.BadRequest(new { message = "Revisa el correo, rol y contraseña." });
            await using var tx = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(81207131)");
            if (!await roles.RoleExistsAsync(request.Role))
            {
                var createdRole = await roles.CreateAsync(new IdentityRole(request.Role));
                if (!createdRole.Succeeded) return Failure(createdRole);
            }
            var user = new IdentityUser { UserName = request.Email.Trim(), Email = request.Email.Trim() };
            var result = await users.CreateAsync(user, request.Password);
            if (!result.Succeeded) return Failure(result);
            result = await users.AddToRoleAsync(user, request.Role);
            if (!result.Succeeded) return Failure(result);
            await tx.CommitAsync();
            return Results.Created("/api/usuarios/" + user.Id, new { user.Id, user.Email });
        });
        group.MapPut("/{id}", async (string id, UserEdit request, HttpContext context, UserManager<IdentityUser> users, RoleManager<IdentityRole> roles, AerobolDbContext db) =>
        {
            if (!AllowedRole(request.Role) || string.IsNullOrWhiteSpace(request.Email) || request.Email.Length > 254)
                return Results.BadRequest(new { message = "Revisa el correo y el rol." });
            await using var tx = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(81207131)");
            var user = await users.FindByIdAsync(id);
            if (user is null) return Results.NotFound();
            var previous = await users.GetRolesAsync(user);
            if (id == users.GetUserId(context.User) && request.Role != "Administrador")
                return Results.BadRequest(new { message = "No puedes quitarte tu propio acceso de administrador." });
            if (MustKeepAdministrator(previous.Contains("Administrador") ? "Administrador" : "Vendedor", request.Role, (await users.GetUsersInRoleAsync("Administrador")).Count))
                return Results.BadRequest(new { message = "Debe permanecer al menos un administrador." });
            if (previous.Any(role => !AllowedRole(role))) return Results.BadRequest(new { message = "Esta cuenta tiene permisos especiales y no se puede modificar desde esta pantalla." });
            if (!await roles.RoleExistsAsync(request.Role))
            {
                var rr = await roles.CreateAsync(new IdentityRole(request.Role)); if (!rr.Succeeded) return Failure(rr);
            }
            user.Email = request.Email.Trim(); user.UserName = user.Email; user.EmailConfirmed = false;
            var result = await users.UpdateAsync(user); if (!result.Succeeded) return Failure(result);
            var remove = previous.Where(role => role != request.Role).ToArray();
            if (remove.Length > 0) { result = await users.RemoveFromRolesAsync(user, remove); if (!result.Succeeded) return Failure(result); }
            if (!previous.Contains(request.Role)) { result = await users.AddToRoleAsync(user, request.Role); if (!result.Succeeded) return Failure(result); }
            result = await users.UpdateSecurityStampAsync(user); if (!result.Succeeded) return Failure(result);
            await tx.CommitAsync();
            return Results.Ok(new { user.Id, user.Email, reauthenticate = id == users.GetUserId(context.User) });
        });
        group.MapDelete("/{id}", async (string id, HttpContext context, UserManager<IdentityUser> users, AerobolDbContext db) =>
        {
            if (id == users.GetUserId(context.User)) return Results.BadRequest(new { message = "No puedes eliminar tu propia cuenta." });
            await using var tx = await db.Database.BeginTransactionAsync();
            await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(81207131)");
            var user = await users.FindByIdAsync(id); if (user is null) return Results.NotFound();
            var userRoles = await users.GetRolesAsync(user);
            if (userRoles.Any(role => !AllowedRole(role))) return Results.BadRequest(new { message = "Cuenta con permisos especiales; requiere revisión administrativa." });
            var count = (await users.GetUsersInRoleAsync("Administrador")).Count;
            if (MustKeepAdministrator(userRoles.Contains("Administrador") ? "Administrador" : "Vendedor", null, count))
                return Results.BadRequest(new { message = "No puedes eliminar al último administrador." });
            var result = await users.DeleteAsync(user); if (!result.Succeeded) return Failure(result);
            await tx.CommitAsync(); return Results.NoContent();
        });
    }
    private static IResult Failure(IdentityResult result) => Results.BadRequest(new { message = "No se pudo guardar la cuenta. Revisa los datos.", errors = result.Errors.Select(e => e.Code switch
    {
        "DuplicateEmail" or "DuplicateUserName" => "Ya existe una cuenta con ese correo.",
        "InvalidEmail" or "InvalidUserName" => "Escribe un correo electrónico válido.",
        "PasswordTooShort" => "La contraseña debe tener al menos 12 caracteres.",
        "PasswordRequiresNonAlphanumeric" => "La contraseña debe incluir un símbolo.",
        "PasswordRequiresDigit" => "La contraseña debe incluir un número.",
        "PasswordRequiresLower" => "La contraseña debe incluir una minúscula.",
        "PasswordRequiresUpper" => "La contraseña debe incluir una mayúscula.",
        _ => "Revisa los datos o actualiza la lista antes de reintentar."
    }).Distinct() });
}
public record UserCreate(string Email, string Password, string Role);
public record UserEdit(string Email, string Role);
