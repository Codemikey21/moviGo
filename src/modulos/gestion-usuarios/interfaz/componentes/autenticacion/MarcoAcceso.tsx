import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/compartido/interfaz/layout/Logo";
import { Chevron } from "@/compartido/interfaz/ui/Chevron";

type Props = {
  /** Lo que va en la columna derecha (la foto) */
  panel: ReactNode;
  children: ReactNode;
};

/**
 * Marco de las pantallas de acceso: formulario a la izquierda y panel con
 * foto a la derecha. En celular el panel se oculta.
 */
export function MarcoAcceso({ panel, children }: Props) {
  return (
    <div className="min-h-svh bg-blanco lg:grid lg:grid-cols-2">
      <div className="flex min-h-svh flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[12px] font-bold uppercase leading-none text-bosque"
          >
            <Chevron className="rotate-180 transition-[translate] duration-300 group-hover:-translate-x-1" />
            Volver al inicio
          </Link>
        </div>

        <main className="flex flex-1 items-start justify-center py-10 lg:items-center">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>

        <p className="text-center text-[12px] text-bruma">
          Proyecto académico · UNAB · Ingeniería de Software
        </p>
      </div>

      <div className="sticky top-0 hidden h-svh p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-tarjeta bg-salvia">{panel}</div>
      </div>
    </div>
  );
}

/** Panel con una sola foto y su frase (recuperar y cambiar contraseña). */
export function PanelFoto({ foto, textoAlt, frase }: { foto: string; textoAlt: string; frase: string }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- las fotos ya están optimizadas */}
      <img src={foto} alt={textoAlt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-carbon/60 via-carbon/0 to-carbon/0" />
      <p className="absolute bottom-10 left-10 right-10 max-w-[460px] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-blanco">
        {frase}
      </p>
    </>
  );
}
