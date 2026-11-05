// Valores públicos de Supabase (URL y clave publicable).
// Se leen con su nombre completo, process.env.NEXT_PUBLIC_..., para que
// Next.js los incluya también en el código que corre en el navegador.

export function configuracionSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !clave) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Revisa .env.local (o las variables de Vercel).",
    );
  }
  return { url, clave };
}

/** true si las dos variables públicas existen (para no romper la landing). */
export function supabaseConfigurado() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
