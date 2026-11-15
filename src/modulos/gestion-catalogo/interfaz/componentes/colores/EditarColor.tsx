"use client";

import { useActionState, useState } from "react";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { editarColorAccion } from "../../../servidor/colores/acciones";
import type { ColorProducto } from "../../../tipos";

/**
 * Pastilla de un color con el botón de editar: cambia el nombre o el tono
 * sin perder las fotos ni las unidades marcadas con ese color.
 */
export function EditarColor({ productoId, color, unidades }: { productoId: string; color: ColorProducto; unidades: number }) {
  const [abierto, setAbierto] = useState(false);
  const [hex, setHex] = useState(color.hex);
  const [estado, accion, enviando] = useActionState(async (anterior: Parameters<typeof editarColorAccion>[0], formData: FormData) => {
    const resultado = await editarColorAccion(anterior, formData);
    if (resultado.estado === "exito") setAbierto(false);
    return resultado;
  }, estadoInicial);
  const error = estado.estado === "error" ? (estado.errores?.nombre ?? estado.errores?.hex ?? estado.mensaje) : null;

  if (!abierto) {
    return (
      <>
        <span className="size-8 rounded-full ring-1 ring-carbon/10" style={{ background: color.hex }} />
        <span className="text-[14px] text-carbon">
          {color.nombre}
          <span className="ml-2 text-pizarra">{unidades} u.</span>
        </span>
        <button
          type="button"
          onClick={() => {
            setHex(color.hex);
            setAbierto(true);
          }}
          aria-label={`Editar ${color.nombre}`}
          className="grid size-7 place-items-center rounded-full text-[13px] text-pizarra transition-colors hover:bg-carbon hover:text-blanco"
        >
          ✎
        </button>
      </>
    );
  }

  return (
    <form action={accion} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={color.id} />
      <input type="hidden" name="productoId" value={productoId} />
      <input type="hidden" name="hex" value={hex} />
      <input
        type="color"
        value={hex}
        onChange={(e) => setHex(e.target.value)}
        aria-label="Tono"
        className="size-8 cursor-pointer rounded-full border-0 bg-transparent p-0"
      />
      <input
        name="nombre"
        defaultValue={color.nombre}
        aria-label="Nombre del color"
        autoFocus
        maxLength={40}
        className="h-9 w-40 rounded-full border border-carbon/15 bg-blanco px-3 text-[14px] text-carbon outline-none focus:border-carbon"
      />
      <button type="submit" disabled={enviando} className="h-9 rounded-full bg-bosque px-4 text-[12px] font-bold uppercase text-blanco disabled:opacity-60">
        {enviando ? "…" : "Guardar"}
      </button>
      <button type="button" onClick={() => setAbierto(false)} className="h-9 rounded-full px-3 text-[12px] font-bold uppercase text-pizarra hover:bg-carbon/[0.06]">
        Cancelar
      </button>
      {error && <span className="w-full pl-2 text-[12px] text-[#c0392b]">{error}</span>}
    </form>
  );
}
