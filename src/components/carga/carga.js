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
      // currentSrc elige la imagen de móvil o escritorio de cada <picture>.
      // Los fondos CSS también forman parte de la carga; no se esperan iframes.
      const urls = new Set();
      document.querySelectorAll("img").forEach(img => {
        const url = img.currentSrc || img.src;
        if (url) urls.add(url);
      });
      document.querySelectorAll("body *").forEach(el => {
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
