  /* ---------- Barra móvil ---------- */
  const barra = $("#barra-movil");
  if ("IntersectionObserver" in window) {
    let heroVisible = true, formVisible = false;
    const actualizar = () => barra.classList.toggle("visible", !heroVisible && !formVisible);
    new IntersectionObserver(([en]) => { heroVisible = en.isIntersecting; actualizar(); }).observe($(".hero"));
    new IntersectionObserver(([en]) => { formVisible = en.isIntersecting; actualizar(); }, { threshold: 0.15 }).observe($("#preinscripcion"));
  }
