"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { CampoArea } from "@/compartido/interfaz/ui/CampoArea";
import { CampoSelect } from "@/compartido/interfaz/ui/CampoSelect";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { registrarUnidadesAccion } from "../../../servidor/unidades/acciones";

type Props = {
  productoId: string;
  puntos: { id: string; nombre: string }[];
  /** Un administrador de punto solo registra en su punto */
  puntoFijo: string | null;
};

/** Ingreso de unidades nuevas de un producto a un punto de servicio. */
export function RegistrarUnidades({ productoId, puntos, puntoFijo }: Props) {
  const [estado, accion, enviando] = useActionState(registrarUnidadesAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;
  const v = error?.valores;
  const [conSeriales, setConSeriales] = useState(Boolean(v?.seriales));
  const opciones = puntos
    .filter((p) => !puntoFijo || p.id === puntoFijo)
    .map((p) => ({ valor: p.id, texto: p.nombre }));

  return (
    <form action={accion} className="space-y-5" noValidate key={v ? JSON.stringify(v) : estado.estado}>
      <input type="hidden" name="productoId" value={productoId} />
      {error?.mensaje && <Aviso tipo="error">{error.mensaje}</Aviso>}
      {estado.estado === "exito" && <Aviso tipo="exito">{estado.mensaje}</Aviso>}

      <div className="grid gap-5 sm:grid-cols-[1.4fr_1fr]">
        <CampoSelect
          etiqueta="Punto de servicio"
          name="puntoId"
          vacio={opciones.length > 1 ? "Elige el punto" : undefined}
          defaultValue={v?.puntoId ?? (opciones.length === 1 ? opciones[0].valor : "")}
          opciones={opciones}
          error={error?.errores?.puntoId}
        />
        <CampoTexto
          etiqueta="Cantidad"
          name="cantidad"
          type="number"
          min={1}
          max={50}
          defaultValue={v?.cantidad ?? "1"}
          disabled={conSeriales}
          ayuda={conSeriales ? "Se cuentan los seriales" : undefined}
          error={error?.errores?.cantidad}
        />
      </div>

      <label className="flex cursor-pointer items-center gap-3 text-[14px] font-medium text-carbon">
        <input
          type="checkbox"
          checked={conSeriales}
          onChange={(e) => setConSeriales(e.target.checked)}
          className="size-4 accent-carbon"
        />
        Tengo los seriales del fabricante (número de marco, VIN…)
      </label>

      {conSeriales ? (
        <CampoArea
          etiqueta="Seriales"
          name="seriales"
          rows={4}
          placeholder={"WTU123456789\nWTU123456790"}
          defaultValue={v?.seriales}
          ayuda="Uno por línea. Si no los tienes, MoviGo genera seriales internos."
          error={error?.errores?.seriales}
          className="[&_textarea]:font-mono"
        />
      ) : (
        <input type="hidden" name="seriales" value="" />
      )}

      <CampoTexto
        etiqueta="Nota (opcional)"
        name="nota"
        placeholder="Factura 1043 del proveedor"
        defaultValue={v?.nota}
        error={error?.errores?.nota}
      />

      <BotonAccion type="submit" disabled={enviando}>
        {enviando ? "Registrando…" : "Registrar ingreso"}
      </BotonAccion>
    </form>
  );
}
