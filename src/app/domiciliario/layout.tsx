import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Logo } from "@/compartido/interfaz/layout/Logo";
import { cerrarSesionAccion } from "@/modulos/gestion-usuarios/servidor/acciones";
import { NavReparto, NavRepartoCargando } from "./_componentes/NavReparto";

export const metadata: Metadata = { title: "Reparto · MoviGo" };

// Portal del domiciliario: pensado para usarse en el teléfono mientras
// reparte. Misma barra blanca redondeada del panel de administración.
// Cada página revisa el rol (el proxy ya exige sesión para /domiciliario).
export default function LayoutDomiciliario({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-escarcha">
      <header className="sticky top-0 z-[600] px-3 pt-3 md:px-5">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center gap-3 rounded-[24px] border border-carbon/10 bg-blanco/95 px-4 backdrop-blur md:px-5">
          <Logo />
          <span className="etiqueta hidden rounded-full bg-escarcha px-3 py-1.5 text-bosque sm:inline">Reparto</span>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <Suspense fallback={<NavRepartoCargando />}>
              <NavReparto />
            </Suspense>
          </div>
          <form action={cerrarSesionAccion}>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-[14px] px-3 text-[12px] font-bold uppercase text-bosque transition-colors hover:bg-carbon/[0.06]"
            >
              Salir
            </button>
          </form>
        </div>
      </header>
      {children}
    </div>
  );
}
