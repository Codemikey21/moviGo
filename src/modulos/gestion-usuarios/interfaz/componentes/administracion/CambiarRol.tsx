"use client";

import { useActionState, useState } from "react";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { cambiarRolAccion } from "../../../servidor/acciones";
import type { PerfilUsuario } from "../../../tipos";

const roles = [
  { valor: "CLIENTE", texto: "Cliente" },
  { valor: "ADMIN_PUNTO", texto: "Admin de punto" },
  { valor: "ADMIN_SISTEMA", texto: "Admin del sistema" },
];

/** Cambiar el rol de un usuario (solo administrador del sistema). */
export function CambiarRol({
  usuarioId,
  rol,
  puntos,
}: {
  usuarioId: string;
  rol: PerfilUsuario["rol"];
  puntos: { id: string; nombre: string }[];
}) {
  const [resultado, accion, enviando] = useActionState(cambiarRolAccion, estadoInicial);
  const [elegido, setElegido] = useState<string>(rol);
  const editable = ["CLIENTE", "ADMIN_PUNTO", "ADMIN_SISTEMA"].includes(rol);

  if (!editable) return <span className="text-[13px] text-pizarra">Domiciliario</span>;

  return (
    <form action={accion} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <select
        name="rol"
        aria-label="Rol"
        value={elegido}
        onChange={(e) => setElegido(e.target.value)}
        className="h-10 rounded-full border border-carbon/10 bg-blanco px-3 text-[13px]"
      >
        {roles.map((r) => (
          <option key={r.valor} value={r.valor}>
            {r.texto}
          </option>
        ))}
      </select>
      {elegido === "ADMIN_PUNTO" && (
        <select name="puntoId" aria-label="Punto" defaultValue="" className="h-10 rounded-full border border-carbon/10 bg-blanco px-3 text-[13px]">
          <option value="">Punto…</option>
          {puntos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre.replace("MoviGo ", "")}
            </option>
          ))}
        </select>
      )}
      {elegido !== rol || elegido === "ADMIN_PUNTO" ? (
        <button
          type="submit"
          disabled={enviando}
          className="h-10 rounded-full bg-bosque px-4 text-[12px] font-bold uppercase text-blanco disabled:opacity-60"
        >
          Guardar
        </button>
      ) : null}
      {resultado.estado === "error" && <span className="w-full text-right text-[12px] text-[#c0392b]">{resultado.mensaje}</span>}
      {resultado.estado === "exito" && <span className="w-full text-right text-[12px] text-eucalipto">{resultado.mensaje}</span>}
    </form>
  );
}
