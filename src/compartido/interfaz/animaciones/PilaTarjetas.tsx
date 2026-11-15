"use client";

import { Children, useRef, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";

/**
 * Tarjetas que se apilan al hacer scroll: cada una se queda pegada arriba y
 * la siguiente la cubre; la de atrás se achica y se oscurece un poco.
 */
export function PilaTarjetas({ children, className = "" }: { children: ReactNode; className?: string }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cartas = Array.from(raiz.current?.querySelectorAll<HTMLElement>("[data-carta]") ?? []);
      cartas.forEach((carta, i) => {
        const siguiente = cartas[i + 1];
        if (!siguiente) return;
        ScrollTrigger.create({
          trigger: siguiente,
          start: "top bottom",
          end: "top 96px",
          scrub: true,
          onUpdate: (self) => {
            carta.style.transform = `scale(${1 - self.progress * 0.06})`;
            carta.style.filter = `brightness(${1 - self.progress * 0.45})`;
          },
        });
      });
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className={className}>
      {Children.map(children, (hijo) => (
        <div data-carta className="sticky top-24 mb-7 h-[calc(100svh-120px)] origin-top overflow-hidden rounded-tarjeta">
          {hijo}
        </div>
      ))}
    </div>
  );
}
