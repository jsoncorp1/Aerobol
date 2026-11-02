  $("#datos").innerHTML = CONFIG.datosRapidos.map((d, i) =>
    '<div class="dato" style="--i:' + i + '"><span class="eti">' + t(d.etiqueta) + "</span><strong>" + t(d.valor) + '</strong><span class="txt">' + t(d.texto) + "</span></div>").join("");

  if ("IntersectionObserver" in window) {
    const revelar = new IntersectionObserver(entradas => entradas.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("visible"); revelar.unobserve(en.target); }
    }), { threshold: 0.2 });
    $$(".dato").forEach(d => revelar.observe(d));
  } else {
    $$(".dato").forEach(d => d.classList.add("visible"));
  }
