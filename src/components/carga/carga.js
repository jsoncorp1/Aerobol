/* Se ejecuta antes de la portada para evitar que aparezcan capas incompletas. */
(function () {
  const pantalla = document.getElementById("carga-inicial");
  const progreso = document.getElementById("carga-progreso");
  const porcentaje = document.getElementById("carga-porcentaje");
  const estado = document.getElementById("carga-estado");
  const reintentar = document.getElementById("carga-reintentar");
  pantalla.hidden = false;
  document.documentElement.classList.add("cargando");

  async function preparar() {
    const bloqueados = [...document.body.children].filter(el =>
      el !== pantalla && !["SCRIPT", "STYLE"].includes(el.tagName) && !el.inert);
    bloqueados.forEach(el => { el.inert = true; });
    try {
      const secciones = [...document.querySelectorAll(".academia-video, .pista")];
      secciones.forEach(el => el.classList.add("carga-diferida"));
      // Solo la portada bloquea la entrada; currentSrc selecciona móvil/escritorio.
      const urls = new Set();
      document.querySelectorAll(".hero img").forEach(img => {
        const url = img.currentSrc || img.src;
        if (url) urls.add(url);
      });
      document.querySelectorAll(".hero, .hero *").forEach(el => {
        for (const pseudo of [null, "::before", "::after"]) {
          const style = getComputedStyle(el, pseudo);
          if (style.display === "none" || (pseudo && ["none", "normal"].includes(style.content))) continue;
          for (const match of style.backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g)) {
            urls.add(new URL(match[1], document.baseURI).href);
          }
        }
      });
      let listas = 0;
      const total = urls.size;
      await Promise.all([...urls].map(async url => {
        const imagen = new Image();
        imagen.src = url;
        // decode espera tanto la descarga como la preparación para dibujarla.
        await imagen.decode();
        listas++;
        const valor = Math.round(listas / total * 100);
        progreso.value = valor;
        porcentaje.textContent = valor + "%";
      }));
      progreso.value = 100;
      porcentaje.textContent = "100%";
      // Da al navegador un cuadro para pintar todas las imágenes juntas.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bloqueados.forEach(el => { el.inert = false; });
        document.documentElement.classList.remove("cargando");
        pantalla.hidden = true;
        if ("IntersectionObserver" in window) {
          const observador = new IntersectionObserver(entradas => {
            entradas.forEach(entrada => {
              if (!entrada.isIntersecting) return;
              entrada.target.classList.remove("carga-diferida");
              observador.unobserve(entrada.target);
            });
          }, { rootMargin: "200px" });
          secciones.forEach(el => observador.observe(el));
        } else {
          secciones.forEach(el => el.classList.remove("carga-diferida"));
        }
      }));
    } catch {
      estado.textContent = "No pudimos cargar todas las imágenes. Revisa tu conexión y vuelve a intentar.";
      reintentar.hidden = false;
      reintentar.addEventListener("click", () => location.reload(), { once: true });
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", preparar, { once: true });
  } else {
    preparar();
  }
})();
