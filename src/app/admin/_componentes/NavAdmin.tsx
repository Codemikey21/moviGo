"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const secciones = [
  { href: "/admin", texto: "Resumen", exacto: true },
  { href: "/admin/pedidos", texto: "Pedidos" },
  { href: "/admin/alquileres", texto: "Alquileres" },
  { href: "/admin/domicilios", texto: "Domicilios" },
  { href: "/admin/mantenimiento", texto: "Taller" },
  { href: "/admin/empresas", texto: "Empresas" },
  { href: "/admin/inventario", texto: "Inventario" },
  { href: "/admin/usuarios", texto: "Usuarios" },
  { href: "/admin/mensajes", texto: "Mensajes" },
];

/** Menú del panel con pastillas (como el de la landing); resalta la sección actual. */
export function NavAdmin() {
  return <Enlaces ruta={usePathname()} />;
}

/** Mientras llega la ruta (va dentro de un Suspense), sin resaltar ninguna. */
export function NavAdminCargando() {
  return <Enlaces ruta="" />;
}

function Enlaces({ ruta }: { ruta: string }) {
  return (
    <nav aria-label="Secciones del panel" className="flex w-max items-center gap-0.5">
      {secciones.map((s) => {
        const activa = s.exacto ? ruta === s.href : ruta.startsWith(s.href);
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
