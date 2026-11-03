// Textos y archivos de medios de la landing, en un solo lugar.
// Para cambiar un texto, una foto o un video, se toca aquí y no en los
// componentes. La estructura de secciones copia la del sitio de referencia.

// Mientras no existan las landings de producto, los enlaces llevan a la
// lista de categorías. Luego apuntarán a /catalogo/<categoria>.
export const RUTA_PENDIENTE = "#categorias";
export const RUTA_INICIAR_SESION = "/iniciar-sesion";
export const RUTA_REGISTRO = "/registro";

/* 1. Hero: titular centrado y video grande con botón de pausa */
export const hero = {
  lineas: ["No es solo un vehículo.", "Es tu forma de moverte."],
  video: "hero",
};

/* 2. Sección anclada horizontal: video, texto y tarjetas */
export const recorrido = {
  etiqueta: "Una mejor forma de moverte",
  texto:
    "Dedica tu tiempo a lo que te importa y deja que MoviGo se encargue del vehículo.",
  video: "recorrido",
  tarjetas: [
    { foto: "/img/landing/recorrido-1.jpg", alt: "Entrega a domicilio" },
    { foto: "/img/landing/recorrido-2.jpg", alt: "Mantenimiento en taller" },
    { foto: "/img/landing/recorrido-3.jpg", alt: "Alquiler por horas" },
  ],
};

/* 3. Palabras que se encienden con el scroll + video a la derecha */
export const palabras = {
  etiqueta: "No es solo un vehículo, es un…",
  items: [
    { palabra: "Atajo", foto: "/img/landing/palabra-atajo.jpg" },
    { palabra: "Plan de domingo", foto: "/img/landing/palabra-domingo.jpg" },
    { palabra: "Escape", foto: "/img/landing/palabra-escape.jpg" },
    { palabra: "Aliado de trabajo", foto: "/img/landing/palabra-trabajo.jpg" },
    { palabra: "Nueva perspectiva", foto: "/img/landing/palabra-perspectiva.jpg" },
  ],
  boton: { texto: "La experiencia MoviGo", href: RUTA_PENDIENTE },
} as const;

/* 4. Pedestal: tu producto estrella a pantalla completa, texto abajo a la izquierda */
export const pedestal = {
  etiqueta: "El futuro de moverse",
  texto:
    "MoviGo reúne bicicletas, scooters, motos, autos eléctricos y drones con mantenimiento y domicilio, para que cada trayecto sea fácil y seguro.",
  boton: { texto: "Conoce los modelos", href: RUTA_PENDIENTE },
  video: "pedestal",
};

/* 5. Sección verde oscuro: palabras que entran una a una, dos tarjetas y cierre */
export const oscura = {
  etiqueta: "Empieza a rodar",
  titulo: ["Compra,", "alquila,", "rueda."],
  tarjetas: [
    {
      titulo: "Comprar",
      enlace: "Ver catálogo",
      href: RUTA_PENDIENTE,
      foto: "/img/landing/comprar.jpg",
    },
    {
      titulo: "Alquilar",
      enlace: "Ver alquiler",
      href: RUTA_PENDIENTE,
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

/* 6. Sección salvia: frase con palabras resaltadas y dos tarjetas con pie */
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
      foto: "/img/landing/mantenimiento.jpg",
    },
    {
      etiqueta: "A tu puerta",
      texto:
        "Te llevamos tu compra o tu alquiler donde estés y lo recogemos cuando termines.",
      enlace: "Pedir domicilio",
      href: "#servicios",
      foto: "/img/landing/domicilio.jpg",
    },
  ],
};

/* 7. Sección blanca: título centrado y lista de categorías con foto grande */
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
  // Foto grande del cierre: la parte trasera de un vehículo sobre fondo oscuro
  foto: "/img/landing/pie.jpg",
  // Se cambia a mano: la página se genera estática y no puede leer la fecha.
  anio: 2026,
  legal:
    "Proyecto académico con fines educativos. Universidad Autónoma de Bucaramanga (UNAB), Ingeniería de Software. Las marcas y productos pertenecen a sus respectivos dueños.",
};
