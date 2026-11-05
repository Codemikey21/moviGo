-- gestion_almacen
-- Almacén: puntos de servicio, unidades físicas con serial y movimientos de stock.
-- Tablas: puntos_servicio, unidades, movimientos_stock.

-- CreateEnum
CREATE TYPE "estado_unidad" AS ENUM ('DISPONIBLE', 'RESERVADA', 'ALQUILADA', 'VENDIDA', 'EN_TALLER', 'BAJA');

-- CreateEnum
CREATE TYPE "tipo_movimiento" AS ENUM ('INGRESO', 'RESERVA', 'SALIDA_VENTA', 'SALIDA_ALQUILER', 'DEVOLUCION', 'A_TALLER', 'DE_TALLER', 'TRASLADO');

-- CreateTable
CREATE TABLE "puntos_servicio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "capacidad" INTEGER NOT NULL,
    "horario" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "puntos_servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unidades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "producto_id" UUID NOT NULL,
    "punto_servicio_id" UUID NOT NULL,
    "serial" TEXT NOT NULL,
    "estado" "estado_unidad" NOT NULL DEFAULT 'DISPONIBLE',
    "kilometraje" DECIMAL(10,1) NOT NULL DEFAULT 0,
    "horas_uso" DECIMAL(10,1) NOT NULL DEFAULT 0,
    "ultimo_mantenimiento" DATE,
    "ingreso_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unidades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientos_stock" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unidad_id" UUID NOT NULL,
    "tipo" "tipo_movimiento" NOT NULL,
    "fecha" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nota" TEXT,
    "registrado_por_id" UUID NOT NULL,
    "destino_id" UUID,

    CONSTRAINT "movimientos_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unidades_serial_key" ON "unidades"("serial");

-- CreateIndex
CREATE INDEX "unidades_producto_id_estado_idx" ON "unidades"("producto_id", "estado");

-- CreateIndex
CREATE INDEX "unidades_punto_servicio_id_estado_idx" ON "unidades"("punto_servicio_id", "estado");

-- CreateIndex
CREATE INDEX "movimientos_stock_unidad_id_fecha_idx" ON "movimientos_stock"("unidad_id", "fecha");

-- AddForeignKey
ALTER TABLE "unidades" ADD CONSTRAINT "unidades_punto_servicio_id_fkey" FOREIGN KEY ("punto_servicio_id") REFERENCES "puntos_servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_unidad_id_fkey" FOREIGN KEY ("unidad_id") REFERENCES "unidades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos_stock" ADD CONSTRAINT "movimientos_stock_destino_id_fkey" FOREIGN KEY ("destino_id") REFERENCES "puntos_servicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;
