using Aerobol.Components;
using Aerobol.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Npgsql;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Antiforgery;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args.Where(arg => arg is not "--check-db" and not "--init-demo" and not "--init-leads" and not "--init-db" and not "--migrate").ToArray(),
    WebRootPath = Path.Combine(AppContext.BaseDirectory, "wwwroot")
});
builder.Configuration.AddJsonFile(
    Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "../.local/database.json")),
    optional: true, reloadOnChange: false);
// Las variables del hosting tienen prioridad sobre la configuración privada local.
builder.Configuration.AddEnvironmentVariables();
var behindProxy = builder.Configuration.GetValue<bool>("Aerobol:DetrasDeProxy");
var keysPath = builder.Configuration["Aerobol:RutaClaves"];
if (!string.IsNullOrWhiteSpace(keysPath))
{
    Directory.CreateDirectory(keysPath);
    builder.Services.AddDataProtection().SetApplicationName("Aerobol.Academy")
        .PersistKeysToFileSystem(new DirectoryInfo(keysPath));
}
if (behindProxy)
{
    var networks = (builder.Configuration["Aerobol:ProxiesConfiables"] ?? "").Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    if (networks.Length == 0) throw new InvalidOperationException("Configura Aerobol__ProxiesConfiables con la red CIDR del proxy de Coolify.");
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        foreach (var network in networks) options.KnownIPNetworks.Add(System.Net.IPNetwork.Parse(network));
    });
}

var connectionString = builder.Configuration.GetConnectionString("Aerobol");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("Configura ConnectionStrings__Aerobol en el servidor o .local/database.json en desarrollo.");

builder.Services.AddDbContext<AerobolDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddIdentity<IdentityUser, IdentityRole>(options =>
{
    options.User.RequireUniqueEmail = true;
    options.Password.RequiredLength = 12;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
}).AddEntityFrameworkStores<AerobolDbContext>().AddDefaultTokenProviders();
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/corporativo/";
    options.Cookie.Name = "Aerobol.Session";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    options.ExpireTimeSpan = TimeSpan.FromHours(4);
    options.SlidingExpiration = true;
    options.Events.OnRedirectToLogin = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api")) context.Response.StatusCode = 401;
        else context.Response.Redirect(context.RedirectUri);
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = context =>
    {
        if (context.Request.Path.StartsWithSegments("/api")) context.Response.StatusCode = 403;
        else context.Response.Redirect("/corporativo/");
        return Task.CompletedTask;
    };
});
builder.Services.AddAuthorization();
builder.Services.AddAntiforgery(options => options.HeaderName = "X-CSRF-TOKEN");
builder.Services.AddRazorComponents().AddInteractiveServerComponents();
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "60";
        await context.HttpContext.Response.WriteAsJsonAsync(new { message = "Demasiados intentos. Espera un minuto y vuelve a intentarlo." }, cancellationToken);
    };
    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("leads", context => RateLimitPartition.GetSlidingWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new SlidingWindowRateLimiterOptions { PermitLimit = builder.Configuration.GetValue("Aerobol:EnviosPorIp", 120), Window = TimeSpan.FromMinutes(1), SegmentsPerWindow = 6, QueueLimit = 0 }));
});

// Comprobación explícita y de solo lectura. No crea ni migra tablas.
if (args.Contains("--check-db"))
{
    try
    {
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        await using (var readOnly = new NpgsqlCommand("SET TRANSACTION READ ONLY", connection, transaction))
            await readOnly.ExecuteNonQueryAsync();
        await using var check = new NpgsqlCommand("SELECT 1", connection, transaction);
        var result = await check.ExecuteScalarAsync();
        await transaction.RollbackAsync();
        Console.WriteLine(Equals(result, 1) ? $"PostgreSQL {connection.PostgreSqlVersion}; SELECT 1 correcto. No se modificaron tablas." : "Resultado inesperado de la comprobación.");
    }
    catch (Exception exception)
    {
        // Nunca escribir la cadena de conexión ni mensajes que puedan incluir secretos.
        Console.Error.WriteLine($"No se pudo verificar PostgreSQL ({exception.GetType().Name}). Revisa red, credenciales y TLS.");
        Environment.ExitCode = 1;
    }
    return;
}

var app = builder.Build();
if (args.Any(arg => arg is "--init-db" or "--init-leads" or "--migrate"))
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AerobolDbContext>();
    await db.Database.OpenConnectionAsync();
    await using var count = new NpgsqlCommand("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'aerobol'", (NpgsqlConnection)db.Database.GetDbConnection());
    var existing = (long)(await count.ExecuteScalarAsync())!;
    var applied = (await db.Database.GetAppliedMigrationsAsync()).ToArray();
    if (existing > 0 && applied.Length == 0)
        throw new InvalidOperationException("Base anterior sin historial de migraciones: requiere revisar y adoptar la migración inicial antes de actualizar. No se borraron datos.");
    if (args.Contains("--init-db") && existing > 0)
        throw new InvalidOperationException("El esquema ya contiene tablas. Usa --migrate para actualizar una base versionada.");
    await db.Database.MigrateAsync();
    Console.WriteLine("Migraciones de Aerobol aplicadas; no se crearon cuentas ni registros de prueba.");
    return;
}
if (args.Contains("--init-demo"))
{
    // Contraseña recibida por stdin: nunca por argumentos, archivos ni logs.
    var seed = System.Text.Json.JsonSerializer.Deserialize<DemoAccount>(await Console.In.ReadToEndAsync())
        ?? throw new InvalidOperationException("Faltan los datos del administrador.");
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AerobolDbContext>();
    await db.Database.OpenConnectionAsync();
    await using var transaction = await db.Database.BeginTransactionAsync();
    await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(83941027)");
    var connection = (NpgsqlConnection)db.Database.GetDbConnection();
    await using var check = new NpgsqlCommand("SELECT count(*) FROM information_schema.tables WHERE table_schema = 'aerobol'", connection, (NpgsqlTransaction)transaction.GetDbTransaction());
    var tableCount = (long)(await check.ExecuteScalarAsync())!;
    if (tableCount == 0)
        throw new InvalidOperationException("Primero inicializa la base con --init-db.");
    var users = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    if (!await roles.RoleExistsAsync("Administrador"))
    {
        var createdRole = await roles.CreateAsync(new IdentityRole("Administrador"));
        if (!createdRole.Succeeded) throw new InvalidOperationException("No se pudo crear el rol de administrador.");
    }
    var user = await users.FindByEmailAsync(seed.Email);
    if (user is null)
    {
        user = new IdentityUser { UserName = seed.Email, Email = seed.Email, EmailConfirmed = true };
        var created = await users.CreateAsync(user, seed.Password);
        if (!created.Succeeded) throw new InvalidOperationException("No se pudo crear el administrador: " + string.Join(", ", created.Errors.Select(error => error.Code)));
        var assigned = await users.AddToRoleAsync(user, "Administrador");
        if (!assigned.Succeeded) throw new InvalidOperationException("No se pudo asignar el rol.");
    }
    else
        throw new InvalidOperationException("La cuenta ya existe; no se cambió su contraseña ni su rol.");
    await transaction.CommitAsync();
    Console.WriteLine("Administrador de demostración creado. Contraseña almacenada mediante Identity como hash.");
    return;
}
if (behindProxy) app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/error");
    app.UseHsts();
    if (!behindProxy) app.UseHttpsRedirection();
}
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.UseAntiforgery();
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "DENY";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    context.Response.Headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self'; frame-src https://www.youtube-nocookie.com; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
    if (context.Request.Path.StartsWithSegments("/sistema") && !app.Environment.IsDevelopment()) { context.Response.StatusCode = 404; return; }
    if ((path.Equals("/corporativo/panel.html", StringComparison.OrdinalIgnoreCase) || path.Equals("/corporativo/panel.js", StringComparison.OrdinalIgnoreCase))
        && !context.User.IsInRole("Administrador"))
    {
        context.Response.Redirect("/corporativo/");
        return;
    }
    if (path.StartsWith("/corporativo/", StringComparison.OrdinalIgnoreCase) || path.StartsWith("/api/", StringComparison.OrdinalIgnoreCase))
        context.Response.Headers.CacheControl = "no-store";
    await next();
});
// El webroot publicado contiene únicamente los recursos públicos seleccionados.
app.UseDefaultFiles();
app.UseStaticFiles();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/health/ready", async (AerobolDbContext db) =>
{
    try
    {
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        var ready = await db.Preinscripciones.AsNoTracking().Select(x => x.Id).Take(1).ToListAsync(timeout.Token);
        return Results.Ok(new { status = "ready" });
    }
    catch { return Results.StatusCode(503); }
});
app.MapGet("/error", () => Results.Problem("No se pudo completar la solicitud."));
app.MapPost("/api/preinscripciones", async (Dictionary<string, string> datos, HttpContext context, IAntiforgery antiforgery, AerobolDbContext db) =>
{
    try { await antiforgery.ValidateRequestAsync(context); }
    catch (AntiforgeryValidationException) { return Results.BadRequest(new { message = "Recarga la página y vuelve a intentarlo." }); }
    var validationError = LeadValidation.Validate(datos);
    if (validationError is not null) return Results.BadRequest(new { message = validationError });
    var lead = new Preinscripcion { Datos = System.Text.Json.JsonSerializer.Serialize(datos) };
    db.Preinscripciones.Add(lead);
    await db.SaveChangesAsync();
    return Results.Created("/api/preinscripciones/" + lead.Id, new { success = true, id = lead.Id, codigo = "AB-" + lead.Id.ToString("N").ToUpperInvariant() });
}).RequireRateLimiting("leads");
app.MapGet("/api/preinscripciones", async (HttpRequest request, AerobolDbContext db) =>
{
    if (!int.TryParse(request.Query["page"].FirstOrDefault() ?? "1", out var page) || page < 1 || page > 100000
        || !int.TryParse(request.Query["pageSize"].FirstOrDefault() ?? "50", out var pageSize) || pageSize < 1 || pageSize > 100)
        return Results.BadRequest(new { message = "Paginación no válida." });
    var state = request.Query["status"].ToString();
    var search = request.Query["q"].ToString().Trim();
    var date = request.Query["date"].FirstOrDefault() ?? "all";
    if ((state != "" && state is not "pending" and not "done") || search.Length > 120 || date is not "all" and not "today" and not "week")
        return Results.BadRequest();
    var total = await db.Preinscripciones.CountAsync();
    var pending = await db.Preinscripciones.CountAsync(x => x.Status == "pending");
    var pattern = "%" + search.Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_") + "%";
    var query = db.Preinscripciones.FromSqlInterpolated($"SELECT * FROM aerobol.\"Preinscripciones\" WHERE (\"Datos\"->>'nombre' ILIKE {pattern} OR \"Datos\"->>'ciudad' ILIKE {pattern} OR \"Datos\"->>'carrera' ILIKE {pattern})").AsNoTracking();
    if (state != "") query = query.Where(x => x.Status == state);
    if (date == "today") { var start = DateTime.UtcNow.AddHours(-4).Date.AddHours(4); query = query.Where(x => x.CreatedAt >= start); }
    if (date == "week") { var start = DateTime.UtcNow.AddDays(-7); query = query.Where(x => x.CreatedAt >= start); }
    var filteredTotal = await query.CountAsync();
    query = request.Query["sort"] == "asc" ? query.OrderBy(x => x.CreatedAt).ThenBy(x => x.Id) : query.OrderByDescending(x => x.CreatedAt).ThenByDescending(x => x.Id);
    var leads = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    return Results.Ok(new { total, pending, done = total - pending, filteredTotal, page, pageSize,
        items = leads.Select(x => new { x.Id, x.CreatedAt, x.Status, x.AttendedAt, x.AttendedBy, codigo = "AB-" + x.Id.ToString("N").ToUpperInvariant(), datos = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(x.Datos) }) });
}).RequireAuthorization(policy => policy.RequireRole("Administrador"));
app.MapPatch("/api/preinscripciones/{id:guid}/estado", async (Guid id, LeadState request, HttpContext context, IAntiforgery antiforgery, AerobolDbContext db) =>
{
    try { await antiforgery.ValidateRequestAsync(context); }
    catch (AntiforgeryValidationException) { return Results.BadRequest(); }
    if (request.Status is not "pending" and not "done") return Results.BadRequest();
    var lead = await db.Preinscripciones.FindAsync(id);
    if (lead is null) return Results.NotFound();
    lead.Status = request.Status;
    lead.AttendedAt = request.Status == "done" ? DateTime.UtcNow : null;
    lead.AttendedBy = request.Status == "done" ? context.User.Identity?.Name : null;
    await db.SaveChangesAsync();
    return Results.Ok(new { lead.Id, lead.Status, lead.AttendedAt });
}).RequireAuthorization(policy => policy.RequireRole("Administrador"));
app.MapGet("/api/auth/token", (HttpContext context, IAntiforgery antiforgery) =>
    Results.Ok(new { token = antiforgery.GetAndStoreTokens(context).RequestToken }));
app.MapPost("/api/auth/login", async (LoginRequest request, HttpContext context, IAntiforgery antiforgery, SignInManager<IdentityUser> signIn) =>
{
    try { await antiforgery.ValidateRequestAsync(context); }
    catch (AntiforgeryValidationException) { return Results.BadRequest(new { message = "Recarga la página y vuelve a intentarlo." }); }
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrEmpty(request.Password) || request.Email.Length > 254 || request.Password.Length > 256)
        return Results.BadRequest(new { message = "Revisa el correo y la contraseña." });
    var result = await signIn.PasswordSignInAsync(request.Email.Trim(), request.Password, false, lockoutOnFailure: true);
    return result.Succeeded ? Results.Ok(new { redirect = "/corporativo/panel.html" })
        : Results.Json(new { message = "No pudimos iniciar sesión. Revisa tus datos o vuelve a intentar más tarde." }, statusCode: 401);
}).RequireRateLimiting("login");
app.MapPost("/api/auth/logout", async (HttpContext context, IAntiforgery antiforgery, SignInManager<IdentityUser> signIn) =>
{
    try { await antiforgery.ValidateRequestAsync(context); }
    catch (AntiforgeryValidationException) { return Results.BadRequest(); }
    await signIn.SignOutAsync();
    return Results.Ok();
}).RequireAuthorization();
app.MapRazorComponents<App>().AddInteractiveServerRenderMode();
app.Run();

record DemoAccount(string Email, string Password);
record LoginRequest(string Email, string Password);
record LeadState(string Status);
