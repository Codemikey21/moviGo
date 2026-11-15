import type { MovimientoFila, TipoMovimiento } from "../../../tipos";

const textos: Record<TipoMovimiento, string> = {
  INGRESO: "Ingreso",
  RESERVA: "Reserva",
  SALIDA_VENTA: "Venta",
  SALIDA_ALQUILER: "Alquiler",
  DEVOLUCION: "Devolución",
  A_TALLER: "Al taller",
  DE_TALLER: "Volvió del taller",
  TRASLADO: "Traslado",
};

const fecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});

/** Últimos movimientos de inventario de un producto. */
export function ListaMovimientos({ movimientos }: { movimientos: MovimientoFila[] }) {
  if (!movimientos.length) {
    return (
      <p className="text-[14px] text-pizarra">
        Aún no hay movimientos. Cada ingreso, traslado o paso por el taller quedará aquí.
      </p>
    );
  }
  return (
    <ol className="divide-y divide-carbon/[0.06]">
      {movimientos.map((m) => (
        <li key={m.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-3 text-[14px]">
          <span className="w-36 shrink-0 text-bruma">{fecha.format(m.fecha)}</span>
          <span className="font-medium text-carbon">
            {textos[m.tipo]}
            {m.destino ? ` a ${m.destino.replace("MoviGo ", "")}` : ""}
          </span>
          <span className="font-mono text-[13px] text-pizarra">{m.serial}</span>
          <span className="ml-auto text-bruma">{m.registradoPor}</span>
          {m.nota && <span className="basis-full pl-[156px] text-pizarra">{m.nota}</span>}
        </li>
      ))}
    </ol>
  );
}
