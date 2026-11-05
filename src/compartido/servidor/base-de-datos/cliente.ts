import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

// Cliente Prisma único (singleton) para todo el servidor.
// Solo los archivos repositorio.ts de cada módulo deben importarlo.

function crearCliente() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Cópiala en .env.local siguiendo .env.ejemplo.",
    );
  }
  // DATABASE_URL es el Transaction pooler de Supabase (puerto 6543),
  // pensado para muchas conexiones cortas como las de Vercel.
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
}

// En desarrollo Next.js recarga los módulos a cada cambio. Guardar el cliente
// en globalThis evita abrir una conexión nueva en cada recarga.
const global = globalThis as unknown as {
  prisma?: PrismaClient;
};

function obtenerCliente(): PrismaClient {
  if (!global.prisma) global.prisma = crearCliente();
  return global.prisma;
}

/**
 * El cliente se crea la primera vez que se usa, no al importar el archivo.
 * Así una página que no consulta la base no falla si falta DATABASE_URL.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_destino, propiedad) {
    const cliente = obtenerCliente();
    const valor = Reflect.get(cliente, propiedad, cliente);
    return typeof valor === "function" ? valor.bind(cliente) : valor;
  },
});
