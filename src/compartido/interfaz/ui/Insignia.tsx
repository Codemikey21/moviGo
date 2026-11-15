import type { ReactNode } from "react";

export type TonoInsignia = "turquesa" | "salvia" | "ambar" | "coral" | "gris" | "oscuro";

const tonos: Record<TonoInsignia, string> = {
  turquesa: "bg-turquesa/25 text-bosque",
  salvia: "bg-salvia text-bosque",
  ambar: "bg-[#f6e7c1] text-[#7a5a12]",
  coral: "bg-[#fde3dc] text-[#8e2a1f]",
  gris: "bg-carbon/[0.06] text-pizarra",
  oscuro: "bg-carbon text-blanco",
};

const puntos: Record<TonoInsignia, string> = {
  turquesa: "bg-turquesa",
  salvia: "bg-eucalipto",
  ambar: "bg-[#d9a520]",
  coral: "bg-[#d9583f]",
  gris: "bg-bruma",
  oscuro: "bg-turquesa",
};

/** Pastilla de estado: "Pagado", "En camino", "Entregado"… */
export function Insignia({ tono, children }: { tono: TonoInsignia; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium ${tonos[tono]}`}>
      <span className={`size-1.5 rounded-full ${puntos[tono]}`} />
      {children}
    </span>
  );
}
