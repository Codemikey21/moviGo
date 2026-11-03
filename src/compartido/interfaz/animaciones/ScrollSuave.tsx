"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { guardarLenis } from "./lenis-store";

/**
 * Scroll suave con Lenis, sincronizado con el reloj de GSAP para que
 * ScrollTrigger lea siempre la posición real. Se desactiva si la persona
 * pidió reducir el movimiento.
 */
export function ScrollSuave() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    guardarLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (tiempo: number) => lenis.raf(tiempo * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Las fuentes y las imágenes cambian las alturas: recalculamos.
    const recalcular = () => ScrollTrigger.refresh();
    window.addEventListener("load", recalcular);
    document.fonts?.ready.then(recalcular);

    return () => {
      window.removeEventListener("load", recalcular);
      gsap.ticker.remove(tick);
      lenis.destroy();
      guardarLenis(null);
    };
  }, []);

  return null;
}
