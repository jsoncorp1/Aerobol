# Portal corporativo — vista local

Abrir `/corporativo/` desde el monolito ASP.NET Core. El login necesita el servidor .NET; no usar un servidor estático. Las vistas no forman parte de `build.py`.

- `index.html` y `login.js`: acceso con correo y contraseña a través de Identity y Neon. El servidor protege panel.html y panel.js con sesión y rol de administrador.
- `panel.html` y `panel.js`: registros de Neon, búsqueda, fechas, paginación, estados, fichas y exportación XLSX. El cambio de estado se guarda en el servidor con fecha y administrador responsable.
- `corporativo.css`: estilos adaptables a escritorio y móvil.

El formulario de la landing ya guarda las preinscripciones en Neon y el panel las consulta desde la API protegida. Quedan pendientes los usuarios definitivos del equipo y los datos oficiales de contacto.

Validación: sintaxis JavaScript comprobada con Node; navegador verificado en móvil y escritorio, navegación del acceso a la demo, búsqueda, ficha y cambio reversible de estado.

La ficha y el Excel muestran tutor, bachiller y UTM. El origen técnico se distingue del origen declarado. La paginación y los filtros se consultan en el servidor; la exportación recorre todas las páginas seleccionadas.

## Revisión del 13 de noviembre de 2026

Carga y error recuperable con botón Reintentar; botón Actualizar; control de doble solicitud de cambio de estado; ficha conservada si falla el guardado; filtros de exportación fijados al iniciar; grado académico en listado y tarjetas, conservando carrera antigua en la ficha y Excel. La etiqueta de demo solo aparece si el servidor confirma modo demo. Login oculta instrucciones de demo en producción. Controles móviles ampliados.

Validación de interfaz con datos ficticios en un servidor temporal de revisión local, independiente de la autenticación y base productivas: paginación, ficha, cambio de estado y error de carga. No se ha verificado la conexión ni el login real por faltar configuración local de base de datos. La vista de revisión indica explícitamente datos ficticios y no se publica con el proyecto.

## Usuarios y acceso protegido

- `usuarios.html` y `usuarios.js`: listado paginado, búsqueda por correo, alta, edición de correo/rol y eliminación con confirmación del correo.
- API `/api/usuarios`: solo Administrador; cambios con CSRF. Roles permitidos: Administrador y Admisiones. Admisiones puede consultar y atender solicitudes, pero no gestionar cuentas.
- No permite autoeliminación ni quitarse el propio rol administrador. Las bajas y cambios de rol se serializan con bloqueo transaccional PostgreSQL para preservar al último administrador dentro de estas operaciones. Cuentas con roles especiales no se modifican desde esta pantalla.
- Contraseñas de alta mediante UserManager/Identity, mínimo 12 caracteres y requisitos de complejidad; nunca se devuelven hashes o contraseñas en el listado. No se implementa un cambio de contraseña administrativo dentro de la edición.
- Las modificaciones de cuentas actualizan el security stamp. Se verifica en cada petición autenticada; las sesiones anteriores dejan de ser válidas tras editar/eliminar. Esto requiere acceso a la base de datos.
- Los números de interesados y tutores se presentan como enlaces `wa.me` cuando tienen longitud válida. Abren WhatsApp sin enviar mensajes automáticamente.

El servidor ficticio anterior fue retirado. En local ahora se ejecuta el monolito real con conexión de base deshabilitada por falta de configuración. Se comprobaron redirecciones sin sesión y 401 para lectura, alta, edición y baja. No se ejecutó CRUD contra una base ni se verificó una sesión autenticada. Es necesario configurar una base de desarrollo y una primera cuenta Administrador mediante el procedimiento de inicialización existente; no se incluyen credenciales por defecto.

## Directorio de equipo y roles

La gestión de usuarios ofrece resumen global, filtros Todos/Administradores/Vendedores, búsqueda por correo, identidades visuales, roles y edición en diálogo. Roles permitidos actualmente: Administrador y Vendedor. Vendedor conserva el alcance operativo de atención de interesados y no accede a gestión de usuarios. El antiguo nombre Admisiones no se admite en nuevas altas. Si hubiera cuentas con ese rol en otro entorno, debe renombrarse/migrarse antes del despliegue para no dejar esos accesos sin rol vigente.

## Integración visual Stitch de solicitudes

Se adapta la composición de las dos referencias de Downloads: resumen de tres indicadores, pestañas Todos/Pendientes/Atendidos, filtros, tabla de escritorio y tarjetas móviles con contacto WhatsApp y ficha. `solicitudes.css` se limita a esta pantalla para conservar login y gestión de usuarios. Se mantiene el logo oficial, rol real sin selector y una sola salida. No se añaden estados de negocio, horarios concretos ni métricas ficticias. El listado sigue paginado en servidor; búsqueda parametrizada también por WhatsApp; exportación incluye el filtro Todos. Los datos adicionales de la ficha se agrupan en un desplegable.
