/* =====================================================================
   PROMOCIONES POR CAMPAÑA
   El anuncio enlaza con ?promo=codigo. Sin código se usa la que tenga
   porDefecto: true. Vencida la fecha, el bloque desaparece solo.
   ===================================================================== */
const PROMOS = {
  anticipada2027: {
    porDefecto: true,
    titulo: "Preinscripción anticipada 2027",
    beneficio: "Preinscríbete antes de la fecha límite y obtén [CONFIRMAR: % o monto] de descuento en tu matrícula, con tu precio congelado para 2027.",
    fechaLimite: "2026-12-31", // [CONFIRMAR] formato AAAA-MM-DD
    cupos: "[CONFIRMAR]",
    condiciones: "Válido para nuevos estudiantes que completen su inscripción en la gestión 2027. [CONFIRMAR condiciones]"
  }
  // ejemplo: verano2027: { titulo: "...", beneficio: "...", fechaLimite: "2027-02-15", cupos: 20, condiciones: "..." }
};
