import type { ReactNode } from "react";

/** Título de cada página del panel, con la misma tipografía de la landing. */
export function EncabezadoAdmin({
  etiqueta,
  titulo,
  descripcion,
  acciones,
}: {
  etiqueta: string;
  titulo: ReactNode;
  descripcion?: ReactNode;
  acciones?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 pb-8 pt-10 md:pt-14">
      <div>
        <p className="etiqueta text-carbon/70">{etiqueta}</p>
        <h1 className="titular mt-4 text-[clamp(40px,5vw,76px)] text-carbon">{titulo}</h1>
        {descripcion && <p className="mt-4 max-w-[640px] text-[18px] leading-[1.5] text-pizarra">{descripcion}</p>}
      </div>
      {acciones}
    </div>
  );
}

/** Pastillas de filtro por estado, con el número de cada uno. */
export function FiltroEstados({
  base,
  actual,
  opciones,
}: {
  base: string;
  actual?: string;
  opciones: { valor?: string; texto: string; cantidad?: number }[];
}) {
  return (
    <nav aria-label="Filtrar por estado" className="mb-6 flex flex-wrap gap-1.5">
      {opciones.map((o) => {
        const activa = (o.valor ?? "") === (actual ?? "");
        return (
          <a
            key={o.texto}
            href={o.valor ? `${base}?estado=${o.valor}` : base}
            aria-current={activa ? "page" : undefined}
            className={`flex h-10 items-center gap-2 rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
              activa ? "bg-bosque text-blanco" : "bg-blanco text-carbon hover:bg-carbon/[0.06]"
            }`}
          >
            {o.texto}
            {o.cantidad !== undefined && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] ${activa ? "bg-blanco/15" : "bg-escarcha"}`}>{o.cantidad}</span>
            )}
          </a>
        );
      })}
    </nav>
  );
}
