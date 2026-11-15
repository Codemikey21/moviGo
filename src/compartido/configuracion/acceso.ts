// Formas de iniciar sesión que se muestran en el sitio.
//
// "Continuar con Google" solo aparece si en Vercel (o en .env.local) está
// NEXT_PUBLIC_GOOGLE_ACTIVO=1. Antes hay que configurar Google en
// Supabase → Authentication → Sign In / Providers → Google.
export const GOOGLE_ACTIVO = process.env.NEXT_PUBLIC_GOOGLE_ACTIVO === "1";
