"use client";

import { useEffect, useState } from "react";
import { Contador } from "@/compartido/interfaz/animaciones/Contador";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import type { Especificacion } from "@/modulos/gestion-catalogo/tipos";
import { ProductoEnColor } from "./ColorElegido";

const DURACION = 5000;

/** "Hasta 60 km" -> { antes: "Hasta", numero: 60, despues: "km" } */
function separar(valor: string) {
  const m = valor.match(/^(\D*?)(\d+(?:[.,]\d+)?)\s*(.*)$/);
  if (!m) return null;
  const decimales = m[2].includes(",") || m[2].includes(".") ? m[2].split(/[.,]/)[1].length : 0;
  return { antes: m[1].trim(), numero: Number(m[2].replace(",", ".")), decimales, despues: m[3].trim() };
}

/**
 * Ficha técnica en la franja verde bosque: el producto a la izquierda con
 * las pestañas en la esquina recortada; a la derecha el dato grande que
 * cuenta. Las pestañas avanzan solas (como Zoox).
 */
export function FichaTecnica({ especificaciones, nombre }: { especificaciones: Especificacion[]; nombre: string }) {
  const pestanas = especificaciones.slice(0, 4);
  const [activa, setActiva] = useState(0);
  const [pausada, setPausada] = useState(false);

  useEffect(() => {
    if (pausada || pestanas.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reloj = setTimeout(() => setActiva((activa + 1) % pestanas.length), DURACION);
    return () => clearTimeout(reloj);
  }, [activa, pausada, pestanas.length]);

  const fila = pestanas[activa];
  if (!fila) return null;
  const partes = separar(fila.valor);
  const resto = especificaciones.filter((e) => e !== fila);

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <Escenario
        className="relative min-h-[420px] rounded-tarjeta rounded-br-none md:min-h-[620px]"
        carril="polygon(20% 0, 80% 0, 100% 100%, 0 100%)"
      >
        {/* Ondas que salen del producto */}
        {[0, 1.2, 2.4].map((d) => (
          <span
            key={d}
            aria-hidden
            className="absolute left-1/2 top-[52%] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[onda-ficha_3.6s_var(--ease-salida)_infinite] rounded-full border border-turquesa/50 opacity-0"
            style={{ animationDelay: `${d}s` }}
          />
        ))}
        <div className="absolute inset-x-[5%] top-1/2 -translate-y-[58%]">
          <ProductoEnColor tamanos="(min-width: 1024px) 50vw, 100vw" />
        </div>
        <button
          type="button"
          onClick={() => setPausada(!pausada)}
          aria-label={pausada ? "Seguir" : "Pausar"}
          className="absolute left-6 top-6 z-[3] grid size-11 place-items-center rounded-[13px] bg-carbon/60 text-[11px] text-blanco"
        >
          {pausada ? "▶" : "❚❚"}
        </button>
        {pestanas.length > 1 && (
          <Muesca lado="derecha" fondo="var(--color-bosque)" className="max-w-[calc(100%-24px)] overflow-x-auto pl-[18px] pt-4">
            <div role="tablist" aria-label="Ficha técnica" className="flex gap-1">
              {pestanas.map((p, i) => (
                <button
                  key={`${p.etiqueta}-${i === activa ? activa : "x"}`}
                  type="button"
                  role="tab"
                  aria-selected={i === activa}
                  onClick={() => setActiva(i)}
                  className={`h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[11px] font-bold uppercase transition-colors ${
                    i === activa ? `bg-blanco text-carbon ${pausada ? "" : "pastilla-avanza"}` : "text-blanco hover:bg-blanco/10"
                  }`}
                  style={{ ["--duracion" as string]: `${DURACION}ms` }}
                >
                  {p.etiqueta}
                </button>
              ))}
            </div>
          </Muesca>
        )}
      </Escenario>

      <div key={activa} className="mx-auto max-w-[460px] text-center text-blanco [animation:vehiculo-entra_0.7s_var(--ease-salida)_both]">
        <p className="etiqueta text-turquesa">{fila.etiqueta}</p>
        {partes ? (
          <p className="mt-6 leading-none">
            {partes.antes && <span className="mb-3 block text-[22px] text-blanco/60">{partes.antes}</span>}
            <Contador valor={partes.numero} decimales={partes.decimales} className="text-[clamp(80px,9vw,120px)] font-[380] tracking-[-0.05em]" />
            {partes.despues && <span className="ml-2 text-[clamp(24px,2.6vw,36px)] tracking-[-0.02em] text-blanco/60">{partes.despues}</span>}
          </p>
        ) : (
          <p className="titular mt-6 text-[clamp(40px,4.4vw,60px)]">{fila.valor}</p>
        )}
        <p className="mt-6 text-[18px] text-blanco/75">
          {nombre}: {fila.etiqueta.toLowerCase()} {fila.valor.toLowerCase()}.
        </p>
        {resto.length > 0 && (
          <dl className="mt-10 text-left">
            {resto.slice(0, 5).map((e) => (
              <div key={e.etiqueta} className="flex justify-between gap-6 border-t border-blanco/15 py-3 text-[15px]">
                <dt className="text-blanco/65">{e.etiqueta}</dt>
                <dd className="text-right font-medium">{e.valor}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
