"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "../animaciones/gsap";
import { obtenerLenis } from "../animaciones/lenis-store";
import { Chevron } from "../ui/Chevron";
import { IconoCuadrado } from "../ui/IconoCuadrado";

type Enlace = { texto: string; href: string };

type Props = {
  abierto: boolean;
  onCerrar: () => void;
  principales: Enlace[];
  secundarios: Enlace[];
};

/**
 * Panel blanco que entra desde la izquierda (como en la referencia): botón
 * de cerrar y marca arriba, cuatro enlaces grandes con botón redondo,
 * una línea, una rejilla de enlaces pequeños y el bloque de redes abajo.
 * Los enlaces aparecen en cascada.
 */
export function MenuLateral({ abierto, onCerrar, principales, secundarios }: Props) {
  const raiz = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const primeraVez = useRef(true);

  // Cerrar con Escape y bloquear el scroll de fondo mientras está abierto
  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e: KeyboardEvent) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", alTeclear);
    obtenerLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", alTeclear);
      obtenerLenis()?.start();
      document.documentElement.style.overflow = "";
    };
  }, [abierto, onCerrar]);

  useGSAP(
    () => {
      const p = panel.current;
      const f = fondo.current;
      if (!p || !f) return;

      const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const d = reducido ? 0 : 0.5;
      const curva = "expo.out";

      if (primeraVez.current) {
        primeraVez.current = false;
        // x: 0 limpia el translateX(-110%) que trae el HTML (ver style del
        // panel); desde aquí GSAP controla la posición solo con xPercent.
        gsap.set(p, { x: 0, xPercent: -110 });
        gsap.set(f, { opacity: 0 });
        return;
      }

      if (abierto) {
        gsap.to(f, { opacity: 1, duration: d * 0.8, ease: "power2.out" });
        gsap.to(p, { xPercent: 0, duration: d, ease: curva });
        gsap.fromTo(
          "[data-menu-item]",
          { opacity: 0, x: -14 },
          { opacity: 1, x: 0, duration: d, ease: curva, stagger: 0.04, delay: d * 0.3 },
        );
      } else {
        gsap.to(f, { opacity: 0, duration: d * 0.6, ease: "power2.out" });
        gsap.to(p, { xPercent: -110, duration: d * 0.8, ease: "power3.inOut" });
      }
    },
    { scope: raiz, dependencies: [abierto] },
  );

  return (
    <div
      ref={raiz}
      aria-hidden={!abierto}
      className={`fixed inset-0 z-[60] ${abierto ? "" : "pointer-events-none"}`}
    >
      {/* Fondo oscuro */}
      <div
        ref={fondo}
        onClick={onCerrar}
        className="absolute inset-0 bg-carbon/45"
        // Cerrado desde el HTML: así no se ve un instante antes de que cargue el JS
        style={{ opacity: 0 }}
      />

      {/* Panel */}
      <div
        ref={panel}
        id="menu-principal"
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        style={{ transform: "translateX(-110%)" }}
        className="absolute bottom-[10px] left-[10px] top-[10px] flex w-[min(369px,calc(100vw-20px))] flex-col overflow-y-auto rounded-[16px] bg-blanco px-[38px] pb-[38px] pt-[38px]"
        data-lenis-prevent
      >
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar menú"
            className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-carbon/10 text-carbon transition-colors hover:bg-escarcha"
          >
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 stroke-current" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
          <Link
            href="/"
            onClick={onCerrar}
            className="text-[13px] font-bold uppercase tracking-[0.3em] text-bosque"
          >
            MoviGo
          </Link>
        </div>

        <ul className="mt-9 flex flex-col gap-[10px]">
          {principales.map((e) => (
            <li key={e.texto} data-menu-item>
              <a
                href={e.href}
                onClick={onCerrar}
                className="group flex items-center justify-between py-[2px] text-[28px] leading-[1.3] tracking-[-0.01em] text-carbon"
              >
                {e.texto}
                <IconoCuadrado variante="oscuro" className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </li>
          ))}
        </ul>

        <div data-menu-item className="my-9 h-px bg-carbon/10" />

        <ul className="grid grid-cols-2 gap-x-6 gap-y-[10px]">
          {secundarios.map((e) => (
            <li key={e.texto} data-menu-item>
              <a
                href={e.href}
                onClick={onCerrar}
                className="group inline-flex items-center gap-2 whitespace-nowrap py-[5px] text-[15px] leading-[1.5] text-carbon"
              >
                {e.texto}
                <Chevron className="transition-transform duration-300 group-hover:translate-x-[2px]" />
              </a>
            </li>
          ))}
        </ul>

        <div
          data-menu-item
          className="mt-auto flex items-center justify-between rounded-[16px] border border-carbon/10 px-6 py-4"
        >
          <span className="text-[12px] font-bold uppercase text-bosque">Redes</span>
          <span className="flex items-center gap-4 text-carbon">
            <a href="#" aria-label="Instagram" className="transition-opacity hover:opacity-70">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="TikTok" className="transition-opacity hover:opacity-70">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M16 3c.3 2.4 1.8 4 4 4.2v3.1c-1.5 0-2.9-.5-4-1.3v6.4A5.6 5.6 0 1 1 10.4 10v3.2a2.5 2.5 0 1 0 2.5 2.5V3H16z" />
              </svg>
            </a>
            <a href="#" aria-label="YouTube" className="transition-opacity hover:opacity-70">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M22 8.2a2.6 2.6 0 0 0-1.8-1.8C18.6 6 12 6 12 6s-6.6 0-8.2.4A2.6 2.6 0 0 0 2 8.2 27 27 0 0 0 1.6 12 27 27 0 0 0 2 15.8a2.6 2.6 0 0 0 1.8 1.8C5.4 18 12 18 12 18s6.6 0 8.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8zM10 14.6V9.4l4.6 2.6L10 14.6z" />
              </svg>
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
