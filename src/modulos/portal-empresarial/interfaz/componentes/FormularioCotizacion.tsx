"use client";

import { useActionState } from "react";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { cotizarAccion } from "../../servidor/acciones";

const clase = "h-10 rounded-full border border-carbon/10 bg-blanco px-3 text-[13px] outline-none focus:border-carbon";

/** El administrador responde la solicitud con valor, descuento y vigencia. */
export function FormularioCotizacion({ solicitudId, validaHasta }: { solicitudId: string; validaHasta: string }) {
  const [resultado, accion, enviando] = useActionState(cotizarAccion, estadoInicial);
  return (
    <form action={accion} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="solicitudId" value={solicitudId} />
      <input name="valor" inputMode="numeric" placeholder="Valor $" aria-label="Valor" className={`${clase} w-32`} />
      <input name="descuento" type="number" min={0} max={50} placeholder="% desc." aria-label="Descuento" className={`${clase} w-24`} />
      <input name="validaHasta" type="date" defaultValue={validaHasta} aria-label="Válida hasta" className={clase} />
      <BotonAccion type="submit" tamano="compacto" disabled={enviando}>
        Enviar cotización
      </BotonAccion>
      {resultado.estado === "error" && <span className="w-full text-[12px] text-[#c0392b]">{resultado.mensaje}</span>}
    </form>
  );
}
