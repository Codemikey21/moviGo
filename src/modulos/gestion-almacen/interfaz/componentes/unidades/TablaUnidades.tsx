"use client";

import { useActionState, useState } from "react";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { moverUnidadAccion } from "../../../servidor/unidades/acciones";
import type { EstadoUnidad, UnidadFila } from "../../../tipos";

const estados: Record<EstadoUnidad, { texto: string; clase: string }> = {
  DISPONIBLE: { texto: "Disponible", clase: "bg-turquesa/25 text-bosque" },
  RESERVADA: { texto: "Reservada", clase: "bg-[#f6e7c1] text-[#7a5a12]" },
  ALQUILADA: { texto: "Alquilada", clase: "bg-salvia text-bosque" },
  VENDIDA: { texto: "Vendida", clase: "bg-carbon/[0.06] text-pizarra" },
  EN_TALLER: { texto: "En taller", clase: "bg-[#fde3dc] text-[#8e2a1f]" },
  BAJA: { texto: "De baja", clase: "bg-carbon/[0.06] text-bruma" },
};

type Props = {
  unidades: UnidadFila[];
  puntos: { id: string; nombre: string }[];
  /** Punto del administrador de punto (null = administra todos) */
  puntoFijo: string | null;
};

/** Unidades físicas de un producto, con filtro por punto y acciones rápidas. */
export function TablaUnidades({ unidades, puntos, puntoFijo }: Props) {
  const [filtro, setFiltro] = useState("todos");
  const visibles = filtro === "todos" ? unidades : unidades.filter((u) => u.punto.id === filtro);

  if (!unidades.length) {
    return <p className="text-[14px] text-pizarra">Todavía no hay unidades de este producto.</p>;
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtrar por punto">
        {[{ id: "todos", nombre: "Todos" }, ...puntos].map((p) => {
          const cuantas =
            p.id === "todos" ? unidades.length : unidades.filter((u) => u.punto.id === p.id).length;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={filtro === p.id}
              onClick={() => setFiltro(p.id)}
              className={`rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                filtro === p.id ? "bg-carbon text-blanco" : "bg-escarcha text-pizarra hover:text-carbon"
              }`}
            >
              {p.nombre.replace("MoviGo ", "")} · {cuantas}
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead>
            <tr className="etiqueta text-bruma">
              <th className="py-2 pr-4 font-medium">Serial</th>
              <th className="py-2 pr-4 font-medium">Punto</th>
              <th className="py-2 pr-4 font-medium">Estado</th>
              <th className="py-2 pr-4 font-medium">Km</th>
              <th className="py-2 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon/[0.06]">
            {visibles.map((u) => (
              <tr key={u.id}>
                <td className="py-2.5 pr-4 font-mono text-[13px] text-carbon">
                  <span className="flex items-center gap-2">
                    {u.color && (
                      <span
                        title={u.color.nombre}
                        className="size-3 shrink-0 rounded-full ring-1 ring-carbon/15"
                        style={{ background: u.color.hex }}
                      />
                    )}
                    {u.serial}
                  </span>
                </td>
                <td className="py-2.5 pr-4 text-pizarra">{u.punto.nombre.replace("MoviGo ", "")}</td>
                <td className="py-2.5 pr-4">
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${estados[u.estado].clase}`}>
                    {estados[u.estado].texto}
                  </span>
                </td>
                <td className="py-2.5 pr-4 tabular-nums text-pizarra">{u.kilometraje.toLocaleString("es-CO")}</td>
                <td className="py-2.5 text-right">
                  {(!puntoFijo || puntoFijo === u.punto.id) && (
                    <AccionesUnidad key={`${u.id}-${u.estado}-${u.punto.id}`} unidad={u} puntos={puntos} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const claseBoton =
  "rounded-full px-3 py-1.5 text-[12px] font-medium text-bosque transition-colors hover:bg-carbon/[0.06] disabled:opacity-50";

function AccionesUnidad({ unidad, puntos }: { unidad: UnidadFila; puntos: { id: string; nombre: string }[] }) {
  const [estado, accion, enviando] = useActionState(moverUnidadAccion, estadoInicial);
  const [trasladando, setTrasladando] = useState(false);
  const destinos = puntos.filter((p) => p.id !== unidad.punto.id);

  return (
    <form action={accion} className="inline-flex flex-wrap items-center justify-end gap-1">
      <input type="hidden" name="unidadId" value={unidad.id} />
      {estado.estado === "error" && <span className="mr-1 text-[12px] text-[#c0392b]">{estado.mensaje}</span>}

      {unidad.estado === "DISPONIBLE" && !trasladando && (
        <>
          <button type="submit" name="cambio" value="A_TALLER" disabled={enviando} className={claseBoton}>
            Al taller
          </button>
          <button type="button" onClick={() => setTrasladando(true)} className={claseBoton}>
            Trasladar
          </button>
        </>
      )}

      {unidad.estado === "DISPONIBLE" && trasladando && (
        <>
          <select
            name="destinoId"
            aria-label="Punto de destino"
            className="h-8 rounded-full border border-carbon/15 bg-blanco px-3 text-[12px]"
            defaultValue={destinos[0]?.id}
          >
            {destinos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre.replace("MoviGo ", "")}
              </option>
            ))}
          </select>
          <button type="submit" name="cambio" value="TRASLADO" disabled={enviando} className={claseBoton}>
            Mover
          </button>
          <button type="button" onClick={() => setTrasladando(false)} className={claseBoton}>
            Cancelar
          </button>
        </>
      )}

      {unidad.estado === "EN_TALLER" && (
        <button type="submit" name="cambio" value="DE_TALLER" disabled={enviando} className={claseBoton}>
          Volvió del taller
        </button>
      )}
    </form>
  );
}
