// Textos y archivos de medios de la landing, en un solo lugar.
// Para cambiar un texto, una foto o un video, se toca aquí y no en los
// componentes. La estructura de secciones copia la del sitio de referencia.
//
// HILO DE LA LANDING: "un día moviéndote con MoviGo".
// Al bajar, el visitante recorre un día completo: amanece en el hero,
// trabaja a mediodía, sale el domingo, escapa en la tarde y la página
// termina de noche en el pie. Cada foto y video muestra un vehículo de
// MoviGo (bicicleta, scooter, moto, auto eléctrico, dron o patineta).
//
// Reglas para que todo combine:
//   - Luz: amanecer o atardecer dorado; de noche, luces de ciudad.
//   - Color: tonos cálidos con verde o turquesa. Nada de cielo blanco.
//   - Vehículos claros (blanco, gris claro, verde pálido) y sin marcas.
//   - Gente natural, en movimiento. Sin placas ni logos visibles.

// Catálogo: /catalogo, filtrado con ?categoria=<slug> y ?modo=comprar|alquilar
export const RUTA_CATALOGO = "/catalogo";
const RUTA_PENDIENTE = RUTA_CATALOGO;
const categoria = (slug: string) => `${RUTA_CATALOGO}?categoria=${slug}`;
export const RUTA_INICIAR_SESION = "/iniciar-sesion";
export const RUTA_REGISTRO = "/registro";

/* 1. Historia (escena fija al hacer scroll, estilo "How to ride")
   Abre la landing: video a pantalla completa con el título, después los
   paneles se recortan y se cruzan, aparece la lista grande y un menú de
   pastillas recorre las categorías. Termina con el llamado a crear cuenta.
   Reemplaza al hero, al recorrido horizontal y a las palabras (secciones
   2 a 4 de abajo), que quedan guardadas por si se quieren volver a usar. */
export const historia = {
  titulo: [
    ["Así", "de", "fácil"],
    ["es", "moverte"],
  ],
  // Video a pantalla completa del inicio (public/video/<nombre>-1080.mp4)
  video: "recorrido",
  // Foto que entra por la derecha en el segundo momento
  foto: "/img/landing/recorrido-3.jpg",
  textoAlt: "Mujer revisando su celular junto a un scooter eléctrico",
  // Miniatura de abajo a la izquierda y lo que dice su burbuja en cada momento
  miniatura: "/img/landing/recorrido-1.jpg",
  burbujas: [
    { texto: "Buscando tu scooter", puntos: true },
    { texto: "Listo en MoviGo Cabecera", puntos: false },
    { texto: "¡Buen viaje!", puntos: false },
  ],
  paso1: {
    etiqueta: "Cómo funciona",
    titulo: "Abres MoviGo, eliges tu vehículo y lo reservas en segundos.",
    texto: "Si ya pediste un domicilio alguna vez, ya sabes cómo es.",
  },
  paso2: {
    etiqueta: "Conoce tu vehículo",
    titulo: "Te esperamos en el punto o te lo llevamos a la puerta.",
    texto: "Casco incluido, batería cargada y revisado por nuestro taller antes de cada salida.",
  },
  // No repite el "Compra, alquila, rueda" de la sección oscura
  lista: ["Elige.", "Reserva.", "Rueda."],
  categorias: [
    {
      nombre: "Scooters",
      foto: "/img/landing/palabra-trabajo.jpg",
      titulo: "Para el día a día",
      texto: "Plegables y eléctricos. Llegas al trabajo sin trancón y lo guardas debajo del escritorio.",
    },
    {
      nombre: "Bicicletas",
      foto: "/img/landing/palabra-domingo.jpg",
      titulo: "Para el plan de domingo",
      texto: "Urbanas, de montaña y eléctricas. Para salir en familia o subir a la Mesa de los Santos.",
    },
    {
      nombre: "Motos",
      foto: "/img/landing/palabra-escape.jpg",
      titulo: "Para escaparte",
      texto: "De ciudad o de ruta. Alquílala por días y sal de Bucaramanga cuando quieras.",
    },
    {
      nombre: "Autos",
      foto: "/img/landing/pie.jpg",
      titulo: "Para ir lejos",
      texto: "Autos eléctricos para el trabajo y la familia, con carga incluida en cada punto.",
    },
    {
      nombre: "Drones",
      foto: "/img/landing/palabra-perspectiva.jpg",
      titulo: "Para verlo todo",
      texto: "Para fotografía, video o simplemente ver tu ciudad desde arriba.",
    },
  ],
  cierre: {
    etiqueta: "Tu MoviGo te espera",
    titulo: "Elige, reserva y sal a rodar.",
    boton: { texto: "Crear mi cuenta", href: RUTA_REGISTRO },
    enlace: { texto: "Ver categorías", href: "#categorias" },
  },
};

/* --- Secciones guardadas (no se usan desde que está la historia) ---

   2. Hero (amanecer): titular centrado y video grande con botón de pausa
   Video: la ciudad despierta, vista aérea de una avenida al amanecer.
   Horizontal 16:9, 16 segundos. */
export const hero = {
  lineas: ["No es solo un vehículo.", "Es tu forma de moverte."],
  video: "hero",
};

/* 3. Sección anclada horizontal (mañana): video, texto y tarjetas
   Video: el repartidor de MoviGo (maleta verde, scooter blanco) rodando
   por la ciudad. Es el mismo personaje de recorrido-1, palabra-trabajo y
   domicilio, para que la historia tenga un protagonista. Las tres tarjetas
   son los servicios en el orden en que se usan: te llega el vehículo, lo
   mantienes y lo alquilas cuando lo necesitas. Fotos verticales 3:4. */
export const recorrido = {
  etiqueta: "Una mejor forma de moverte",
  texto:
    "Dedica tu tiempo a lo que te importa y deja que MoviGo se encargue del vehículo.",
  video: "recorrido",
  tarjetas: [
    {
      foto: "/img/landing/recorrido-1.jpg",
      alt: "Repartidor de MoviGo caminando con su scooter y su maleta térmica",
    },
    {
      foto: "/img/landing/recorrido-2.jpg",
      alt: "Mecánico sonriendo mientras revisa una rueda en el taller",
    },
    {
      foto: "/img/landing/recorrido-3.jpg",
      alt: "Mujer revisando su celular junto a un scooter eléctrico",
    },
  ],
};

/* 4. Palabras que se encienden con el scroll (de la mañana al atardecer)
   Cada palabra es un vehículo distinto y un momento del día.
   Fotos verticales 3:4. */
export const palabras = {
  etiqueta: "No es solo un vehículo, es un…",
  items: [
    // Mañana: motos pasando entre el tráfico
    { palabra: "Atajo", foto: "/img/landing/palabra-atajo.jpg" },
    // Mediodía: el repartidor de MoviGo con su scooter y su maleta
    { palabra: "Aliado de trabajo", foto: "/img/landing/palabra-trabajo.jpg" },
    // Fin de semana: familia o amigos en bicicleta por un parque
    { palabra: "Plan de domingo", foto: "/img/landing/palabra-domingo.jpg" },
    // Tarde: moto en carretera de montaña, luz dorada
    { palabra: "Escape", foto: "/img/landing/palabra-escape.jpg" },
    // Atardecer: la ciudad vista desde el aire, como desde un dron
    { palabra: "Nueva perspectiva", foto: "/img/landing/palabra-perspectiva.jpg" },
  ],
  boton: { texto: "La experiencia MoviGo", href: RUTA_PENDIENTE },
} as const;

/* --- Secciones en uso, después de la historia --- */

/* 5. Pedestal (atardecer): el vehículo estrella a pantalla completa
   Video: una moto estacionada con el sol de la tarde a contraluz y su
   sombra larga. Deja espacio libre abajo a la izquierda para el texto.
   Horizontal 16:9. */
export const pedestal = {
  etiqueta: "El futuro de moverse",
  texto:
    "MoviGo reúne bicicletas, scooters, motos, autos eléctricos y drones con mantenimiento y domicilio, para que cada trayecto sea fácil y seguro.",
  boton: { texto: "Conoce los modelos", href: RUTA_PENDIENTE },
  video: "pedestal",
};

/* 6. Sección verde oscuro (anochecer): palabras que entran una a una,
   dos tarjetas y cierre. Fotos cuadradas 1:1 con luz cálida de tienda. */
export const oscura = {
  etiqueta: "Empieza a rodar",
  titulo: ["Compra,", "alquila,", "rueda."],
  tarjetas: [
    {
      titulo: "Comprar",
      enlace: "Ver catálogo",
      href: `${RUTA_CATALOGO}?modo=comprar`,
      // Escaparate de una tienda de bicicletas de noche, con luz cálida
      foto: "/img/landing/comprar.jpg",
    },
    {
      titulo: "Alquilar",
      enlace: "Ver alquiler",
      href: `${RUTA_CATALOGO}?modo=alquilar`,
      // Asesora de MoviGo entregando las llaves a un cliente
      foto: "/img/landing/alquilar.jpg",
    },
  ],
  cierre: {
    etiqueta: "Portal empresarial: flotas para tu equipo",
    texto:
      "Cotiza, administra y mantén los vehículos de tu empresa desde un solo panel.",
    boton: { texto: "Solicitar cotización", href: "/empresas" },
  },
};

/* 7. Sección salvia (servicios): frase con palabras resaltadas y dos
   tarjetas con pie. Fotos cuadradas 1:1. */
export const salvia = {
  etiqueta: "Movilidad a tu medida",
  // Las partes con `resaltar: true` van en color eucalipto
  frase: [
    { texto: "MoviGo es tu forma de moverte: " },
    { texto: "más limpia, más libre, más tuya", resaltar: true },
    { texto: " — y mucho más divertida." },
  ],
  tarjetas: [
    {
      etiqueta: "Sin filas ni esperas",
      texto:
        "Agenda una revisión o reparación y sigue el estado de tu vehículo desde tu cuenta.",
      enlace: "Agendar mantenimiento",
      href: "/mi-cuenta/mantenimiento",
      // Mecánico ajustando una moto o bicicleta, luz cálida de taller
      foto: "/img/landing/mantenimiento.jpg",
    },
    {
      etiqueta: "A tu puerta",
      texto:
        "Te llevamos tu compra o tu alquiler donde estés y lo recogemos cuando termines.",
      enlace: "Pedir domicilio",
      href: RUTA_CATALOGO,
      // El repartidor de MoviGo sacando un pedido de su maleta térmica
      foto: "/img/landing/domicilio.jpg",
    },
  ],
};

/* 8. Sección blanca: título centrado y lista de categorías con foto grande
   Foto horizontal 4:3: tienda con bicicletas en exhibición. */
export const categorias = {
  etiqueta: "Elige tu MoviGo",
  titulo: "Seis formas de moverte y todo lo que necesitas para rodar",
  boton: { texto: "Ver catálogo completo", href: RUTA_PENDIENTE },
  foto: "/img/landing/catalogo.jpg",
  items: [
    { nombre: "Bicicletas", modo: "Compra · Alquiler", href: categoria("bicicletas") },
    { nombre: "Scooters", modo: "Compra · Alquiler", href: categoria("scooters") },
    { nombre: "Motos", modo: "Compra · Alquiler", href: categoria("motos") },
    { nombre: "Autos eléctricos", modo: "Compra · Alquiler", href: categoria("autos-electricos") },
    { nombre: "Drones", modo: "Compra · Alquiler", href: categoria("drones") },
    { nombre: "Patinetas", modo: "Compra", href: categoria("patinetas") },
    { nombre: "Accesorios", modo: "Compra", href: categoria("accesorios") },
  ],
};

/* Menú lateral y pie de página */
export const menu = {
  principales: [
    { texto: "Catálogo", href: RUTA_CATALOGO },
    { texto: "Alquilar", href: `${RUTA_CATALOGO}?modo=alquilar` },
    { texto: "Servicios", href: "/#servicios" },
    { texto: "Empresas", href: "/empresas" },
  ],
  secundarios: [
    { texto: "Comprar", href: `${RUTA_CATALOGO}?modo=comprar` },
    { texto: "Mi carrito", href: "/carrito" },
    { texto: "Mis pedidos", href: "/mi-cuenta/pedidos" },
    { texto: "Mantenimiento", href: "/mi-cuenta/mantenimiento" },
    { texto: "Iniciar sesión", href: RUTA_INICIAR_SESION },
    { texto: "Registrarse", href: RUTA_REGISTRO },
    { texto: "Portal empresarial", href: "/empresas" },
    { texto: "Soporte", href: "/#contacto" },
  ],
};

export const pie = {
  mapa: [
    { texto: "Catálogo", href: RUTA_CATALOGO },
    { texto: "Servicios", href: "/#servicios" },
    { texto: "Empresas", href: "/#empresas" },
    { texto: "Soporte", href: "/#contacto" },
  ],
  cuenta: [
    { texto: "Iniciar sesión", href: RUTA_INICIAR_SESION },
    { texto: "Registrarse", href: RUTA_REGISTRO },
    { texto: "Mi cuenta", href: "/mi-cuenta" },
  ],
  boletin: {
    etiqueta: "Mantente al día",
    texto: "Novedades, modelos nuevos y promociones.",
  },
  legales: [
    { texto: "Política de privacidad", href: "#contacto" },
    { texto: "Términos de uso", href: "#contacto" },
    { texto: "Zonas de cobertura", href: "#contacto" },
    { texto: "Gestionar cookies", href: "#contacto" },
  ],
  // Cierre del día (noche): calle de ciudad con estelas de luz, foto
  // oscura horizontal 16:9
  foto: "/img/landing/pie.jpg",
  // Se cambia a mano: la página se genera estática y no puede leer la fecha.
  anio: 2026,
  legal:
    "Bucaramanga, Santander · Colombia. Precios en pesos colombianos con IVA incluido.",
};
