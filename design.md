# Design — Landing de Preinscripción Aerobol Academy

**Basado en:** proposal.md · contenido.md
**Fecha:** 26 de octubre de 2026

---

## 1. Decisión de stack

| Opción | Pros | Contras | Decisión |
|---|---|---|---|
| **HTML + CSS + JS puro (un solo archivo)** | Carga rapidísima en celular, hosting estático gratis o muy barato, cero mantenimiento, fácil de entregar el código al cliente | Contenido editable solo tocando el archivo | ✅ **Elegida** |
| Angular | Es nuestro stack principal | Bundle pesado para una sola página, más lento en celulares de gama baja, sobredimensionado | ❌ |
| .NET + Razor | Backend propio para los leads | Necesita servidor de pago desde el día 1; rompe la promesa de "servidor incluido" a este precio | ❌ (queda para el opcional "Panel de inscritos") |

**Por qué:** el 90 % del tráfico llega desde anuncios en redes sociales, en celular y muchas veces con datos móviles. Cada segundo de carga pierde leads. Un sitio estático sin frameworks carga en menos de 1 segundo.

## 2. Arquitectura

```
                     ┌──────────────────────────┐
  Anuncio (FB/IG/TT) │  aerobolacademy.com      │
  ?utm_source=...    │  ?promo=anticipada2027   │
  ─────────────────► │                          │
                     │  index.html (estático)   │
                     │  ├─ CONFIG (datos)       │
                     │  ├─ PROMOS (campañas)    │
                     │  └─ Formulario           │
                     └────────────┬─────────────┘
                                  │ POST JSON (fetch)
                                  ▼
                     ┌──────────────────────────┐
                     │ Servicio de formularios  │  ← FORM_ENDPOINT configurable
                     │ (Web3Forms por defecto)  │
                     └────────────┬─────────────┘
                                  │ correo
                                  ▼
                     Equipo de ventas Aerobol
```

**Migración futura (opcional "Panel de inscritos"):** se cambia solo `FORM_ENDPOINT` para apuntar a una API .NET 8 (`POST /api/leads`) con PostgreSQL. El formulario ya envía JSON con nombres de campos estables, así que el front no se toca.

## 3. Estructura del archivo

Un solo `index.html` autocontenido:

| Bloque | Contenido |
|---|---|
| `<style>` | Tokens de color en `:root`, layout mobile-first, animaciones |
| `<body>` | Secciones en el orden de contenido.md, con `id` para anclas |
| `<script>` → `CONFIG` | Todos los datos de la academia (nombre, WhatsApp, carreras, FAQ, testimonios, redes, endpoint) |
| `<script>` → `PROMOS` | Diccionario de promociones por código de campaña |
| `<script>` → lógica | Render de datos, captura UTM, promo, validación, envío, animaciones |

**Regla:** ningún dato de Aerobol va "quemado" en el HTML. Todo sale de `CONFIG` y `PROMOS`, para que actualizar carreras, precios o promos sea editar un objeto, no buscar textos por todo el archivo.

## 4. Diseño visual

| Elemento | Decisión |
|---|---|
| Concepto | "Despegue": la página avanza del cielo (portada) a la pista nocturna (formulario), como un vuelo |
| Colores | Morado Aerobol `#5B2563` (marca), verde Aerobol `#14A37F` (acción), azul noche `#0B1026` (fondos), crema `#F7F4EE` (secciones claras). **[CONFIRMAR códigos exactos con el logo original]** |
| Tipografía | **Sora** (títulos, aire técnico-aeronáutico) + **Inter** (texto), de Google Fonts |
| Imágenes | Mientras Aerobol no entregue fotos: escenas hechas en CSS/SVG (cielo degradado, nubes, avión vectorial original, pista con luces). Se reemplazan por fotos reales sin cambiar el layout |
| Animaciones | Aparición suave al hacer scroll (IntersectionObserver), avión que cruza la portada, luces de pista. Respetan `prefers-reduced-motion` |
| Botón principal | Verde Aerobol, siempre visible en celular como barra inferior fija tras pasar la portada |

## 5. Captura de campaña (UTM)

- Al cargar, se leen de la URL: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `fbclid`, `promo`.
- Se guardan en `sessionStorage` (con `try/catch`) para que no se pierdan si el visitante navega por anclas o recarga.
- Viajan como campos ocultos en cada envío.
- Si no hay UTM, `origen = "directo"`.

## 6. Promociones por enlace

- `PROMOS` es un diccionario: `{ codigo: { titulo, beneficio, fechaLimite, cupos, condiciones } }`.
- El enlace del anuncio lleva `?promo=codigo`. Si el código existe y no venció, se muestra el bloque de promoción y la promo viaja en el registro.
- Sin `?promo` → se muestra la promo marcada `porDefecto: true` (si hay y está vigente). Si no hay ninguna vigente, el bloque se oculta.
- Fecha vencida → el bloque desaparece solo, sin tocar el código.
- Cuenta regresiva en días hasta `fechaLimite`.

## 7. Envío del formulario

- `fetch` POST JSON a `CONFIG.formEndpoint`.
- Por defecto, **Web3Forms** (gratis, reenvía al correo configurado con una `access_key`). **Límite del plan gratis: 250 envíos al mes** → ver riesgos.
- Asunto del correo: `Nuevo preinscrito: {nombre} — {carrera} ({origen})` para que ventas filtre rápido.
- Si falla el envío: mensaje de error y botón para mandar los mismos datos por WhatsApp (el lead nunca se pierde).
- Honeypot invisible contra bots.

## 8. Hosting y dominio

- Hosting estático: Vercel o Netlify (plan gratuito), con HTTPS automático.
- Dominio `.com` del cliente apuntando por DNS.
- Coherente con la cotización: "servidor incluido el primer año".

## 9. Riesgos técnicos

| Riesgo | Mitigación |
|---|---|
| Web3Forms gratis = 250 envíos/mes; una campaña exitosa lo supera | Monitorear; pasar a plan pago (~USD 8/mes) o al opcional Panel de inscritos (.NET). Avisar al cliente antes de lanzar pauta grande |
| La `access_key` de Web3Forms queda visible en el HTML | Es el diseño previsto del servicio (solo permite enviar a un correo fijo). Activar en su panel la restricción por dominio |
| Correos de leads caen en spam | Pedir a ventas que marquen el remitente como seguro; probar antes de lanzar |
| Fotos y video aún no existen | Escenas CSS/SVG de respaldo; layout preparado para reemplazarlas |
| Datos de menores de edad | Campo de padre/tutor obligatorio si edad < 18; casilla de privacidad obligatoria |
