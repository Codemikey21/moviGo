"use client";

import { useEffect, useRef, useState } from "react";
import { formatoPesos } from "@/compartido/utilidades/formato";

/**
 * Barras de ingresos por día (últimos 14 días). Crecen cuando aparecen en
 * pantalla; al pasar el mouse muestran el valor. La de hoy va en turquesa.
 */
export function GraficaIngresos({
  dias,
  tono = "oscuro",
}: {
  dias: { clave: string; total: number }[];
  /** "oscuro" para fondo verde bosque, "claro" para fondo blanco */
  tono?: "oscuro" | "claro";
}) {
  const raiz = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const maximo = Math.max(...dias.map((d) => d.total), 1);
  const etiquetaDia = (clave: string) =>
    new Intl.DateTimeFormat("es-CO", { day: "numeric", timeZone: "UTC" }).format(new Date(`${clave}T12:00:00Z`));

  useEffect(() => {
    const nodo = raiz.current;
    if (!nodo) return;
    const observador = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      setVisible(true);
      observador.disconnect();
    }, { threshold: 0.3 });
    observador.observe(nodo);
    return () => observador.disconnect();
  }, []);

  const claro = tono === "claro";
  return (
    <div ref={raiz} className="flex h-[260px] items-end gap-1.5 sm:gap-2.5" role="img" aria-label="Ingresos por día de los últimos 14 días">
      {dias.map((d, i) => {
        const hoy = i === dias.length - 1;
        return (
          <div key={d.clave} className="group relative flex h-full flex-1 flex-col justify-end">
            <span
              className={`block min-h-1 rounded-t-[10px] rounded-b-[4px] transition-[height,background-color] duration-[1100ms] ease-salida ${
                hoy ? "bg-turquesa" : claro ? "bg-salvia group-hover:bg-bosque" : "bg-blanco/25 group-hover:bg-blanco/45"
              }`}
              style={{ height: visible ? `${(d.total / maximo) * 100}%` : "0%", transitionDelay: `${i * 45}ms` }}
            />
            <span className={`mt-2 text-center font-mono text-[11px] ${hoy ? (claro ? "text-carbon" : "text-turquesa") : claro ? "text-bruma" : "text-blanco/50"}`}>
              {etiquetaDia(d.clave)}
            </span>
            {d.total > 0 && (
              <span
                className={`pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  claro ? "bg-carbon text-blanco" : "bg-blanco text-carbon"
                } ${hoy ? "block" : "hidden group-hover:block"}`}
                style={{ bottom: visible ? `calc(${(d.total / maximo) * 100}% + 28px)` : undefined }}
              >
                {hoy ? "Hoy · " : ""}
                {formatoPesos.format(d.total)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
