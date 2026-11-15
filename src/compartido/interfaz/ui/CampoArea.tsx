import type { TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  etiqueta: string;
  ayuda?: string;
  error?: string;
};

/** Texto largo con el mismo estilo de CampoTexto. */
export function CampoArea({ etiqueta, ayuda, error, id, name, className = "", ...resto }: Props) {
  const idCampo = id ?? name;
  const idMensaje = `${idCampo}-mensaje`;
  return (
    <div className={className}>
      <label htmlFor={idCampo} className="mb-2 block text-[14px] font-medium text-carbon">
        {etiqueta}
      </label>
      <textarea
        id={idCampo}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || ayuda ? idMensaje : undefined}
        className={`min-h-28 w-full rounded-campo border bg-escarcha px-4 py-3.5 text-[16px] leading-relaxed text-carbon outline-none transition-colors placeholder:text-niebla focus:bg-blanco ${
          error ? "border-[#c0392b]" : "border-transparent focus:border-carbon"
        }`}
        {...resto}
      />
      {(error || ayuda) && (
        <p id={idMensaje} className={`mt-2 text-[13px] ${error ? "text-[#c0392b]" : "text-pizarra"}`}>
          {error ?? ayuda}
        </p>
      )}
    </div>
  );
}
