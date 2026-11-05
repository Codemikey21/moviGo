# Inicio de sesión y registro

MoviGo usa **Supabase Auth** para las cuentas. Supabase guarda el correo y la
contraseña; MoviGo guarda el perfil (nombre, celular, rol) en la tabla
`usuarios`. Los dos se enlazan por el mismo `id`.

## Cómo funciona

| Qué | Dónde |
|---|---|
| Pantallas de iniciar sesión y crear cuenta (pestañas) | `src/app/(auth)/iniciar-sesion`, `src/app/(auth)/registro` |
| Recuperar y cambiar contraseña | `src/app/(auth)/recuperar-contrasena`, `src/app/(auth)/nueva-contrasena` |
| Regreso desde el correo y desde Google | `src/app/auth/confirmar/route.ts` |
| Mi cuenta (solo con sesión) | `src/app/(cliente)/mi-cuenta` |
| Reglas y llamadas a Supabase | `src/modulos/gestion-usuarios/servidor/` |
| Protección de rutas y sesión al día | `src/proxy.ts` |
| Perfil automático al registrarse | `database/migraciones/gestion_usuarios_autenticacion.sql` |

Rutas privadas: `/mi-cuenta`, `/nueva-contrasena`, `/empresa` y `/admin`.
Sin sesión, el proxy manda a `/iniciar-sesion?siguiente=...` y después de
entrar la persona vuelve a donde iba.

## Configuración en Supabase

### 1. Direcciones permitidas

**Authentication → URL Configuration**

- **Site URL:** `http://localhost:3000` (cuando el sitio esté en Vercel, la dirección de Vercel).
- **Redirect URLs:** agregar las dos:
  - `http://localhost:3000/**`
  - `https://TU-PROYECTO.vercel.app/**`

Si una dirección no está en la lista, Supabase ignora el enlace de regreso y
los correos dejan de funcionar.

### 2. Plantillas de correo

**Authentication → Emails → Templates.** Así los enlaces funcionan aunque la
persona abra el correo en otro navegador o en el celular.

**Confirm signup**

- Asunto: `Confirma tu cuenta de MoviGo`
- Cuerpo:

```html
<h2>¡Bienvenido a MoviGo!</h2>
<p>Confirma tu correo para activar tu cuenta y empezar a moverte.</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email">Confirmar mi correo</a></p>
<p>Si no creaste una cuenta en MoviGo, ignora este mensaje.</p>
```

**Reset password**

- Asunto: `Crea tu nueva contraseña de MoviGo`
- Cuerpo:

```html
<h2>¿Olvidaste tu contraseña?</h2>
<p>Abre este enlace para crear una nueva. Vence en una hora.</p>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Crear nueva contraseña</a></p>
<p>Si no pediste el cambio, ignora este mensaje: tu contraseña sigue igual.</p>
```

### 3. Google

1. En [Google Cloud Console](https://console.cloud.google.com/) crear un proyecto,
   configurar la **pantalla de consentimiento** (tipo externo) y crear una
   credencial **ID de cliente de OAuth** de tipo **Aplicación web**.
2. En **URI de redireccionamiento autorizados** poner:
   `https://loilwlyfhkqwwowbklch.supabase.co/auth/v1/callback`
3. Copiar el **ID de cliente** y el **secreto** en Supabase:
   **Authentication → Sign In / Providers → Google**, y activarlo.

### 4. Límite de correos

El correo que trae Supabase por defecto solo manda unos pocos mensajes por
hora y es para pruebas. Para la presentación sirve; si se necesitan más, se
configura un SMTP propio en **Authentication → Emails → SMTP Settings**.

## Variables de entorno

En `.env.local` y en **Vercel → Settings → Environment Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL` (Transaction pooler, puerto 6543)

Opcional: `SITIO_URL` con la dirección pública del sitio, por si algún
enlace sale mal armado.
