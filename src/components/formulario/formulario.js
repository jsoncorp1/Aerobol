  /* ---------- Opciones de los selects ---------- */
  const selCarrera = $("#f-carrera");
  selCarrera.innerHTML = '<option value="">Elige una carrera</option>' +
    CONFIG.carreras.map(c => '<option value="' + esc(c.nombre) + '">' + esc(c.nombre) + "</option>").join("") +
    '<option value="Aún no sé">Aún no sé, quiero orientación</option>';

  $("#f-ciudad").innerHTML = '<option value="">Elige tu ciudad</option>' +
    CONFIG.ciudades.map(c => '<option value="' + esc(c) + '">' + esc(c) + "</option>").join("");

  $("#f-pais").innerHTML = CONFIG.paises.map(p =>
    '<option value="' + esc(p.cod) + '">' + p.bandera + " " + esc(p.cod) + "</option>").join("");

  /* ---------- Formulario ---------- */
  const form = $("#form");
  const edad = $("#f-edad");
  const tutor = $("#tutor");

  function setError(id, msg) {
    const m = $("#e-" + id); if (!m) return;
    m.textContent = msg || "";
    const campo = m.closest(".campo"); if (campo) campo.classList.toggle("err", !!msg);
  }
  function limpiarError(id) { setError(id, ""); }

  function elegirCarrera(nombre) {
    selCarrera.value = nombre;
    limpiarError("carrera");
    $("#preinscripcion").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(() => $("#f-nombre").focus({ preventScroll: true }), 500);
  }

  const valRadio = n => (form.querySelector('input[name="' + n + '"]:checked') || {}).value || "";

  function telValido(cod, num) {
    const d = num.replace(/\D/g, "");
    if (cod === "+591") return /^[67]\d{7}$/.test(d);
    return d.length >= 7 && d.length <= 15;
  }
  const esMenor = () => { const v = parseInt(edad.value, 10); return !isNaN(v) && v < 18; };

  const REGLAS = {
    nombre: () => $("#f-nombre").value.trim().split(/\s+/).filter(w => /^[\p{L}'.-]{2,}$/u.test(w)).length >= 2 ? "" : "Escribe tu nombre y apellido.",
    tel: () => telValido($("#f-pais").value, $("#f-tel").value) ? "" : "Revisa tu número de WhatsApp, parece incompleto.",
    correo: () => { const v = $("#f-correo").value.trim(); return !v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "" : "Ese correo no parece válido."; },
    ciudad: () => $("#f-ciudad").value ? "" : "Elige tu ciudad.",
    carrera: () => selCarrera.value ? "" : "Elige la carrera que te interesa.",
    inicio: () => valRadio("inicio") ? "" : "Elige cuándo te gustaría empezar.",
    edad: () => { const v = Number(edad.value); return Number.isInteger(v) && v >= 14 && v <= 70 ? "" : "Escribe una edad válida."; },
    bachiller: () => valRadio("bachiller") ? "" : "Cuéntanos si ya saliste bachiller.",
    "tutor-nombre": () => !esMenor() || $("#f-tutor-nombre").value.trim().length >= 3 ? "" : "Necesitamos el nombre de tu padre, madre o tutor porque eres menor de edad.",
    "tutor-tel": () => !esMenor() || telValido("+591", $("#f-tutor-tel").value) ? "" : "Necesitamos un celular válido de tu padre, madre o tutor.",
    horario: () => valRadio("horario") ? "" : "Elige en qué horario te llamamos.",
    privacidad: () => $("#f-privacidad").checked ? "" : "Debes aceptar la política de privacidad para continuar."
  };
  const CAMPO_DE = { "f-nombre": "nombre", "f-tel": "tel", "f-pais": "tel", "f-correo": "correo", "f-ciudad": "ciudad", "f-carrera": "carrera", "f-edad": "edad", "f-tutor-nombre": "tutor-nombre", "f-tutor-tel": "tutor-tel", "f-privacidad": "privacidad" };

  form.addEventListener("focusout", e => {
    if (!form.classList.contains("validado")) return; // antes del primer intento no se muestran errores
    const k = CAMPO_DE[e.target.id];
    if (k && (e.target.value || e.target.type === "checkbox")) setError(k, REGLAS[k]());
  });
  form.addEventListener("change", e => {
    const k = CAMPO_DE[e.target.id] || (e.target.type === "radio" ? e.target.name : "");
    if (k && $("#e-" + k) && $("#e-" + k).textContent) setError(k, REGLAS[k]());
  });
  edad.addEventListener("input", () => {
    tutor.hidden = !esMenor();
    if (!esMenor()) { limpiarError("tutor-nombre"); limpiarError("tutor-tel"); }
  });

  function datosLead() {
    const pais = $("#f-pais").value;
    const ahora = new Date();
    const fecha = ahora.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" });
    const d = {
      nombre: $("#f-nombre").value.trim(),
      whatsapp: pais + " " + $("#f-tel").value.replace(/\D/g, ""),
      correo: $("#f-correo").value.trim(),
      ciudad: $("#f-ciudad").value,
      carrera: selCarrera.value,
      inicio: valRadio("inicio"),
      edad: edad.value,
      bachiller: valRadio("bachiller"),
      horario_contacto: valRadio("horario"),
      como_nos_conocio: $("#f-fuente").value,
      promo: codigoPromo,
      origen: origen,
      fecha_registro: fecha + " (hora de Bolivia)"
    };
    if (esMenor()) {
      d.tutor_nombre = $("#f-tutor-nombre").value.trim();
      d.tutor_celular = "+591 " + $("#f-tutor-tel").value.replace(/\D/g, "");
    }
    CLAVES.filter(k => k !== "promo").forEach(k => { if (campana[k]) d[k] = campana[k]; });
    return d;
  }

  function textoWhatsapp(d) {
    return "Hola Aerobol, quiero preinscribirme.\n" +
      "Nombre: " + d.nombre + "\nWhatsApp: " + d.whatsapp + "\nCiudad: " + d.ciudad +
      "\nCarrera: " + d.carrera + "\nInicio: " + d.inicio + "\nEdad: " + d.edad +
      (d.tutor_nombre ? "\nTutor: " + d.tutor_nombre + " (" + d.tutor_celular + ")" : "") +
      "\nBachiller: " + d.bachiller + "\nMejor horario: " + d.horario_contacto;
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
      btn.disabled = false; btn.textContent = "Quiero que me llamen";
      $("#form-error span").textContent = err.message === "token" ? "No pudimos conectar. Recarga la página y vuelve a intentarlo." : err.message;
      $("#wa-respaldo").hidden = !whatsappDisponible;
      if (whatsappDisponible) $("#wa-respaldo").href = waLink(textoWhatsapp(d));
      $("#form-error").hidden = false;
    }
  });
