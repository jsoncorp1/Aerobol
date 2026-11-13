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
