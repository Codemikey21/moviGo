"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/compartido/interfaz/animaciones/gsap";
import { VideoLoop } from "@/compartido/interfaz/ui/VideoLoop";
import { hero } from "./contenido";

export function Hero() {
  const raiz = useRef<HTMLElement>(null);
  const marco = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Titular: las palabras suben una a una desde su máscara.
        // `from` pinta el estado inicial en el primer cuadro.
        gsap.from(".palabra-int", {
          yPercent: 110,
          duration: 1,
          ease: "power4.out",
          stagger: 0.055,
          delay: 0.1,
        });

        // Marco del video: se funde y sube un poco
        gsap.from(marco.current, {
          opacity: 0,
          y: 48,
          duration: 1.3,
          ease: "power3.out",
          delay: 0.5,
        });

        // Paralaje: el video se mueve más lento que el marco
        gsap.fromTo(
          "[data-paralaje]",
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: "none",
            scrollTrigger: {
              trigger: marco.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} className="bg-salvia pb-8 pt-[118px] md:pt-[130px]">
      <h1 className="mx-auto max-w-[760px] px-5 text-center text-[clamp(34px,4.3vw,56px)] font-normal leading-[1.15] tracking-[-0.01em]">
        {hero.lineas.map((linea) => (
          <span key={linea} className="block">
            {linea.split(" ").map((palabra, i, todas) => (
              <span key={`${palabra}-${i}`}>
                <span className="palabra">
                  <span className="palabra-int">{palabra}</span>
                </span>
                {i < todas.length - 1 && " "}
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div className="mx-5 mt-[44px] md:mt-[60px]">
        <div
          ref={marco}
          className="relative aspect-[4/5] w-full overflow-hidden rounded-tarjeta sm:aspect-video"
        >
          <VideoLoop nombre={hero.video} tono="bosque" conControl paralaje />
        </div>
      </div>
    </section>
  );
}
