"use client";

import { useActionState } from "react";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { gestionarMantenimientoAccion } from "../../../servidor/mantenimiento/acciones";
import type { EstadoMantenimiento } from "../../../tipos";

/** Recibir en taller o terminar (con el costo) desde el panel. */
export function GestionMantenimiento({ id, estado }: { id: string; estado: EstadoMantenimiento }) {
  const [resultado, accion, enviando] = useActionState(gestionarMantenimientoAccion, estadoInicial);
  if (estado === "REALIZADO") return null;
  return (
    <form action={accion} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="id" value={id} />
      {resultado.estado === "error" && <span className="text-[12px] text-[#c0392b]">{resultado.mensaje}</span>}
      {estado === "PROGRAMADO" ? (
        <BotonAccion type="submit" name="accion" value="iniciar" tamano="compacto" disabled={enviando}>
          Recibir en taller
        </BotonAccion>
      ) : (
        <>
          <input
            name="costo"
            inputMode="numeric"
            placeholder="Costo $"
            aria-label="Costo del mantenimiento"
            className="h-10 w-28 rounded-full border border-carbon/10 bg-blanco px-3 text-[13px] outline-none focus:border-carbon"
          />
          <BotonAccion type="submit" name="accion" value="terminar" tamano="compacto" disabled={enviando}>
            Terminado
          </BotonAccion>
        </>
      )}
    </form>
  );
}
