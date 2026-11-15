-- Fotos de los productos en Supabase Storage.
--
-- 1. Crea el bucket público "productos": cualquiera puede VER las fotos
--    (el catálogo es público), pero solo un administrador puede subirlas,
--    cambiarlas o borrarlas.
-- 2. Las fotos se suben directo desde el navegador del administrador, con su
--    propia sesión. Por eso no hace falta la clave secreta de Supabase.
--
-- Se puede aplicar las veces que quieras: no duplica nada.
-- Uso: npm run db:aplicar -- gestion_catalogo_fotos.sql

-- ---------------------------------------------------------------------------
-- Bucket: máximo 5 MB por foto y solo imágenes.
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'productos',
  'productos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- ¿Quien hace la petición es administrador de MoviGo?
-- SECURITY DEFINER porque la tabla usuarios tiene RLS sin políticas: así la
-- función puede leer el rol sin abrir la tabla a nadie. plpgsql para que
-- no falle si este archivo se aplica antes que gestion_usuarios.sql.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.usuarios
    WHERE id = auth.uid()
      AND activo
      AND rol IN ('ADMIN_SISTEMA', 'ADMIN_PUNTO')
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.es_administrador() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.es_administrador() TO authenticated;

-- ---------------------------------------------------------------------------
-- Políticas del bucket (las de lectura no hacen falta: es público).
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "productos: admin sube fotos" ON storage.objects;
CREATE POLICY "productos: admin sube fotos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'productos' AND public.es_administrador());

DROP POLICY IF EXISTS "productos: admin cambia fotos" ON storage.objects;
CREATE POLICY "productos: admin cambia fotos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'productos' AND public.es_administrador());

DROP POLICY IF EXISTS "productos: admin borra fotos" ON storage.objects;
CREATE POLICY "productos: admin borra fotos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'productos' AND public.es_administrador());

-- Para borrar, Storage primero busca el archivo: el admin necesita verlo.
DROP POLICY IF EXISTS "productos: admin ve fotos" ON storage.objects;
CREATE POLICY "productos: admin ve fotos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'productos' AND public.es_administrador());
