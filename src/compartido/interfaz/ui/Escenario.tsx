import type { ReactNode } from "react";

/**
 * Fondo oscuro con un carril de luz y un haz que se mueve despacio: el
 * "pedestal" donde se muestran los vehículos (como la foto de Zoox).
 */
export function Escenario({
  className = "",
  carril = "polygon(30% 0, 70% 0, 100% 100%, 0 100%)",
  haz = true,
  children,
}: {
  className?: string;
  /** Forma del carril de luz (clip-path) */
  carril?: string;
  haz?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`escenario ${className}`}>
      <div aria-hidden className="escenario-carril" style={{ clipPath: carril }} />
      {haz && <div aria-hidden className="escenario-haz" />}
      {children}
    </div>
  );
}
