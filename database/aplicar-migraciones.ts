// Aplica los archivos .sql de database/migraciones sobre la base de datos de
// DIRECT_URL, en orden alfabético: primero los módulos (gestion_*,
// portal_empresarial), luego relaciones y al final seguridad_rls.
//
// Uso:
//   npm run db:aplicar                     aplica todos (base vacía)
//   npm run db:aplicar -- archivo.sql      aplica solo los que nombres
//
// Aplicar todos es para una base vacía: si una tabla ya existe, se detiene.

import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

const carpeta = path.join("database", "migraciones");
const pedidos = process.argv.slice(2);

const archivos =
  pedidos.length > 0
    ? pedidos.map((nombre) => (nombre.endsWith(".sql") ? nombre : `${nombre}.sql`))
    : readdirSync(carpeta)
        .filter((nombre) => nombre.endsWith(".sql"))
        .sort();

for (const archivo of archivos) {
  const ruta = path.join(carpeta, archivo);
  if (!existsSync(ruta)) {
    console.error(`No existe ${ruta}`);
    process.exit(1);
  }
  console.log(`Aplicando ${archivo}...`);
  execSync(`npx prisma db execute --file "${ruta}"`, { stdio: "inherit" });
}

console.log(`Listo: ${archivos.length} archivo(s) aplicado(s).`);
