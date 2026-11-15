import type { CSSProperties, ReactNode } from "react";

/**
 * Pestaña recortada en una esquina inferior de una tarjeta, del mismo color
 * del fondo de la página, con las esquinas invertidas (detalle de Zoox).
 * La tarjeta debe tener `relative`, `overflow-hidden` y la esquina de ese
 * lado sin redondear (rounded-bl-none o rounded-br-none).
 */
export function Muesca({
  lado = "izquierda",
  fondo = "var(--color-blanco)",
  className = "",
  children,
}: {
  lado?: "izquierda" | "derecha";
  /** Color del fondo de la página detrás de la tarjeta */
  fondo?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`muesca muesca-${lado} ${className}`}
      style={{ "--fondo-muesca": fondo } as CSSProperties}
    >
      {children}
    </div>
  );
}
