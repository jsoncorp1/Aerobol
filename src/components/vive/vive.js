  /* ---------- Conócenos: video de la academia, con portada mientras llega ---------- */
  const presentacion = CONFIG.presentacion;
  $("#vive-titulo").textContent = presentacion.titulo;
  $("#vive-texto").textContent = presentacion.texto;
  const medioPresentacion = $("#conocenos-media");
  if (presentacion.videoYoutubeId && /^[a-zA-Z0-9_-]{11}$/.test(presentacion.videoYoutubeId)) {
    const video = document.createElement("iframe");
    video.src = "https://www.youtube-nocookie.com/embed/" + presentacion.videoYoutubeId;
    video.title = "Instrucción de vuelo: tomas y despegues | One Air";
    video.referrerPolicy = "strict-origin-when-cross-origin";
    video.allow = "encrypted-media; picture-in-picture; fullscreen";
    video.allowFullscreen = true;
    video.loading = "lazy";
    medioPresentacion.replaceChildren(video);
    const creditoVideo = document.createElement("p");
    creditoVideo.className = "video-credito";
    const enlaceVideo = document.createElement("a");
    enlaceVideo.href = "https://www.youtube.com/watch?v=" + presentacion.videoYoutubeId;
    enlaceVideo.target = "_blank";
    enlaceVideo.rel = "noopener";
    enlaceVideo.textContent = "Tomas y despegues · One Air · Ver en YouTube";
    creditoVideo.append(enlaceVideo);
    medioPresentacion.append(creditoVideo);
  } else if (presentacion.imagen) {
    const imagen = document.createElement("img");
    imagen.src = presentacion.imagen;
    imagen.alt = presentacion.imagenAlt || "Presentación de Aerobol Academy";
    imagen.loading = "lazy";
    imagen.decoding = "async";
    const creditoImagen = document.createElement("p");
    creditoImagen.className = "video-credito";
    creditoImagen.textContent = "Imagen ilustrativa · Ahunt / Wikimedia Commons";
    medioPresentacion.replaceChildren(imagen, creditoImagen);
  }
