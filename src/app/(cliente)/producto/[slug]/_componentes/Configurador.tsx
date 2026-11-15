"use client";

import { useState, type ComponentProps } from "react";
import type { DisponibilidadColor, DisponibilidadPunto } from "@/modulos/gestion-almacen/tipos";
import { NOMBRE_VISTA, VISTAS, type Vista } from "@/modulos/gestion-catalogo/tipos";
import { MuestrasColor, NombreColor, ProductoEnColor, useColorElegido } from "./ColorElegido";
import { PanelReserva } from "./PanelReserva";

type Props = Omit<ComponentProps<typeof PanelReserva>, "colorId" | "disponibilidad"> & {
  marca: string;
  categoriaNombre: string;
  /** Disponibilidad de todo el producto (todos los colores) */
  disponibilidad: DisponibilidadPunto[];
  /** Unidades por color y punto */
  porColor: DisponibilidadColor[];
};

/**
 * Configurador tipo concesionario: el producto grande en el color elegido,
 * sus vistas, las muestras de color, el stock de ese color en cada punto y
 * el panel para comprar o alquilar esa unidad.
 */
export function Configurador({ marca, categoriaNombre, disponibilidad, porColor, ...panel }: Props) {
  const { colores, color, fotos } = useColorElegido();
  const [vista, setVista] = useState<Vista>("LATERAL");
  const [espejo, setEspejo] = useState(false);

  // Disponibilidad del color elegido en cada punto
  const delColor: DisponibilidadPunto[] =
    colores.length && color
      ? disponibilidad.map((d) => {
          const filas = porColor.filter((f) => f.colorId === color.id && f.puntoId === d.punto.id);
          return {
            punto: d.punto,
            disponibles: filas.reduce((s, f) => s + f.disponibles, 0),
            total: filas.reduce((s, f) => s + f.total, 0),
          };
        })
      : disponibilidad;
  const maximo = Math.max(4, ...delColor.map((d) => d.disponibles));

  // Vistas con foto para este color; si no hay fotos, se puede voltear el dibujo
  const vistas = VISTAS.filter((v) => fotos.some((f) => f.vista === v));

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      {/* Lienzo */}
      <div
        data-revelar
        className="relative min-h-[420px] overflow-hidden rounded-tarjeta bg-escarcha lg:sticky lg:top-[100px] lg:min-h-[620px] lg:self-start"
      >
        <div aria-hidden className="absolute left-1/2 top-[52%] aspect-square w-[120%] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,#fff,rgb(255_255_255/0))]" />
        <div className="absolute inset-x-6 top-6 z-10 flex items-center justify-between">
          <span className="etiqueta text-bruma">{vistas.length ? NOMBRE_VISTA[vista] : "Vista lateral"}</span>
          <NombreColor className="text-[15px] text-pizarra" />
        </div>
        <div className="absolute inset-x-[6%] top-1/2 -translate-y-1/2">
          <ProductoEnColor vista={vista} espejo={espejo} tamanos="(min-width: 1024px) 55vw, 100vw" />
        </div>
        <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
          <div className="flex gap-1 rounded-full bg-blanco p-1">
            {vistas.length > 1
              ? vistas.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setVista(v)}
                    className={`h-9 whitespace-nowrap rounded-full px-4 text-[11px] font-bold uppercase transition-colors ${
                      vista === v ? "bg-bosque text-blanco" : "text-carbon hover:bg-escarcha"
                    }`}
                  >
                    {NOMBRE_VISTA[v]}
                  </button>
                ))
              : fotos.length === 0 &&
                (["Lado izquierdo", "Lado derecho"] as const).map((texto, i) => (
                  <button
                    key={texto}
                    type="button"
                    onClick={() => setEspejo(i === 1)}
                    className={`h-9 whitespace-nowrap rounded-full px-4 text-[11px] font-bold uppercase transition-colors ${
                      espejo === (i === 1) ? "bg-bosque text-blanco" : "text-carbon hover:bg-escarcha"
                    }`}
                  >
                    {texto}
                  </button>
                ))}
          </div>
        </div>
      </div>

      {/* Panel */}
      <div data-revelar className="rounded-tarjeta bg-blanco p-6 sm:p-9">
        <p className="etiqueta text-eucalipto">
          {marca} · {categoriaNombre}
        </p>
        <h3 className="titular mt-3 text-[clamp(28px,2.6vw,36px)] text-carbon">{panel.producto.nombre}</h3>

        {colores.length > 0 && (
          <div className="mt-7">
            <p className="mb-3 text-[14px] text-pizarra">
              Color: <NombreColor className="text-carbon" />
            </p>
            <MuestrasColor />
          </div>
        )}

        <div className="mt-7">
          <p className="etiqueta mb-1 text-bruma">{color ? `${color.nombre} disponible en` : "Disponible en"}</p>
          <ul>
            {delColor.map((d) => (
              <li
                key={d.punto.id}
                className={`flex items-center gap-4 border-t border-carbon/10 py-3 text-[15px] transition-opacity ${d.disponibles ? "" : "opacity-45"}`}
              >
                <span className="flex-1 text-carbon">{d.punto.nombre}</span>
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-escarcha">
                  <span
                    className="block h-full rounded-full bg-turquesa transition-[width] duration-700 ease-salida"
                    style={{ width: `${(d.disponibles / maximo) * 100}%` }}
                  />
                </span>
                <b className="w-6 text-right font-medium tabular-nums text-carbon">{d.disponibles}</b>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 border-t border-carbon/10 pt-8">
          <PanelReserva key={color?.id ?? "sin-color"} {...panel} colorId={color?.id ?? null} disponibilidad={delColor} />
        </div>
      </div>
    </div>
  );
}
