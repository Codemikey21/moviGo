import type { EstadoServicio } from "../../../tipos";

/**
 * Código de 4 dígitos que el cliente le dice al domiciliario en la puerta.
 * Sin él, el domiciliario no puede marcar la entrega.
 */
export function CodigoEntrega({ codigo, estado, className = "" }: { codigo: string; estado: EstadoServicio; className?: string }) {
  if (!["SOLICITADO", "ASIGNADO", "EN_CURSO"].includes(estado)) return null;
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 rounded-[22px] bg-carbon px-6 py-5 text-blanco ${className}`}>
      <div className="max-w-[340px]">
        <p className="etiqueta text-turquesa">Código de entrega</p>
        <p className="mt-2 text-[14px] leading-snug text-blanco/70">
          Dáselo al domiciliario cuando tengas tu pedido en las manos. No lo compartas antes.
        </p>
      </div>
      <p aria-label={`Código ${codigo.split("").join(" ")}`} className="flex gap-2">
        {codigo.split("").map((n, i) => (
          <span key={i} className="grid h-14 w-11 place-items-center rounded-[14px] bg-blanco/10 font-mono text-[28px] text-blanco">
            {n}
          </span>
        ))}
      </p>
    </div>
  );
}
