  /* Preferencias: sin autorización no se conserva atribución de campaña. */
  const CLAVES = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "promo"];
  const qs = new URLSearchParams(location.search);
  let consentimiento = null;
  try {
    const guardado = JSON.parse(ls.get("ab_consentimiento"));
    if (guardado && guardado.version === 1 && Date.now() - guardado.fecha < 180 * 86400000 && typeof guardado.externos === "boolean" && typeof guardado.campanas === "boolean") consentimiento = guardado;
  } catch (e) {}
  const campana = {};
  let origen = "directo";
  function actualizarCampana() {
    CLAVES.forEach(k => {
      if (consentimiento?.campanas) {
        const v = qs.get(k);
        if (v) ss.set("ab_" + k, v);
        campana[k] = v || ss.get("ab_" + k) || "";
      } else {
        try { sessionStorage.removeItem("ab_" + k); } catch (e) {}
        campana[k] = "";
      }
    });
    origen = campana.utm_source || (campana.fbclid ? "facebook" : "directo");
  }
  actualizarCampana();
  const codigoPromo = "";
