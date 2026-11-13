/* =====================================================================
   CONFIGURACIÓN DE LA ACADEMIA
   Todo lo que dice la página sale de aquí. Lo que empieza con "[" es un
   dato pendiente de confirmar con Aerobol: se resalta en amarillo y la
   página muestra un aviso de revisión hasta que no quede ninguno.
   ===================================================================== */
const CONFIG = {
  academia: "Aerobol Academy",
  razonSocial: "AIRFLYBOL ACADEMY SRL",
  nombreComercial: "AEROBOL ACADEMY",
  whatsappNumero: "59171058088", // solo dígitos, ej. "59171234567"
  whatsappVisible: "71058088",
  telefono: "+591 710 58088",
  correo: "aerobolacademy.ceo@gmail.com",
  direccion: "Calle Colón, esquina Ingavi y Ayacucho, primer anillo, centro de Santa Cruz",
  horarioAtencion: "09:00 a 20:00",
  mensajeWhatsapp: "Hola Aerobol, quiero información sobre sus carreras.",

  // El formulario usa la API del monolito: /api/preinscripciones.

  privacidadVersion: "2026-11-13-bo-r5",
  enlaces: { privacidad: "/privacidad/", terminos: "/terminos/", cookies: "/cookies/" },
  redes: [
    { nombre: "Facebook", url: "[CONFIRMAR]" },
    { nombre: "Instagram", url: "[CONFIRMAR]" },
    { nombre: "TikTok", url: "[CONFIRMAR]" }
  ],

  datosRapidos: [
    { etiqueta: "Trayectoria", valor: "[CONFIRMAR] años", texto: "formando profesionales de la aviación" },
    { etiqueta: "Egresados", valor: "[CONFIRMAR] egresados", texto: "trabajando en el sector aeronáutico" },
    { etiqueta: "Validez oficial", valor: "Certificación [CONFIRMAR]", texto: "programas con validez oficial" }
  ],


  beneficios: [
    { icono: "certificado", titulo: "Formación certificada", texto: "Programas avalados por [CONFIRMAR: DGAC u otra entidad], para que tu título tenga validez real." },
    { icono: "piloto", titulo: "Instructores con experiencia real", texto: "Aprendes de pilotos y profesionales que vuelan o han volado en [CONFIRMAR: aerolíneas]." },
    { icono: "despegue", titulo: "Práctica desde el inicio", texto: "[CONFIRMAR: simulador, aeronaves o prácticas en aeropuerto] para que llegues preparado a tu primer trabajo." },
    { icono: "maleta", titulo: "Te acompañamos al empleo", texto: "[CONFIRMAR: convenios o bolsa de trabajo] con empresas del sector aeronáutico." }
  ],

  carreras: [
    { codigo: "AB-101", nombre: "Piloto Privado", desc: "El primer paso para tomar los controles de un avión.", duracion: "[CONFIRMAR]", modalidad: "[CONFIRMAR]" },
    { codigo: "AB-201", nombre: "Piloto Comercial", desc: "Conviértete en piloto profesional y vuela para una aerolínea.", duracion: "[CONFIRMAR]", modalidad: "[CONFIRMAR]" },
    { codigo: "AB-301", nombre: "Tripulante de Cabina (TCP)", desc: "Seguridad y servicio a bordo: la cara de la aerolínea en cada vuelo.", duracion: "[CONFIRMAR]", modalidad: "[CONFIRMAR]" },
    { codigo: "AB-401", nombre: "Despachador de Vuelo", desc: "Planificas desde tierra que cada vuelo salga y llegue seguro.", duracion: "[CONFIRMAR]", modalidad: "[CONFIRMAR]" },
    { codigo: "AB-501", nombre: "Técnico en Mantenimiento Aeronáutico", desc: "Te aseguras de que cada avión esté listo para volar.", duracion: "[CONFIRMAR]", modalidad: "[CONFIRMAR]" }
  ],

  // «Conócenos»: espacio permanente para el video que entregará el cliente.
  presentacion: {
    titulo: "Conócenos",
    texto: "Hay muchas formas de ser parte de la aviación. Descubre la tuya con Aerobol Academy.",
    videoYoutubeId: "", // ID del video promocional de YouTube, sin la URL completa.
    imagen: "assets/formacion-cessna.webp",         // Portada opcional mientras llega el video, ej. "assets/campana-aerobol.webp".
    imagenAlt: "Una instructora y un alumno junto a un Cessna 172 de entrenamiento"
  },

  ciudades: ["Santa Cruz", "La Paz", "Cochabamba", "Sucre", "Tarija", "Oruro", "Potosí", "Beni", "Pando", "Fuera de Bolivia"],
  paises: [
    { cod: "+591", nombre: "Bolivia", bandera: "🇧🇴" },
    { cod: "+54", nombre: "Argentina", bandera: "🇦🇷" },
    { cod: "+55", nombre: "Brasil", bandera: "🇧🇷" },
    { cod: "+56", nombre: "Chile", bandera: "🇨🇱" },
    { cod: "+51", nombre: "Perú", bandera: "🇵🇪" },
    { cod: "+595", nombre: "Paraguay", bandera: "🇵🇾" },
    { cod: "+34", nombre: "España", bandera: "🇪🇸" },
    { cod: "+1", nombre: "Estados Unidos", bandera: "🇺🇸" }
  ],

  faq: [
    { p: "¿La preinscripción tiene costo?", r: "No. Es gratuita y no te compromete a nada. Solo reservas tu interés y un asesor te contacta." },
    { p: "¿Qué requisitos necesito?", r: "[CONFIRMAR: edad mínima, bachillerato, examen médico y otros requisitos]." },
    { p: "¿Cuánto cuesta la carrera?", r: "[CONFIRMAR: precio, precio desde, o explicado por un asesor]." },
    { p: "¿Hay planes de pago o becas?", r: "[CONFIRMAR]." },
    { p: "¿El título tiene validez oficial?", r: "[CONFIRMAR: entidad que certifica]." },
    { p: "¿Qué horarios tienen las clases?", r: "[CONFIRMAR]." },
    { p: "¿Puedo preinscribirme si todavía estoy en el colegio?", r: "Puedes solicitar información mientras estás en el colegio, con el acompañamiento de tu representante si eres menor. La consulta no reserva un cupo." }
  ]
};
