"use client";

import { useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, useGSAP } from "./gsap";

/**
 * Envuelve una página y hace aparecer (subir + fundir) todo elemento que
 * lleve el atributo `data-revelar` cuando entra en pantalla. Los elementos
 * que entran juntos lo hacen en cascada.
 *
 * El estado oculto lo pone GSAP al arrancar, no el CSS: si por algo la
 * animación no corre, el contenido se ve igual.
 */
export function Revelador({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const elementos = gsap.utils.toArray<HTMLElement>("[data-revelar]");
        gsap.set(elementos, { opacity: 0, y: 36 });

        const mostrar = (els: Element[]) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.09,
            overwrite: true,
          });

        ScrollTrigger.batch(elementos, {
          start: "top 90%",
          once: true,
          onEnter: mostrar,
          onLeave: mostrar,
        });
      });
    },
    { scope: raiz },
  );

  return <div ref={raiz}>{children}</div>;
}
