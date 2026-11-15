-- gestion_notificaciones_contacto
-- Mensajes que llegan desde /contacto y correos suscritos al boletín.
-- Tablas: mensajes_contacto, suscripciones_boletin.
-- Se puede volver a ejecutar sin romper nada.

-- CreateTable
CREATE TABLE IF NOT EXISTS "mensajes_contacto" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "motivo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atendido" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "mensajes_contacto_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "mensajes_contacto" DROP CONSTRAINT IF EXISTS "mensajes_contacto_motivo_check";
ALTER TABLE "mensajes_contacto" ADD CONSTRAINT "mensajes_contacto_motivo_check"
  CHECK ("motivo" IN ('PEDIDO', 'PRODUCTO', 'TALLER', 'EMPRESAS', 'OTRO'));

-- CreateIndex
CREATE INDEX IF NOT EXISTS "mensajes_contacto_atendido_creado_en_idx" ON "mensajes_contacto"("atendido", "creado_en");

-- CreateTable
CREATE TABLE IF NOT EXISTS "suscripciones_boletin" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "correo" TEXT NOT NULL,
    "creada_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suscripciones_boletin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "suscripciones_boletin_correo_key" ON "suscripciones_boletin"("correo");

-- Igual que las demás tablas: nadie entra por la API pública de Supabase
ALTER TABLE "mensajes_contacto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "suscripciones_boletin" ENABLE ROW LEVEL SECURITY;
