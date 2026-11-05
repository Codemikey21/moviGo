-- gestion_usuarios
-- Usuarios: perfil de cada cuenta, roles, clientes, domiciliarios, administradores y direcciones.
-- Tablas: usuarios, clientes, domiciliarios, administradores, direcciones.

-- CreateEnum
CREATE TYPE "rol" AS ENUM ('CLIENTE', 'EMPRESA', 'DOMICILIARIO', 'ADMIN_PUNTO', 'ADMIN_SISTEMA');

-- CreateEnum
CREATE TYPE "alcance_admin" AS ENUM ('SISTEMA', 'PUNTO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" UUID NOT NULL,
    "correo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "rol" NOT NULL DEFAULT 'CLIENTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "usuario_id" UUID NOT NULL,
    "documento" TEXT,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "domiciliarios" (
    "usuario_id" UUID NOT NULL,
    "vehiculo" TEXT NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT false,
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "calificacion" DECIMAL(3,2),

    CONSTRAINT "domiciliarios_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "administradores" (
    "usuario_id" UUID NOT NULL,
    "alcance" "alcance_admin" NOT NULL,
    "punto_asignado_id" UUID,

    CONSTRAINT "administradores_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cliente_id" UUID NOT NULL,
    "etiqueta" TEXT NOT NULL,
    "linea_direccion" TEXT NOT NULL,
    "barrio" TEXT,
    "ciudad" TEXT NOT NULL DEFAULT 'Bucaramanga',
    "latitud" DECIMAL(9,6),
    "longitud" DECIMAL(9,6),
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE INDEX "administradores_punto_asignado_id_idx" ON "administradores"("punto_asignado_id");

-- CreateIndex
CREATE INDEX "direcciones_cliente_id_idx" ON "direcciones"("cliente_id");

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domiciliarios" ADD CONSTRAINT "domiciliarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "administradores" ADD CONSTRAINT "administradores_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("usuario_id") ON DELETE CASCADE ON UPDATE CASCADE;
