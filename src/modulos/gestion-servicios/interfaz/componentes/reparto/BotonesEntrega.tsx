"use client";

import { useActionState } from "react";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { accionRepartoAccion } from "../../../servidor/reparto/acciones";

type Accion = "tomar" | "aceptar" | "rechazar" | "salir";

const estilos: Record<Accion, { texto: string; enviando: string; clase: string }> = {
  tomar: { texto: "Tomar entrega", enviando: "Tomando…", clase: "bg-turquesa text-carbon" },
  aceptar: { texto: "Aceptar", enviando: "Aceptando…", clase: "bg-turquesa text-carbon" },
  rechazar: { texto: "No puedo", enviando: "Devolviendo…", clase: "bg-carbon/[0.06] text-carbon" },
  salir: { texto: "Ya la recogí · salir a ruta", enviando: "Saliendo…", clase: "bg-turquesa text-carbon" },
};

/** Botones de una entrega en el portal del domiciliario. */
export function BotonesEntrega({ domicilioId, acciones, ancho = false }: { domicilioId: string; acciones: Accion[]; ancho?: boolean }) {
  const [estado, accion, enviando] = useActionState(accionRepartoAccion, estadoInicial);

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="domicilioId" value={domicilioId} />
      <div className={`flex gap-2 ${ancho ? "flex-col sm:flex-row" : "flex-wrap"}`}>
        {acciones.map((a) => (
          <button
            key={a}
            type="submit"
            name="accion"
            value={a}
            disabled={enviando}
            className={`flex h-[52px] items-center justify-center rounded-boton px-6 text-[13px] font-bold uppercase tracking-[0.04em] transition-[transform,opacity] active:scale-[0.98] disabled:opacity-60 ${
              estilos[a].clase
            } ${ancho ? "w-full sm:w-auto sm:flex-1" : ""}`}
          >
            {enviando ? estilos[a].enviando : estilos[a].texto}
          </button>
        ))}
      </div>
      {estado.estado === "error" && (
        <p role="alert" className="text-[14px] text-[#c0392b]">
          {estado.mensaje}
        </p>
      )}
      {estado.estado === "exito" && (
        <p role="status" className="text-[14px] text-eucalipto">
          {estado.mensaje}
        </p>
      )}
    </form>
  );
}
