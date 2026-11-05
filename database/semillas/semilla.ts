// Datos iniciales de MoviGo: categorías, puntos de servicio y criterios de
// mantenimiento. Se puede correr las veces que quieras: si un dato ya existe,
// lo actualiza en vez de duplicarlo.
//
// Uso: npm run db:semilla

import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, TipoCriterio } from "../../src/generated/prisma/client";

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
    capacidad: 60,
    horario: "Lunes a sábado de 7:00 a. m. a 8:00 p. m.",
  },
  {
    nombre: "MoviGo Centro",
    direccion: "Centro, Bucaramanga",
    latitud: 7.1254,
    longitud: -73.1198,
    capacidad: 40,
    horario: "Lunes a sábado de 7:00 a. m. a 7:00 p. m.",
  },
  {
    nombre: "MoviGo Floridablanca",
    direccion: "Cañaveral, Floridablanca",
    latitud: 7.0647,
    longitud: -73.0982,
    capacidad: 50,
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
}

main()
  .then(() => console.log("Semilla lista."))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
