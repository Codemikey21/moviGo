-- Entregas a domicilio de pedidos y alquileres.
--
-- 1. Un domicilio puede llevar un pedido de compra (pedido_id).
-- 2. Puede salir de un punto de servicio (punto_origen_id) en vez de una
--    dirección del cliente, por eso origen_id deja de ser obligatorio.
--
-- Se puede aplicar las veces que quieras: no duplica nada.
-- Uso: npm run db:aplicar -- gestion_servicios_entregas.sql

ALTER TABLE "domicilios" ADD COLUMN IF NOT EXISTS "pedido_id" UUID;
ALTER TABLE "domicilios" ADD COLUMN IF NOT EXISTS "punto_origen_id" UUID;
ALTER TABLE "domicilios" ALTER COLUMN "origen_id" DROP NOT NULL;

ALTER TABLE "domicilios" DROP CONSTRAINT IF EXISTS "domicilios_pedido_id_fkey";
ALTER TABLE "domicilios" ADD CONSTRAINT "domicilios_pedido_id_fkey"
  FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "domicilios" DROP CONSTRAINT IF EXISTS "domicilios_punto_origen_id_fkey";
ALTER TABLE "domicilios" ADD CONSTRAINT "domicilios_punto_origen_id_fkey"
  FOREIGN KEY ("punto_origen_id") REFERENCES "puntos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "domicilios_pedido_id_idx" ON "domicilios"("pedido_id");
