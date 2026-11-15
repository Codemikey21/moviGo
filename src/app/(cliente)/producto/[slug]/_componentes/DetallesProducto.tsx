"use client";

import { useState } from "react";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import type { Especificacion } from "@/modulos/gestion-catalogo/tipos";
import { ProductoEnColor, useColorElegido } from "./ColorElegido";

// Partes del dibujo de cada categoría (coordenadas del dibujo de 900 × 560).
type Parte = "bateria" | "motor" | "rueda" | "freno" | "faro" | "manubrio" | "camara" | "helice" | "suspension" | "cuerpo";

const partes: Record<string, Partial<Record<Parte, [number, number]>>> = {
  "autos-electricos": { faro: [826, 332], bateria: [450, 432], rueda: [690, 440], freno: [214, 440], motor: [770, 380], cuerpo: [360, 250] },
  motos: { faro: [644, 226], motor: [468, 356], rueda: [694, 432], freno: [210, 432], cuerpo: [500, 245], suspension: [640, 300] },
  scooters: { faro: [738, 199], bateria: [450, 440], rueda: [190, 432], freno: [724, 432], manubrio: [734, 82], motor: [724, 432], cuerpo: [560, 410] },
  bicicletas: { suspension: [640, 288], motor: [420, 390], rueda: [220, 386], freno: [680, 386], cuerpo: [480, 215], bateria: [520, 300] },
  patinetas: { cuerpo: [450, 405], rueda: [270, 470], motor: [630, 470], bateria: [450, 435] },
  drones: { camara: [450, 340], helice: [690, 184], bateria: [450, 262], cuerpo: [250, 300] },
  accesorios: { cuerpo: [450, 260], faro: [600, 340] },
};

/** Qué parte del dibujo corresponde a cada fila de la ficha técnica. */
function parteDe(etiqueta: string): Parte {
  const e = etiqueta.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/autonom|bater|carga|celda/.test(e)) return "bateria";
  if (/motor|potencia|cilindr|velocidad|transmis|cambio/.test(e)) return "motor";
  if (/freno/.test(e)) return "freno";
  if (/rin|rueda|llanta|neumat/.test(e)) return "rueda";
  if (/suspens|horquilla/.test(e)) return "suspension";
  if (/video|camara|foto|gafas/.test(e)) return "camara";
  if (/vuelo|alcance|helice/.test(e)) return "helice";
  if (/luz|lumen|delantera|trasera|faro|visor/.test(e)) return "faro";
  if (/manubrio|pantalla/.test(e)) return "manubrio";
  return "cuerpo";
}

/**
 * Tarjeta oscura con el producto y su ficha técnica en una pestaña
 * recortada (acordeón). Si se muestra el dibujo, cada fila tiene su punto
 * sobre la parte del vehículo.
 */
export function DetallesProducto({ especificaciones, descripcion }: { especificaciones: Especificacion[]; descripcion: string }) {
  const { categoria, fotos } = useColorElegido();
  const [abierta, setAbierta] = useState(0);
  const filas = especificaciones.slice(0, 5);
  const mapa = partes[categoria] ?? {};

  // Un punto por parte (si dos filas caen en la misma parte, solo la primera)
  const usadas = new Set<string>();
  const puntos = filas.flatMap((f, i) => {
    const parte = mapa[parteDe(f.etiqueta)] ? parteDe(f.etiqueta) : "cuerpo";
    const xy = mapa[parte];
    if (!xy || usadas.has(parte)) return [];
    usadas.add(parte);
    return [{ i, x: xy[0], y: xy[1] }];
  });

  return (
    <Escenario
      className="relative min-h-[680px] rounded-tarjeta rounded-bl-none md:min-h-[760px]"
      carril="polygon(38% 0, 78% 0, 100% 100%, 18% 100%)"
    >
      <div className="absolute inset-x-[4%] top-[6%] md:left-[30%] md:right-[-2%] md:top-[8%]">
        <ProductoEnColor tamanos="(min-width: 768px) 70vw, 100vw">
          {fotos.length === 0 &&
            puntos.map((p) => (
              <button
                key={p.i}
                type="button"
                aria-label={filas[p.i].etiqueta}
                onClick={() => setAbierta(p.i)}
                className="absolute z-[2] grid size-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-blanco/25 backdrop-blur-sm after:absolute after:inset-0 after:animate-ping after:rounded-full after:border after:border-blanco/70"
                style={{ left: `${(p.x / 900) * 100}%`, top: `${(p.y / 560) * 100}%` }}
              >
                <span className={`size-2.5 rounded-full transition-transform ${abierta === p.i ? "scale-125 bg-turquesa" : "bg-blanco"}`} />
              </button>
            ))}
        </ProductoEnColor>
      </div>

      <Muesca lado="izquierda" className="w-[min(470px,94%)] pb-8 pr-8 pt-9 md:pr-10">
        <p className="etiqueta pb-4 text-bruma">Lo que trae</p>
        {filas.length === 0 ? (
          <p className="text-[16px] leading-relaxed text-pizarra">{descripcion}</p>
        ) : (
          <ul>
            {filas.map((f, i) => (
              <li key={f.etiqueta} className="border-t border-carbon/10 first:border-t-0">
                <button
                  type="button"
                  aria-expanded={abierta === i}
                  onClick={() => setAbierta(abierta === i ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 py-3.5 text-left text-[20px] tracking-[-0.01em] text-carbon md:text-[22px]"
                >
                  {f.etiqueta}
                  <span
                    className={`grid size-[34px] shrink-0 place-items-center rounded-[11px] bg-turquesa text-[20px] transition-transform duration-500 ease-salida ${
                      abierta === i ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-500 ease-salida ${abierta === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <p className="pb-4 text-[17px] text-pizarra">{f.valor}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Muesca>
    </Escenario>
  );
}
