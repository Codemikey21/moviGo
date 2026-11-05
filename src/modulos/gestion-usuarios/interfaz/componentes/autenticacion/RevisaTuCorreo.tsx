import type { ReactNode } from "react";

type Props = {
  correo?: string;
  mensaje: string;
  /** Botón o enlace para seguir */
  children?: ReactNode;
};

/** Pantalla de "revisa tu correo" con un sobre que entra suave. */
export function RevisaTuCorreo({ correo, mensaje, children }: Props) {
  return (
    <div role="status" className="entrar-desde-derecha">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-salvia text-bosque">
        <svg aria-hidden viewBox="0 0 24 24" fill="none" className="h-8 w-8">
          <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-6 text-[28px] font-medium leading-tight tracking-[-0.01em] text-carbon">
        Revisa tu correo
      </h2>
      <p className="mt-3 text-[16px] text-pizarra">{mensaje}</p>
      {correo && (
        <p className="mt-4 rounded-campo bg-escarcha px-4 py-3 text-[15px] font-medium text-carbon">
          {correo}
        </p>
      )}
      <p className="mt-4 text-[14px] text-bruma">
        Si no te llega en unos minutos, revisa la carpeta de spam o promociones.
      </p>
      {children && <div className="mt-8">{children}</div>}
    </div>
  );
}
