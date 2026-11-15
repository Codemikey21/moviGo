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
  alto = "250vh",
  className = "",
  classNamePin = "",
  children,
  ...resto
}: {
  /** Cuánto scroll dura la escena */
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
    <section ref={seccion} className={`relative [--p:0] ${className}`} style={{ height: alto }} {...resto}>
      <div className={`sticky top-0 h-svh overflow-hidden ${classNamePin}`}>{children}</div>
    </section>
  );
}
