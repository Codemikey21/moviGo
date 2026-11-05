"use client";

import { useState, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  /** Enlace opcional a la derecha de la etiqueta (por ejemplo "¿La olvidaste?") */
  extra?: React.ReactNode;
};

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export function CampoContrasena({ etiqueta, ayuda, error, extra, id, name, ...resto }: Props) {
  const [visible, setVisible] = useState(false);
  const idCampo = id ?? name;
  const idMensaje = `${idCampo}-mensaje`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <label htmlFor={idCampo} className="text-[14px] font-medium text-carbon">
          {etiqueta}
        </label>
        {extra}
      </div>
      <div className="relative">
        <input
          id={idCampo}
          name={name}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          className={`h-14 w-full rounded-campo border bg-escarcha pl-4 pr-24 text-[16px] text-carbon outline-none transition-colors placeholder:text-niebla focus:bg-blanco ${
            error ? "border-[#c0392b]" : "border-transparent focus:border-carbon"
          }`}
          {...resto}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-[12px] px-3 text-[12px] font-bold uppercase text-bosque transition-colors hover:bg-salvia"
        >
          {visible ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {(error || ayuda) && (
        <p
          id={idMensaje}
          className={`mt-2 text-[13px] ${error ? "text-[#c0392b]" : "text-pizarra"}`}
        >
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}
