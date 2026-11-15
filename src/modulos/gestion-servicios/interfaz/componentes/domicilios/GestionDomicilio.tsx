"use client";

import { useActionState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { gestionarDomicilioAccion } from "../../../servidor/domicilios/acciones";
import type { DomiciliarioVista, DomicilioVista } from "../../../tipos";

/** Asignar domiciliario → salir a ruta → entregado. */
export function GestionDomicilio({ domicilio, domiciliarios }: { domicilio: DomicilioVista; domiciliarios: DomiciliarioVista[] }) {
  const [resultado, accion, enviando] = useActionState(gestionarDomicilioAccion, estadoInicial);

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="domicilioId" value={domicilio.id} />
      {resultado.estado === "error" && <Aviso tipo="error">{resultado.mensaje}</Aviso>}

      {!domicilio.listoParaDespachar && domicilio.estado === "SOLICITADO" && (
        <p className="rounded-campo bg-[#f6e7c1]/60 px-4 py-3 text-[14px] text-[#7a5a12]">Esperando el pago del cliente.</p>
      )}

      {domicilio.listoParaDespachar && ["SOLICITADO", "ASIGNADO"].includes(domicilio.estado) && (
        <div className="flex gap-2">
          <select
            name="domiciliarioId"
            aria-label="Domiciliario"
            defaultValue={domicilio.domiciliario?.id ?? ""}
            className="h-[50px] min-w-0 flex-1 rounded-campo border border-transparent bg-escarcha px-3 text-[15px] outline-none focus:border-carbon"
          >
            <option value="">Elige domiciliario</option>
            {domiciliarios.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} · {d.vehiculo}
                {d.enCurso ? ` (${d.enCurso} en curso)` : ""}
              </option>
            ))}
          </select>
          <BotonAccion type="submit" name="accion" value="asignar" variante={domicilio.domiciliario ? "secundario" : "primario"} disabled={enviando}>
            {domicilio.domiciliario ? "Cambiar" : "Asignar"}
          </BotonAccion>
        </div>
      )}

      {domicilio.estado === "ASIGNADO" && domicilio.domiciliario && (
        <p className={`rounded-campo px-4 py-3 text-[14px] ${domicilio.aceptadoEn ? "bg-salvia text-bosque" : "bg-[#f6e7c1]/60 text-[#7a5a12]"}`}>
          {domicilio.aceptadoEn
            ? `${domicilio.domiciliario.nombre} aceptó y va a recogerlo.`
            : `Esperando que ${domicilio.domiciliario.nombre} acepte en su portal.`}
        </p>
      )}

      {domicilio.estado === "ASIGNADO" && (
        <BotonAccion type="submit" name="accion" value="salir" disabled={enviando} className="w-full">
          Salió a ruta
        </BotonAccion>
      )}
      {domicilio.estado === "EN_CURSO" && (
        <BotonAccion type="submit" name="accion" value="entregar" disabled={enviando} className="w-full">
          Marcar entregado
        </BotonAccion>
      )}
    </form>
  );
}
