-- gestion_pedidos
-- Pedidos: carrito, compras y sus líneas.
-- Tablas: carritos, items_carrito, pedidos, lineas_pedido.

-- CreateEnum
CREATE TYPE "estado_pedido" AS ENUM ('PENDIENTE_PAGO', 'PAGADO', 'PREPARANDO', 'ENTREGADO', 'CANCELADO', 'FALLIDO');

-- CreateEnum
CREATE TYPE "modalidad_entrega" AS ENUM ('EN_PUNTO', 'A_DOMICILIO');

-- CreateTable
CREATE TABLE "carritos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "carritos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_carrito" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "carrito_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "items_carrito_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "numero" TEXT NOT NULL,
    "cliente_id" UUID NOT NULL,
    "estado" "estado_pedido" NOT NULL DEFAULT 'PENDIENTE_PAGO',
    "entrega" "modalidad_entrega" NOT NULL,
    "direccion_entrega_id" UUID,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lineas_pedido" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID NOT NULL,
    "producto_id" UUID NOT NULL,
    "unidad_id" UUID,
    "cantidad" INTEGER NOT NULL,
    "precio_unitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lineas_pedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carritos_cliente_id_key" ON "carritos"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "items_carrito_carrito_id_producto_id_key" ON "items_carrito"("carrito_id", "producto_id");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_numero_key" ON "pedidos"("numero");

-- CreateIndex
CREATE INDEX "pedidos_cliente_id_creado_en_idx" ON "pedidos"("cliente_id", "creado_en");

-- CreateIndex
CREATE UNIQUE INDEX "lineas_pedido_unidad_id_key" ON "lineas_pedido"("unidad_id");

-- CreateIndex
CREATE INDEX "lineas_pedido_pedido_id_idx" ON "lineas_pedido"("pedido_id");

-- AddForeignKey
ALTER TABLE "items_carrito" ADD CONSTRAINT "items_carrito_carrito_id_fkey" FOREIGN KEY ("carrito_id") REFERENCES "carritos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lineas_pedido" ADD CONSTRAINT "lineas_pedido_pedido_id_fkey" FOREIGN KEY ("pedido_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
