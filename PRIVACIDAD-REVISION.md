# Política de privacidad: revisión de la academia

Preparada el 12 de noviembre de 2026. Estado: borrador para revisión, sin aprobación como política definitiva.

## Qué se implementó

- Página pública `/privacidad/`, generada desde `src/legal/privacidad.html` por `build.py`. Usa los contactos y la versión declarados en `src/config/config.js`.
- Enlaces reales desde el formulario, el pie y el aviso de almacenamiento. Se abren en otra pestaña para no perder una solicitud a medio completar.
- La solicitud incluye `privacidad_version` y el servidor ya guarda la fecha de recepción en `CreatedAt`. Es una referencia al texto mostrado, no una certificación de identidad ni una prueba inviolable de consentimiento.
- Publicación de la página incluida en el proyecto .NET y comprobación de reproducibilidad incluida en CI.
- La propia página legal no carga fuentes externas, YouTube ni scripts de medición y funciona sin JavaScript.

## Información que aún debe confirmar Aerobol

| Dato | Situación |
| --- | --- |
| Responsable | El usuario confirmó el nombre de empresa Aerobol. Confirmar identificación tributaria si corresponde, domicilio y persona o canal que atenderá derechos. |
| Conservación | No hay borrado automático por antigüedad. Definir plazos para solicitudes, exportaciones, registros técnicos y respaldos y el proceso para cumplirlos. No se inventó un plazo de 12 meses. |
| Infraestructura | El usuario confirmó que Jsoncorp tendrá la base de datos. Confirmar detalles de ese servicio, hosting web, países de alojamiento, subencargados y accesos de soporte. No se da por verificada su configuración en producción. |
| Atención de derechos | Confirmar que el correo y el teléfono del sitio se atienden y quién podrá localizar, corregir o eliminar registros y copias/exportaciones. El panel actual no tiene una función pública de autoservicio para esas peticiones. |
| Menores | El formulario reducido no recoge edad ni verifica autorización del representante. La academia debe definir cómo atender esas consultas y los trámites posteriores. |
| Servicios externos | Revisar si se mantendrán las fuentes de Google y el reproductor de YouTube. El dominio `youtube-nocookie.com` no evita por sí solo todas las conexiones con Google. |

El texto distingue las prácticas visibles en el código de los puntos pendientes. No añade un DPO, registros, certificaciones, autoridades extranjeras, proveedores ni plazos que no estén confirmados.

Antes de adoptar la política definitiva: completar esos datos, confirmar que el texto describe el funcionamiento real, actualizar `privacidadVersion`, retirar el aviso de borrador y los pendientes de la plantilla y revisar su etiqueta `noindex`. Ejecutar `build.py`, validar los enlaces y publicar la nueva versión junto con el servidor. La aprobación del texto no implementa por sí misma un proceso de eliminación de datos.

## Base técnica revisada

- Campos: nombre, WhatsApp/código de país, ciudad, inicio, bachiller, grado académico opcional y horario. Autorización expresa sin premarcar.
- Datos asociados: UTM, `fbclid` si viene en la URL, origen, fecha, código de solicitud y estado/administrador que atiende.
- Almacenamiento: `ab_cookies` en localStorage; `ab_utm_*`, `ab_fbclid` y `ab_promo` en sessionStorage. Leer el aviso no equivale a aceptar publicidad.
- Sesión administrativa `Aerobol.Session` y protección antifalsificación del formulario. Los datos de consulta no se almacenan en una cookie.
- Base de datos y acceso administrativo; exportación Excel local. Solicitudes de versiones anteriores pueden tener campos que ya no están en el formulario actual.
- El enlace alternativo a WhatsApp incorpora los datos del interesado en el mensaje de su URL. No se hace envío automático desde este trabajo.

## Referencias consultadas (sin copiar sus políticas)

- [WE FLY Academia — Política de privacidad](https://weflyacademia.com/politica-de-privacidad/): estructura legible para consultas de formación aeronáutica y distinción entre datos, finalidad, conservación y contacto.
- [Aerodynamics Academy — Política de privacidad](https://aerodynamics.es/politica-de-privacidad/): información en formularios y autorización. Su normativa española/europea no se trasladó como si fuera automáticamente aplicable a Aerobol.
- [Constitución Política del Estado publicada por SENAPI](https://www.senapi.gob.bo/normativas/constitucion-politica-del-estado/constitucion-politica-del-estado-plurinacional-de-bolivia): privacidad y acción de protección de privacidad, artículos 21.2 y 130.
- [Ayuda oficial de YouTube — Reproductor y privacidad mejorada](https://support.google.com/youtube/answer/171780?hl=es): alcance del dominio `youtube-nocookie.com`.

Se intentó consultar también Cruzair; su página no devolvió texto suficiente para usarla como base.

## Términos y cookies

Se añadieron `/terminos/` y `/cookies/` con la misma paleta morado y verde. Los términos cubren uso del sitio y consultas; matrícula, pagos y devoluciones están pendientes de la academia. Cookies describe almacenamiento local, sesión, seguridad y servicios externos; «Entendido» solo cierra el aviso y no bloquea integraciones ni expresa consentimiento publicitario.

Referencias: [aviso legal de Aerodynamics](https://aerodynamics.es/aviso-legal/), [cookies de Google](https://policies.google.com/technologies/cookies?hl=es) y documentación oficial de YouTube citada arriba. No se trasladan condiciones ni normativa española a Aerobol.

## Gestor de consentimiento

Sustituye al aviso Entendido: aceptar, rechazar y configurar contenido externo y atribución de campañas, opciones desactivadas inicialmente. Preferencias versionadas en ab_consentimiento durante 180 días; el antiguo ab_cookies no sirve como autorización. Google Fonts y YouTube solo se cargan al autorizar contenido externo. Revocar descarga iframe/fuente y elimina parámetros almacenados según categoría; no borra solicitudes anteriores ni datos de terceros. El pie permite cambiar la elección. Esta sección sustituye la descripción histórica del aviso informativo anterior.

## Revisión boliviana posterior

Ver `CUMPLIMIENTO-BOLIVIA.md` para requisitos y evidencia. El usuario aclaró que Aerobol posiblemente tiene NIT y una persona a cargo; ambos datos están pendientes y no se publican todavía. Queda identificar al titular legal. Nueva versión bo-r2: consentimiento identifica Jsoncorp, texto/versión/fecha añadidos por el servidor y rechazo de formularios con versión antigua. No se atribuye esa autorización a registros anteriores. Se corrigen promesas de cupo y se preservan reclamaciones de la Ley 453. Los documentos continúan como borradores por pendientes operativos reales.

## Contacto de Jsoncorp indicado por el usuario

Harold Aparaza Monasterio fue indicado como contacto de Jsoncorp. No se ha confirmado su cargo, representación legal ni responsabilidad en la atención de derechos. Se conserva esta referencia solo en este documento interno; no se publica el nombre en las páginas legales. La identidad de Jsoncorp como proveedor técnico no sustituye la identificación del responsable de Aerobol.

## Razón social confirmada el 13 de noviembre

El cliente proporcionó AIRFLYBOL ACADEMY SRL, con nombre comercial AEROBOL ACADEMY. Se actualizan privacidad, términos y cookies mediante configuración compartida. Esta confirmación sustituye el pendiente de razón social descrito en revisiones anteriores. NIT, domicilio legal, contacto responsable, conservación y detalles de infraestructura siguen pendientes. Versión publicada bo-r4; no se modifican registros ni consentimientos anteriores.

## Aviso visual retirado a petición del usuario

El 13 de noviembre se retiró de las tres páginas el recuadro «Borrador para revisión». El usuario indica que considera aprobado ese contenido por el cliente. No se eliminan los pendientes operativos registrados en este documento ni se presenta el cambio visual como verificación jurídica o estatal.

## Canal de privacidad confirmado

El 13 de noviembre el usuario aportó la respuesta del cliente «Ese correo por favor», que confirma aerobolacademy.ceo@gmail.com para solicitudes de privacidad. Se publica como canal confirmado. La respuesta «Correcto» aparece junto a una cita abreviada que menciona la identidad y dirección; no se trata como confirmación inequívoca de que la dirección de atención sea el domicilio legal. Ese punto sigue pendiente.

## Autorización dirigida a Aerobol

El usuario indicó que existe un contrato interno entre ambas partes y solicitó retirar Jsoncorp de la casilla del formulario. Versión bo-r5: autorización dirigida únicamente a Aerobol. Se sincroniza el texto registrado por el servidor; no se modifican autorizaciones históricas. La descripción del proveedor técnico en la política se mantiene; no se interpreta el contrato interno como eliminación automática de las obligaciones de información.
