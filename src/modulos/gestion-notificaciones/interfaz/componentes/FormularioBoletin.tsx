"use client";

import { useActionState } from "react";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { suscribirBoletinAccion } from "../../servidor/acciones";

/** Suscripción al boletín del pie de página. Al suscribirse, el formulario se cambia por la confirmación. */
export function FormularioBoletin() {
  const [estado, accion, enviando] = useActionState(suscribirBoletinAccion, estadoInicial);
  const error = estado.estado === "error" ? (estado.errores?.correo ?? estado.mensaje) : null;

  if (estado.estado === "exito") {
    return (
      <div role="status" className="flex items-start gap-4 rounded-[18px] bg-salvia p-5 text-carbon">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-bosque text-[15px] text-blanco">
          ✓
        </span>
        <p className="text-[15px] leading-snug">
          {estado.mensaje}
          {estado.correo && <span className="mt-1 block text-[13px] text-pizarra">{estado.correo}</span>}
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4" action={accion} noValidate>
      <label className="sr-only" htmlFor="pie-correo">
        Correo electrónico
      </label>
      <div>
        <input
          id="pie-correo"
          type="email"
          name="correo"
          required
          autoComplete="email"
          placeholder="Tu correo"
          defaultValue={estado.estado === "error" ? estado.valores?.correo : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "pie-correo-error" : undefined}
          className={`h-14 w-full rounded-[18px] border bg-blanco px-5 text-[14px] text-carbon placeholder:text-niebla focus:outline-none ${
            error ? "border-[#c0392b]" : "border-carbon/20 focus:border-carbon"
          }`}
        />
        {error && (
          <p id="pie-correo-error" className="mt-2 text-[13px] text-[#c0392b]">
            {error}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={enviando}
        className="etiqueta group relative isolate h-[50px] w-full overflow-hidden rounded-boton border border-carbon/70 font-bold text-carbon transition-colors duration-[334ms] hover:text-blanco active:scale-[0.98] disabled:opacity-60"
      >
        <span
          aria-hidden
          className="absolute inset-0 -z-10 origin-left scale-x-0 bg-carbon transition-[scale] duration-[334ms] ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-x-100"
        />
        {enviando ? "Un momento…" : "Unirme al boletín"}
      </button>
      <p className="text-[12px] leading-snug text-pizarra">
        Puedes pedir que te saquemos cuando quieras. Lee la{" "}
        <a href="/legal/privacidad" className="underline underline-offset-2">
          política de privacidad
        </a>
        .
      </p>
    </form>
  );
}
