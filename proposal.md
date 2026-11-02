# Proposal — Landing de Preinscripción Aerobol Academy

**Proyecto:** Landing page de captación de futuros estudiantes
**Cliente:** Aerobol Academy
**Proveedor:** JsonCorp
**Fecha:** 26 de octubre de 2026
**Estado:** Borrador para validar con el cliente

---

## 1. Qué vamos a construir

Una landing page de una sola página, 100 % enfocada en Aerobol Academy, cuyo único objetivo es **convertir visitantes en contactos calificados** (leads) para que el equipo de ventas de la academia los llame.

La página va a servir para dos usos al mismo tiempo:

1. **Preinscripción para la gestión 2027:** asegurar desde ahora a los futuros estudiantes del próximo año.
2. **Campañas de promoción:** que cada campaña (redes sociales, temporadas, descuentos) apunte a la misma landing y muestre su promoción, sin tener que hacer una página nueva por campaña.

La referencia visual (Cruzair "Origen") se usa solo como inspiración de nivel y sensación. **La estructura, el diseño y todo el contenido son propios de JsonCorp para Aerobol.**

## 2. Por qué

- **Aerobol no tiene presencia web propia indexada.** Hoy, quien ve un anuncio no tiene a dónde ir más que a un chat. Una landing propia da credibilidad y ordena la captación.
- **Ventas necesita datos útiles, no solo un nombre.** Cada registro tiene que llegar con lo necesario para llamar bien: qué curso le interesa, cuándo quiere empezar, a qué hora contactarlo y de qué campaña vino.
- **Las campañas se miden.** Si cada lead trae su origen (Facebook, Instagram, TikTok, promo de temporada), la academia sabe qué campaña le trae estudiantes y en cuál conviene invertir.
- **Asegurar 2027 con anticipación** reduce la dependencia de la inscripción de último momento y le da a la academia previsión de cupos.

## 3. Objetivos medibles

| Objetivo | Indicador |
|---|---|
| Captar leads calificados | N.º de preinscripciones por semana |
| Medir campañas | % de leads con origen de campaña identificado (meta: 100 %) |
| Facilitar el trabajo de ventas | Cada lead con curso de interés, WhatsApp y horario de contacto |
| Conversión de la página | % de visitantes que completan el formulario (meta inicial: 5–10 %) |

## 4. Público objetivo

- **Principal:** jóvenes de 17 a 25 años, bachilleres o por salir del colegio, que sueñan con trabajar en aviación. Usan el celular para todo y llegan desde redes sociales.
- **Secundario:** padres de familia que pagan o co-deciden la carrera. Buscan seguridad: certificación, costo, salida laboral.
- **Terciario:** adultos que buscan un cambio de carrera o especializarse.

> El contenido tiene que hablarle al sueño del joven **y** dar tranquilidad al padre.

## 5. Alcance

### Incluido
- Landing de una sola página, pensada primero para celular.
- Secciones: portada, por qué Aerobol, carreras, promoción vigente, testimonios/video, cómo es el proceso, formulario, preguntas frecuentes, pie de página.
- **Bloque de promoción configurable por campaña** (texto, fecha límite y cupos), activable por enlace.
- Formulario de preinscripción con validaciones y captura automática del origen de campaña.
- Envío de cada registro al equipo de ventas (correo).
- Botón flotante de WhatsApp.
- Redacción de todo el contenido (copy) por parte de JsonCorp, validado con Aerobol.

### No incluido (según cotización COT-AEROBOL-2026-10-v1)
- Producción de video y sesión de fotos.
- Gestión de la pauta publicitaria.
- Panel de inscritos con base de datos (opcional, cotizado aparte).
- Medición con Meta Pixel y Google Analytics (opcional, cotizado aparte).

## 6. Riesgos y decisiones abiertas

| Riesgo | Impacto | Propuesta |
|---|---|---|
| Aerobol no tiene información pública: cursos, requisitos, certificaciones y precios dependen 100 % de ellos | Retrasa el contenido y el plazo de entrega | Enviar el cuestionario de contenido el mismo día que se acepta la cotización; el plazo corre desde que lo devuelven |
| Leads solo por correo: con muchas campañas, ventas pierde registros o los duplica | Leads sin llamar, campañas mal medidas | Recomendar el **panel de inscritos** opcional (exportable a Excel) desde el inicio |
| Sin Pixel/Analytics no se sabe qué campaña funciona | Inversión en publicidad a ciegas | Recomendar el opcional de medición; como mínimo, el formulario guarda la campaña de origen |
| Promesas sin respaldo (empleo garantizado, certificación) | Riesgo legal y reputacional | Solo publicar lo que Aerobol confirme por escrito |
| Datos personales de menores de edad (17 años) | Riesgo legal | Pedir edad y, si es menor, dato del padre/tutor; texto de privacidad claro |
| Precio de captación ajustado (Bs 2.400 con impuestos) | Poco margen para cambios extra | Respetar las 2 rondas de cambios; nuevo contenido después de aprobar se cotiza aparte |

## 7. Qué necesitamos de Aerobol para avanzar

Ver el documento `contenido.md`, sección **"Cuestionario para Aerobol"**.

## 8. Próximos pasos (flujo OPEN-SPEC)

1. ✅ **proposal.md** — este documento (qué y por qué).
2. ⬜ **design.md** — arquitectura técnica: stack, captura de UTM, envío del formulario, configuración de promociones, hosting.
3. ⬜ **spec.md** — comportamiento funcional: validaciones del formulario, estados, mensajes, reglas del bloque de promoción.
4. ⬜ **tasks.md** — tareas de desarrollo.
5. ⬜ Documentación del módulo al finalizar.
