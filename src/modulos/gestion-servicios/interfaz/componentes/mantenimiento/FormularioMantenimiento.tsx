"use client";

import { useActionState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { CampoArea } from "@/compartido/interfaz/ui/CampoArea";
import { CampoSelect } from "@/compartido/interfaz/ui/CampoSelect";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { agendarMantenimientoAccion } from "../../../servidor/mantenimiento/acciones";
import type { VehiculoPropio } from "../../../tipos";

/** Agendar una revisión o reparación de un vehículo comprado en MoviGo. */
export function FormularioMantenimiento({ vehiculos, desde, hasta }: { vehiculos: VehiculoPropio[]; desde: string; hasta: string }) {
  const [estado, accion, enviando] = useActionState(agendarMantenimientoAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;
  const v = error?.valores;

  return (
    <form action={accion} className="space-y-5" noValidate key={estado.estado === "exito" ? "listo" : "form"}>
      {error?.mensaje && <Aviso tipo="error">{error.mensaje}</Aviso>}
      {estado.estado === "exito" && <Aviso tipo="exito">{estado.mensaje}</Aviso>}
      <CampoSelect
        etiqueta="Vehículo"
        name="unidadId"
        vacio="Elige tu vehículo"
        defaultValue={v?.unidadId ?? ""}
        opciones={vehiculos.map((x) => ({ valor: x.unidadId, texto: `${x.marca} ${x.nombre} · ${x.serial}` }))}
        error={error?.errores?.unidadId}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          etiqueta="¿Qué necesitas?"
          name="tipo"
          defaultValue={v?.tipo ?? "PREVENTIVO"}
          opciones={[
            { valor: "PREVENTIVO", texto: "Revisión general" },
            { valor: "CORRECTIVO", texto: "Reparación" },
          ]}
        />
        <CampoTexto
          etiqueta="Día"
          name="programadoPara"
          type="date"
          min={desde}
          max={hasta}
          defaultValue={v?.programadoPara ?? desde}
          error={error?.errores?.programadoPara}
        />
      </div>
      <CampoArea
        etiqueta="Cuéntanos qué le pasa"
        name="descripcion"
        rows={3}
        placeholder="Los frenos suenan y la batería dura menos que antes."
        defaultValue={v?.descripcion}
        error={error?.errores?.descripcion}
      />
      <BotonAccion type="submit" disabled={enviando}>
        {enviando ? "Agendando…" : "Agendar mantenimiento"}
      </BotonAccion>
    </form>
  );
}
