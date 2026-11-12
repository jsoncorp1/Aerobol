  /* ---------- Opciones de los selects ---------- */
  $("#f-ciudad").innerHTML = '<option value="">Elige tu ciudad</option>' +
    CONFIG.ciudades.map(c => '<option value="' + esc(c) + '">' + esc(c) + "</option>").join("");

  $("#f-pais").innerHTML = CONFIG.paises.map(p =>
    '<option value="' + esc(p.cod) + '">' + p.bandera + " " + esc(p.cod) + "</option>").join("");

  /* ---------- Formulario ---------- */
  const form = $("#form");

  function setError(id, msg) {
    const m = $("#e-" + id); if (!m) return;
    m.textContent = msg || "";
    const campo = m.closest(".campo"); if (campo) campo.classList.toggle("err", !!msg);
  }
  function limpiarError(id) { setError(id, ""); }


  const valRadio = n => (form.querySelector('input[name="' + n + '"]:checked') || {}).value || "";

  function telValido(cod, num) {
    const d = num.replace(/\D/g, "");
    if (cod === "+591") return /^[67]\d{7}$/.test(d);
    return d.length >= 7 && d.length <= 15;
  }

  const REGLAS = {
    nombre: () => $("#f-nombre").value.trim().split(/\s+/).filter(w => /^[\p{L}'.-]{2,}$/u.test(w)).length >= 2 ? "" : "Escribe tu nombre y apellido.",
    tel: () => telValido($("#f-pais").value, $("#f-tel").value) ? "" : "Revisa tu número de WhatsApp, parece incompleto.",
    ciudad: () => $("#f-ciudad").value ? "" : "Elige tu ciudad.",
    inicio: () => valRadio("inicio") ? "" : "Elige cuándo te gustaría empezar.",
    bachiller: () => valRadio("bachiller") ? "" : "Cuéntanos si ya saliste bachiller.",
    horario: () => valRadio("horario") ? "" : "Elige en qué horario te llamamos.",
    privacidad: () => $("#f-privacidad").checked ? "" : "Debes aceptar la política de privacidad para continuar."
  };
  const CAMPO_DE = { "f-nombre": "nombre", "f-tel": "tel", "f-pais": "tel", "f-ciudad": "ciudad", "f-privacidad": "privacidad" };

  form.addEventListener("focusout", e => {
    if (!form.classList.contains("validado")) return; // antes del primer intento no se muestran errores
    const k = CAMPO_DE[e.target.id];
    if (k && (e.target.value || e.target.type === "checkbox")) setError(k, REGLAS[k]());
  });
  form.addEventListener("change", e => {
    const k = CAMPO_DE[e.target.id] || (e.target.type === "radio" ? e.target.name : "");
    if (k && $("#e-" + k) && $("#e-" + k).textContent) setError(k, REGLAS[k]());
  });

  function datosLead() {
    const pais = $("#f-pais").value;
    const ahora = new Date();
    const fecha = ahora.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" });
    const d = {
      nombre: $("#f-nombre").value.trim(),
      whatsapp: pais + " " + $("#f-tel").value.replace(/\D/g, ""),
      ciudad: $("#f-ciudad").value,
      inicio: valRadio("inicio"),
      bachiller: valRadio("bachiller"),
      grado_academico: $("#f-grado").value,
      horario_contacto: valRadio("horario"),
      privacidad_version: CONFIG.privacidadVersion,
      promo: codigoPromo,
      origen: origen,
      fecha_registro: fecha + " (hora de Bolivia)"
    };
    CLAVES.filter(k => k !== "promo").forEach(k => { if (campana[k]) d[k] = campana[k]; });
    return d;
  }

  function textoWhatsapp(d) {
    return "Hola Aerobol, quiero preinscribirme.\n" +
      "Nombre: " + d.nombre + "\nWhatsApp: " + d.whatsapp + "\nCiudad: " + d.ciudad +
      "\nInicio: " + d.inicio +
      "\nBachiller: " + d.bachiller + (d.grado_academico ? "\nGrado académico: " + d.grado_academico : "") + "\nMejor horario: " + d.horario_contacto;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    $("#form-error").hidden = true;
    form.classList.add("validado");
    let primero = null;
    Object.keys(REGLAS).forEach(k => {
      const msg = REGLAS[k](); setError(k, msg);
      if (msg && !primero) primero = $("#e-" + k).closest(".campo");
    });
    if (primero) {
      const foco = primero.querySelector("input:not([type=radio]), select") || primero.querySelector("input");
      primero.scrollIntoView({ behavior: "auto", block: "center" });
      if (foco) foco.focus({ preventScroll: true });
      return;
    }

    const d = datosLead();
    d.botcheck = $("#f-web").value;

    const btn = $("#enviar");
    btn.disabled = true; btn.textContent = "Enviando…";


    try {
      const tokenResponse = await fetch('/api/auth/token', { cache: 'no-store' });
      if (!tokenResponse.ok) throw new Error('token');
      const { token } = await tokenResponse.json();
      const res = await fetch('/api/preinscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
        body: JSON.stringify({ ...d, privacidad: 'true' })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) throw new Error(json.message || "No pudimos enviar tu registro. Revisa tu conexión y vuelve a intentarlo.");
      mostrarPase(d, json.codigo);
    } catch (err) {
      btn.disabled = false; btn.textContent = "Enviar solicitud";
      $("#form-error span").textContent = err.message === "token" ? "No pudimos conectar. Recarga la página y vuelve a intentarlo." : err.message;
      $("#wa-respaldo").hidden = !whatsappDisponible;
      if (whatsappDisponible) $("#wa-respaldo").href = waLink(textoWhatsapp(d));
      $("#form-error").hidden = false;
    }
  });
