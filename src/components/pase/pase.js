  function mostrarPase(d, codigo) {

    const primer = d.nombre.split(/\s+/)[0];
    $("#form-zona").innerHTML =
      '<div class="pase" role="status" tabindex="-1" id="pase">' +
        '<div class="pase-top"><span>Pase de preinscripción</span><span>' + esc(codigo) + "</span></div>" +
        '<div class="pase-body">' +
          "<h3 style=\"font-size:1.5rem;font-stretch:118%\">¡Listo, " + esc(primer) + "! Ya estás preinscrito.</h3>" +
          '<div class="pase-ruta">' +
            '<div><span class="lbl">Pasajero</span><strong>' + esc(d.nombre) + "</strong></div>" +
            '<svg width="34" height="34" viewBox="-17 -17 34 34" aria-hidden="true"><path d="M14 0 L4 -3 L-2 -12 L-6 -12 L-3 -3 L-10 -3 L-13 -7 L-16 -7 L-14 0 L-16 7 L-13 7 L-10 3 L-3 3 L-6 12 L-2 12 L4 3 Z" fill="#5B2563"/></svg>' +
            '<div class="der"><span class="lbl">Destino</span><strong>' + esc(d.carrera || "Aerobol Academy") + "</strong></div>" +
          "</div>" +
          '<div class="pase-datos">' +
            '<div><span class="lbl">Salida</span><strong>' + esc(d.inicio) + "</strong></div>" +
            '<div><span class="lbl">Te llamamos</span><strong>' + esc(d.horario_contacto) + "</strong></div>" +
            '<div><span class="lbl">Al número</span><strong>' + esc(d.whatsapp) + "</strong></div>" +
          "</div>" +
          "<p>Un asesor de Aerobol te llamará en el horario que elegiste." + (whatsappDisponible ? " Si no quieres esperar, escríbenos ahora por WhatsApp." : "") + "</p>" +
          '<a class="btn" href="' + esc(waLink(textoWhatsapp(d))) + '" target="_blank" rel="noopener">Escribir por WhatsApp</a>' +
        "</div>" +
      "</div>";
    if (!whatsappDisponible) { const enlace = $("#pase .btn"); if (enlace) enlace.remove(); }
    const pase = $("#pase"); pase.focus({ preventScroll: true });
    $("#preinscripcion").scrollIntoView({ behavior: "auto", block: "start" });
  }
