// Íconos de trazo de MoviGo (24×24, línea de 1.6). Se pintan con currentColor.

const trazos = {
  inicio: <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1Z" />,
  inventario: (
    <>
      <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16Z" />
      <path d="M3.5 8 12 12.5 20.5 8M12 12.5v8" />
    </>
  ),
  pedidos: (
    <>
      <path d="M5 7h14l-1.2 11.1a2 2 0 0 1-2 1.9H8.2a2 2 0 0 1-2-1.9Z" />
      <path d="M9 9.5V6a3 3 0 0 1 6 0v3.5" />
    </>
  ),
  carrito: (
    <>
      <path d="M3 4.5h2.2l2.1 10.6a1.5 1.5 0 0 0 1.5 1.2h8.4a1.5 1.5 0 0 0 1.5-1.2L20 8H6" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </>
  ),
  alquileres: (
    <>
      <circle cx="8" cy="15" r="3.5" />
      <path d="m10.5 12.5 7-7M15.5 7.5l2 2M13.5 9.5l1.5 1.5" />
    </>
  ),
  domicilios: (
    <>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  mantenimiento: (
    <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.5 2.5-2.3-.7-.7-2.3Z" />
  ),
  usuarios: (
    <>
      <circle cx="9" cy="8.5" r="3.5" />
      <path d="M2.5 19.5a6.5 6.5 0 0 1 13 0M16 5.2a3.5 3.5 0 0 1 0 6.6M18 14a6.5 6.5 0 0 1 3.5 5.5" />
    </>
  ),
  cuenta: (
    <>
      <circle cx="12" cy="9" r="3.8" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  sitio: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.5 3.5 5.3 3.5 8.5s-1.1 6-3.5 8.5c-2.4-2.5-3.5-5.3-3.5-8.5s1.1-6 3.5-8.5Z" />
    </>
  ),
  buscar: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="m15 15 5 5" />
    </>
  ),
  punto: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  reloj: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  calendario: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="2.5" />
      <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
    </>
  ),
  tarjeta: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 15h4" />
    </>
  ),
  celular: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <path d="M11 17.5h2" />
    </>
  ),
  banco: <path d="M4 9.5 12 5l8 4.5M5.5 10v7M10 10v7M14 10v7M18.5 10v7M4 19.5h16" />,
  candado: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  mas: <path d="M12 5v14M5 12h14" />,
  menos: <path d="M5 12h14" />,
  cerrar: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  ingreso: <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />,
  traslado: <path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5" />,
  devolucion: <path d="M9 7 4.5 11.5 9 16M5 11.5h9.5a5 5 0 0 1 0 10H12" />,
  venta: (
    <>
      <path d="M4 12.5V5.5A1.5 1.5 0 0 1 5.5 4h7l7.5 7.5-8 8Z" />
      <circle cx="8.5" cy="8.5" r="1.4" />
    </>
  ),
  paquete: (
    <>
      <path d="M4 8 12 4l8 4v8l-8 4-8-4Z" />
      <path d="m4 8 8 4 8-4M12 12v8M8 6l8 4" />
    </>
  ),
  campana: (
    <>
      <path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15Z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
  flecha: <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />,
  atras: <path d="M19 12H5M10.5 6.5 5 12l5.5 5.5" />,
  escudo: (
    <>
      <path d="M12 3.5 19 6v5.5c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </>
  ),
  rayo: <path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12Z" />,
} as const;

export type NombreIcono = keyof typeof trazos;

export function Icono({ nombre, className = "size-5" }: { nombre: NombreIcono; className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
    >
      {trazos[nombre]}
    </svg>
  );
}
