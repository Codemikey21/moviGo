-- gestion_usuarios_autenticacion
-- Conecta Supabase Auth con las tablas de MoviGo.
-- Cuando alguien crea una cuenta (con correo o con Google), Supabase guarda
-- la cuenta en auth.users. Estos triggers crean al instante su perfil en
-- "usuarios" y su fila en "clientes", y los borran si la cuenta se elimina.
-- Va después de gestion_usuarios.sql porque usa sus tablas.

-- Crea el perfil a partir de los datos del registro.
-- El nombre viene del formulario de MoviGo ("nombre") o de Google
-- ("full_name" o "name"); si no hay ninguno, se usa la parte del correo
-- antes de la @.
CREATE OR REPLACE FUNCTION public.crear_perfil_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.usuarios (id, correo, nombre, telefono, rol, activo, creado_en, actualizado_en)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'nombre'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data ->> 'name'), ''),
      SPLIT_PART(NEW.email, '@', 1)
    ),
    NULLIF(TRIM(NEW.raw_user_meta_data ->> 'telefono'), ''),
    'CLIENTE'::public.rol,
    true,
    NOW(),
    NOW()
  );

  INSERT INTO public.clientes (usuario_id) VALUES (NEW.id);

  RETURN NEW;
END;
$$;

-- Si la cuenta se borra en Supabase, se borra su perfil.
-- Los datos que dependen de él (clientes, direcciones, carrito) caen en cascada.
CREATE OR REPLACE FUNCTION public.borrar_perfil_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.usuarios WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Si cambia el correo de la cuenta, se actualiza también en el perfil.
CREATE OR REPLACE FUNCTION public.actualizar_correo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.usuarios
  SET correo = NEW.email, actualizado_en = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS al_crear_cuenta ON auth.users;
CREATE TRIGGER al_crear_cuenta
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.crear_perfil_usuario();

DROP TRIGGER IF EXISTS al_borrar_cuenta ON auth.users;
CREATE TRIGGER al_borrar_cuenta
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.borrar_perfil_usuario();

DROP TRIGGER IF EXISTS al_cambiar_correo ON auth.users;
CREATE TRIGGER al_cambiar_correo
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.actualizar_correo_usuario();

-- Estas funciones solo las usa la base de datos. Nadie puede llamarlas
-- desde la API pública de Supabase.
REVOKE EXECUTE ON FUNCTION public.crear_perfil_usuario() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.borrar_perfil_usuario() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.actualizar_correo_usuario() FROM PUBLIC, anon, authenticated;

-- Cuentas que se crearon antes de aplicar este archivo: se les crea el
-- perfil que les falta. Se puede correr varias veces sin duplicar nada.
INSERT INTO public.usuarios (id, correo, nombre, telefono, rol, activo, creado_en, actualizado_en)
SELECT
  u.id,
  u.email,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data ->> 'nombre'), ''),
    NULLIF(TRIM(u.raw_user_meta_data ->> 'full_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data ->> 'name'), ''),
    SPLIT_PART(u.email, '@', 1)
  ),
  NULLIF(TRIM(u.raw_user_meta_data ->> 'telefono'), ''),
  'CLIENTE'::public.rol,
  true,
  NOW(),
  NOW()
FROM auth.users AS u
WHERE u.email IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.usuarios AS p WHERE p.id = u.id);

INSERT INTO public.clientes (usuario_id)
SELECT p.id
FROM public.usuarios AS p
WHERE p.rol = 'CLIENTE'::public.rol
  AND NOT EXISTS (SELECT 1 FROM public.clientes AS c WHERE c.usuario_id = p.id);
