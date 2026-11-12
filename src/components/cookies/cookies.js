  /* El aviso antiguo no equivale a consentimiento para las opciones nuevas. */
  const avisoCookies = $("#cookies");
  const dialogCookies = $("#cookies-config");
  function aplicarConsentimiento() {
    actualizarCampana();
    const externos = !!consentimiento?.externos;
    const video = $(".academia-video-player iframe");
    if (externos) {
      if (!video.hasAttribute("src")) video.src = video.dataset.src;
      if (!$("#fuente-externa")) {
        const fuente = document.createElement("link");
        fuente.id = "fuente-externa"; fuente.rel = "stylesheet";
        fuente.href = "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&display=swap";
        document.head.append(fuente);
      }
    } else {
      video.removeAttribute("src");
      $("#fuente-externa")?.remove();
    }
    video.hidden = !externos;
    $("#video-permiso").hidden = externos;
    avisoCookies.hidden = !!consentimiento;
  }
  let retornoCookies;
  function configurarCookies() {
    retornoCookies = document.activeElement;
    $("#ck-externos").checked = !!consentimiento?.externos;
    $("#ck-campanas").checked = !!consentimiento?.campanas;
    dialogCookies.showModal();
  }
  function cerrarCookies() {
    dialogCookies.close();
    if (retornoCookies?.isConnected && !retornoCookies.closest("[hidden]")) retornoCookies.focus();
    else $("#pie-cookies-configurar").focus();
  }
  function guardarCookies(externos, campanas) {
    consentimiento = { version:1, fecha:Date.now(), externos, campanas };
    ls.set("ab_consentimiento", JSON.stringify(consentimiento));
    aplicarConsentimiento();
    if (dialogCookies.open) cerrarCookies();
  }
  $$("[data-cookies-configurar]").forEach(b => b.addEventListener("click", configurarCookies));
  $("#ck-aceptar").addEventListener("click", () => guardarCookies(true, true));
  $("#ck-rechazar").addEventListener("click", () => guardarCookies(false, false));
  $("#ck-guardar").addEventListener("click", () => guardarCookies($("#ck-externos").checked, $("#ck-campanas").checked));
  $("#ck-cerrar").addEventListener("click", cerrarCookies);
  aplicarConsentimiento();
