# Revisión de adecuación a Bolivia

Fecha: 12 de noviembre de 2026. Estado: implementación parcial; pendiente de datos y procedimientos operativos. No es una certificación de cumplimiento ni aprobación estatal.

## Normas consultadas

- Constitución, arts. 21.2 y 130: privacidad y acción de protección de privacidad. [Texto publicado por SENAPI](https://www.senapi.gob.bo/normativas/constitucion-politica-del-estado/constitucion-politica-del-estado-plurinacional-de-bolivia).
- Reglamento aprobado por DS 1793, arts. 56 y 57: información previa, autorización, finalidad, destinatarios, seguridad y comunicaciones digitales. [Fuente estatal CTIC](https://www.ctic.gob.bo/wp-content/uploads/2016/03/DS-N%C2%B0-1793-Reglamento-a-la-Ley-N%C2%B0164-para-el-Desarrollo-de-Tecnolog%C3%ADas-de-la-Informaci%C3%B3n-y-Comunicaci%C3%B3n.pdf).
- Ley 453, arts. 13–14, 18–22 y 25–26: información, condiciones ofertadas, contratos, publicidad y reclamos. [Texto publicado por la Autoridad de Fiscalización del Juego](https://www.aj.gob.bo/wp-content/uploads/2025/08/Ley-453.pdf).

Son referencias verificadas para esta revisión, no una búsqueda exhaustiva de normativa sectorial, tributaria, modificaciones o autorizaciones de actividad. No se trata un proyecto de ley como ley vigente ni se importa la obligación española de tres botones como una exigencia boliviana comprobada.

## Requisitos, evidencia y pendientes

| Aspecto | Implementación | Lo que falta |
| --- | --- | --- |
| Información previa e identidad, DS 1793 art. 56 | Política enlazada antes del envío; contacto y domicilio de atención publicados | Razón social confirmada por el cliente: AIRFLYBOL ACADEMY SRL; nombre comercial AEROBOL ACADEMY. Canal confirmado por el cliente: aerobolacademy.ceo@gmail.com. Falta confirmar NIT y domicilio legal; no inventar registro ni afirmar exención tributaria |
| Consentimiento y finalidad | Casilla obligatoria sin premarcar; autorización de atención y contacto que identifica tratamiento técnico por Jsoncorp; no suscripción general a publicidad | Confirmar que academia y proveedor limitan sus usos a esa finalidad |
| Evidencia | API rechaza ausencia de autorización y versión distinta; añade versión, texto y recepción UTC desde el servidor | No prueba identidad del remitente; archivar versiones aceptadas y respaldos con acceso restringido. Los registros antiguos no adquieren retrospectivamente este consentimiento |
| Destinatarios y alojamiento | Jsoncorp identificado; integraciones externas explicadas | Contacto indicado de Jsoncorp: Harold Aparaza Monasterio (referencia interna; cargo y representación sin confirmar). Falta identidad contractual del proveedor, hosting, países, subproveedores, permisos y acuerdo de confidencialidad/instrucciones de tratamiento |
| Acceso, actualización, rectificación, cancelación, objeción y revocación | Canal de correo y teléfono publicados; texto explica derechos | Asignar persona responsable; probar atención real, localización, corrección, supresión/restricción, retiro de contacto y tratamiento de exportaciones y respaldos |
| Conservación | No se promete un borrado inexistente | Aprobar plazos y ejecutar eliminación/revisión en base, copias, exportaciones y registros técnicos. No hay tarea automática de borrado por antigüedad |
| Seguridad | Panel autenticado, autorización por rol, CSRF, validación y HTTPS previsto en producción | Verificar TLS/proxy, acceso a base, respaldos, actualizaciones, respuesta a incidentes y personas con acceso en el entorno real |
| Preferencias de navegador | Necesarias siempre; contenido externo y atribución opcionales inicialmente apagados; rechazo/configuración y reapertura | Verificar en producción y tras cada nueva integración. No confundir los 180 días de preferencias locales con retención de solicitudes |
| Información y publicidad, Ley 453 | Retirada promesa de cupo del metadato y FAQ; términos aclaran alcance de la consulta, reclamos y derechos irrenunciables | Confirmar oferta, precios cuando se anuncien, autorizaciones educativas/aeronáuticas y afirmaciones de certificación antes de publicarlas |
| Matrícula y contratos | La landing no cobra ni celebra matrícula; no inventa devolución ni penalidad | Facilitar condiciones reales antes de contratar y verificar régimen de aprobación de contratos de adhesión y normativa sectorial aplicable |
| Menores | Aviso de acompañamiento y canal para representantes | Aprobar procedimiento de representación. El formulario reducido no detecta edad ni acredita consentimiento del representante |

## Procedimiento propuesto para solicitudes sobre datos

Debe ser aprobado y asignado a personas por Aerobol; no se presenta como un proceso ya operativo.

1. Recibir la solicitud en el correo de la política, confirmar su recepción y registrar fecha, medio, tipo de petición y responsable interno con acceso restringido. Usar asunto «Privacidad»; no exigir compras ni una nueva autorización publicitaria.
2. Localizar por código de solicitud o teléfono. Verificar identidad de forma proporcionada al riesgo y al derecho pedido; no solicitar copias de documento por defecto ni revelar información de otra persona.
3. Si se pide retiro de contacto, detener el seguimiento y comunicarlo a quienes atienden la consulta. Revisar también listas/exportaciones. No basta con cerrar un aviso de cookies.
4. Para acceso/corrección, entregar o modificar únicamente los registros de la persona verificada. Para cancelación o supresión, comprobar si existe una conservación legal concreta; si la hay, limitar el acceso/uso y explicar el motivo. No prometer borrar inmediatamente todos los respaldos sin conocer su ciclo.
5. Coordinar con Jsoncorp las acciones autorizadas en base, exportaciones y copias; registrar confirmaciones y el tratamiento de datos que puedan reaparecer al restaurar un respaldo. Nunca publicar SQL de administración como endpoint sin autenticación.
6. Responder por un canal seguro explicando acciones y límites. No se inventa un plazo legal de respuesta en este documento: debe determinarse según la norma aplicable y organizarse una atención oportuna. Conservar evidencia mínima de atención durante el plazo que se apruebe.

## Antes de considerar definitivos los documentos

Confirmar los datos pendientes; implementar y probar conservación y atención de derechos; verificar producción y las autorizaciones sectoriales; obtener aprobación de Aerobol y revisar el alcance jurídico aplicable. Solo después actualizar versión y retirar los avisos de borrador. No borrar datos productivos ni imponer un plazo de retención sin la decisión autorizada de la academia.
