import { Suspense, type ReactNode } from "react";
import { NavCuenta, NavCuentaCargando } from "../_componentes/NavCuenta";

// Pedidos, alquileres y mantenimiento comparten el menú de pastillas arriba.
// (El inicio de la cuenta no lo usa: su vitrina ocupa toda la pantalla.)
export default function LayoutSeccionesCuenta({ children }: { children: ReactNode }) {
  return (
    <div className="pb-[120px] pt-[120px] md:pt-[130px]">
      <div className="contenedor">
        <Suspense fallback={<NavCuentaCargando />}>
          <NavCuenta />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
