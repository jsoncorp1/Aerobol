  $("#anio").textContent = new Date().getFullYear();
  function contactoPie(selector, valor, enlace) {
    const contenedor = $(selector);
    if (pendiente(valor)) { contenedor.textContent = "Por confirmar"; return; }
    const a = document.createElement("a");
    a.textContent = valor;
    a.href = enlace;
    contenedor.append(a);
  }
  contactoPie("#pie-whatsapp", CONFIG.whatsappVisible, waLink(CONFIG.mensajeWhatsapp));
  contactoPie("#pie-telefono", CONFIG.telefono, "tel:" + String(CONFIG.telefono).replace(/[^+0-9]/g, ""));
  contactoPie("#pie-correo", CONFIG.correo, "mailto:" + CONFIG.correo);
  if (!pendiente(CONFIG.direccion)) {
    $("#pie-mapa").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.academia + " " + CONFIG.direccion);
    $("#pie-mapa").hidden = false;
  }
  ["direccion", "horarioAtencion"].forEach(clave => {
    if (pendiente(CONFIG[clave])) $(".pie [data-cfg=" + clave + "]").textContent = clave === "direccion" ? "Dirección por confirmar" : "Horario por confirmar";
  });
