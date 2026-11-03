"use client";

import { useState, type RefObject } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";

/**
 * Para secciones altas con un contenido "pegajoso" (sticky) en su interior:
 * devuelve qué paso (0..total-1) toca según cuánto se ha recorrido la
 * sección. Opcionalmente deja el progreso continuo (0..1) en `progreso`,
 * útil para escenas 3D que se animan sin re-renderizar React.
 */
export function useIndiceAlScroll(
  seccion: RefObject<HTMLElement | null>,
  total: number,
  progreso?: RefObject<number>,
) {
  const [indice, setIndice] = useState(0);

  useGSAP(
    () => {
      const el = seccion.current;
      if (!el) return;

      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          if (progreso) progreso.current = self.progress;
          setIndice(Math.min(total - 1, Math.floor(self.progress * total)));
        },
      });
    },
    { scope: seccion, dependencies: [total] },
  );

  return indice;
}
