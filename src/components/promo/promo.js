  /* ---------- Promoción ---------- */
  function hoyISO() {
    const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function promoVigente(p) {
    if (!p || pendiente(p.fechaLimite)) return !!p;
    const [y, m, d] = String(p.fechaLimite).split("-").map(Number);
    return new Date(y, m - 1, d) >= hoyISO();
  }
  let codigoPromo = campana.promo && PROMOS[campana.promo] ? campana.promo : "";
  if (!codigoPromo) codigoPromo = Object.keys(PROMOS).find(k => PROMOS[k].porDefecto) || "";
  const promo = PROMOS[codigoPromo];
  if (promo && promoVigente(promo)) {
    $("#promo").hidden = false;
    $("#promo-titulo").innerHTML = t(promo.titulo);
    $("#promo-beneficio").innerHTML = t(promo.beneficio);
    $("#promo-condiciones").innerHTML = promo.condiciones ? t(promo.condiciones) : "";
    const [y, m, d] = String(promo.fechaLimite).split("-").map(Number);
    const dias = Math.round((new Date(y, m - 1, d) - hoyISO()) / 86400000);
    $("#promo-dias").innerHTML = dias === 0 ? "<b>¡Último día!</b>" : "<b>" + dias + "</b><span>" + (dias === 1 ? "día" : "días") + " para que termine</span>";
    $("#promo-cupos").innerHTML = promo.cupos ? "Cupos de esta promoción: " + t(String(promo.cupos)) : "";
  } else {
    codigoPromo = "";
  }
