import { formatoPesos } from "@/compartido/utilidades/formato";

/** Barras de ingresos por día (últimos 14 días). */
export function GraficaIngresos({ dias }: { dias: { clave: string; total: number }[] }) {
  const maximo = Math.max(...dias.map((d) => d.total), 1);
  const etiquetaDia = (clave: string) =>
    new Intl.DateTimeFormat("es-CO", { day: "numeric", timeZone: "UTC" }).format(new Date(`${clave}T12:00:00Z`));
  return (
    <div className="flex h-[200px] items-end gap-1.5 sm:gap-2" role="img" aria-label="Ingresos por día de los últimos 14 días">
      {dias.map((d, i) => (
        <div key={d.clave} className="group relative flex h-full flex-1 flex-col justify-end">
          <span
            className={`block min-h-1 rounded-t-[8px] ${i === dias.length - 1 ? "bg-turquesa" : "bg-blanco/25"}`}
            style={{ height: `${(d.total / maximo) * 100}%` }}
          />
          <span className="mt-2 text-center text-[11px] text-blanco/50">{etiquetaDia(d.clave)}</span>
          {d.total > 0 && (
            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-blanco px-2.5 py-1 text-[11px] text-carbon group-hover:block">
              {formatoPesos.format(d.total)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
