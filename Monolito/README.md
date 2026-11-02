# Aerobol — base del monolito

ASP.NET Core 10, Blazor Interactive Server y PostgreSQL mediante Npgsql/EF Core.

## Configuración

La conexión se configura con `ConnectionStrings__Aerobol` en el entorno del servidor. En este equipo se usa el archivo privado `.local/database.json` en la raíz del repositorio, excluido de Git. No copiarlo a `wwwroot` ni publicarlo. La configuración del entorno tiene prioridad sobre el archivo local.

Formato de ejemplo, sin credenciales reales:

```json
{"ConnectionStrings":{"Aerobol":"Host=HOST;Database=DATABASE;Username=USER;Password=SECRET;SSL Mode=VerifyFull;Channel Binding=Require"}}
```

## Ejecutar desde la raíz del repositorio

```powershell
dotnet run --project Monolito/Aerobol.csproj -- --check-db
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project Monolito/Aerobol.csproj --urls http://127.0.0.1:8000
```

`--check-db` abre una transacción de solo lectura, ejecuta `SELECT 1` y la revierte. No migra ni crea tablas. No se ejecutan migraciones automáticamente al arrancar.

- `/`: landing existente.
- `/corporativo/`: login real con Identity; el panel requiere sesión y rol Administrador. El panel consulta los registros guardados en PostgreSQL.
- `/sistema`: componente de prueba, disponible solo en Development.
- `/health`: estado de la aplicación, sin datos de la base ni credenciales.

El build copia únicamente `index.html`, los recursos de `assets/` y HTML/CSS/JS de `corporativo/` al directorio público de salida. Ejecutar `build.py` antes de compilar si cambia `src/`.

Identity usa el esquema `aerobol`. Las migraciones EF están en `Data/Migrations/` y el SQL inicial se incluye para revisión. `--init-db` prepara una base vacía, `--migrate` actualiza una base con historial EF y `--init-leads` es un alias de compatibilidad de la misma ruta de migraciones. Una base antigua con tablas pero sin historial EF requiere adopción de línea base revisada; el comando no intenta recrearla.

`--init-demo` recibe Email y Password por stdin y crea solo una cuenta nueva; la base debe estar inicializada antes. No sobrescribe cuentas existentes. No usar `EnsureCreated` en la base compartida.

POST `/api/preinscripciones` guarda registros, GET pagina hasta 100 filas por petición y PATCH `/api/preinscripciones/{id}/estado` actualiza el último estado y responsable. Las consultas y cambios requieren el rol Administrador; envíos y cambios validan CSRF. El informe incluye todas las páginas del filtro.

El login usa cookies HttpOnly, protección CSRF, bloqueo tras 5 intentos fallidos y un límite de solicitudes por IP. El cierre de sesión invalida la cookie. La contraseña de la cuenta demo no se guarda en el repositorio.

En producción, configurar el dominio en `AllowedHosts`, HTTPS y la conexión como secreto del hosting. Ejecutar la aplicación .NET; no servir la raíz del repositorio con un servidor estático, ya que contiene la configuración privada y el código del servidor.
