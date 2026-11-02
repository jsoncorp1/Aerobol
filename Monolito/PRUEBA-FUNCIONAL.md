# Prueba funcional — 29 de octubre de 2026

Se realizó desde el navegador con datos ficticios, sin enviar correos ni mensajes.

1. Envío desde la landing: Camila Prueba Funcional, Piloto Privado, La Paz, gestión 2027, horario Tarde. El formulario mostró el pase de confirmación.
2. El panel recibió un registro pendiente desde Neon.
3. Se pulsó Marcar atendido en la tarjeta móvil y apareció en Atendidos.
4. Se recargó la página: el estado continuó atendido y la ficha mostró el administrador responsable.
5. Se reinició la aplicación y se consultó con una nueva sesión: un único registro con ID a86b39a5-b7a5-4bdf-853b-b65263bda04a, estado done y fecha de atención 2026-10-29T19:08:33.818221Z (15:08 en Bolivia).
6. Datos incompletos: HTTP 400. Envío sin CSRF: HTTP 400. Consulta sin sesión: HTTP 401.

El registro de prueba se conserva como atendido para revisión. Los antiguos seis ejemplos del navegador ya no forman parte de la fuente de datos.

Cambios necesarios para la prueba: tabla Preinscripciones en el esquema aerobol; endpoints de alta, consulta y actualización con validación, rol y CSRF; formulario y panel conectados a esos endpoints. No se borraron tablas ni datos existentes.
