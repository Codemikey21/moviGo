/**
 * Videos oficiales de los productos.
 *
 * Solo se guardan el ID de YouTube, el título y el canal que los publica: ningún
 * video se descarga ni se copia al proyecto. Los títulos y los canales son los
 * que aparecen en YouTube. Los productos que no están aquí no tienen un video
 * oficial del modelo exacto confirmado.
 *
 * La clave es "<categoria>/<slug>", la misma que usa src/data/medios.generado.json.
 * (No confundir con el campo `video` de cada producto, que es un archivo local
 * opcional con póster.)
 */

export const VIDEOS_OFICIALES = {
  'bicicletas/starker-t-flex': {
    youtubeId: 'r8pPqg6J5-E',
    titulo: 'Unboxing bicicleta eléctrica Starker T-Flex Aluminio',
    canal: 'Auteco Electric',
  },
  'patinetas/segway-ninebot-max-g2': {
    youtubeId: 'gfrEKlwiWic',
    titulo: 'Segway Ninebot Max G2: Unlock Your MAX',
    canal: 'Segway',
  },
  'motos/starker-thunder-1500': {
    youtubeId: 'lrowM9ElKps',
    titulo: 'Moto eléctrica THUNDER',
    canal: 'Auteco Electric',
  },
  'carros/renault-kwid-e-tech': {
    youtubeId: 'RQnNwWYoKNY',
    titulo: 'Prepárate para lograr grandes cosas todos los días con Renault Kwid E-Tech 100% eléctrico',
    canal: 'Renault Colombia - Oficial',
  },
  'patinetas/xiaomi-electric-scooter-4-ultra': {
    youtubeId: 'Kl1H9fGOYDI',
    titulo: 'Xiaomi Electric Scooter 4 Ultra performance test | Xiaomi Insider',
    canal: 'Xiaomi',
  },
  'carros/dacia-spring-2026': {
    youtubeId: 'Q8nJZzqbfBg',
    titulo: '2026 New Dacia Spring: Official Reveal Video',
    canal: 'Dacia UK',
  },
  'accesorios/specialized-align-ii-mips': {
    youtubeId: 'XIugcSMY95A',
    titulo: 'Meet the Align II',
    canal: 'Specialized Bicycles',
  },
}

// Enlace al video en YouTube.
export const urlVideo = (youtubeId) => `https://www.youtube.com/watch?v=${youtubeId}`

// Video oficial de un producto o null si no hay uno confirmado.
export function videoOficialDe(categoria, slug) {
  return VIDEOS_OFICIALES[`${categoria}/${slug}`] ?? null
}
