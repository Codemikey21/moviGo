"use client";

import { useActionState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { CampoArea } from "@/compartido/interfaz/ui/CampoArea";
import { CampoSelect } from "@/compartido/interfaz/ui/CampoSelect";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { enviarMensajeContactoAccion } from "../../servidor/acciones";
import { MOTIVOS_CONTACTO, NOMBRE_MOTIVO, type MotivoContacto } from "../../tipos";

type Props = {
  /** Si la persona tiene sesión, su nombre y correo ya van llenos */
  nombre?: string;
  correo?: string;
  telefono?: string;
  motivo?: MotivoContacto;
};

/** Formulario de /contacto. El mensaje llega al buzón del panel de administración. */
export function FormularioContacto({ nombre, correo, telefono, motivo }: Props) {
  const [estado, accion, enviando] = useActionState(enviarMensajeContactoAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;
  const v = error?.valores;
  const e = error?.errores ?? {};

  if (estado.estado === "exito") {
    return (
      <div role="status" className="rounded-[28px] bg-salvia p-8 text-carbon">
        <span aria-hidden className="grid size-12 place-items-center rounded-full bg-bosque text-[20px] text-blanco">
          ✓
        </span>
        <p className="titular mt-6 text-[32px]">Mensaje enviado</p>
        <p className="mt-3 max-w-[460px] text-[16px] leading-relaxed text-pizarra">{estado.mensaje}</p>
      </div>
    );
  }

  return (
    <form action={accion} className="grid gap-4 sm:grid-cols-2" noValidate>
      {error?.mensaje && (
        <div className="sm:col-span-2">
          <Aviso tipo="error">{error.mensaje}</Aviso>
        </div>
      )}
      {/* Campo trampa para robots: oculto para las personas y los lectores de pantalla */}
      <div aria-hidden className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="contacto-sitio">No llenes este campo</label>
        <input id="contacto-sitio" name="sitio" tabIndex={-1} autoComplete="off" />
      </div>

      <CampoTexto etiqueta="Nombre" name="nombre" autoComplete="name" defaultValue={v?.nombre ?? nombre} error={e.nombre} />
      <CampoTexto etiqueta="Correo" name="correo" type="email" autoComplete="email" defaultValue={v?.correo ?? correo} error={e.correo} />
      <CampoTexto
        etiqueta="Teléfono (opcional)"
        name="telefono"
        type="tel"
        autoComplete="tel"
        placeholder="300 123 4567"
        defaultValue={v?.telefono ?? telefono}
        error={e.telefono}
      />
      <CampoSelect
        etiqueta="¿Sobre qué nos escribes?"
        name="motivo"
        defaultValue={v?.motivo ?? motivo ?? "PEDIDO"}
        error={e.motivo}
        opciones={MOTIVOS_CONTACTO.map((m) => ({ valor: m, texto: NOMBRE_MOTIVO[m] }))}
      />
      <CampoArea
        className="sm:col-span-2"
        etiqueta="Mensaje"
        name="mensaje"
        rows={6}
        placeholder="Si es sobre un pedido, incluye su número (por ejemplo MV-261115-K7Q2)."
        defaultValue={v?.mensaje}
        error={e.mensaje}
      />
      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
        <BotonAccion type="submit" disabled={enviando}>
          {enviando ? "Enviando…" : "Enviar mensaje"}
        </BotonAccion>
        <p className="max-w-[340px] text-[13px] leading-snug text-pizarra">
          Usamos tus datos solo para responderte, como dice la{" "}
          <a href="/legal/privacidad" className="underline underline-offset-2">
            política de privacidad
          </a>
          .
        </p>
      </div>
    </form>
  );
}
