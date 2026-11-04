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

// Mientras no existan las landings de producto, los enlaces llevan a la
// lista de categorías. Luego apuntarán a /catalogo/<categoria>.
export const RUTA_PENDIENTE = "#categorias";
export const RUTA_INICIAR_SESION = "/iniciar-sesion";
export const RUTA_REGISTRO = "/registro";

/* 1. Hero (amanecer): titular centrado y video grande con botón de pausa
   Video: la ciudad despierta, vista aérea de una avenida al amanecer.
   Horizontal 16:9, 16 segundos. */
export const hero = {
  lineas: ["No es solo un vehículo.", "Es tu forma de moverte."],
  video: "hero",
};

/* 2. Sección anclada horizontal (mañana): video, texto y tarjetas
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

/* 3. Palabras que se encienden con el scroll (de la mañana al atardecer)
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

/* 4. Pedestal (atardecer): el vehículo estrella a pantalla completa
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

/* 5. Sección verde oscuro (anochecer): palabras que entran una a una,
   dos tarjetas y cierre. Fotos cuadradas 1:1 con luz cálida de tienda. */
export const oscura = {
  etiqueta: "Empieza a rodar",
  titulo: ["Compra,", "alquila,", "rueda."],
  tarjetas: [
    {
      titulo: "Comprar",
      enlace: "Ver catálogo",
      href: RUTA_PENDIENTE,
      // Escaparate de una tienda de bicicletas de noche, con luz cálida
      foto: "/img/landing/comprar.jpg",
    },
    {
      titulo: "Alquilar",
      enlace: "Ver alquiler",
      href: RUTA_PENDIENTE,
      // Asesora de MoviGo entregando las llaves a un cliente
      foto: "/img/landing/alquilar.jpg",
    },
  ],
  cierre: {
    etiqueta: "Portal empresarial: flotas para tu equipo",
    texto:
      "Cotiza, administra y mantén los vehículos de tu empresa desde un solo panel.",
    boton: { texto: "Solicitar cotización", href: "#contacto" },
  },
};

/* 6. Sección salvia (servicios): frase con palabras resaltadas y dos
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
      href: "#servicios",
      // Mecánico ajustando una moto o bicicleta, luz cálida de taller
      foto: "/img/landing/mantenimiento.jpg",
    },
    {
      etiqueta: "A tu puerta",
      texto:
        "Te llevamos tu compra o tu alquiler donde estés y lo recogemos cuando termines.",
      enlace: "Pedir domicilio",
      href: "#servicios",
      // El repartidor de MoviGo sacando un pedido de su maleta térmica
      foto: "/img/landing/domicilio.jpg",
    },
  ],
};

/* 7. Sección blanca: título centrado y lista de categorías con foto grande
   Foto horizontal 4:3: tienda con bicicletas en exhibición. */
export const categorias = {
  etiqueta: "Elige tu MoviGo",
  titulo: "Seis formas de moverte y todo lo que necesitas para rodar",
  boton: { texto: "Ver catálogo completo", href: RUTA_PENDIENTE },
  foto: "/img/landing/catalogo.jpg",
  items: [
    { nombre: "Bicicletas", modo: "Compra · Alquiler", href: RUTA_PENDIENTE },
    { nombre: "Scooters", modo: "Compra · Alquiler", href: RUTA_PENDIENTE },
    { nombre: "Motos", modo: "Compra · Alquiler", href: RUTA_PENDIENTE },
    { nombre: "Autos eléctricos", modo: "Compra · Alquiler", href: RUTA_PENDIENTE },
    { nombre: "Drones", modo: "Compra · Alquiler", href: RUTA_PENDIENTE },
    { nombre: "Patinetas", modo: "Compra", href: RUTA_PENDIENTE },
    { nombre: "Accesorios", modo: "Compra", href: RUTA_PENDIENTE },
  ],
};

/* Menú lateral y pie de página */
export const menu = {
  principales: [
    { texto: "Categorías", href: "#categorias" },
    { texto: "Servicios", href: "#servicios" },
    { texto: "Empresas", href: "#empresas" },
    { texto: "Contacto", href: "#contacto" },
  ],
  secundarios: [
    { texto: "Comprar", href: RUTA_PENDIENTE },
    { texto: "Alquilar", href: RUTA_PENDIENTE },
    { texto: "Mantenimiento", href: "#servicios" },
    { texto: "Domicilios", href: "#servicios" },
    { texto: "Iniciar sesión", href: RUTA_INICIAR_SESION },
    { texto: "Registrarse", href: RUTA_REGISTRO },
    { texto: "Portal empresarial", href: "#empresas" },
    { texto: "Soporte", href: "#contacto" },
  ],
};

export const pie = {
  mapa: [
    { texto: "Categorías", href: "#categorias" },
    { texto: "Servicios", href: "#servicios" },
    { texto: "Empresas", href: "#empresas" },
    { texto: "Soporte", href: "#contacto" },
  ],
  cuenta: [
    { texto: "Iniciar sesión", href: RUTA_INICIAR_SESION },
    { texto: "Registrarse", href: RUTA_REGISTRO },
    { texto: "Mi cuenta", href: RUTA_INICIAR_SESION },
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
    "Proyecto académico con fines educativos. Universidad Autónoma de Bucaramanga (UNAB), Ingeniería de Software. Las marcas y productos pertenecen a sus respectivos dueños.",
};
