"use client";

import { useRef } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";

type Parte = { texto: string; resaltado?: boolean };

/**
 * Frase que se va "encendiendo" palabra por palabra mientras se hace
 * scroll (como las declaraciones grandes de Zoox). Las partes resaltadas
 * salen en verde eucalipto.
 *
 * Con `estatico` la frase sale completa desde el inicio: se usa en las
 * pantallas de trabajo (panel, cuenta, compra), donde leer rápido importa
 * más que el efecto.
 */
export function TextoPalabras({
  partes,
  className = "",
  como: Etiqueta = "h2",
  estatico = false,
}: {
  partes: Parte[];
  className?: string;
  como?: "h1" | "h2" | "p";
  estatico?: boolean;
}) {
  const raiz = useRef<HTMLHeadingElement>(null);

  // Cada palabra en su propio span (conservando los espacios)
  const palabras = partes.flatMap((p) =>
    (p.texto.match(/\s*\S+\s*/g) ?? []).map((w) => ({ w, resaltado: p.resaltado })),
  );

  useGSAP(
    () => {
      const el = raiz.current;
      if (!el || estatico) return;
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
    { scope: raiz, dependencies: [estatico] },
  );

  if (estatico) {
    return (
      <Etiqueta className={className}>
        {partes.map((p, i) => (
          <span key={i} className={p.resaltado ? "text-eucalipto" : undefined}>
            {p.texto}
          </span>
        ))}
      </Etiqueta>
    );
  }

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
