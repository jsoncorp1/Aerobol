# Comportamiento vigente

- Landing: portada, video de referencia en Conócenos, formulario y contacto.
- Registro: nombre y apellido, teléfono válido, ciudad, carrera, inicio, edad entera de 14 a 70, bachiller, horario y consentimiento. Menores de 18: tutor y celular boliviano obligatorios.
- Campañas: guardar UTM y origen técnico por separado de cómo nos conoció el interesado.
- Éxito: código vinculado al ID de PostgreSQL; no mostrar éxito ante error del servidor.
- Error: mensaje visible, reintento y WhatsApp solo cuando la academia tenga número configurado.
- Panel: autenticación Identity y rol, búsqueda, filtros de estado/fecha, paginación del servidor, detalle completo, atención y reversión del último estado.
- Exportación: XLSX con logo y todas las filas del filtro activo, incluyendo tutor, bachiller y campañas.
- Producción: HTTPS en proxy, claves persistentes, proxies de confianza y base preparada por migración explícita. No publicar contenido o política de privacidad pendientes como definitivos.
