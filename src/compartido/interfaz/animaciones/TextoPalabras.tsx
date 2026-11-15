"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";

type Parte = { texto: string; resaltado?: boolean };

/**
 * Frase que se va "encendiendo" palabra por palabra mientras se hace
 * scroll (como las declaraciones grandes de Zoox). Las partes resaltadas
 * salen en verde eucalipto.
 */
export function TextoPalabras({
  partes,
  className = "",
  como: Etiqueta = "h2",
}: {
  partes: Parte[];
  className?: string;
  como?: "h1" | "h2" | "p";
}) {
  const raiz = useRef<HTMLHeadingElement>(null);

  // Cada palabra en su propio span (conservando los espacios)
  const palabras = partes.flatMap((p) =>
    (p.texto.match(/\s*\S+\s*/g) ?? []).map((w) => ({ w, resaltado: p.resaltado })),
  );

  useGSAP(
    () => {
      const el = raiz.current;
      if (!el) return;
      const spans = Array.from(el.querySelectorAll<HTMLElement>("[data-palabra]"));
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        end: "bottom 45%",
        onUpdate: (self) => {
          const encendidas = Math.round(self.progress * spans.length);
          spans.forEach((s, i) => s.setAttribute("data-encendida", String(i < encendidas)));
        },
      });
    },
    { scope: raiz },
  );

  return (
    <Etiqueta ref={raiz} className={className}>
      {palabras.map((p, i) => (
        <span key={i} data-palabra className={`palabra-scroll ${p.resaltado ? "text-eucalipto" : ""}`}>
          {p.w}
        </span>
      ))}
    </Etiqueta>
  );
}
