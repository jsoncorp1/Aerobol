  /* ---------- WhatsApp ---------- */
  const whatsappDisponible = !pendiente(CONFIG.whatsappNumero) && /^\d{8,15}$/.test(String(CONFIG.whatsappNumero).replace(/\D/g, ""));
  function waLink(texto) {
    const num = pendiente(CONFIG.whatsappNumero) ? "" : String(CONFIG.whatsappNumero).replace(/\D/g, "");
    if (!whatsappDisponible) return "#preinscripcion";
    return "https://wa.me/" + num + "?text=" + encodeURIComponent(texto);
  }
  $$("[data-wa]").forEach(a => { a.hidden = !whatsappDisponible; if (whatsappDisponible) a.href = waLink(CONFIG.mensajeWhatsapp); });
