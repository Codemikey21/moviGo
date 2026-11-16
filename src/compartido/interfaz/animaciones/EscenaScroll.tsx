"use client";

import { useRef, type ReactNode } from "react";
import { ScrollTrigger, useGSAP } from "./gsap";

/**
 * Sección alta con un contenido pegajoso (sticky) que ocupa la pantalla.
 * Mientras se recorre la sección deja el avance (0 a 1) en la variable CSS
 * `--p` del contenedor; los hijos lo usan con calc() para encogerse,
 * moverse o aparecer (como el producto que se achica en Zoox).
 */
export function EscenaScroll({
  alto,
  className = "",
  classNamePin = "",
  children,
  ...resto
}: {
  /**
   * Cuánto scroll dura la escena. Normalmente se da con clases en className
   * (h-svh md:h-[200vh]) para que en el celular la escena no sea más alta
   * que la pantalla; este valor fijo, si se pasa, gana sobre las clases.
   */
  alto?: string;
  className?: string;
  classNamePin?: string;
  children: ReactNode;
} & Record<`data-${string}`, string>) {
  const seccion = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = seccion.current;
      if (!el) return;
      ScrollTrigger.create({
        trigger: el,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => el.style.setProperty("--p", self.progress.toFixed(4)),
      });
    },
    { scope: seccion },
  );

  return (
    <section ref={seccion} className={`relative [--p:0] ${className}`} style={alto ? { height: alto } : undefined} {...resto}>
      <div className={`sticky top-0 h-svh overflow-hidden ${classNamePin}`}>{children}</div>
    </section>
  );
}
