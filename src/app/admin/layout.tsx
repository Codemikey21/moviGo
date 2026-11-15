import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { Logo } from "@/compartido/interfaz/layout/Logo";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { NavAdmin, NavAdminCargando } from "./_componentes/NavAdmin";

// Panel de administración: misma barra blanca redondeada de la landing,
// con el menú de pastillas del panel. Cada página revisa el rol (el proxy
// ya exige sesión para /admin).
export default function LayoutAdmin({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-escarcha">
      <header className="sticky top-0 z-40 px-3 pt-3 md:px-5">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-4 rounded-[24px] border border-carbon/10 bg-blanco/95 px-4 backdrop-blur md:px-5">
          <Logo />
          <span className="etiqueta hidden rounded-full bg-escarcha px-3 py-1.5 text-bosque xl:inline">Administración</span>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <Suspense fallback={<NavAdminCargando />}>
              <NavAdmin />
            </Suspense>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              aria-label="Ver el sitio"
              className="hidden h-10 items-center gap-2 rounded-[14px] px-3 text-[12px] font-bold uppercase text-bosque transition-colors hover:bg-carbon/[0.06] lg:flex"
            >
              <Icono nombre="sitio" className="size-4" /> Ver sitio
            </Link>
            <Link
              href="/mi-cuenta"
              aria-label="Mi cuenta"
              className="grid size-10 place-items-center rounded-[14px] border border-carbon/10 text-bosque transition-colors hover:bg-escarcha"
            >
              <Icono nombre="cuenta" className="size-5" />
            </Link>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
