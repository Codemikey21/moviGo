import type { ReactNode } from "react";
import { Logo } from "@/compartido/interfaz/layout/Logo";
import { Icono } from "@/compartido/interfaz/ui/Icono";

// La pasarela tiene su propia barra, sin menú: como el checkout de un banco.
export default function LayoutPago({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-svh bg-escarcha">
      <header className="px-3 pt-3 md:px-5">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between rounded-[24px] border border-carbon/10 bg-blanco px-5">
          <Logo />
          <p className="flex items-center gap-2 text-[13px] text-pizarra">
            <Icono nombre="candado" className="size-4 text-eucalipto" />
            <span>
              Pago seguro · <span className="font-medium text-carbon">MoviGo Pay</span>
            </span>
          </p>
        </div>
      </header>
      {children}
      <footer className="px-5 pb-10 pt-6 text-center text-[12px] text-bruma">
        Tus datos viajan cifrados. MoviGo no guarda el número completo de tu tarjeta.
      </footer>
    </div>
  );
}
