-- gestion_servicios_domiciliario
-- Portal del domiciliario (/domiciliario):
--   1. Código de entrega de 4 dígitos en cada domicilio (el cliente se lo
--      dice al domiciliario para confirmar que recibió).
--   2. Cuándo el domiciliario aceptó la entrega.
--   3. Bucket privado "evidencias" para la foto de la entrega: solo la sube
--      el domiciliario que lleva ese domicilio y solo la ven él y los
--      administradores.
-- Se puede volver a ejecutar sin romper nada.
-- Uso: npm run db:aplicar -- gestion_servicios_domiciliario.sql

-- ---------------------------------------------------------------------------
-- 1 y 2. Columnas nuevas en domicilios
-- ---------------------------------------------------------------------------
ALTER TABLE "domicilios" ADD COLUMN IF NOT EXISTS "codigo_entrega" TEXT;
ALTER TABLE "domicilios" ADD COLUMN IF NOT EXISTS "aceptado_en" TIMESTAMPTZ(6);

-- Los domicilios que ya existían reciben un código al azar
UPDATE "domicilios"
SET "codigo_entrega" = lpad(floor(random() * 10000)::int::text, 4, '0')
WHERE "codigo_entrega" IS NULL;

ALTER TABLE "domicilios" ALTER COLUMN "codigo_entrega" SET NOT NULL;

ALTER TABLE "domicilios" DROP CONSTRAINT IF EXISTS "domicilios_codigo_entrega_check";
ALTER TABLE "domicilios" ADD CONSTRAINT "domicilios_codigo_entrega_check"
  CHECK ("codigo_entrega" ~ '^[0-9]{4}$');

-- Los asignados de antes se toman como aceptados
UPDATE "domicilios"
SET "aceptado_en" = COALESCE("asignado_en", "creada_en")
WHERE "aceptado_en" IS NULL AND "estado" IN ('EN_CURSO', 'COMPLETADO');

-- ---------------------------------------------------------------------------
-- 3. Fotos de entrega en Supabase Storage (solo si la base es de Supabase)
-- ---------------------------------------------------------------------------
DO $migracion$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
    RAISE NOTICE 'Sin Supabase Storage: se omite el bucket de evidencias.';
    RETURN;
  END IF;

  -- Bucket privado: máximo 3 MB por foto y solo imágenes
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('evidencias', 'evidencias', false, 3145728, ARRAY['image/jpeg', 'image/png', 'image/webp'])
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

  -- ¿Quien hace la petición lleva el domicilio de esa carpeta?
  -- La foto se guarda como <id del domicilio>/<archivo>.webp
  EXECUTE $f$
    CREATE OR REPLACE FUNCTION public.lleva_domicilio(ruta text)
    RETURNS boolean
    LANGUAGE plpgsql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
    AS $cuerpo$
    BEGIN
      RETURN EXISTS (
        SELECT 1
        FROM public.domicilios d
        WHERE d.id::text = split_part(ruta, '/', 1)
          AND d.domiciliario_id = auth.uid()
          AND d.estado IN ('EN_CURSO', 'COMPLETADO')
      );
    END;
    $cuerpo$
  $f$;

  REVOKE EXECUTE ON FUNCTION public.lleva_domicilio(text) FROM PUBLIC, anon;
  GRANT EXECUTE ON FUNCTION public.lleva_domicilio(text) TO authenticated;

  DROP POLICY IF EXISTS "evidencias: domiciliario sube foto" ON storage.objects;
  CREATE POLICY "evidencias: domiciliario sube foto" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'evidencias' AND public.lleva_domicilio(name));

  DROP POLICY IF EXISTS "evidencias: domiciliario y admin ven fotos" ON storage.objects;
  CREATE POLICY "evidencias: domiciliario y admin ven fotos" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'evidencias' AND (public.lleva_domicilio(name) OR public.es_administrador()));
END
$migracion$;
