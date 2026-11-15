"use client";

import { useActionState } from "react";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { gestionarAlquilerAccion } from "../../../servidor/alquiler/acciones";
import type { AlquilerVista } from "../../../tipos";

/** Botones del administrador según el estado del alquiler. */
export function AccionesAlquiler({ alquiler }: { alquiler: AlquilerVista }) {
  const [resultado, accion, enviando] = useActionState(gestionarAlquilerAccion, estadoInicial);
  return (
    <form action={accion} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="id" value={alquiler.id} />
      {resultado.estado === "error" && <span className="text-[13px] text-[#c0392b]">{resultado.mensaje}</span>}
      {alquiler.estado === "ASIGNADO" && alquiler.entrega === "EN_PUNTO" && (
        <BotonAccion type="submit" name="accion" value="entregar" tamano="compacto" disabled={enviando}>
          Entregar
        </BotonAccion>
      )}
      {alquiler.estado === "ASIGNADO" && alquiler.entrega === "A_DOMICILIO" && (
        <span className="text-[13px] text-pizarra">Se entrega con el domicilio</span>
      )}
      {alquiler.estado === "EN_CURSO" && (
        <BotonAccion type="submit" name="accion" value="devolver" tamano="compacto" disabled={enviando}>
          Recibir devolución
        </BotonAccion>
      )}
      {["SOLICITADO", "ASIGNADO"].includes(alquiler.estado) && (
        <BotonAccion type="submit" name="accion" value="cancelar" variante="secundario" tamano="compacto" disabled={enviando}>
          Cancelar
        </BotonAccion>
      )}
    </form>
  );
}
