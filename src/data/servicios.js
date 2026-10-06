/**
 * Servicios y páginas de apoyo de MoviGo.
 *
 * MoviGo es un proyecto académico y estos servicios todavía no funcionan: cada
 * página describe lo que se planea ofrecer, sin cifras ni plazos. Los textos
 * deben seguir siendo verdaderos mientras el servicio no exista. Los íconos son
 * trazos SVG sobre un lienzo de 48 × 48.
 */

const circulo = (cx, cy, r) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`

export const SERVICIOS = [
  {
    slug: 'domicilios',
    ruta: '/servicios/domicilios',
    nombre: 'Domicilios',
    tagline: 'Entregas con la misma flota.',
    resumen: 'Domicilios con bicicletas, patinetas y motos.',
    colorAcento: '#ff9f0a',
    icono: [
      'M8 16 L24 8 L40 16 V32 L24 40 L8 32 Z',
      'M8 16 L24 24 L40 16',
      'M24 24 V40',
    ],
    descripcion:
      'MoviGo quiere hacer domicilios con los mismos vehículos que vende y alquila. El servicio está en construcción: esta página describe lo que se planea ofrecer.',
    ofrece: [
      {
        titulo: 'La misma flota',
        texto:
          'Los domicilios se harían con vehículos del catálogo, como bicicletas, patinetas y motos.',
      },
      {
        titulo: 'Pedidos de comercios',
        texto:
          'Pensado para que los comercios soliciten entregas desde el portal empresarial.',
      },
      {
        titulo: 'Seguimiento del pedido',
        texto:
          'Se planea que quien envía y quien recibe puedan consultar el estado de la entrega.',
      },
      {
        titulo: 'Registro de entregas',
        texto:
          'Cada entrega quedaría registrada para poder consultarla después.',
      },
    ],
    proximamente: {
      titulo: 'Estamos construyendo el servicio de domicilios',
      texto:
        'Todavía no se pueden solicitar entregas. El servicio se conectará con el portal empresarial para que los comercios gestionen sus pedidos.',
      lista: [
        'Solicitud de entregas desde la web',
        'Tarifa calculada antes de confirmar',
        'Seguimiento del pedido',
        'Historial de entregas para empresas',
      ],
    },
  },
  {
    slug: 'alquiler',
    ruta: '/servicios/alquiler',
    nombre: 'Alquiler',
    tagline: 'Úsalo cuando lo necesites.',
    resumen: 'Por hora, por día o por semana.',
    colorAcento: '#30d158',
    icono: [circulo(24, 24, 16), 'M24 14 V24 L31 28'],
    descripcion:
      'Alquila los vehículos del catálogo por el tiempo que los necesites, sin comprarlos. Cada producto de la tienda muestra una tarifa de ejemplo por hora, por día y por semana; todavía no son tarifas reales.',
    ofrece: [
      {
        titulo: 'Tarifas por tiempo',
        texto:
          'Una tarifa por hora, por día y por semana en cada producto que se pueda alquilar.',
      },
      {
        titulo: 'Reserva y recogida',
        texto:
          'Se planea reservar en línea y recoger el vehículo en un punto de servicio.',
      },
      {
        titulo: 'Accesorios de seguridad',
        texto:
          'El catálogo incluye cascos, luces y candados para completar el equipo.',
      },
      {
        titulo: 'Flotas para empresas',
        texto:
          'Alquiler para negocios que necesitan varios vehículos, desde el portal empresarial.',
      },
    ],
    proximamente: {
      titulo: 'El sistema de reservas está en construcción',
      texto:
        'Todavía no se puede reservar. Mientras tanto, puedes consultar las tarifas de ejemplo en la página de cada producto.',
      lista: [
        'Calendario de disponibilidad por vehículo',
        'Reserva por horas, días o semanas',
        'Registro e identificación del usuario',
        'Pago en línea',
      ],
    },
  },
  {
    slug: 'mantenimiento',
    ruta: '/servicios/mantenimiento',
    nombre: 'Mantenimiento',
    tagline: 'Siempre listos para rodar.',
    resumen: 'Revisión y cuidado de los vehículos.',
    colorAcento: '#2997ff',
    icono: [
      'M14 34 L30 18',
      circulo(34, 14, 6),
      circulo(12, 36, 3),
    ],
    descripcion:
      'Cuidar los vehículos de la flota y los de los clientes es parte de la propuesta de MoviGo. El servicio está en construcción: esta página describe lo que se planea ofrecer.',
    ofrece: [
      {
        titulo: 'Revisiones periódicas',
        texto:
          'Revisión de frenos, llantas y batería de cada vehículo.',
      },
      {
        titulo: 'Taller en los puntos de servicio',
        texto:
          'Ajustes y reparaciones básicas en los puntos de servicio.',
      },
      {
        titulo: 'Para flotas y empresas',
        texto:
          'Mantenimiento de los vehículos de un negocio, coordinado desde el portal empresarial.',
      },
      {
        titulo: 'Historial de cada vehículo',
        texto:
          'Registro de las revisiones y reparaciones de cada vehículo.',
      },
    ],
    proximamente: {
      titulo: 'Agenda tu mantenimiento desde la web',
      texto:
        'Todavía no se pueden agendar citas. Se está diseñando el módulo para reservar una cita en un punto de servicio y consultar el estado de cada vehículo.',
      lista: [
        'Agenda de citas en el punto de servicio',
        'Estado de la batería, los frenos y las llantas',
        'Recordatorios de revisión',
        'Cotización de repuestos y reparaciones',
      ],
    },
  },
  {
    slug: 'puntos-de-servicio',
    ruta: '/puntos-de-servicio',
    nombre: 'Puntos de servicio',
    tagline: 'Un lugar para recoger, devolver y consultar.',
    resumen: 'Recoge, devuelve y recibe ayuda en tu ciudad.',
    colorAcento: '#bf5af2',
    icono: [
      'M24 42 C24 42 11 30 11 20 A13 13 0 0 1 37 20 C37 30 24 42 24 42 Z',
      circulo(24, 20, 5),
    ],
    descripcion:
      'MoviGo planea una red de puntos para recoger y devolver vehículos, comprar accesorios y recibir asesoría. Se empezaría por Bucaramanga y su área metropolitana. Todavía no hay ningún punto abierto.',
    ofrece: [
      {
        titulo: 'Recogida y devolución',
        texto:
          'Recoger un vehículo alquilado y devolverlo en uno de los puntos.',
      },
      {
        titulo: 'Carga de baterías',
        texto:
          'Se planea ofrecer carga de baterías para los vehículos eléctricos.',
      },
      {
        titulo: 'Asesoría en persona',
        texto:
          'Conocer los vehículos antes de comprarlos y recibir orientación para elegir.',
      },
      {
        titulo: 'Taller básico',
        texto:
          'Ajustes y revisiones sencillas de los vehículos.',
      },
    ],
    proximamente: {
      titulo: 'Un mapa con todos nuestros puntos',
      texto:
        'Cuando existan los puntos, se publicará un mapa para encontrar el más cercano y consultar su horario y sus servicios.',
      lista: [
        'Mapa con búsqueda por barrio y por cercanía',
        'Horarios y servicios de cada punto',
        'Disponibilidad de vehículos y baterías',
        'Indicaciones para llegar',
      ],
    },
  },
  {
    slug: 'soporte',
    ruta: '/soporte',
    nombre: 'Soporte',
    tagline: 'Estamos para ayudarte.',
    resumen: 'Ayuda con tus compras, alquileres y entregas.',
    colorAcento: '#40c8e0',
    icono: [
      'M8 12 H40 V30 H22 L14 38 V30 H8 Z',
      'M16 19 H32 M16 24 H27',
    ],
    descripcion:
      'Un solo lugar para resolver dudas sobre compras, alquileres y entregas. Se planea combinar guías paso a paso con atención de una persona. El servicio todavía no está activo.',
    ofrece: [
      {
        titulo: 'Centro de ayuda',
        texto:
          'Guías para usar, cargar y cuidar cada tipo de vehículo.',
      },
      {
        titulo: 'Contacto con un asesor',
        texto:
          'Un canal para escribir al equipo de MoviGo.',
      },
      {
        titulo: 'Garantías y devoluciones',
        texto:
          'Consulta del estado de una garantía o de una devolución.',
      },
      {
        titulo: 'Ayuda en ruta',
        texto:
          'Orientación cuando un vehículo alquilado presenta una falla.',
      },
    ],
    proximamente: {
      titulo: 'Tu centro de ayuda está en camino',
      texto:
        'Todavía no hay atención activa. Se están escribiendo las guías y definiendo el canal de contacto.',
      lista: [
        'Buscador de ayuda',
        'Contacto con un asesor',
        'Seguimiento de casos, garantías y devoluciones',
        'Ayuda para vehículos alquilados',
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
