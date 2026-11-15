import { redesActivas } from "@/compartido/configuracion/contacto";

const iconos = {
  instagram: (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  tiktok: (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M16 3c.3 2.4 1.8 4 4 4.2v3.1c-1.5 0-2.9-.5-4-1.3v6.4A5.6 5.6 0 1 1 10.4 10v3.2a2.5 2.5 0 1 0 2.5 2.5V3H16z" />
    </svg>
  ),
  youtube: (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M22 8.2a2.6 2.6 0 0 0-1.8-1.8C18.6 6 12 6 12 6s-6.6 0-8.2.4A2.6 2.6 0 0 0 2 8.2 27 27 0 0 0 1.6 12 27 27 0 0 0 2 15.8a2.6 2.6 0 0 0 1.8 1.8C5.4 18 12 18 12 18s6.6 0 8.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8zM10 14.6V9.4l4.6 2.6L10 14.6z" />
    </svg>
  ),
};

export const hayRedes = redesActivas.length > 0;

/** Íconos de las redes configuradas en compartido/configuracion/contacto.ts. Sin redes, no pinta nada. */
export function RedesSociales({ claseEnlace, className = "" }: { claseEnlace: string; className?: string }) {
  if (!hayRedes) return null;
  return (
    <span className={`flex items-center ${className}`}>
      {redesActivas.map((r) => (
        <a key={r.red} href={r.href} target="_blank" rel="noopener noreferrer" aria-label={r.nombre} className={claseEnlace}>
          {iconos[r.red]}
        </a>
      ))}
    </span>
  );
}
