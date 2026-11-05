import type { ButtonHTMLAttributes, ReactNode } from "react";
import { clasesBoton, ContenidoBoton, type Tamano, type Variante } from "./Boton";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamano?: Tamano;
  children: ReactNode;
};

/**
 * El mismo botón del sistema, pero como <button> para formularios.
 * Desactivado (por ejemplo mientras se envía) pierde la animación.
 */
export function BotonAccion({
  variante = "primario",
  tamano = "normal",
  type = "button",
  className = "",
  children,
  ...resto
}: Props) {
  return (
    <button
      type={type}
      className={`${clasesBoton(variante, tamano)} disabled:pointer-events-none disabled:opacity-60 ${className}`}
      {...resto}
    >
      <ContenidoBoton>{children}</ContenidoBoton>
    </button>
  );
}
