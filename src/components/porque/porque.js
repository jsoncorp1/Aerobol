  /* ---------- Beneficios ---------- */
  const ICONOS = {
    certificado: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 9.5C8 19.3 5 15.5 5 11V6l7-3z"/><path d="M9 11.5l2 2 4-4"/>',
    piloto: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20c.8-4 3.8-6 7.5-6s6.7 2 7.5 6"/><path d="M8 5.5h8"/>',
    despegue: '<path d="M3 19h18"/><path d="M4 14.5l4.5 1.2 9.5-6.2c1.2-.8 2.7-.4 3 .6.2.8-.3 1.6-1.2 2L8.5 17.6 5 14.8"/><path d="M9.5 12.2L7 9l1.5-.5 4 2"/>',
    maleta: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5.5v2"/><path d="M3.5 12.5h17"/>'
  };
  $("#beneficios").innerHTML = CONFIG.beneficios.map(b =>
    '<div class="porque-item"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (ICONOS[b.icono] || "") + "</svg><h3>" + t(b.titulo) + "</h3><p>" + t(b.texto) + "</p></div>").join("");
