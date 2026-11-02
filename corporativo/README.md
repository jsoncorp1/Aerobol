# Portal corporativo — vista local

Abrir `/corporativo/` desde el monolito ASP.NET Core. El login necesita el servidor .NET; no usar un servidor estático. Las vistas no forman parte de `build.py`.

- `index.html` y `login.js`: acceso con correo y contraseña a través de Identity y Neon. El servidor protege panel.html y panel.js con sesión y rol de administrador.
- `panel.html` y `panel.js`: registros de Neon, búsqueda, fechas, paginación, estados, fichas y exportación XLSX. El cambio de estado se guarda en el servidor con fecha y administrador responsable.
- `corporativo.css`: estilos adaptables a escritorio y móvil.

El formulario de la landing ya guarda las preinscripciones en Neon y el panel las consulta desde la API protegida. Quedan pendientes los usuarios definitivos del equipo y los datos oficiales de contacto.

Validación: sintaxis JavaScript comprobada con Node; navegador verificado en móvil y escritorio, navegación del acceso a la demo, búsqueda, ficha y cambio reversible de estado.

La ficha y el Excel muestran tutor, bachiller y UTM. El origen técnico se distingue del origen declarado. La paginación y los filtros se consultan en el servidor; la exportación recorre todas las páginas seleccionadas.
