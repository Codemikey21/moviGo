// Canales de contacto y redes de MoviGo.
// Pon aquí los enlaces reales cuando existan: los que queden vacíos no se
// muestran en el sitio (ni en el pie, ni en el menú, ni en /contacto).

export const redes = {
  instagram: "", // https://instagram.com/tu_cuenta
  tiktok: "", // https://tiktok.com/@tu_cuenta
  youtube: "", // https://youtube.com/@tu_canal
};

export const canales = {
  /** Correo de soporte, por ejemplo hola@movigo.co */
  correo: "",
  /** Número de WhatsApp con indicativo y sin espacios, por ejemplo 573001234567 */
  whatsapp: "",
  /** Horario de atención que se muestra en /contacto */
  horario: "Lunes a sábado, de 8:00 a. m. a 6:00 p. m.",
};

/** Redes con enlace, en el orden en que se muestran. */
export const redesActivas = (
  [
    { nombre: "Instagram", red: "instagram", href: redes.instagram },
    { nombre: "TikTok", red: "tiktok", href: redes.tiktok },
    { nombre: "YouTube", red: "youtube", href: redes.youtube },
  ] as const
).filter((r) => r.href.trim() !== "");
