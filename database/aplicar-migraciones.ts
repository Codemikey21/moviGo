// Aplica los archivos .sql de database/migraciones sobre la base de datos de
// DIRECT_URL, en orden alfabético: primero los módulos (gestion_*,
// portal_empresarial), luego relaciones y al final seguridad_rls.
//
// Es para una base vacía. Si una tabla ya existe, el comando se detiene.
//
// Uso: npm run db:aplicar

import { execSync } from "node:child_process";
import { readdirSync } from "node:fs";
import path from "node:path";

const carpeta = path.join("database", "migraciones");

const archivos = readdirSync(carpeta)
  .filter((nombre) => nombre.endsWith(".sql"))
  .sort();

for (const archivo of archivos) {
  console.log(`Aplicando ${archivo}...`);
  execSync(`npx prisma db execute --file "${path.join(carpeta, archivo)}"`, {
    stdio: "inherit",
  });
}

console.log(`Listo: ${archivos.length} archivos aplicados.`);
