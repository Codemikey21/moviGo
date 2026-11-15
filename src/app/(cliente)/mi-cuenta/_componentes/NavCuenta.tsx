"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { href: "/mi-cuenta", texto: "Inicio", exacto: true },
  { href: "/mi-cuenta/pedidos", texto: "Pedidos y alquileres", exacto: false },
  { href: "/mi-cuenta/mantenimiento", texto: "Mantenimiento", exacto: false },
];

/** Pastillas de la cuenta (como el menú de pastillas de la landing). */
export function NavCuenta() {
  const ruta = usePathname();
  return <Pastillas ruta={ruta} />;
}

export function NavCuentaCargando() {
  return <Pastillas ruta="" />;
}

function Pastillas({ ruta }: { ruta: string }) {
  return (
    <nav aria-label="Mi cuenta" className="inline-flex max-w-full overflow-x-auto rounded-full bg-escarcha p-1">
      {enlaces.map((e) => {
        const activo = e.exacto
          ? ruta === e.href
          : ruta.startsWith(e.href) || (e.href === "/mi-cuenta/pedidos" && ruta.startsWith("/mi-cuenta/alquileres"));
        return (
          <Link
            key={e.href}
            href={e.href}
            aria-current={activo ? "page" : undefined}
            className={`flex h-10 items-center whitespace-nowrap rounded-full px-5 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
              activo ? "bg-bosque text-blanco" : "text-carbon hover:bg-carbon/[0.06]"
            }`}
          >
            {e.texto}
          </Link>
        );
      })}
    </nav>
  );
}
