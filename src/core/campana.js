  /* ---------- Campaña (UTM) ---------- */
  const CLAVES = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "promo"];
  const qs = new URLSearchParams(location.search);
  const campana = {};
  CLAVES.forEach(k => {
    const v = qs.get(k);
    if (v) ss.set("ab_" + k, v);
    campana[k] = v || ss.get("ab_" + k) || "";
  });
  const origen = campana.utm_source || (campana.fbclid ? "facebook" : "directo");

  // No hay una promoción activa en esta página.
  const codigoPromo = "";
