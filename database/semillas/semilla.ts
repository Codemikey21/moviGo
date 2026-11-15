// Datos iniciales de MoviGo: categorías, puntos de servicio, criterios de
// mantenimiento, productos del catálogo con sus unidades en cada punto y
// domiciliarios de demostración.
// Se puede correr las veces que quieras: si un dato ya existe, lo actualiza
// en vez de duplicarlo.
//
// Uso: npm run db:semilla

import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { Modalidad, PrismaClient, TipoCriterio } from "../../src/generated/prisma/client";
import { productos } from "./datos-productos";

config({ path: ".env.local", quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("Falta DATABASE_URL en .env.local.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// ---------------------------------------------------------------------------
// Categorías: las mismas de la landing, en el mismo orden.
// ---------------------------------------------------------------------------
const categorias = [
  {
    slug: "bicicletas",
    nombre: "Bicicletas",
    descripcion: "Urbanas, de montaña y eléctricas para moverte sin trancón.",
  },
  {
    slug: "scooters",
    nombre: "Scooters",
    descripcion: "Scooters eléctricos para trayectos cortos en la ciudad.",
  },
  {
    slug: "motos",
    nombre: "Motos",
    descripcion: "Motos de ciudad y de ruta, a gasolina y eléctricas.",
  },
  {
    slug: "autos-electricos",
    nombre: "Autos eléctricos",
    descripcion: "Carros eléctricos para la familia y el trabajo.",
  },
  {
    slug: "drones",
    nombre: "Drones",
    descripcion: "Drones para fotografía, video y recreación.",
  },
  {
    slug: "patinetas",
    nombre: "Patinetas",
    descripcion: "Patinetas clásicas y eléctricas.",
  },
  {
    slug: "accesorios",
    nombre: "Accesorios",
    descripcion: "Cascos, candados, luces, cargadores y repuestos.",
  },
];

// ---------------------------------------------------------------------------
// Puntos de servicio en el área metropolitana de Bucaramanga.
// Son de ejemplo: las coordenadas apuntan a cada sector, no a un local real.
// ---------------------------------------------------------------------------
const puntos = [
  {
    nombre: "MoviGo Cabecera",
    direccion: "Cabecera del Llano, Bucaramanga",
    latitud: 7.1193,
    longitud: -73.109,
    capacidad: 80,
    horario: "Lunes a sábado de 7:00 a. m. a 8:00 p. m.",
  },
  {
    nombre: "MoviGo Centro",
    direccion: "Centro, Bucaramanga",
    latitud: 7.1254,
    longitud: -73.1198,
    capacidad: 60,
    horario: "Lunes a sábado de 7:00 a. m. a 7:00 p. m.",
  },
  {
    nombre: "MoviGo Floridablanca",
    direccion: "Cañaveral, Floridablanca",
    latitud: 7.0647,
    longitud: -73.0982,
    capacidad: 70,
    horario: "Todos los días de 8:00 a. m. a 8:00 p. m.",
  },
];

// ---------------------------------------------------------------------------
// Cada cuánto necesita revisión cada categoría. Cuando una unidad pasa el
// umbral se crea una AlertaMantenimiento.
// ---------------------------------------------------------------------------
const criterios: Record<string, { tipo: TipoCriterio; umbral: number }[]> = {
  bicicletas: [
    { tipo: TipoCriterio.KILOMETRAJE, umbral: 1500 },
    { tipo: TipoCriterio.DIAS, umbral: 90 },
  ],
  scooters: [
    { tipo: TipoCriterio.KILOMETRAJE, umbral: 1000 },
    { tipo: TipoCriterio.DIAS, umbral: 60 },
  ],
  motos: [
    { tipo: TipoCriterio.KILOMETRAJE, umbral: 3000 },
    { tipo: TipoCriterio.DIAS, umbral: 120 },
  ],
  "autos-electricos": [
    { tipo: TipoCriterio.KILOMETRAJE, umbral: 10000 },
    { tipo: TipoCriterio.DIAS, umbral: 180 },
  ],
  drones: [
    { tipo: TipoCriterio.HORAS_USO, umbral: 50 },
    { tipo: TipoCriterio.DIAS, umbral: 90 },
  ],
  patinetas: [{ tipo: TipoCriterio.DIAS, umbral: 120 }],
};

// ---------------------------------------------------------------------------
// Prefijo del serial de cada unidad según su categoría: MV-SCO-01-001 es la
// unidad 1 del primer scooter de la lista.
// ---------------------------------------------------------------------------
const prefijos: Record<string, string> = {
  bicicletas: "BIC",
  scooters: "SCO",
  motos: "MOT",
  "autos-electricos": "AUT",
  drones: "DRO",
  patinetas: "PAT",
  accesorios: "ACC",
};

async function sembrarProductos() {
  const idsCategoria = new Map(
    (await db.categoria.findMany({ select: { id: true, slug: true } })).map((c) => [c.slug, c.id]),
  );
  // Mismo orden de la lista de puntos: [Cabecera, Centro, Floridablanca]
  const idsPunto = await Promise.all(
    puntos.map(async (p) => (await db.puntoServicio.findFirstOrThrow({ where: { nombre: p.nombre } })).id),
  );

  const numeroEnCategoria = new Map<string, number>();
  let totalUnidades = 0;

  for (const p of productos) {
    const categoriaId = idsCategoria.get(p.categoria);
    if (!categoriaId) throw new Error(`La categoría ${p.categoria} no existe (producto ${p.slug}).`);

    const datos = {
      categoriaId,
      nombre: p.nombre,
      marca: p.marca,
      modelo: p.modelo,
      descripcion: p.descripcion,
      precioVenta: p.precioVenta,
      tarifaAlquilerDia: p.tarifaAlquilerDia,
      modalidades: p.tarifaAlquilerDia ? [Modalidad.VENTA, Modalidad.ALQUILER] : [Modalidad.VENTA],
      especificaciones: p.especificaciones,
    };
    const producto = await db.producto.upsert({
      where: { slug: p.slug },
      update: datos,
      create: { ...datos, slug: p.slug },
    });

    // Unidades físicas: el serial no cambia entre corridas, así que si la
    // unidad ya existe no se toca (puede estar alquilada o en taller).
    const numero = (numeroEnCategoria.get(p.categoria) ?? 0) + 1;
    numeroEnCategoria.set(p.categoria, numero);
    let consecutivo = 0;
    for (const [i, cantidad] of p.unidades.entries()) {
      for (let n = 0; n < cantidad; n++) {
        consecutivo++;
        const serial = `MV-${prefijos[p.categoria]}-${String(numero).padStart(2, "0")}-${String(consecutivo).padStart(3, "0")}`;
        await db.unidad.upsert({
          where: { serial },
          update: {},
          create: { serial, productoId: producto.id, puntoServicioId: idsPunto[i] },
        });
        totalUnidades++;
      }
    }
  }
  console.log(`Productos: ${productos.length}`);
  console.log(`Unidades: ${totalUnidades}`);
}

// ---------------------------------------------------------------------------
// Domiciliarios de demostración: el administrador les asigna los domicilios.
// No tienen cuenta para iniciar sesión (solo existen en MoviGo).
// ---------------------------------------------------------------------------
const domiciliarios = [
  {
    id: "d0000000-0000-4000-8000-000000000001",
    nombre: "Camilo Ríos",
    correo: "camilo.rios@domiciliarios.movigo.co",
    telefono: "3001112233",
    vehiculo: "Scooter eléctrico",
    latitud: 7.1193,
    longitud: -73.109,
  },
  {
    id: "d0000000-0000-4000-8000-000000000002",
    nombre: "Valentina Duarte",
    correo: "valentina.duarte@domiciliarios.movigo.co",
    telefono: "3104445566",
    vehiculo: "Bicicleta eléctrica",
    latitud: 7.1254,
    longitud: -73.1198,
  },
  {
    id: "d0000000-0000-4000-8000-000000000003",
    nombre: "Andrés Pabón",
    correo: "andres.pabon@domiciliarios.movigo.co",
    telefono: "3157778899",
    vehiculo: "Moto eléctrica",
    latitud: 7.0647,
    longitud: -73.0982,
  },
];

async function sembrarDomiciliarios() {
  for (const d of domiciliarios) {
    const { vehiculo, latitud, longitud, ...usuario } = d;
    await db.usuario.upsert({
      where: { id: d.id },
      update: { nombre: usuario.nombre, telefono: usuario.telefono },
      create: {
        ...usuario,
        rol: "DOMICILIARIO",
        domiciliario: { create: { vehiculo, disponible: true, latitud, longitud, calificacion: 4.9 } },
      },
    });
  }
  console.log(`Domiciliarios: ${domiciliarios.length}`);
}

async function main() {
  for (const [orden, c] of categorias.entries()) {
    await db.categoria.upsert({
      where: { slug: c.slug },
      update: { nombre: c.nombre, descripcion: c.descripcion, orden },
      create: { ...c, orden },
    });
  }
  console.log(`Categorías: ${categorias.length}`);

  for (const p of puntos) {
    const existente = await db.puntoServicio.findFirst({
      where: { nombre: p.nombre },
    });
    if (existente) {
      await db.puntoServicio.update({ where: { id: existente.id }, data: p });
    } else {
      await db.puntoServicio.create({ data: p });
    }
  }
  console.log(`Puntos de servicio: ${puntos.length}`);

  let totalCriterios = 0;
  for (const [slug, lista] of Object.entries(criterios)) {
    const categoria = await db.categoria.findUniqueOrThrow({ where: { slug } });
    for (const { tipo, umbral } of lista) {
      await db.criterioMantenimiento.upsert({
        where: { categoriaId_tipo: { categoriaId: categoria.id, tipo } },
        update: { umbral },
        create: { categoriaId: categoria.id, tipo, umbral },
      });
      totalCriterios++;
    }
  }
  console.log(`Criterios de mantenimiento: ${totalCriterios}`);

  await sembrarProductos();
  await sembrarDomiciliarios();
}

main()
  .then(() => console.log("Semilla lista."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
