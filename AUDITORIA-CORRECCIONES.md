# Correcciones de la revisión — 30 de octubre de 2026

## Código corregido y probado

- Tutor, celular del tutor, bachiller, UTM, FBCLID, código y fecha de atención se muestran en la ficha y la exportación XLSX.
- El origen técnico (`utm_source`, luego origen) ya no se sobrescribe por la respuesta «Cómo nos conoció»; ambos se conservan separados.
- GET consulta páginas de hasta 100 filas con estado, búsqueda, fecha y orden en PostgreSQL. El panel solicita solo su página; Excel recorre todas las páginas del filtro.
- Los límites responden 429 con JSON y Retry-After. El límite público es configurable y por defecto 120/minuto/IP; el login mantiene su límite y bloqueo de Identity.
- La API rechaza honeypot, teléfono boliviano incorrecto, menores sin tutor y edad decimal. El navegador también exige edad entera.
- El pase usa el código derivado del ID guardado, no un valor independiente del navegador.
- No se muestran enlaces WhatsApp sin número. Ante errores se ofrece reintento y solo se muestra el respaldo si hay destinatario válido.
- Se añadieron CSP, nosniff, DENY, Referrer-Policy y Permissions-Policy. La CSP conserva unsafe-inline para el HTML ensamblado actual; no se presenta como una política estricta basada en nonces.
- `/sistema` devuelve 404 en producción.
- Se eliminó del build el CSS de secciones no usadas y se retiró la configuración obsoleta de Web3Forms.
- Se actualizaron parches de Identity/EF y Npgsql. La dependencia Pkcs también quedó fijada en una versión corregida tras el aviso de NuGet.

## Correcciones del 2 de noviembre de 2026

- Se restauró el bloqueo de Identity: 5 intentos fallidos, 15 minutos. Solo aplica a cuentas con `LockoutEnabled = true`: las creadas mientras estuvo desactivado deben actualizarse.
- `/sistema` devuelve 404 en producción también con otras mayúsculas o barra final.
- La imagen Docker incluye `blazor.web.js`.
- El pase ya no menciona WhatsApp si no hay número, y el aviso de cookies no promete medición inexistente.
- La API valida ciudad, carrera y «Cómo nos conoció» contra las opciones del formulario.

## Base de datos

Hay una migración inicial EF Core, snapshot y SQL revisable en `Monolito/Data/Migrations/`. El modelo y la migración incluyen el CHECK de estado y el índice de fecha.

`--init-db`, `--migrate` y el alias antiguo `--init-leads` usan la misma ruta de migraciones. Las bases ya existentes sin historial EF se detectan y el comando se detiene: deben revisarse y adoptar una línea base antes de actualizarlas. Esta preparación NO aplicó esa adopción ni alteró el esquema existente de Neon.

Neon continúa en PostgreSQL 18.6. El destino 17 y el traslado siguen pendientes. No se aplican migraciones silenciosas al arrancar.

## Evidencia

- Build y publicación Release ejecutados.
- 14 pruebas xUnit aprobadas: validación de adulto, menor/tutor, teléfonos, consentimiento, honeypot, correo, edad y campañas.
- API probada contra Neon con `Persona Auditoria Funcional`, ID `ba943977-465b-47ea-9328-877e31325f80`: registro con tutor y UTM, respuesta paginada, código ligado al ID y estado final atendido.
- Rechazos comprobados: edad decimal 400, consulta sin sesión 401 y límite 429 con Retry-After.
- Navegador: inicio de sesión, filtro de atendidos, búsqueda y detalle con tutor/campaña.
- Excel descargado y comprobado: tutor, bachiller y UTM incluidos.
- El timeout inicial de testhost se resolvió ejecutando xUnit con permisos de comunicación entre sus procesos; la corrida final pasó completa.

Se conserva el registro ficticio de auditoría marcado atendido; no se enviaron mensajes ni correos. No se borraron tablas ni registros anteriores.

## Decisiones de arquitectura y pendientes

El usuario eligió un monolito. Se conserva un solo proyecto web, una solución `.slnx` y un proyecto xUnit. Se agregó un workflow de compilación/pruebas, aún no ejecutado en GitHub. El panel sigue en HTML/JS y Blazor queda preparado para futuras pantallas; no se migró de interfaz durante esta corrección. Las tablas existentes mantienen sus nombres para no forzar una migración destructiva de snake_case. No se afirma cumplimiento integral del estándar JsonCorp: su documento completo no estaba adjunto a esta revisión.

Pendientes antes de publicación: política de privacidad válida, datos oficiales y contenido audiovisual definitivo/autorizado. Pendientes técnicos separados: adoptar la línea base en la base antigua, trasladar a PostgreSQL 17, completar prueba del contenedor, optimizar video/logo y añadir gestión de usuarios/recuperación de contraseña. No se inventaron datos del cliente ni se retiraron los videos que el usuario había elegido para la demo.

La atención conserva el último responsable y fecha; no es un historial inmutable de todos los cambios. El límite por IP reduce abuso básico, pero debe calibrarse con tráfico real y no sustituye una solución completa contra bots.
