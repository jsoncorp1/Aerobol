  /* ---------- Cookies ---------- */
  // Aviso informativo: no hay medición. Si se agrega Meta Pixel o Analytics, pedir aquí el consentimiento y ajustar la CSP.
  if (!ls.get("ab_cookies")) $("#cookies").hidden = false;
  $("#ck-aceptar").addEventListener("click", () => { ls.set("ab_cookies", "esenciales"); $("#cookies").hidden = true; });
