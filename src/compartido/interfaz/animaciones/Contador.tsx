"use client";

import { useEffect, useRef } from "react";

const formatear = (n: number, decimales: number) =>
  n.toLocaleString("es-CO", { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

/**
 * Número que cuenta desde 0 hasta su valor cuando aparece en pantalla.
 * Usa el formato colombiano (puntos de miles, coma decimal).
 *
 * El servidor pinta el valor final: si la animación no corre (o la persona
 * pidió menos movimiento) el número se ve completo igual.
 */
export function Contador({
  valor,
  decimales = 0,
  prefijo = "",
  sufijo = "",
  duracion = 1600,
  className = "",
}: {
  valor: number;
  decimales?: number;
  prefijo?: string;
  sufijo?: string;
  duracion?: number;
  className?: string;
}) {
  const numero = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const nodo = numero.current;
    if (!nodo || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cuadro = 0;
    nodo.textContent = formatear(0, decimales);
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        observador.disconnect();
        const inicio = performance.now();
        const paso = (t: number) => {
          const p = Math.min((t - inicio) / duracion, 1);
          nodo.textContent = formatear(valor * (1 - Math.pow(1 - p, 4)), decimales);
          if (p < 1) cuadro = requestAnimationFrame(paso);
        };
        cuadro = requestAnimationFrame(paso);
      },
      { threshold: 0.3 },
    );
    observador.observe(nodo);
    return () => {
      observador.disconnect();
      cancelAnimationFrame(cuadro);
      nodo.textContent = formatear(valor, decimales);
    };
  }, [valor, decimales, duracion]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefijo}
      <span ref={numero}>{formatear(valor, decimales)}</span>
      {sufijo}
    </span>
  );
}
