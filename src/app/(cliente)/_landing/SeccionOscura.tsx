"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/compartido/interfaz/animaciones/gsap";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { EnlaceFlecha } from "@/compartido/interfaz/ui/EnlaceFlecha";
import { ImagenSlot } from "@/compartido/interfaz/ui/ImagenSlot";
import { oscura } from "./contenido";

/**
 * Sección verde oscuro: titular gigante cuyas palabras entran una a una con
 * el scroll, dos tarjetas de distinto tamaño y un bloque de cierre.
 */
export function SeccionOscura() {
  const raiz = useRef<HTMLElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Cada palabra pasa de gris y abajo a blanco y en su sitio,
        // ligada al scroll (como "Ready, set, Zoox!")
        gsap.fromTo(
          "[data-palabra-titulo]",
          { opacity: 0.18, y: 24 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            stagger: 0.35,
            scrollTrigger: {
              trigger: titulo.current,
              start: "top 85%",
              end: "top 35%",
              scrub: 0.4,
            },
          },
        );
      });
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} className="bg-bosque text-blanco">
      {/* Título */}
      <div className="px-5 pb-20 pt-[120px] text-center md:pt-[160px]">
        <p className="etiqueta pb-[30px] text-blanco/80">{oscura.etiqueta}</p>
        <h2
          ref={titulo}
          className="mx-auto max-w-[1100px] text-[clamp(48px,8.3vw,120px)] font-normal leading-[1.1] tracking-[-0.01em]"
        >
          {oscura.titulo.map((palabra, i) => (
            <span key={palabra}>
              <span data-palabra-titulo className="inline-block">
                {palabra}
              </span>
              {i < oscura.titulo.length - 1 && " "}
            </span>
          ))}
        </h2>
      </div>

      {/* Dos tarjetas: la primera más grande, como en la referencia */}
      <div className="px-5 py-20">
        <div className="mx-auto flex max-w-[1164px] flex-col items-start gap-10 md:flex-row md:items-start md:justify-center md:gap-[20px]">
          {oscura.tarjetas.map((t, i) => (
            <article
              key={t.titulo}
              data-revelar
              className="flex w-full flex-col items-center md:w-1/2"
            >
              <Link
                href={t.href}
                className={`group relative block aspect-square w-full max-w-full overflow-hidden rounded-tarjeta ${
                  i === 0 ? "md:w-[456px]" : "md:w-[338px]"
                }`}
              >
                <div className="absolute inset-0 transition-transform duration-700 ease-salida group-hover:scale-[1.04]">
                  <ImagenSlot src={t.foto} alt={t.titulo} tono={i === 0 ? "carbon" : "eucalipto"} />
                </div>
              </Link>
              <div className="pt-10 text-center">
                <h3 className="pb-4 text-[28px] leading-[1.3]">{t.titulo}</h3>
                <EnlaceFlecha href={t.href} tono="claro">
                  {t.enlace}
                </EnlaceFlecha>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Cierre: empresas */}
      <div id="empresas" className="px-5 pb-[120px] pt-[60px] text-center md:pb-[160px]">
        <p data-revelar className="etiqueta pb-4 text-blanco/80">
          {oscura.cierre.etiqueta}
        </p>
        <p
          data-revelar
          className="mx-auto max-w-[549px] pb-4 text-[clamp(26px,2.5vw,36px)] leading-[1.2]"
        >
          {oscura.cierre.texto}
        </p>
        <div data-revelar className="pt-4">
          <Boton href={oscura.cierre.boton.href}>{oscura.cierre.boton.texto}</Boton>
        </div>
      </div>
    </section>
  );
}
