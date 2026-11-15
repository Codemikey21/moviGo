"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { agregarColorAccion, borrarColorAccion } from "../../../servidor/colores/acciones";
import type { ColorProducto } from "../../../tipos";
import { EditarColor } from "./EditarColor";

/**
 * Colores en que viene el producto (los del configurador). Cada foto y cada
 * unidad puede marcarse con uno de estos colores.
 */
export function ColoresProducto({
  productoId,
  colores,
  conteo,
  puedeEditar,
}: {
  productoId: string;
  colores: ColorProducto[];
  /** Unidades de cada color: { colorId: n } */
  conteo: Record<string, number>;
  puedeEditar: boolean;
}) {
  const [estado, accion, enviando] = useActionState(agregarColorAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;
  const [hex, setHex] = useState(error?.valores?.hex || "#64d5b3");

  return (
    <div className="space-y-6">
      {colores.length === 0 ? (
        <p className="rounded-[20px] bg-escarcha px-5 py-4 text-[14px] text-pizarra">
          Este producto aún no tiene colores. Sin colores, el configurador muestra un solo color.
        </p>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {colores.map((c) => (
            <li key={c.id} className="flex items-center gap-3 rounded-full bg-escarcha py-2 pl-2 pr-3">
              {puedeEditar ? (
                <EditarColor productoId={productoId} color={c} unidades={conteo[c.id] ?? 0} />
              ) : (
                <>
                  <span className="size-8 rounded-full ring-1 ring-carbon/10" style={{ background: c.hex }} />
                  <span className="text-[14px] text-carbon">
                    {c.nombre}
                    <span className="ml-2 text-pizarra">{conteo[c.id] ?? 0} u.</span>
                  </span>
                </>
              )}
              {puedeEditar && (
                <form
                  action={borrarColorAccion}
                  onSubmit={(e) => {
                    if (!confirm(`¿Borrar el color ${c.nombre}? Sus fotos y unidades quedan sin color.`)) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    aria-label={`Borrar ${c.nombre}`}
                    className="grid size-7 place-items-center rounded-full text-pizarra transition-colors hover:bg-carbon hover:text-blanco"
                  >
                    ×
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}

      {puedeEditar && (
        <form action={accion} className="space-y-4 border-t border-carbon/[0.08] pt-6" key={estado.estado === "exito" ? estado.mensaje : "f"}>
          <input type="hidden" name="productoId" value={productoId} />
          {error?.mensaje && <Aviso tipo="error">{error.mensaje}</Aviso>}
          {estado.estado === "exito" && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
          <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <CampoTexto
              etiqueta="Nombre del color"
              name="nombre"
              placeholder="Negro mate"
              defaultValue={error?.valores?.nombre}
              error={error?.errores?.nombre}
            />
            <div>
              <label htmlFor="hex" className="mb-2 block text-[14px] font-medium text-carbon">
                Tono
              </label>
              <div className="flex h-14 items-center gap-3 rounded-campo bg-escarcha px-3">
                <input
                  id="hex"
                  type="color"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="size-9 cursor-pointer rounded-full border-0 bg-transparent p-0"
                />
                <input type="hidden" name="hex" value={hex} />
                <span className="font-mono text-[14px] text-pizarra">{hex}</span>
              </div>
            </div>
            <BotonAccion type="submit" disabled={enviando}>
              {enviando ? "Agregando…" : "Agregar color"}
            </BotonAccion>
          </div>
        </form>
      )}
    </div>
  );
}
