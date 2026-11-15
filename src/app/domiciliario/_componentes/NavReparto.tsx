"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const secciones = [
  { href: "/domiciliario", texto: "Entregas", exacto: false },
  { href: "/domiciliario/historial", texto: "Historial", exacto: true },
];

/** Menú del portal del domiciliario; resalta la sección actual. */
export function NavReparto() {
  return <Enlaces ruta={usePathname()} />;
}

/** Mientras llega la ruta (va dentro de un Suspense), sin resaltar ninguna. */
export function NavRepartoCargando() {
  return <Enlaces ruta="" />;
}

function Enlaces({ ruta }: { ruta: string }) {
  return (
    <nav aria-label="Secciones del portal" className="flex w-max items-center gap-0.5">
      {secciones.map((s) => {
        const activa = s.exacto ? ruta === s.href : ruta === s.href || (ruta.startsWith(`${s.href}/entregas`) && s.href === "/domiciliario");
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={activa ? "page" : undefined}
            className={`flex h-10 items-center whitespace-nowrap rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
              activa ? "bg-bosque text-blanco" : "text-carbon hover:bg-carbon/[0.06]"
            }`}
          >
            {s.texto}
          </Link>
        );
      })}
    </nav>
  );
}
