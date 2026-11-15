import Link from "next/link";
import type { ReactNode } from "react";
import type { EntregaReparto } from "../../../tipos";

export function kilometros(metros: number) {
  return metros < 1000 ? `${metros} m` : `${(metros / 1000).toLocaleString("es-CO", { maximumFractionDigits: 1 })} km`;
}

/** Hace cuánto pasó algo, en palabras cortas. */
export function haceCuanto(fecha: Date | null) {
  if (!fecha) return "";
  const minutos = Math.round((Date.now() - fecha.getTime()) / 60_000);
  if (minutos < 1) return "ahora";
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  return horas < 24 ? `hace ${horas} h` : `hace ${Math.round(horas / 24)} d`;
}

/**
 * Tarjeta de una entrega en el portal del domiciliario: de dónde sale, a
 * dónde va, qué lleva y qué tan lejos. Abajo van las acciones.
 */
export function TarjetaEntrega({
  entrega: e,
  etiqueta,
  children,
  tono = "claro",
}: {
  entrega: EntregaReparto;
  etiqueta: string;
  children?: ReactNode;
  tono?: "claro" | "oscuro";
}) {
  const oscuro = tono === "oscuro";
  return (
    <article className={`rounded-[28px] p-6 ${oscuro ? "bg-carbon text-blanco" : "bg-blanco text-carbon"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className={`etiqueta ${oscuro ? "text-turquesa" : "text-eucalipto"}`}>{etiqueta}</p>
        <p className={`shrink-0 font-mono text-[12px] uppercase ${oscuro ? "text-blanco/60" : "text-pizarra"}`}>{kilometros(e.distancia)}</p>
      </div>
      <Link href={`/domiciliario/entregas/${e.id}`} className="group mt-4 block">
        <ol className="relative space-y-4 pl-7">
          <span aria-hidden className={`absolute bottom-3 left-[7px] top-3 w-px ${oscuro ? "bg-blanco/20" : "bg-carbon/15"}`} />
          <li className="relative">
            <span aria-hidden className="absolute -left-7 top-1 grid size-[15px] place-items-center rounded-full bg-bosque ring-4 ring-bosque/15" />
            <p className={`text-[13px] ${oscuro ? "text-blanco/60" : "text-pizarra"}`}>Recoge en</p>
            <p className="text-[17px] leading-snug">{e.origen.nombre}</p>
          </li>
          <li className="relative">
            <span aria-hidden className="absolute -left-7 top-1 size-[15px] rounded-full bg-turquesa ring-4 ring-turquesa/20" />
            <p className={`text-[13px] ${oscuro ? "text-blanco/60" : "text-pizarra"}`}>Entrega en {e.destino.barrio}</p>
            <p className="text-[17px] leading-snug group-hover:underline group-hover:underline-offset-4">{e.destino.direccion}</p>
          </li>
        </ol>
        <p className={`mt-4 text-[14px] ${oscuro ? "text-blanco/70" : "text-pizarra"}`}>{e.descripcion}</p>
      </Link>
      {children && <div className="mt-5">{children}</div>}
    </article>
  );
}
