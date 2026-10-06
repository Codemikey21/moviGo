/**
 * Servicios y páginas de apoyo de MoviGo.
 *
 * Estas páginas aún no tienen funcionalidad, pero cada una describe con
 * detalle lo que ofrecerá. Los íconos son trazos SVG sobre un lienzo de 48 × 48.
 */

const circulo = (cx, cy, r) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`

export const SERVICIOS = [
  {
    slug: 'domicilios',
    ruta: '/servicios/domicilios',
    nombre: 'Domicilios',
    tagline: 'Tus pedidos, en minutos.',
    resumen: 'Entregas rápidas con seguimiento en tiempo real.',
    colorAcento: '#ff9f0a',
    icono: [
      'M8 16 L24 8 L40 16 V32 L24 40 L8 32 Z',
      'M8 16 L24 24 L40 16',
      'M24 24 V40',
    ],
    descripcion:
      'La misma flota con la que te mueves por la ciudad entrega tus pedidos. Conectamos a comercios y a clientes con repartidores en bicicleta, patineta, moto o dron, según la distancia y el tipo de carga.',
    ofrece: [
      {
        titulo: 'Entregas en minutos',
        texto:
          'Asignamos automáticamente al repartidor y al vehículo más cercano y adecuado para cada pedido.',
      },
      {
        titulo: 'Seguimiento en tiempo real',
        texto:
          'Quien envía y quien recibe ven el recorrido en el mapa y reciben avisos en cada etapa de la entrega.',
      },
      {
        titulo: 'Para cada tipo de carga',
        texto:
          'Desde documentos y comida hasta paquetes de varios kilos, con bolsas térmicas y cajas de reparto incluidas.',
      },
      {
        titulo: 'Prueba de entrega',
        texto:
          'Confirmación con código y foto para que cada pedido quede registrado y sin discusiones.',
      },
    ],
    proximamente: {
      titulo: 'Estamos construyendo el servicio de domicilios',
      texto:
        'Muy pronto podrás programar entregas desde la web, elegir el tipo de vehículo y pagar en línea. Los comercios podrán gestionar sus pedidos desde el portal empresarial.',
      lista: [
        'Solicitud de entregas inmediatas o programadas',
        'Tarifa calculada por distancia y peso antes de confirmar',
        'Mapa con la ubicación del repartidor en vivo',
        'Historial de entregas y facturación para empresas',
      ],
    },
  },
  {
    slug: 'alquiler',
    ruta: '/servicios/alquiler',
    nombre: 'Alquiler',
    tagline: 'Úsalo cuando lo necesites.',
    resumen: 'Por hora, por día o por semana, sin compromisos.',
    colorAcento: '#30d158',
    icono: [circulo(24, 24, 16), 'M24 14 V24 L31 28'],
    descripcion:
      'Alquila cualquier vehículo de la flota por el tiempo que lo necesites, sin pagar el costo de comprarlo. Cada producto de la tienda muestra su tarifa por hora, por día y por semana.',
    ofrece: [
      {
        titulo: 'Tarifas claras',
        texto:
          'Precio por hora, por día y por semana en cada producto, sin cargos escondidos.',
      },
      {
        titulo: 'Reserva y recoge',
        texto:
          'Reserva en línea y recoge tu vehículo en el punto de servicio más cercano, o pide que te lo llevemos.',
      },
      {
        titulo: 'Equipo incluido',
        texto:
          'Casco, luces y candado vienen con tu alquiler, y puedes añadir baterías extra si las necesitas.',
      },
      {
        titulo: 'Flotas para empresas',
        texto:
          'Planes mensuales con descuento para negocios que necesitan varios vehículos al mismo tiempo.',
      },
    ],
    proximamente: {
      titulo: 'El sistema de reservas llega muy pronto',
      texto:
        'Estamos terminando el proceso de reserva para que puedas elegir fecha, vehículo y punto de recogida en pocos pasos. Mientras tanto, puedes consultar las tarifas de alquiler en la página de cada producto.',
      lista: [
        'Calendario de disponibilidad por vehículo',
        'Reserva por horas, días o semanas',
        'Verificación de identidad desde el celular',
        'Pago en línea y depósito reembolsable',
      ],
    },
  },
  {
    slug: 'mantenimiento',
    ruta: '/servicios/mantenimiento',
    nombre: 'Mantenimiento',
    tagline: 'Siempre listos para rodar.',
    resumen: 'Revisiones y reparaciones con alertas automáticas.',
    colorAcento: '#2997ff',
    icono: [
      'M14 34 L30 18',
      circulo(34, 14, 6),
      circulo(12, 36, 3),
    ],
    descripcion:
      'Cuidamos los vehículos de la flota y los tuyos. Un sistema de alertas revisa el uso de cada equipo y programa el mantenimiento antes de que aparezcan las fallas.',
    ofrece: [
      {
        titulo: 'Alertas automáticas',
        texto:
          'Avisamos cuando toca revisar frenos, llantas o batería, según los kilómetros y las horas de uso reales.',
      },
      {
        titulo: 'Taller especializado',
        texto:
          'Técnicos con experiencia en vehículos eléctricos y repuestos originales de cada línea.',
      },
      {
        titulo: 'Mantenimiento a domicilio',
        texto:
          'Para flotas y empresas, un técnico puede revisar los vehículos en tu bodega o punto de operación.',
      },
      {
        titulo: 'Historial digital',
        texto:
          'Cada revisión queda registrada en el historial del vehículo, útil para la garantía y la reventa.',
      },
    ],
    proximamente: {
      titulo: 'Agenda tu mantenimiento desde la web',
      texto:
        'Estamos desarrollando el módulo para reservar cita en taller, recibir recordatorios y consultar el estado de salud de cada vehículo. Será parte del portal empresarial y de tu cuenta personal.',
      lista: [
        'Agenda de citas en el punto de servicio',
        'Panel con el estado de la batería, los frenos y las llantas',
        'Notificaciones antes de cada revisión programada',
        'Cotización de repuestos y reparaciones en línea',
      ],
    },
  },
  {
    slug: 'puntos-de-servicio',
    ruta: '/puntos-de-servicio',
    nombre: 'Puntos de servicio',
    tagline: 'Siempre hay uno cerca.',
    resumen: 'Recoge, devuelve, carga y repara en tu ciudad.',
    colorAcento: '#bf5af2',
    icono: [
      'M24 42 C24 42 11 30 11 20 A13 13 0 0 1 37 20 C37 30 24 42 24 42 Z',
      circulo(24, 20, 5),
    ],
    descripcion:
      'Una red de puntos para recoger y devolver tu vehículo, cambiar la batería, comprar accesorios y recibir ayuda de un asesor. Empezaremos por Bucaramanga y su área metropolitana.',
    ofrece: [
      {
        titulo: 'Recogida y devolución',
        texto:
          'Recoge tu vehículo alquilado y devuélvelo en cualquier punto, aunque no sea el mismo donde lo tomaste.',
      },
      {
        titulo: 'Estaciones de carga',
        texto:
          'Carga tu batería o cámbiala por una completa en menos de dos minutos.',
      },
      {
        titulo: 'Asesoría en persona',
        texto:
          'Prueba los vehículos antes de comprarlos y recibe orientación para elegir el que mejor se ajusta a tus rutas.',
      },
      {
        titulo: 'Taller rápido',
        texto:
          'Ajustes, pinchazos y revisiones básicas mientras esperas, sin necesidad de cita.',
      },
    ],
    proximamente: {
      titulo: 'Un mapa con todos nuestros puntos',
      texto:
        'Estamos preparando un mapa interactivo para que encuentres el punto más cercano, consultes su horario y veas en tiempo real cuántos vehículos y baterías tiene disponibles.',
      lista: [
        'Mapa con búsqueda por barrio y por cercanía',
        'Horarios y servicios disponibles en cada punto',
        'Disponibilidad de vehículos y baterías en vivo',
        'Indicaciones para llegar a pie, en bicicleta o en carro',
      ],
    },
  },
  {
    slug: 'soporte',
    ruta: '/soporte',
    nombre: 'Soporte',
    tagline: 'Estamos para ayudarte.',
    resumen: 'Respuestas rápidas, cuando las necesites.',
    colorAcento: '#40c8e0',
    icono: [
      'M8 12 H40 V30 H22 L14 38 V30 H8 Z',
      'M16 19 H32 M16 24 H27',
    ],
    descripcion:
      'Un solo lugar para resolver dudas sobre tus compras, tus alquileres y tus entregas. Combinaremos guías paso a paso con atención de personas reales cuando lo necesites.',
    ofrece: [
      {
        titulo: 'Centro de ayuda',
        texto:
          'Guías cortas para usar, cargar y cuidar cada tipo de vehículo, con vídeos y preguntas frecuentes.',
      },
      {
        titulo: 'Chat con un asesor',
        texto:
          'Escríbenos y recibe respuesta de nuestro equipo en horario extendido, todos los días.',
      },
      {
        titulo: 'Garantías y devoluciones',
        texto:
          'Consulta el estado de tu garantía, solicita una devolución o abre un caso desde tu cuenta.',
      },
      {
        titulo: 'Asistencia en ruta',
        texto:
          'Si tu vehículo alquilado falla en la calle, enviamos ayuda o un reemplazo al lugar donde estés.',
      },
    ],
    proximamente: {
      titulo: 'Tu centro de ayuda está en camino',
      texto:
        'Estamos escribiendo las guías y conectando el chat de atención. Cuando esté listo, podrás abrir casos y seguir su avance desde tu cuenta, sin repetir tu historia a cada asesor.',
      lista: [
        'Buscador de ayuda con respuestas inmediatas',
        'Chat en vivo con asesores',
        'Seguimiento de casos, garantías y devoluciones',
        'Línea de asistencia en ruta para alquileres',
      ],
    },
  },
]

/**
 * Páginas provisionales de la sección "Empresas".
 * No tienen contenido propio todavía: reutilizan, sin cambios, el texto de los
 * servicios que ya existen (domicilios y alquiler). Solo cambian el nombre y
 * la ruta, para que el menú de Empresas lleve a una página con el mismo patrón
 * que las demás páginas de servicio.
 */
const servicioBase = (slug) => SERVICIOS.find((servicio) => servicio.slug === slug)

export const EMPRESAS = [
  {
    ...servicioBase('domicilios'),
    slug: 'empresas-domicilios',
    ruta: '/empresas/domicilios',
    nombre: 'Domicilios para negocios',
  },
  {
    ...servicioBase('alquiler'),
    slug: 'empresas-alquiler',
    ruta: '/empresas/alquiler',
    nombre: 'Alquiler para flotas',
  },
]
