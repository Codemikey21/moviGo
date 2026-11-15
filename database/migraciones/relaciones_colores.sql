-- Colores de cada producto (configurador tipo concesionario).
--
-- 1. colores_producto: los colores en que viene cada producto.
-- 2. medios.color_id y medios.vista: cada foto puede ser de un color y de
--    una vista (lado, frente, detalle, ambiente).
-- 3. unidades.color_id: de qué color es cada vehículo físico (así el stock
--    se cuenta por color en cada punto).
-- 4. items_carrito.color_id: el color que la persona eligió al comprar.
--
-- Toca tablas de tres módulos (catálogo, almacén y pedidos), por eso va
-- junto a relaciones.sql: en una base vacía corre después de crearlas todas.
--
-- Se puede aplicar las veces que quieras: no duplica nada.
-- Uso: npm run db:aplicar -- relaciones_colores.sql

CREATE TABLE IF NOT EXISTS "colores_producto" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "producto_id" UUID NOT NULL,
  "nombre" TEXT NOT NULL,
  "hex" TEXT NOT NULL,
  "orden" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "colores_producto_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "colores_producto_hex_check" CHECK ("hex" ~ '^#[0-9a-fA-F]{6}$')
);

ALTER TABLE "colores_producto" DROP CONSTRAINT IF EXISTS "colores_producto_producto_id_fkey";
ALTER TABLE "colores_producto" ADD CONSTRAINT "colores_producto_producto_id_fkey"
  FOREIGN KEY ("producto_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "colores_producto_producto_id_nombre_key" ON "colores_producto"("producto_id", "nombre");
CREATE INDEX IF NOT EXISTS "colores_producto_producto_id_orden_idx" ON "colores_producto"("producto_id", "orden");

-- Fotos por color y vista
ALTER TABLE "medios" ADD COLUMN IF NOT EXISTS "color_id" UUID;
ALTER TABLE "medios" ADD COLUMN IF NOT EXISTS "vista" TEXT;
ALTER TABLE "medios" DROP CONSTRAINT IF EXISTS "medios_color_id_fkey";
ALTER TABLE "medios" ADD CONSTRAINT "medios_color_id_fkey"
  FOREIGN KEY ("color_id") REFERENCES "colores_producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "medios" DROP CONSTRAINT IF EXISTS "medios_vista_check";
ALTER TABLE "medios" ADD CONSTRAINT "medios_vista_check"
  CHECK ("vista" IS NULL OR "vista" IN ('LATERAL', 'FRENTE', 'DETALLE', 'AMBIENTE'));

-- Color de cada unidad física
ALTER TABLE "unidades" ADD COLUMN IF NOT EXISTS "color_id" UUID;
ALTER TABLE "unidades" DROP CONSTRAINT IF EXISTS "unidades_color_id_fkey";
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_color_id_fkey"
  FOREIGN KEY ("color_id") REFERENCES "colores_producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;
CREATE INDEX IF NOT EXISTS "unidades_producto_id_color_id_estado_idx" ON "unidades"("producto_id", "color_id", "estado");

-- Color elegido en el carrito
ALTER TABLE "items_carrito" ADD COLUMN IF NOT EXISTS "color_id" UUID;
ALTER TABLE "items_carrito" DROP CONSTRAINT IF EXISTS "items_carrito_color_id_fkey";
ALTER TABLE "items_carrito" ADD CONSTRAINT "items_carrito_color_id_fkey"
  FOREIGN KEY ("color_id") REFERENCES "colores_producto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Igual que las demás tablas: nadie entra por la API pública de Supabase
ALTER TABLE "colores_producto" ENABLE ROW LEVEL SECURITY;
