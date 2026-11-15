import { Suspense, type ReactNode } from "react";
import { NavCuenta, NavCuentaCargando } from "./_componentes/NavCuenta";

// Todo lo de la cuenta comparte el menú de pastillas arriba.
export default function LayoutCuenta({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-svh bg-blanco pb-[120px] pt-[120px] md:pt-[130px]">
      <div className="contenedor">
        <Suspense fallback={<NavCuentaCargando />}>
          <NavCuenta />
        </Suspense>
      </div>
      {children}
    </main>
  );
}
