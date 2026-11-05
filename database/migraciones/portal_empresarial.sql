-- portal_empresarial
-- Portal empresarial: empresas, sus contactos, solicitudes y cotizaciones.
-- Tablas: empresas, contactos_empresa, solicitudes_corporativas, cotizaciones.

-- CreateEnum
CREATE TYPE "tipo_solicitud_corp" AS ENUM ('FLOTA_ALQUILER', 'DOMICILIOS_LOTE');

-- CreateEnum
CREATE TYPE "estado_cotizacion" AS ENUM ('BORRADOR', 'ENVIADA', 'APROBADA', 'RECHAZADA');

-- CreateTable
CREATE TABLE "contactos_empresa" (
    "cliente_id" UUID NOT NULL,
    "empresa_id" UUID NOT NULL,
    "cargo" TEXT NOT NULL,

    CONSTRAINT "contactos_empresa_pkey" PRIMARY KEY ("cliente_id")
);

-- CreateTable
CREATE TABLE "empresas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "razon_social" TEXT NOT NULL,
    "nit" TEXT NOT NULL,
    "sector" TEXT,
    "descuento_pactado" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "creada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_corporativas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "empresa_id" UUID NOT NULL,
    "contacto_id" UUID,
    "tipo" "tipo_solicitud_corp" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "desde" DATE NOT NULL,
    "hasta" DATE NOT NULL,
    "estado" "estado_cotizacion" NOT NULL DEFAULT 'BORRADOR',
    "notas" TEXT,
    "creada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_corporativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "solicitud_id" UUID NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "descuento_aplicado" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "valida_hasta" DATE NOT NULL,
    "creada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contactos_empresa_empresa_id_idx" ON "contactos_empresa"("empresa_id");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_nit_key" ON "empresas"("nit");

-- CreateIndex
CREATE INDEX "solicitudes_corporativas_empresa_id_estado_idx" ON "solicitudes_corporativas"("empresa_id", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_solicitud_id_key" ON "cotizaciones"("solicitud_id");

-- AddForeignKey
ALTER TABLE "contactos_empresa" ADD CONSTRAINT "contactos_empresa_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_corporativas" ADD CONSTRAINT "solicitudes_corporativas_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_corporativas" ADD CONSTRAINT "solicitudes_corporativas_contacto_id_fkey" FOREIGN KEY ("contacto_id") REFERENCES "contactos_empresa"("cliente_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_solicitud_id_fkey" FOREIGN KEY ("solicitud_id") REFERENCES "solicitudes_corporativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
