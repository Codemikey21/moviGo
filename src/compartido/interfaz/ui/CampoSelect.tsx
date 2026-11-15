import type { SelectHTMLAttributes } from "react";
import { Chevron } from "./Chevron";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  etiqueta: string;
  error?: string;
  opciones: { valor: string; texto: string }[];
  /** Texto de la opción vacía ("Elige…"); sin él no hay opción vacía */
  vacio?: string;
};

/** Lista desplegable con el mismo estilo de CampoTexto. */
export function CampoSelect({ etiqueta, error, opciones, vacio, id, name, className = "", ...resto }: Props) {
  const idCampo = id ?? name;
  return (
    <div className={className}>
      <label htmlFor={idCampo} className="mb-2 block text-[14px] font-medium text-carbon">
        {etiqueta}
      </label>
      <div className="relative">
        <select
          id={idCampo}
          name={name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${idCampo}-mensaje` : undefined}
          className={`h-14 w-full appearance-none rounded-campo border bg-escarcha pl-4 pr-10 text-[16px] text-carbon outline-none transition-colors focus:bg-blanco ${
            error ? "border-[#c0392b]" : "border-transparent focus:border-carbon"
          }`}
          {...resto}
        >
          {vacio !== undefined && <option value="">{vacio}</option>}
          {opciones.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
        <Chevron className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-pizarra" />
      </div>
      {error && (
        <p id={`${idCampo}-mensaje`} className="mt-2 text-[13px] text-[#c0392b]">
          {error}
        </p>
      )}
    </div>
  );
}
