  /* ---------- Datos simples ---------- */
  $$("[data-cfg]").forEach(el => el.innerHTML = t(CONFIG[el.dataset.cfg]));
  $$("[data-link]").forEach(a => a.href = CONFIG.enlaces[a.dataset.link] || "#");
