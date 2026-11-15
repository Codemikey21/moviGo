import type { ReactNode } from "react";

// Marco de toda la cuenta. Las secciones (pedidos, alquileres, taller)
// agregan su menú en (secciones)/layout.tsx.
export default function LayoutCuenta({ children }: { children: ReactNode }) {
  return <main className="min-h-svh bg-blanco">{children}</main>;
}
