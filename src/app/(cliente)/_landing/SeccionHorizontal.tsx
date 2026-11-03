"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/compartido/interfaz/animaciones/gsap";
import { ImagenSlot } from "@/compartido/interfaz/ui/ImagenSlot";
import { VideoLoop } from "@/compartido/interfaz/ui/VideoLoop";
import { recorrido } from "./contenido";

/**
 * En escritorio la sección se ancla a la pantalla y, al hacer scroll, la
 * pista se desplaza en horizontal: video grande, texto y fotos. En celular
 * se apila normal.
 */
export function SeccionHorizontal() {
  const raiz = useRef<HTMLElement>(null);
  const pista = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        () => {
          const el = pista.current;
          if (!el) return;

          const distancia = () => Math.max(0, el.scrollWidth - window.innerWidth);

          gsap.to(el, {
            x: () => -distancia(),
            ease: "none",
            scrollTrigger: {
              trigger: raiz.current,
              start: "top top",
              end: () => `+=${distancia()}`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });
        },
      );
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} className="bg-blanco lg:overflow-hidden">
      <div
        ref={pista}
        className="flex flex-col gap-5 px-5 py-20 lg:h-svh lg:w-max lg:flex-row lg:items-center lg:gap-5 lg:px-5 lg:py-0"
      >
        {/* 1. Video grande */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-tarjeta sm:aspect-video lg:aspect-auto lg:h-[calc(100svh-40px)] lg:w-[68vw] lg:shrink-0">
          <VideoLoop nombre={recorrido.video} tono="eucalipto" conControl />
        </div>

        {/* 2. Texto */}
        <div className="flex flex-col items-center gap-[30px] py-10 text-center lg:w-[460px] lg:shrink-0 lg:px-12">
          <h2 className="etiqueta text-carbon/70">{recorrido.etiqueta}</h2>
          <p className="text-[clamp(22px,2vw,28px)] leading-[1.3] tracking-[-0.01em]">
            {recorrido.texto}
          </p>
        </div>

        {/* 3. Fotos */}
        {recorrido.tarjetas.map((t, i) => (
          <div
            key={t.foto}
            className={`relative aspect-[4/3] w-full overflow-hidden rounded-tarjeta lg:aspect-auto lg:shrink-0 ${
              i === 0
                ? "lg:h-[calc(100svh-40px)] lg:w-[44vw]"
                : "lg:h-[calc(100svh-40px)] lg:w-[32vw]"
            }`}
          >
            <ImagenSlot src={t.foto} alt={t.alt} tono={i % 2 ? "eucalipto" : "salvia"} />
          </div>
        ))}
      </div>
    </section>
  );
}
