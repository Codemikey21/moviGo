import { Icono } from "@/compartido/interfaz/ui/Icono";
import type { DisponibilidadPunto } from "../../../tipos";

type Props = {
  puntos: DisponibilidadPunto[];
  /** Cuántas unidades se necesitan en el punto para poder elegirlo */
  necesarias?: number;
  seleccionado: string;
  onElegir: (puntoId: string) => void;
  error?: string;
  /** Texto de la etiqueta del grupo */
  titulo?: string;
};

/** Tarjetas para elegir el punto de servicio, con lo que hay en cada uno. */
export function SelectorPunto({ puntos, necesarias = 1, seleccionado, onElegir, error, titulo = "Punto de servicio" }: Props) {
  return (
    <fieldset>
      <legend className="mb-2 text-[14px] font-medium text-carbon">{titulo}</legend>
      <div className="grid gap-2">
        {puntos.map(({ punto, disponibles }) => {
          const alcanza = disponibles >= necesarias;
          const activo = seleccionado === punto.id;
          return (
            <label
              key={punto.id}
              className={`flex cursor-pointer items-center gap-3 rounded-campo border px-4 py-3.5 transition-colors ${
                !alcanza
                  ? "cursor-not-allowed border-transparent bg-escarcha/60 opacity-55"
                  : activo
                    ? "border-carbon bg-blanco"
                    : "border-transparent bg-escarcha hover:border-carbon/20"
              }`}
            >
              <input
                type="radio"
                name="puntoId"
                value={punto.id}
                checked={activo}
                disabled={!alcanza}
                onChange={() => onElegir(punto.id)}
                className="sr-only"
              />
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full ${activo ? "bg-turquesa text-carbon" : "bg-blanco text-bosque"}`}
              >
                <Icono nombre="punto" className="size-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] text-carbon">{punto.nombre}</span>
                <span className="block truncate text-[13px] text-pizarra">{punto.horario}</span>
              </span>
              <span className={`shrink-0 text-[13px] ${alcanza ? "text-bosque" : "text-pizarra"}`}>
                {disponibles ? `${disponibles} disp.` : "Sin unidades"}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-2 text-[13px] text-[#c0392b]">{error}</p>}
    </fieldset>
  );
}
