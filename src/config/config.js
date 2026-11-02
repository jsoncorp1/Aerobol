/* =====================================================================
   CONFIGURACIÓN DE LA ACADEMIA
   Todo lo que dice la página sale de aquí. Lo que empieza con "[" es un
   dato pendiente de confirmar con Aerobol: se resalta en amarillo y la
   página muestra un aviso de revisión hasta que no quede ninguno.
   ===================================================================== */
const CONFIG = {
  academia: "Aerobol Academy",
  whatsappNumero: "[CONFIRMAR: número con código 591]", // solo dígitos, ej. "59171234567"
  whatsappVisible: "[CONFIRMAR]",
  telefono: "[CONFIRMAR]",
  correo: "[CONFIRMAR]",
  direccion: "[CONFIRMAR: dirección de la academia]",
  horarioAtencion: "[CONFIRMAR: horario de atención]",
  mensajeWhatsapp: "Hola Aerobol, quiero información sobre sus carreras.",

  // El formulario usa la API del monolito: /api/preinscripciones.

  enlaces: { privacidad: "#", terminos: "#" },
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
    videoYoutubeId: "Nyr6UImPgbA", // ID del video promocional de YouTube, sin la URL completa.
    imagen: "",         // Portada opcional mientras llega el video, ej. "assets/campana-aerobol.webp".
    imagenAlt: "Presentación de Aerobol Academy"
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
    { p: "¿Puedo preinscribirme si todavía estoy en el colegio?", r: "Sí. Puedes preinscribirte ahora y asegurar tu cupo para cuando salgas bachiller." }
  ]
};
