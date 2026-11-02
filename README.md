# Aerobol Academy

Monolito ASP.NET Core 10 para la landing y el portal de admisiones de la gestión 2027. El formulario guarda registros en PostgreSQL; el panel protegido por Identity permite consultarlos, marcar su atención y exportarlos a Excel.

## Estructura actual

- `src/`: fuente de la landing (portada, Conócenos, formulario y pie). `build.py` genera `index.html` y `landing.html`.
- `corporativo/`: login y panel HTML/JS, tarjetas móviles, tabla de escritorio, filtros y exportación XLSX con logo.
- `Monolito/`: servidor, Identity, EF Core, validaciones y migraciones.
- `Tests/`: pruebas xUnit. `Aerobol.slnx` reúne los proyectos.
- `Dockerfile`, `compose.yaml` y `DESPLIEGUE.md`: preparación para Coolify y PostgreSQL 17.

## Desarrollo

Requiere Python 3 y SDK .NET 10. La conexión va en `ConnectionStrings__Aerobol` o `.local/database.json` (ignorado por Git). Nunca servir la raíz del repositorio con un servidor estático porque contiene configuración privada.

```powershell
python build.py
dotnet test Aerobol.slnx
$env:ASPNETCORE_ENVIRONMENT = 'Development'
dotnet run --project Monolito/Aerobol.csproj --urls http://127.0.0.1:8000
```

Rutas: `/` landing, `/corporativo/` acceso, `/health` proceso y `/health/ready` base de datos. `/sistema` solo se ofrece en Development. El panel operativo sigue en JavaScript; Blazor es la base prevista para futuras pantallas.

## Registros y seguridad

POST `/api/preinscripciones` valida datos, consentimiento, tutor para menores y honeypot. Devuelve un código derivado del ID guardado. GET usa paginación (máximo 100 filas), filtros y ordenación en el servidor. Consultar y cambiar estados requiere sesión y rol Administrador. El cambio registra el último administrador y su fecha, no un historial completo de auditoría.

El panel distingue el origen de campaña del dato declarado por el interesado; la ficha y el Excel incluyen tutor, bachiller y UTM. La exportación reúne todas las páginas del filtro activo.

Las cookies son HttpOnly, SameSite Strict y Secure en producción. Los cambios verifican CSRF. Los límites devuelven JSON 429 y Retry-After. El límite público predeterminado es 120 solicitudes/minuto/IP, configurable con `Aerobol__EnviosPorIp`; se debe ajustar con métricas reales y la IP correcta del proxy. No sustituye una protección contra bots completa.

La CSP permite inline en la landing actual porque sus scripts y estilos se ensamblan en el HTML; sí restringe marcos, objetos y orígenes externos. Se incluyen nosniff, DENY, Referrer-Policy y Permissions-Policy.

## Base de datos

La conexión local existente sigue siendo Neon PostgreSQL 18.6; el destino PostgreSQL 17 está preparado, pendiente de crear/conectar y trasladar los datos. No se ha simulado un cambio de versión.

La migración inicial está en `Monolito/Data/Migrations/` con su SQL revisable. Para una base vacía: `--init-db`. Para una base ya versionada: `--migrate`. Las bases creadas por los antiguos comandos no tienen historial EF: primero requieren revisión y adopción de la línea base. Los comandos se detienen ante ese caso, sin borrar tablas. No se aplican migraciones automáticamente al arrancar.

## Contenido pendiente de la academia

Los contactos y datos oficiales se completarán cuando los entregue el cliente. Mientras falte el número no se muestran enlaces de WhatsApp sin destinatario. La política de privacidad sigue pendiente; el enlace provisional no es una política válida para publicación.

El clip EFA de la portada continúa como referencia local con permiso sin verificar. Conócenos usa el video de YouTube de One Air elegido para la demo. No se sustituyeron estos contenidos sin acuerdo del cliente. El script antiguo de preparación de video no se ejecuta en el build actual.

Ver `AUDITORIA-CORRECCIONES.md` para el alcance de las correcciones y los pendientes. `design.md`, `proposal.md` y `contenido.md` conservan antecedentes y material del cliente; no son la especificación operativa actual.
