import type { ReactNode } from "react";

type Props = {
  tipo: "error" | "exito" | "info";
  children: ReactNode;
};

const estilos = {
  error: "border-[#c0392b]/25 bg-[#fdf1ef] text-[#8e2a1f]",
  exito: "border-eucalipto/30 bg-escarcha text-bosque",
  info: "border-carbon/10 bg-escarcha text-pizarra",
};

/** Mensaje arriba del formulario. Los lectores de pantalla lo anuncian. */
export function Aviso({ tipo, children }: Props) {
  return (
    <div
      role={tipo === "error" ? "alert" : "status"}
      className={`rounded-campo border px-4 py-3 text-[14px] leading-snug ${estilos[tipo]}`}
    >
      {children}
    </div>
  );
}
