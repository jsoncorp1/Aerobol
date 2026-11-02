  const hero = $(".hero");
  const videoInicio = $("#hero-video");
  const movimientoReducido = matchMedia("(prefers-reduced-motion: reduce)");
  let inicioVisible = false;
  videoInicio.muted = true;

  function sincronizarVideoInicio() {
    if (!movimientoReducido.matches && inicioVisible && !document.hidden) {
      videoInicio.play().catch(() => {});
    } else {
      videoInicio.pause();
    }
  }
  movimientoReducido.addEventListener("change", sincronizarVideoInicio);
  document.addEventListener("visibilitychange", sincronizarVideoInicio);
  new IntersectionObserver(([entrada]) => {
    inicioVisible = entrada.isIntersecting;
    sincronizarVideoInicio();
  }, { threshold: 0 }).observe(hero);

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
