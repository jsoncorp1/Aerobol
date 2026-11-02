  /* ---------- Carreras: tarjetas y selección de interés ---------- */
  const CARRERA_VISUAL = {
    'AB-101': {area: 'Pilotaje', icono: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>'},
    'AB-201': {area: 'Vuelo profesional', icono: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.5 5.5L8 16l2.5-5.5Z"/>'},
    'AB-301': {area: 'Experiencia a bordo', icono: '<path d="M5 20h14M7 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15"/><rect x="9" y="6" width="6" height="7" rx="2"/><path d="M10 17h4"/>'},
    'AB-401': {area: 'Operaciones en tierra', icono: '<path d="m4 4 2 7h12l2-7ZM8 11l1 10h6l1-10M6 21h12M8 4V2m8 2V2M4 7h16"/>'},
    'AB-501': {area: 'Tecnología aeronáutica', icono: '<path d="M14 6a5 5 0 0 0-6 6L3 17a2.8 2.8 0 0 0 4 4l5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z"/>'}
  };
  $("#lista-carreras").innerHTML = CONFIG.carreras.map((c, i) => {
    const visual = CARRERA_VISUAL[c.codigo] || {area: 'Formación aeronáutica', icono: '<path d="m22 2-7 20-4-9-9-4Z"/>'};
    return '<article class="carrera-card" aria-labelledby="carrera-titulo-' + i + '">' +
      '<div class="carrera-card-top"><span class="carrera-icono" aria-hidden="true"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + visual.icono + '</svg></span><span class="carrera-area">' + esc(visual.area) + '</span></div>' +
      '<h3 id="carrera-titulo-' + i + '">' + t(c.nombre) + '</h3><p class="carrera-desc">' + t(c.desc) + '</p>' +
      '<details class="carrera-detalles"><summary>Duración y modalidad</summary><dl><div><dt>Duración</dt><dd>' + t(c.duracion) + '</dd></div><div><dt>Modalidad</dt><dd>' + t(c.modalidad) + '</dd></div></dl></details>' +
      '<button class="carrera-accion" type="button" data-carrera="' + i + '" aria-label="Quiero saber más sobre ' + esc(c.nombre) + '">Quiero saber más <span aria-hidden="true">↗</span></button>' +
      '</article>';
  }).join('');

  $("#lista-carreras").addEventListener("click", e => {
    const b = e.target.closest("[data-carrera]");
    if (!b) return;
    elegirCarrera(CONFIG.carreras[+b.dataset.carrera].nombre);
  });
