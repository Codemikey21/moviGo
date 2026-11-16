"use client";

import { useEffect, useRef, useState } from "react";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { FotoOVehiculo } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/FotoOVehiculo";
import { IconoProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/IconoProducto";
import type { Foto } from "@/modulos/gestion-catalogo/tipos";

export type FilaInventario = { categoria: string; puntoId: string; estado: string; cantidad: number };

type Props = {
  puntos: { id: string; nombre: string; capacidad: number }[];
  /** En el orden en que se muestran */
  categorias: { slug: string; nombre: string; foto: Foto | null }[];
  filas: FilaInventario[];
};

const OCUPADAS = ["ALQUILADA", "EN_TALLER"];

/**
 * Inventario por categoría en la franja verde bosque: a la izquierda los
 * vehículos van pasando sobre el escenario; a la derecha, por categoría,
 * cuántas unidades están libres, apartadas y en la calle o el taller.
 * Las pestañas filtran por punto de servicio.
 */
export function InventarioCategorias({ puntos, categorias, filas }: Props) {
  const [punto, setPunto] = useState<string | null>(null);
  const [vehiculo, setVehiculo] = useState(0);
  const [visible, setVisible] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);

  // Los vehículos van pasando solos
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || categorias.length < 2) return;
    const reloj = setInterval(() => setVehiculo((v) => (v + 1) % categorias.length), 2800);
    return () => clearInterval(reloj);
  }, [categorias.length]);

  useEffect(() => {
    const nodo = raiz.current;
    if (!nodo) return;
    const observador = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setVisible(true);
      observador.disconnect();
    }, { threshold: 0.25 });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  const delPunto = filas.filter((f) => !punto || f.puntoId === punto);
  const suma = (pred: (f: FilaInventario) => boolean) => delPunto.filter(pred).reduce((s, f) => s + f.cantidad, 0);
  const libres = suma((f) => f.estado === "DISPONIBLE");
  const enPunto = suma(() => true);
  const capacidad = puntos.filter((p) => !punto || p.id === punto).reduce((s, p) => s + p.capacidad, 0);
  const nombrePunto = puntos.find((p) => p.id === punto)?.nombre ?? "toda la red";
  const actual = categorias[vehiculo];

  return (
    <div ref={raiz} className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
      <Escenario className="relative min-h-[420px] rounded-tarjeta rounded-bl-none md:min-h-[600px]" carril="polygon(25% 0, 75% 0, 100% 100%, 0 100%)">
        {actual && (
          <>
            <p className="absolute left-7 top-7 z-[2] font-mono text-[12px] uppercase text-blanco/70">
              {actual.nombre} · {suma((f) => f.categoria === actual.slug && f.estado === "DISPONIBLE")} libres
            </p>
            <div className="absolute inset-x-[6%] top-[22%]">
              <FotoOVehiculo key={actual.slug} foto={actual.foto} categoria={actual.slug} titulo={actual.nombre} className="vehiculo-entra block w-full" />
            </div>
          </>
        )}
        <Muesca lado="izquierda" fondo="var(--color-bosque)" className="max-w-[calc(100%-24px)] overflow-x-auto pr-[18px] pt-4">
          <div role="tablist" aria-label="Punto de servicio" className="flex gap-1">
            {[{ id: null, nombre: "Todos" }, ...puntos].map((p) => (
              <button
                key={p.id ?? "todos"}
                type="button"
                role="tab"
                aria-selected={punto === p.id}
                onClick={() => setPunto(p.id)}
                className={`h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[11px] font-bold uppercase transition-colors ${
                  punto === p.id ? "bg-blanco text-carbon" : "text-blanco hover:bg-blanco/10"
                }`}
              >
                {p.nombre.replace("MoviGo ", "")}
              </button>
            ))}
          </div>
        </Muesca>
      </Escenario>

      <div className="text-blanco">
        <p className="etiqueta text-turquesa">Inventario · {nombrePunto}</p>
        <h2 className="titular mt-4 text-[clamp(36px,3.6vw,50px)]">
          {libres} unidad{libres === 1 ? "" : "es"} lista{libres === 1 ? "" : "s"} para salir hoy.
        </h2>
        <p className="mt-3 text-[15px] text-blanco/65">
          {enPunto > capacidad ? (
            // Más unidades que espacios (p. ej. cargadas a mano en la base): se dice tal cual
            <>
              {enPunto} unidades para {capacidad} espacios:{" "}
              <span className="text-[#e9b43c]">
                {enPunto - capacidad} por encima de la capacidad.
              </span>
            </>
          ) : (
            <>
              {enPunto} de {capacidad} espacios ocupados ({capacidad ? Math.round((enPunto / capacidad) * 100) : 0} %).
            </>
          )}
        </p>
        <div className="mb-3 mt-7 flex flex-wrap gap-5 text-[13px] text-blanco/70">
          <span className="flex items-center gap-2"><i className="size-2.5 rounded-[3px] bg-turquesa" />Libre</span>
          <span className="flex items-center gap-2"><i className="size-2.5 rounded-[3px] bg-[#e9b43c]" />Apartada</span>
          <span className="flex items-center gap-2"><i className="size-2.5 rounded-[3px] bg-blanco/40" />Alquilada o en taller</span>
        </div>
        <ul>
          {categorias.map((c, i) => {
            const de = (pred: (f: FilaInventario) => boolean) => suma((f) => f.categoria === c.slug && pred(f));
            const total = de(() => true);
            const partes = [
              { n: de((f) => f.estado === "DISPONIBLE"), clase: "bg-turquesa" },
              { n: de((f) => f.estado === "RESERVADA"), clase: "bg-[#e9b43c]" },
              { n: de((f) => OCUPADAS.includes(f.estado)), clase: "bg-blanco/40" },
            ];
            return (
              <li key={c.slug} className={`border-t border-blanco/15 py-3 ${total ? "" : "opacity-45"}`}>
                <div className="flex items-center justify-between gap-4 text-[16px]">
                  <span className="flex items-center gap-3">
                    <IconoProducto foto={c.foto} categoria={c.slug} className="w-11" />
                    {c.nombre}
                  </span>
                  <b className="font-medium tabular-nums">
                    {partes[0].n} / {total}
                  </b>
                </div>
                <div className="mt-2.5 flex h-2 gap-0.5 overflow-hidden rounded-full bg-blanco/10">
                  {partes.map((p, j) => (
                    <i
                      key={j}
                      className={`block h-full transition-[width] duration-[1200ms] ease-salida ${p.clase}`}
                      style={{ width: visible && total ? `${(p.n / total) * 100}%` : "0%", transitionDelay: `${i * 80 + j * 150}ms` }}
                    />
                  ))}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
