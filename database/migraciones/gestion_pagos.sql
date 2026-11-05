-- gestion_pagos
-- Pagos: cobros de pedidos y alquileres, y avisos de la pasarela.
-- Tablas: pagos, eventos_webhook.

-- CreateEnum
CREATE TYPE "estado_pago" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO', 'REEMBOLSADO');

-- CreateTable
CREATE TABLE "pagos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pedido_id" UUID,
    "alquiler_id" UUID,
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "estado" "estado_pago" NOT NULL DEFAULT 'PENDIENTE',
    "referencia" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmado_en" TIMESTAMPTZ(6),

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eventos_webhook" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pago_id" UUID,
    "tipo" TEXT NOT NULL,
    "firma" TEXT NOT NULL,
    "cuerpo" JSONB NOT NULL,
    "recibido_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "eventos_webhook_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pagos_referencia_key" ON "pagos"("referencia");

-- CreateIndex
CREATE INDEX "pagos_pedido_id_idx" ON "pagos"("pedido_id");

-- CreateIndex
CREATE INDEX "pagos_alquiler_id_idx" ON "pagos"("alquiler_id");

-- CreateIndex
CREATE INDEX "eventos_webhook_procesado_recibido_en_idx" ON "eventos_webhook"("procesado", "recibido_en");

-- AddForeignKey
ALTER TABLE "eventos_webhook" ADD CONSTRAINT "eventos_webhook_pago_id_fkey" FOREIGN KEY ("pago_id") REFERENCES "pagos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
