import { Icono } from "./Icono";

export type Paso = {
  titulo: string;
  detalle?: string;
  estado: "hecho" | "actual" | "pendiente";
};

/** Pasos de un pedido o alquiler: hechos en turquesa, el actual resaltado. */
export function LineaTiempo({ pasos, tono = "claro" }: { pasos: Paso[]; tono?: "claro" | "oscuro" }) {
  const oscuro = tono === "oscuro";
  return (
    <ol className="grid gap-5 sm:grid-flow-col sm:auto-cols-fr sm:gap-3">
      {pasos.map((p, i) => (
        <li key={p.titulo} className="relative flex gap-4 sm:block">
          {/* Línea que une con el siguiente paso */}
          {i < pasos.length - 1 && (
            <span
              aria-hidden
              className={`absolute left-[17px] top-10 h-[calc(100%-12px)] w-0.5 sm:left-12 sm:right-0 sm:top-[17px] sm:h-0.5 sm:w-auto ${
                p.estado === "hecho" ? "bg-turquesa" : oscuro ? "bg-blanco/15" : "bg-carbon/10"
              }`}
            />
          )}
          <span
            className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-full ${
              p.estado === "hecho"
                ? "bg-turquesa text-carbon"
                : p.estado === "actual"
                  ? `${oscuro ? "bg-blanco text-carbon" : "bg-carbon text-blanco"} ring-4 ${oscuro ? "ring-blanco/15" : "ring-turquesa/30"}`
                  : oscuro
                    ? "bg-blanco/10 text-blanco/40"
                    : "bg-escarcha text-niebla"
            }`}
          >
            {p.estado === "hecho" ? <Icono nombre="check" className="size-4" /> : <span className="text-[12px] font-bold">{i + 1}</span>}
          </span>
          <div className="pb-1 sm:mt-3 sm:pr-4">
            <p
              className={`text-[15px] ${
                p.estado === "pendiente" ? (oscuro ? "text-blanco/45" : "text-bruma") : oscuro ? "text-blanco" : "text-carbon"
              }`}
            >
              {p.titulo}
            </p>
            {p.detalle && <p className={`mt-0.5 text-[13px] ${oscuro ? "text-blanco/60" : "text-pizarra"}`}>{p.detalle}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
