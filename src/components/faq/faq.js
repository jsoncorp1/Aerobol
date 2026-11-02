  /* ---------- FAQ ---------- */
  $("#faq").innerHTML = CONFIG.faq.map(f =>
    "<details><summary>" + t(f.p) + "</summary><p>" + t(f.r) + "</p></details>").join("");
