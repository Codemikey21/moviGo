"use client";

import { useActionState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { CampoArea } from "@/compartido/interfaz/ui/CampoArea";
import { CampoSelect } from "@/compartido/interfaz/ui/CampoSelect";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { solicitarCotizacionAccion } from "../../servidor/acciones";

/** Pedir una flota o domicilios en lote. La primera vez también registra la empresa. */
export function FormularioSolicitud({ conEmpresa, hoy }: { conEmpresa: boolean; hoy: string }) {
  const [estado, accion, enviando] = useActionState(solicitarCotizacionAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;
  const v = error?.valores;
  const e = error?.errores ?? {};

  return (
    <form action={accion} className="space-y-5" noValidate key={estado.estado === "exito" ? "ok" : "form"}>
      <input type="hidden" name="conEmpresa" value={conEmpresa ? "1" : "0"} />
      {error?.mensaje && <Aviso tipo="error">{error.mensaje}</Aviso>}
      {estado.estado === "exito" && <Aviso tipo="exito">{estado.mensaje}</Aviso>}

      {!conEmpresa && (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="etiqueta mb-3 text-eucalipto">Tu empresa</legend>
          <CampoTexto className="sm:col-span-2" etiqueta="Razón social" name="razonSocial" placeholder="Logística Santander S.A.S." defaultValue={v?.razonSocial} error={e.razonSocial} />
          <CampoTexto etiqueta="NIT" name="nit" placeholder="900123456-7" defaultValue={v?.nit} error={e.nit} />
          <CampoTexto etiqueta="Sector (opcional)" name="sector" placeholder="Mensajería" defaultValue={v?.sector} error={e.sector} />
          <CampoTexto className="sm:col-span-2" etiqueta="Tu cargo" name="cargo" placeholder="Jefe de operaciones" defaultValue={v?.cargo} error={e.cargo} />
        </fieldset>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="etiqueta mb-3 text-eucalipto">Lo que necesitas</legend>
        <CampoSelect
          etiqueta="Servicio"
          name="tipo"
          defaultValue={v?.tipo ?? "FLOTA_ALQUILER"}
          opciones={[
            { valor: "FLOTA_ALQUILER", texto: "Flota en alquiler" },
            { valor: "DOMICILIOS_LOTE", texto: "Domicilios en lote" },
          ]}
        />
        <CampoTexto etiqueta="Cantidad" name="cantidad" type="number" min={2} max={500} defaultValue={v?.cantidad ?? "10"} error={e.cantidad} />
        <CampoTexto etiqueta="Desde" name="desde" type="date" min={hoy} defaultValue={v?.desde ?? hoy} error={e.desde} />
        <CampoTexto etiqueta="Hasta" name="hasta" type="date" min={hoy} defaultValue={v?.hasta} error={e.hasta} />
        <CampoArea className="sm:col-span-2" etiqueta="Notas (opcional)" name="notas" rows={3} placeholder="10 scooters para mensajeros en Cabecera, con casco." defaultValue={v?.notas} />
      </fieldset>

      <BotonAccion type="submit" disabled={enviando}>
        {enviando ? "Enviando…" : "Solicitar cotización"}
      </BotonAccion>
    </form>
  );
}
