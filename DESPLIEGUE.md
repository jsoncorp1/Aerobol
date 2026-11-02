# Aerobol Academy — Coolify y PostgreSQL 17

Un solo contenedor ASP.NET Core 10 sirve la landing, el acceso y el panel. PostgreSQL es un servicio separado, con versión principal **17**. El Dockerfile sirve el puerto **8080** como usuario `app`; Coolify termina HTTPS.

## Estado de la preparación

Estos archivos preparan un nuevo destino. La aplicación local continúa conectada a Neon PostgreSQL 18.6. No se cambió la versión de Neon ni se trasladaron sus registros. No se publicaron credenciales ni se crearon cuentas automáticamente.

## Coolify: aplicación y base de datos

1. Crear un recurso PostgreSQL seleccionando **17**, con volumen persistente. Usar una base nueva y conservar Neon mientras se valida el cambio.
2. Crear la aplicación desde este repositorio, Build Pack **Dockerfile**, ruta `/Dockerfile`, contexto raíz y puerto **8080**.
3. Asignar un dominio y activar HTTPS en Coolify. La aplicación necesita WebSocket para Blazor Interactive Server.
4. Configurar las variables siguientes. La plantilla `.env.coolify.example` contiene ejemplos sin secretos.
5. Montar un volumen nombrado persistente en **`/keys`**. Debe poder escribir el usuario `app` (UID 1654 de las imágenes .NET). No usar un bind mount vacío propiedad de root sin ajustar permisos.
6. Inicializar la base vacía y crear el administrador con los comandos de abajo. Hacerlo en una ejecución puntual de la imagen con las mismas variables y red antes de exigir que el despliegue pase el healthcheck: una base sin tablas devuelve 503.
7. Comprobar `/health/ready`, login, preinscripción, cambio de estado y exportación Excel. Entrar, redesplegar y comprobar que la sesión persiste.

| Variable | Valor |
|---|---|
| `ConnectionStrings__Aerobol` | Cadena PostgreSQL en palabras clave; marcar secreta |
| `AllowedHosts` | Dominio real más `localhost;127.0.0.1` para healthcheck, sin `https://` |
| `Aerobol__DetrasDeProxy` | `true` |
| `Aerobol__ProxiesConfiables` | Red CIDR real desde la que llega el proxy; varias separadas por `;` |
| `Aerobol__RutaClaves` | `/keys` |
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `TZ` | `America/La_Paz` |

Consultar la subred del proxy con `docker network inspect NOMBRE_DE_RED`. No habilitar confianza universal en cabeceras. Conectar la aplicación a la red de Coolify y no publicar su puerto a internet por fuera del proxy.

Para Neon u otro PostgreSQL remoto con TLS:

```text
Host=HOST;Port=5432;Database=BASE;Username=USUARIO;Password=SECRETO;SSL Mode=VerifyFull;Channel Binding=Require
```

Para PostgreSQL 17 en la misma red privada de Docker, cuando el servicio no tiene TLS configurado, usar su hostname interno y `SSL Mode=Disable` (sin `Channel Binding=Require`). No exponer ese puerto de base de datos a internet. El cifrado HTTPS del navegador lo gestiona Coolify.

## Inicialización explícita

En la terminal de la aplicación, con la conexión configurada:

```sh
dotnet Aerobol.dll --check-db
dotnet Aerobol.dll --init-db
```

El primer comando muestra la versión real de PostgreSQL y ejecuta `SELECT 1`. El segundo crea las tablas iniciales de Identity y preinscripciones en el esquema `aerobol` **solo si está vacío**; si encuentra tablas, se detiene. No elimina registros, no cambia contraseñas y no ejecuta migraciones automáticas en cada arranque.

Para crear el administrador, `--init-demo` recibe por **stdin** un JSON con las propiedades `Email` y `Password`. Enviar mediante un gestor de secretos o entrada oculta de la terminal; no guardar contraseñas en el repositorio ni pasarlas como argumentos. La cuenta existente no se sobrescribe. No volver a usar la contraseña de demo en una publicación pública.

Las migraciones EF están versionadas en `Monolito/Data/Migrations/`, incluido el SQL inicial para revisión. `--init-db` aplica esa migración en una base vacía; las actualizaciones posteriores usan `--migrate` explícitamente. Las bases antiguas sin historial requieren adoptar una línea base revisada antes. Ningún comando borra ni recrea automáticamente una base existente.

## Prueba local con PostgreSQL 17

```powershell
Copy-Item .env.example .env
# Editar .env y establecer una contraseña privada.
docker compose build
docker compose up -d postgres
docker compose run --rm app --init-db
# Crear administrador mediante --init-demo con JSON por stdin.
docker compose up -d app
docker compose exec app dotnet Aerobol.dll --check-db
```

Abrir `http://localhost:8080`. Este Compose es para prueba local y usa Development para permitir cookies por HTTP. La imagen y la configuración de Coolify usan Production. Compose conserva PostgreSQL en `aerobol-db17` y las claves en `aerobol-keys`; no publica el puerto de PostgreSQL. No ejecutar `docker compose down -v` si se quieren conservar los datos.

## Traslado desde Neon 18 a 17

La versión anterior no se convierte cambiando la cadena de conexión. Usar un destino 17 nuevo, respaldar el esquema `aerobol` y trasladar los datos en una ventana sin nuevas escrituras. Una restauración de 18 a 17 puede necesitar adaptación de SQL; no asumir que un dump de una versión superior restaura sin ajustes.

La migración debe conservar IDs, hashes de contraseña, roles, preinscripciones y datos del último cambio de estado. No ejecutar `--init-demo` para recrear y perder el usuario original si se van a importar sus tablas. Validar recuentos, relaciones, login y estado del registro de prueba antes de sustituir `ConnectionStrings__Aerobol`. Conservar Neon como respaldo hasta terminar la validación. Falta proporcionar o crear ese destino para hacer el traslado.

## Salud y archivos privados

- `/health`: proceso activo.
- `/health/ready`: consulta real de la tabla de preinscripciones; devuelve 503 si la base o el esquema no están disponibles. El HEALTHCHECK del contenedor utiliza esta ruta.
- `.dockerignore` excluye `.local`, `.env`, Git, reportes y salidas de compilación. El secreto de Neon no entra en la imagen.
- Las claves de sesión persisten en `/keys`; proteger ese volumen y sus respaldos en el servidor. El contenedor no instala certificados ni cambia la seguridad del host.

Los datos oficiales de contacto y el permiso del video externo siguen pendientes antes de publicar la landing definitiva.
