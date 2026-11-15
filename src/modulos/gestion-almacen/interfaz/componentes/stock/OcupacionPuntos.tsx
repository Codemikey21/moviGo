import { Icono } from "@/compartido/interfaz/ui/Icono";
import type { PuntoResumen } from "../../../tipos";

/** Anillo de ocupación: cuánto del espacio del punto está usado. */
function Anillo({ porcentaje }: { porcentaje: number }) {
  const radio = 34;
  const vuelta = 2 * Math.PI * radio;
  return (
    <svg viewBox="0 0 80 80" className="size-[84px] -rotate-90" aria-hidden>
      <circle cx="40" cy="40" r={radio} fill="none" strokeWidth="7" className="stroke-escarcha" />
      <circle
        cx="40"
        cy="40"
        r={radio}
        fill="none"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={vuelta}
        strokeDashoffset={vuelta * (1 - porcentaje / 100)}
        className={porcentaje >= 90 ? "stroke-[#d9583f]" : "stroke-turquesa"}
      />
    </svg>
  );
}

/** Cada punto de servicio con su ocupación, dirección y horario. */
export function OcupacionPuntos({ puntos }: { puntos: PuntoResumen[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {puntos.map((p) => {
        const porcentaje = Math.min(100, Math.round((p.ocupadas / p.capacidad) * 100));
        return (
          <li key={p.id} className="flex flex-col rounded-[28px] bg-blanco p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="etiqueta text-eucalipto">Punto de servicio</p>
                <h3 className="mt-2 text-[22px] leading-tight text-carbon">{p.nombre.replace("MoviGo ", "")}</h3>
              </div>
              <div className="relative shrink-0">
                <Anillo porcentaje={porcentaje} />
                <span className="absolute inset-0 grid place-items-center text-[15px] font-semibold text-carbon">{porcentaje}%</span>
              </div>
            </div>
            <p className="mt-3 text-[15px] text-carbon">
              <span className="text-[32px] tracking-[-0.02em]">{p.ocupadas}</span>
              <span className="text-pizarra"> / {p.capacidad} espacios</span>
            </p>
            <div className="mt-auto space-y-1.5 border-t border-carbon/[0.07] pt-4 text-[13px] text-pizarra">
              <p className="flex items-center gap-2">
                <Icono nombre="punto" className="size-4 text-bruma" /> {p.direccion}
              </p>
              <p className="flex items-center gap-2">
                <Icono nombre="reloj" className="size-4 text-bruma" /> {p.horario}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
