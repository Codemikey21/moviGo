"use client";

import { useActionState, useState } from "react";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { VEHICULOS_REPARTO } from "@/modulos/gestion-servicios/tipos";
import { cambiarRolAccion } from "../../../servidor/acciones";
import type { PerfilUsuario } from "../../../tipos";

const roles = [
  { valor: "CLIENTE", texto: "Cliente" },
  { valor: "DOMICILIARIO", texto: "Domiciliario" },
  { valor: "ADMIN_PUNTO", texto: "Admin de punto" },
  { valor: "ADMIN_SISTEMA", texto: "Admin del sistema" },
];

const claseSelect = "h-10 rounded-full border border-carbon/10 bg-blanco px-3 text-[13px]";

/** Cambiar el rol de un usuario (solo administrador del sistema). */
export function CambiarRol({
  usuarioId,
  rol,
  vehiculo,
  puntos,
}: {
  usuarioId: string;
  rol: PerfilUsuario["rol"];
  /** Solo si ya es domiciliario */
  vehiculo?: string | null;
  puntos: { id: string; nombre: string }[];
}) {
  const [resultado, accion, enviando] = useActionState(cambiarRolAccion, estadoInicial);
  const [elegido, setElegido] = useState<string>(rol);
  const [vehiculoElegido, setVehiculoElegido] = useState<string>(vehiculo ?? VEHICULOS_REPARTO[0]);

  // Las cuentas de empresa se manejan desde el portal empresarial
  if (rol === "EMPRESA") return <span className="text-[13px] text-pizarra">Empresa</span>;

  const cambio = elegido !== rol || elegido === "ADMIN_PUNTO" || (elegido === "DOMICILIARIO" && vehiculoElegido !== vehiculo);

  return (
    <form action={accion} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="usuarioId" value={usuarioId} />
      <select name="rol" aria-label="Rol" value={elegido} onChange={(e) => setElegido(e.target.value)} className={claseSelect}>
        {roles.map((r) => (
          <option key={r.valor} value={r.valor}>
            {r.texto}
          </option>
        ))}
      </select>
      {elegido === "ADMIN_PUNTO" && (
        <select name="puntoId" aria-label="Punto" defaultValue="" className={claseSelect}>
          <option value="">Punto…</option>
          {puntos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre.replace("MoviGo ", "")}
            </option>
          ))}
        </select>
      )}
      {elegido === "DOMICILIARIO" && (
        <select
          name="vehiculo"
          aria-label="Vehículo con el que reparte"
          value={vehiculoElegido}
          onChange={(e) => setVehiculoElegido(e.target.value)}
          className={claseSelect}
        >
          {VEHICULOS_REPARTO.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      )}
      {cambio ? (
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
