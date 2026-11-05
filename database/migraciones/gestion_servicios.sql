-- gestion_servicios
-- Servicios: alquileres, domicilios con seguimiento y evidencias, y mantenimiento.
-- Tablas: alquileres, domicilios, registros_ubicacion, evidencias, mantenimientos, alertas_mantenimiento, criterios_mantenimiento.

-- CreateEnum
CREATE TYPE "estado_servicio" AS ENUM ('SOLICITADO', 'ASIGNADO', 'EN_CURSO', 'COMPLETADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "tipo_evidencia" AS ENUM ('FOTO', 'FIRMA');

-- CreateEnum
CREATE TYPE "tipo_mantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO');

-- CreateEnum
CREATE TYPE "estado_mantenimiento" AS ENUM ('PROGRAMADO', 'EN_CURSO', 'REALIZADO');

-- CreateEnum
CREATE TYPE "tipo_criterio" AS ENUM ('KILOMETRAJE', 'HORAS_USO', 'DIAS');

-- CreateTable
CREATE TABLE "alquileres" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "unidad_id" UUID NOT NULL,
    "punto_recogida_id" UUID,
    "solicitud_corporativa_id" UUID,
    "estado" "estado_servicio" NOT NULL DEFAULT 'SOLICITADO',
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "entrega" "modalidad_entrega" NOT NULL,
    "codigo_recogida" TEXT,
    "total" DECIMAL(12,2) NOT NULL,
    "calificacion" INTEGER,
    "comentario" TEXT,
    "creada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alquileres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domicilios" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "domiciliario_id" UUID,
    "alquiler_id" UUID,
    "solicitud_corporativa_id" UUID,
    "origen_id" UUID NOT NULL,
    "destino_id" UUID NOT NULL,
    "estado" "estado_servicio" NOT NULL DEFAULT 'SOLICITADO',
    "descripcion_paquete" TEXT NOT NULL,
    "costo" DECIMAL(12,2) NOT NULL,
    "asignado_en" TIMESTAMPTZ(6),
    "entregado_en" TIMESTAMPTZ(6),
    "calificacion" INTEGER,
    "comentario" TEXT,
    "creada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domicilios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_ubicacion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domicilio_id" UUID NOT NULL,
    "latitud" DECIMAL(9,6) NOT NULL,
    "longitud" DECIMAL(9,6) NOT NULL,
    "registrada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_ubicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidencias" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domicilio_id" UUID NOT NULL,
    "tipo" "tipo_evidencia" NOT NULL,
    "url" TEXT NOT NULL,
    "nombre_receptor" TEXT,
    "tomada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimientos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unidad_id" UUID NOT NULL,
    "solicitado_por_id" UUID,
    "tipo" "tipo_mantenimiento" NOT NULL,
    "descripcion" TEXT NOT NULL,
    "programado_para" DATE NOT NULL,
    "realizado_en" DATE,
    "costo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "estado" "estado_mantenimiento" NOT NULL DEFAULT 'PROGRAMADO',
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertas_mantenimiento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "unidad_id" UUID NOT NULL,
    "criterio_id" UUID NOT NULL,
    "mantenimiento_id" UUID,
    "valor_medido" DECIMAL(10,1) NOT NULL,
    "creada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendida" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alertas_mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "criterios_mantenimiento" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "categoria_id" UUID NOT NULL,
    "tipo" "tipo_criterio" NOT NULL,
    "umbral" DECIMAL(10,1) NOT NULL,

    CONSTRAINT "criterios_mantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "alquileres_codigo_recogida_key" ON "alquileres"("codigo_recogida");

-- CreateIndex
CREATE INDEX "alquileres_cliente_id_creada_en_idx" ON "alquileres"("cliente_id", "creada_en");

-- CreateIndex
CREATE INDEX "alquileres_unidad_id_fecha_inicio_fecha_fin_idx" ON "alquileres"("unidad_id", "fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE INDEX "domicilios_cliente_id_creada_en_idx" ON "domicilios"("cliente_id", "creada_en");

-- CreateIndex
CREATE INDEX "domicilios_domiciliario_id_estado_idx" ON "domicilios"("domiciliario_id", "estado");

-- CreateIndex
CREATE INDEX "registros_ubicacion_domicilio_id_registrada_en_idx" ON "registros_ubicacion"("domicilio_id", "registrada_en");

-- CreateIndex
CREATE INDEX "evidencias_domicilio_id_idx" ON "evidencias"("domicilio_id");

-- CreateIndex
CREATE INDEX "mantenimientos_unidad_id_programado_para_idx" ON "mantenimientos"("unidad_id", "programado_para");

-- CreateIndex
CREATE INDEX "alertas_mantenimiento_unidad_id_atendida_idx" ON "alertas_mantenimiento"("unidad_id", "atendida");

-- CreateIndex
CREATE UNIQUE INDEX "criterios_mantenimiento_categoria_id_tipo_key" ON "criterios_mantenimiento"("categoria_id", "tipo");

-- AddForeignKey
ALTER TABLE "domicilios" ADD CONSTRAINT "domicilios_alquiler_id_fkey" FOREIGN KEY ("alquiler_id") REFERENCES "alquileres"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ubicacion" ADD CONSTRAINT "registros_ubicacion_domicilio_id_fkey" FOREIGN KEY ("domicilio_id") REFERENCES "domicilios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidencias" ADD CONSTRAINT "evidencias_domicilio_id_fkey" FOREIGN KEY ("domicilio_id") REFERENCES "domicilios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_mantenimiento" ADD CONSTRAINT "alertas_mantenimiento_criterio_id_fkey" FOREIGN KEY ("criterio_id") REFERENCES "criterios_mantenimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertas_mantenimiento" ADD CONSTRAINT "alertas_mantenimiento_mantenimiento_id_fkey" FOREIGN KEY ("mantenimiento_id") REFERENCES "mantenimientos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
