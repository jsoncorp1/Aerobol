  /* El indicador se oculta al empezar a recorrer la página. */
  const deslice = $("#deslice");
  let pendienteFrame = false;
  addEventListener("scroll", () => {
    if (pendienteFrame) return;
    pendienteFrame = true;
    requestAnimationFrame(() => {
      pendienteFrame = false;
      deslice.classList.toggle("oculto", scrollY > 40);
    });
  }, { passive: true });
