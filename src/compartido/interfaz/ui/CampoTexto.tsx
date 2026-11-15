import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  etiqueta: string;
  /** Texto de ayuda bajo el campo */
  ayuda?: string;
  /** Mensaje de error; si existe, reemplaza a la ayuda */
  error?: string;
};

/** Campo del formulario: etiqueta arriba, caja escarcha con radio 16px. */
export function CampoTexto({ etiqueta, ayuda, error, id, name, className = "", ...resto }: Props) {
  const idCampo = id ?? name;
  const idMensaje = `${idCampo}-mensaje`;

  return (
    <div className={className}>
      <label htmlFor={idCampo} className="mb-2 block text-[14px] font-medium text-carbon">
        {etiqueta}
      </label>
      <input
        id={idCampo}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        className={`h-14 w-full rounded-campo border bg-escarcha px-4 text-[16px] text-carbon outline-none transition-colors placeholder:text-niebla focus:bg-blanco ${
          error ? "border-[#c0392b]" : "border-transparent focus:border-carbon"
        }`}
        {...resto}
      />
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
