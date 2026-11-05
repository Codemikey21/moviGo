import Link from "next/link";
import type { ReactNode } from "react";
import { Chevron } from "./Chevron";

export type Variante = "primario" | "secundario" | "oscuro";
export type Tamano = "normal" | "compacto";

const variantes: Record<Variante, string> = {
  // El turquesa solo se usa como relleno; el texto va en carbón (contraste).
  primario: "bg-turquesa text-carbon",
  oscuro: "bg-bosque text-blanco",
  // Al pasar el mouse se rellena de carbón, así que el texto pasa a blanco
  secundario:
    "border border-carbon/70 bg-transparent text-carbon hover:text-blanco focus-visible:text-blanco",
};

// Color del relleno que barre el botón al pasar el mouse
const barridos: Record<Variante, string> = {
  primario: "bg-[#4cc7a1]",
  oscuro: "bg-carbon",
  secundario: "bg-carbon",
};

const tamanos: Record<Tamano, string> = {
  normal: "h-[50px] px-[22px]",
  compacto: "h-10 px-4",
};

// Curva y duración medidas en el sitio de referencia
const curva =
  "duration-[334ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

/** Clases del botón del sistema. Las usan Boton (enlace) y BotonAccion (botón). */
export function clasesBoton(variante: Variante, tamano: Tamano) {
  return `group relative isolate inline-flex select-none items-center justify-center overflow-hidden rounded-boton text-[12px] font-bold uppercase leading-none transition-[scale,color] active:scale-[0.96] ${curva} ${variantes[variante]} ${tamanos[tamano]}`;
}

/**
 * Contenido del botón: un relleno que barre de izquierda a derecha y el
 * texto con las flechas que entran y salen al pasar el mouse.
 */
export function ContenidoBoton({
  children,
  variante = "primario",
}: {
  children: ReactNode;
  variante?: Variante;
}) {
  return (
    <>
      {/* Relleno que barre de izquierda a derecha */}
      <span
        aria-hidden
        className={`absolute inset-0 -z-10 origin-left scale-x-0 rounded-[inherit] transition-[scale] group-hover:scale-x-100 group-focus-visible:scale-x-100 ${curva} ${barridos[variante]}`}
      />
      {/* Flecha que entra por la izquierda */}
      <span
        aria-hidden
        className={`absolute left-[16px] top-1/2 -translate-x-[30px] -translate-y-1/2 opacity-0 transition-[translate,opacity] group-hover:-translate-x-[6px] group-hover:opacity-100 ${curva}`}
      >
        <Chevron className="rotate-180" />
      </span>

      <span
        className={`flex items-center gap-2 transition-[translate] group-hover:translate-x-[14px] ${curva}`}
      >
        <span className="whitespace-nowrap">{children}</span>
        {/* Flecha que sale por la derecha */}
        <span
          aria-hidden
          className={`transition-[translate,opacity] group-hover:translate-x-[30px] group-hover:opacity-0 ${curva}`}
        >
          <Chevron />
        </span>
      </span>
    </>
  );
}

type Props = {
  href: string;
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
  className?: string;
};

/**
 * Botón del sistema (radio 16px, texto de 12px en mayúsculas).
 * Al pasar el mouse el texto se corre a la derecha, entra una flecha por la
 * izquierda y la de la derecha sale: el mismo gesto del sitio de referencia.
 */
export function Boton({
  href,
  variante = "primario",
  tamano = "normal",
  children,
  className = "",
}: Props) {
  return (
    <Link href={href} className={`${clasesBoton(variante, tamano)} ${className}`}>
      <ContenidoBoton variante={variante}>{children}</ContenidoBoton>
    </Link>
  );
}
