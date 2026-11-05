// Configuración de la CLI de Prisma (generación del cliente y semillas).
// La app no usa este archivo: el cliente de la app está en
// src/compartido/servidor/base-de-datos/cliente.ts.
//
// Las migraciones son archivos .sql en database/migraciones y se aplican con
// npm run db:aplicar (ver database/aplicar-migraciones.ts).
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js lee .env.local; la CLI de Prisma no, por eso se carga aquí.
config({ path: ".env.local", quiet: true });

export default defineConfig({
  schema: "database/schema.prisma",
  migrations: {
    seed: "tsx database/semillas/semilla.ts",
  },
  datasource: {
    // La CLI usa la conexión directa (Session pooler, puerto 5432).
    // Si la variable no existe (por ejemplo en CI), `prisma generate` igual funciona.
    url: process.env.DIRECT_URL,
  },
});
