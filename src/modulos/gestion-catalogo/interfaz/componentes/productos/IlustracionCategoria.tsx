import type { ReactNode } from "react";

// Dibujo de línea de cada categoría. Se muestra mientras el producto no
// tenga fotos propias, sobre el fondo salvia del "pedestal" (como en la
// sección del pedestal de la landing).

const dibujos: Record<string, ReactNode> = {
  bicicletas: (
    <>
      <circle cx="62" cy="102" r="34" />
      <circle cx="182" cy="102" r="34" />
      <circle cx="62" cy="102" r="3" />
      <circle cx="182" cy="102" r="3" />
      <path d="M62 102 L112 102 L96 52 Z" />
      <path d="M96 52 L158 54 L112 102" />
      <path d="M158 54 L182 102" />
      <path d="M96 52 L94 42 M82 41 H106" />
      <path d="M158 54 L154 38 L172 34" />
      <circle cx="112" cy="102" r="7" />
    </>
  ),
  scooters: (
    <>
      <circle cx="56" cy="118" r="17" />
      <circle cx="190" cy="118" r="17" />
      <rect x="62" y="104" width="112" height="11" rx="5.5" />
      <path d="M190 118 L172 28" />
      <path d="M158 27 L188 31" />
      <path d="M36 112 A22 22 0 0 1 74 106" />
      <path d="M171 104 L182 100" />
    </>
  ),
  motos: (
    <>
      <circle cx="60" cy="108" r="30" />
      <circle cx="186" cy="108" r="30" />
      <circle cx="60" cy="108" r="9" />
      <circle cx="186" cy="108" r="9" />
      <path d="M60 108 L108 98 L150 98 L186 108" />
      <path d="M78 74 C96 62 128 60 152 70 L166 76 L148 96 L104 98 Z" />
      <path d="M66 72 L112 66" />
      <path d="M186 108 L164 54" />
      <path d="M152 50 L176 46" />
      <rect x="104" y="84" width="34" height="18" rx="5" />
    </>
  ),
  "autos-electricos": (
    <>
      <path d="M22 104 V90 C22 82 30 77 40 75 L72 70 L100 48 C106 44 112 42 120 42 H166 C176 42 183 46 189 54 L206 72 C216 75 222 81 222 91 V104 Z" />
      <path d="M100 70 L118 52 H162 C168 52 172 55 176 60 L184 70 Z" />
      <path d="M140 52 V70" />
      <circle cx="68" cy="106" r="17" className="fill-[var(--fondo-ilustracion)]" />
      <circle cx="178" cy="106" r="17" className="fill-[var(--fondo-ilustracion)]" />
      <circle cx="68" cy="106" r="6" />
      <circle cx="178" cy="106" r="6" />
      <path d="M210 84 H218 M24 86 H32" />
      <path d="M112 84 l-6 10 h10 l-6 10" />
    </>
  ),
  drones: (
    <>
      <rect x="96" y="64" width="48" height="26" rx="10" />
      <path d="M100 68 L60 44 M140 68 L180 44 M100 86 L60 110 M140 86 L180 110" />
      <ellipse cx="60" cy="40" rx="34" ry="7" />
      <ellipse cx="180" cy="40" rx="34" ry="7" />
      <ellipse cx="60" cy="114" rx="34" ry="7" />
      <ellipse cx="180" cy="114" rx="34" ry="7" />
      <circle cx="60" cy="40" r="3" />
      <circle cx="180" cy="40" r="3" />
      <circle cx="60" cy="114" r="3" />
      <circle cx="180" cy="114" r="3" />
      <circle cx="120" cy="97" r="7" />
    </>
  ),
  patinetas: (
    <>
      <path d="M22 60 Q34 76 54 78 H186 Q206 76 218 60" />
      <path d="M62 82 L74 96 L86 82 M154 82 L166 96 L178 82" />
      <circle cx="74" cy="108" r="12" />
      <circle cx="166" cy="108" r="12" />
      <circle cx="74" cy="108" r="3" />
      <circle cx="166" cy="108" r="3" />
    </>
  ),
  accesorios: (
    <>
      <path d="M44 106 C44 62 80 34 124 34 C172 34 202 68 202 100 V106 Z" />
      <path d="M62 86 C80 76 112 74 150 80" />
      <path d="M104 40 C110 54 112 66 112 78 M138 38 C146 52 150 64 150 78" />
      <path d="M44 106 H202" />
      <path d="M78 106 C80 124 96 132 112 130" />
    </>
  ),
};

/** Dibujo de la categoría (bicicletas, scooters, motos…). */
export function IlustracionCategoria({
  categoria,
  className = "",
}: {
  categoria: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 150"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {dibujos[categoria] ?? dibujos.bicicletas}
    </svg>
  );
}
