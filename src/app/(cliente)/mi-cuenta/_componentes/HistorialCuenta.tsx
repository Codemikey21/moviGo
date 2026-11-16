"use client";

import Link from "next/link";
import { useState } from "react";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { FotoOVehiculo } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/FotoOVehiculo";
import { IconoProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/IconoProducto";
import type { Foto } from "@/modulos/gestion-catalogo/tipos";

export type FilaHistorial = {
  id: string;
  categoria: string;
  /** Foto del producto (si no tiene, se usa el dibujo de la categoría) */
  foto: Foto | null;
  titulo: string;
  /** Referencia y fecha */
  detalle: string;
  monto: string;
  estado: string;
  /** Color del puntico del estado */
  tono: "activo" | "pendiente" | "cerrado";
  href: string;
};

const tonos = { activo: "bg-turquesa", pendiente: "bg-[#e9b43c]", cerrado: "bg-niebla" };

/**
 * Historial con pestañas (compras, alquileres, taller). A la izquierda, el
 * dibujo del último movimiento de la pestaña sobre el escenario.
 */
export function HistorialCuenta({ pestanas }: { pestanas: { nombre: string; filas: FilaHistorial[] }[] }) {
  const [activa, setActiva] = useState(0);
  const [cambiando, setCambiando] = useState(false);
  const [mostrada, setMostrada] = useState(0);

  function elegir(i: number) {
    if (i === activa) return;
    setActiva(i);
    setCambiando(true);
    setTimeout(() => {
      setMostrada(i);
      setCambiando(false);
    }, 350);
  }

  const filas = pestanas[mostrada]?.filas ?? [];
  const destacada = filas[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
      <Escenario
        className="relative min-h-[420px] rounded-tarjeta rounded-bl-none lg:min-h-[600px]"
        carril="polygon(25% 0, 75% 0, 100% 100%, 0 100%)"
        haz={false}
      >
        <div
          className={`absolute inset-x-[6%] top-[16%] transition-[opacity,translate] duration-500 ease-salida ${
            cambiando ? "-translate-x-10 opacity-0" : ""
          }`}
        >
          {destacada ? (
            <FotoOVehiculo key={destacada.id} foto={destacada.foto} categoria={destacada.categoria} titulo={destacada.titulo} className="vehiculo-entra w-full" />
          ) : (
            <p className="pt-24 text-center text-blanco/60">Todavía no hay movimientos aquí.</p>
          )}
        </div>
        <Muesca lado="izquierda" fondo="var(--color-bosque)" className="pr-[18px] pt-4">
          <div role="tablist" aria-label="Historial" className="flex gap-1">
            {pestanas.map((p, i) => (
              <button
                key={p.nombre}
                role="tab"
                type="button"
                aria-selected={i === activa}
                onClick={() => elegir(i)}
                className={`h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[11px] font-bold uppercase transition-colors ${
                  i === activa ? "bg-blanco text-carbon" : "text-blanco hover:bg-blanco/10"
                }`}
              >
                {p.nombre} · {p.filas.length}
              </button>
            ))}
          </div>
        </Muesca>
      </Escenario>

      <div>
        <p className="etiqueta text-turquesa">Historial</p>
        <h2 className="titular mt-4 text-[clamp(36px,3.6vw,50px)] text-blanco">Todo lo que has movido con nosotros.</h2>
        <ul
          className={`mt-8 transition-[opacity,translate] duration-500 ease-salida ${
            cambiando ? "translate-y-3 opacity-0" : ""
          }`}
        >
          {filas.length === 0 && (
            <li className="border-t border-blanco/15 py-6 text-blanco/60">Aquí verás tus {pestanas[mostrada]?.nombre.toLowerCase()}.</li>
          )}
          {filas.map((f) => (
            <li key={f.id} className="border-t border-blanco/15">
              <Link
                href={f.href}
                className="grid grid-cols-[56px_1fr_auto] items-center gap-x-4 gap-y-1 py-4 transition-[padding] duration-500 ease-salida hover:pl-2.5"
              >
                <span className="row-span-2 grid size-14 place-items-center rounded-[16px] bg-blanco/8">
                  <IconoProducto foto={f.foto} categoria={f.categoria} className="w-[46px]" />
                </span>
                <span className="truncate text-[18px] text-blanco">{f.titulo}</span>
                <span className="text-right text-[18px] tabular-nums text-blanco">{f.monto}</span>
                <span className="truncate font-mono text-[12px] text-blanco/55">{f.detalle}</span>
                <span className="flex items-center justify-end gap-2 text-[13px] text-blanco/75">
                  <i className={`size-2 rounded-full ${tonos[f.tono]}`} />
                  {f.estado}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
