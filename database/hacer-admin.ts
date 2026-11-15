// Convierte una cuenta de MoviGo en administrador del sistema.
// La cuenta tiene que existir: primero regístrate en la página y confirma
// el correo.
//
// Uso: npm run db:admin -- tu-correo@ejemplo.com

import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

config({ path: ".env.local", quiet: true });

const correo = process.argv[2]?.trim().toLowerCase();
if (!correo) {
  console.error("Escribe el correo: npm run db:admin -- tu-correo@ejemplo.com");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("Falta DATABASE_URL en .env.local.");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const usuario = await db.usuario.findUnique({ where: { correo } });
  if (!usuario) {
    console.error(`No hay ninguna cuenta con ${correo}. Regístrate primero en la página.`);
    process.exitCode = 1;
    return;
  }

  await db.usuario.update({
    where: { id: usuario.id },
    data: {
      rol: "ADMIN_SISTEMA",
      administrador: {
        upsert: {
          create: { alcance: "SISTEMA" },
          update: { alcance: "SISTEMA", puntoAsignadoId: null },
        },
      },
    },
  });
  console.log(`${usuario.nombre} (${correo}) ahora es administrador del sistema.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
