"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/compartido/interfaz/animaciones/gsap";
import { obtenerLenis } from "@/compartido/interfaz/animaciones/lenis-store";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { historia } from "./contenido";

const { burbujas, categorias } = historia;

// Recortes de los paneles (clip-path). 12px de margen y radio de 36px.
const M = "12px";
const R = "round 36px";
const recorte = {
  completo: `inset(${M} ${M} ${M} ${M} ${R})`,
  izquierda: `inset(${M} calc(50% + 6px) ${M} ${M} ${R})`,
  derecha: `inset(${M} ${M} ${M} calc(50% + 6px) ${R})`,
  cerradoIzquierda: `inset(${M} calc(100% - ${M}) ${M} ${M} ${R})`,
  cerradoDerecha: `inset(${M} ${M} ${M} calc(100% - ${M}) ${R})`,
};

// En qué punto del recorrido (de 0 a 1) empieza cada parte.
const MARCAS = {
  paso1: 0.04,
  paso2: 0.2,
  lista: 0.36,
  categorias: [0.44, 0.53, 0.62, 0.71, 0.8],
  cierre: 0.88,
};

/** Burbuja blanca con los tres puntos que titilan. */
function Burbuja({ paso }: { paso: number }) {
  const b = burbujas[paso];
  return (
    <div
      key={paso}
      className="entrar-desde-izquierda flex h-9 items-center whitespace-nowrap rounded-full bg-blanco px-4 text-[12px] font-bold uppercase tracking-[0.04em] text-carbon shadow-[0_2px_12px_rgba(13,18,18,0.12)]"
    >
      {b.texto}
      {b.puntos && (
        <span aria-hidden className="ml-0.5 inline-flex">
          <span className="animate-[titilar_1.2s_infinite]">.</span>
          <span className="animate-[titilar_1.2s_0.2s_infinite]">.</span>
          <span className="animate-[titilar_1.2s_0.4s_infinite]">.</span>
        </span>
      )}
    </div>
  );
}

/**
 * Apertura de la landing, al estilo de "How to ride" de la referencia:
 * una escena fija en pantalla donde, al bajar, los paneles de video y foto
 * se recortan y se cruzan, entran los textos y al final un menú de pastillas
 * recorre las categorías. En celular se muestra apilada, sin escena fija.
 */
export function SeccionHistoria() {
  const raiz = useRef<HTMLElement>(null);
  const [paso, setPaso] = useState(0);
  const [categoria, setCategoria] = useState(0);
  const trigger = useRef<ScrollTrigger | null>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        // Entrada del título, palabra por palabra (no depende del scroll)
        gsap.from(".hc-palabra", {
          yPercent: 110,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.07,
          delay: 0.2,
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: raiz.current,
            start: "top top",
            end: "+=700%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            onUpdate(st) {
              const p = st.progress;
              setPaso(p < MARCAS.paso2 - 0.02 ? 0 : p < MARCAS.lista ? 1 : 2);
              // Se marca la pastilla cuando la foto ya terminó de entrar (el scrub va con retraso)
              const i = MARCAS.categorias.filter((m) => p >= m + 0.04).length - 1;
              setCategoria(Math.max(0, i));
            },
          },
        });
        trigger.current = tl.scrollTrigger ?? null;

        // Duración total = 1, así cada posición del timeline es una fracción del scroll
        tl.set({}, {}, 1);

        // 1. El título se va y el video se recorta a la mitad izquierda
        tl.to(".hc-titulo", { yPercent: -40, opacity: 0, duration: 0.06 }, MARCAS.paso1)
          .to(".hc-panel-a", { clipPath: recorte.izquierda, duration: 0.1 }, MARCAS.paso1 + 0.02)
          .fromTo(
            ".hc-texto-1",
            { x: 80, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.08, ease: "power3.out" },
            MARCAS.paso1 + 0.08,
          );

        // 2. Entra la foto por la derecha, el video se cierra hacia la izquierda
        tl.to(".hc-texto-1", { x: -40, opacity: 0, duration: 0.05 }, MARCAS.paso2)
          .fromTo(
            ".hc-panel-b",
            { clipPath: recorte.cerradoDerecha },
            { clipPath: recorte.derecha, duration: 0.1 },
            MARCAS.paso2,
          )
          .to(".hc-panel-a", { clipPath: recorte.cerradoIzquierda, duration: 0.1 }, MARCAS.paso2 + 0.03)
          .fromTo(
            ".hc-foto-b",
            { scale: 1.25 },
            { scale: 1, duration: 0.14, ease: "power2.out" },
            MARCAS.paso2,
          )
          .fromTo(
            ".hc-texto-2",
            { x: -80, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.08, ease: "power3.out" },
            MARCAS.paso2 + 0.09,
          );

        // 3. Compra. Alquila. Rueda. y aparece el menú de categorías
        tl.to(".hc-texto-2", { y: -30, opacity: 0, duration: 0.05 }, MARCAS.lista)
          .fromTo(
            ".hc-item",
            { x: -60, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.06, stagger: 0.02, ease: "power3.out" },
            MARCAS.lista + 0.03,
          )
          .fromTo(
            ".hc-menu",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.05, ease: "power3.out" },
            MARCAS.lista + 0.05,
          );

        // 4. Cada categoría entra recortándose desde la derecha sobre la anterior
        MARCAS.categorias.forEach((marca, i) => {
          const foto = `.hc-cat-${i}`;
          const texto = `.hc-cat-texto-${i}`;
          tl.fromTo(
            foto,
            { clipPath: "inset(0% 0% 0% 100%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.06 },
            marca,
          ).fromTo(`${foto} img`, { scale: 1.2 }, { scale: 1, duration: 0.08 }, marca);
          if (i > 0) {
            tl.to(`.hc-cat-texto-${i - 1}`, { y: -20, opacity: 0, duration: 0.03 }, marca);
          }
          tl.fromTo(
            texto,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.04, ease: "power3.out" },
            marca + 0.03,
          );
        });

        // 5. Cierre: todo se va y la foto ocupa la pantalla con el llamado
        tl.to([".hc-item", ".hc-menu", `.hc-cat-texto-${categorias.length - 1}`], {
          opacity: 0,
          duration: 0.04,
        }, MARCAS.cierre)
          .to(".hc-panel-b", { clipPath: recorte.completo, duration: 0.08 }, MARCAS.cierre + 0.01)
          // La última foto y su degradado se estiran a todo el ancho
          .to([`.hc-cat-${categorias.length - 1}`, ".hc-degradado"], { left: "0%", duration: 0.08 }, MARCAS.cierre + 0.01)
          .to(".hc-velo", { opacity: 1, duration: 0.06 }, MARCAS.cierre + 0.04)
          .fromTo(
            ".hc-cierre",
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.06, ease: "power3.out" },
            MARCAS.cierre + 0.06,
          );

        return () => {
          trigger.current = null;
        };
      });
    },
    { scope: raiz },
  );

  /** Al tocar una pastilla, baja (o sube) hasta esa categoría. */
  function irACategoria(i: number) {
    const st = trigger.current;
    if (!st) return;
    const destino = st.start + (st.end - st.start) * (MARCAS.categorias[i] + 0.04);
    const lenis = obtenerLenis();
    if (lenis) lenis.scrollTo(destino, { duration: 1.4 });
    else window.scrollTo({ top: destino, behavior: "smooth" });
  }

  return (
    <>
      {/* ---------------- Escritorio: escena fija ---------------- */}
      <section
        ref={raiz}
        aria-label="Cómo funciona MoviGo"
        id="como-funciona"
        className="relative hidden h-svh overflow-hidden bg-blanco lg:block"
      >
        {/* Panel A: video */}
        <div className="hc-panel-a absolute inset-0" style={{ clipPath: recorte.completo }}>
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={`/video/${historia.video}-1080.mp4`}
            poster={`/video/${historia.video}-poster.jpg`}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-carbon/45 via-carbon/10 to-carbon/30" />
        </div>

        {/* Título sobre el video */}
        <h1 className="hc-titulo pointer-events-none absolute inset-x-0 top-[16%] text-center text-[88px] font-medium leading-[0.98] tracking-[-0.03em] text-blanco">
          {historia.titulo.map((linea) => (
            // Cada línea recorta a sus palabras para que suban desde abajo
            <span key={linea.join(" ")} className="block overflow-hidden pb-2">
              {linea.map((palabra, i) => (
                <span key={palabra}>
                  <span className="hc-palabra inline-block">{palabra}</span>
                  {i < linea.length - 1 && " "}
                </span>
              ))}
            </span>
          ))}
        </h1>

        {/* Texto 1 (derecha) */}
        <div className="hc-texto-1 absolute left-[calc(50%+96px)] top-1/2 max-w-[400px] -translate-y-1/2 opacity-0">
          <p className="etiqueta text-eucalipto">{historia.paso1.etiqueta}</p>
          <p className="mt-4 text-[32px] font-medium leading-[1.12] tracking-[-0.01em] text-carbon">
            {historia.paso1.titulo}
          </p>
          <p className="mt-4 text-[16px] text-pizarra">{historia.paso1.texto}</p>
        </div>

        {/* Panel B: foto y luego galería de categorías */}
        <div className="hc-panel-b absolute inset-0" style={{ clipPath: recorte.cerradoDerecha }}>
          <div className="hc-foto-b absolute inset-y-0 left-1/2 right-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={historia.foto} alt={historia.textoAlt} className="h-full w-full object-cover" />
          </div>
          {categorias.map((c, i) => (
            <div
              key={c.nombre}
              className={`hc-cat-${i} absolute inset-y-0 left-1/2 right-0 overflow-hidden`}
              style={{ clipPath: "inset(0% 0% 0% 100%)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.foto} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
          {/* Degradado para leer los textos de cada categoría */}
          <div className="hc-degradado absolute inset-y-0 left-1/2 right-0 bg-gradient-to-t from-carbon/70 via-carbon/0 to-carbon/0" />
          {categorias.map((c, i) => (
            <div
              key={c.nombre}
              className={`hc-cat-texto-${i} absolute bottom-[132px] left-[calc(50%+48px)] max-w-[440px] text-blanco opacity-0`}
            >
              <p className="etiqueta text-turquesa">{c.nombre}</p>
              <p className="mt-3 text-[34px] font-medium leading-[1.08] tracking-[-0.01em]">{c.titulo}</p>
              <p className="mt-3 text-[16px] text-blanco/80">{c.texto}</p>
            </div>
          ))}
          {/* Velo oscuro del cierre */}
          <div className="hc-velo absolute inset-0 bg-carbon/55 opacity-0" />
        </div>

        {/* Texto 2 (izquierda) */}
        <div className="hc-texto-2 absolute left-[96px] top-1/2 max-w-[420px] -translate-y-1/2 opacity-0">
          <p className="etiqueta text-eucalipto">{historia.paso2.etiqueta}</p>
          <p className="mt-4 text-[32px] font-medium leading-[1.12] tracking-[-0.01em] text-carbon">
            {historia.paso2.titulo}
          </p>
          <p className="mt-4 text-[16px] text-pizarra">{historia.paso2.texto}</p>
        </div>

        {/* Lista grande (izquierda) */}
        <ul className="absolute left-[96px] top-1/2 -translate-y-1/2 space-y-1">
          {historia.lista.map((t) => (
            <li
              key={t}
              className="hc-item text-[88px] font-medium leading-[1] tracking-[-0.03em] text-carbon opacity-0"
            >
              {t}
            </li>
          ))}
        </ul>

        {/* Menú de pastillas */}
        <nav
          aria-label="Categorías"
          className="hc-menu absolute bottom-10 left-[calc(50%+48px)] flex gap-1 rounded-[20px] bg-blanco/90 p-1 opacity-0 backdrop-blur"
        >
          {categorias.map((c, i) => (
            <button
              key={c.nombre}
              type="button"
              onClick={() => irACategoria(i)}
              aria-current={categoria === i ? "true" : undefined}
              className={`relative h-11 rounded-[16px] px-4 text-[12px] font-bold uppercase tracking-[0.03em] transition-colors duration-300 ${
                categoria === i ? "bg-bosque text-blanco" : "text-pizarra hover:text-carbon"
              }`}
            >
              {c.nombre}
            </button>
          ))}
        </nav>

        {/* Cierre */}
        <div className="hc-cierre absolute inset-x-0 top-1/2 mx-auto max-w-[620px] -translate-y-1/2 text-center text-blanco opacity-0">
          <p className="etiqueta text-turquesa">{historia.cierre.etiqueta}</p>
          <p className="mt-4 text-[56px] font-medium leading-[1.02] tracking-[-0.02em]">
            {historia.cierre.titulo}
          </p>
          <div className="mt-8 flex items-center justify-center gap-6">
            <Boton href={historia.cierre.boton.href}>{historia.cierre.boton.texto}</Boton>
            <Link
              href={historia.cierre.enlace.href}
              className="text-[12px] font-bold uppercase text-blanco underline-offset-4 hover:underline"
            >
              {historia.cierre.enlace.texto}
            </Link>
          </div>
        </div>

        {/* Miniatura con burbuja (abajo a la izquierda) */}
        <div className="absolute bottom-8 left-8 flex items-center gap-3">
          <div className="h-[72px] w-[72px] overflow-hidden rounded-[20px] border-2 border-blanco shadow-[0_2px_12px_rgba(13,18,18,0.15)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={historia.miniatura} alt="" className="h-full w-full object-cover" />
          </div>
          <Burbuja paso={paso} />
        </div>
      </section>

      {/* ---------------- Celular: apilado ---------------- */}
      <section className="space-y-4 px-3 pt-24 lg:hidden">
        <div className="relative aspect-[4/5] overflow-hidden rounded-tarjeta">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={`/video/${historia.video}-1080.mp4`}
            poster={`/video/${historia.video}-poster.jpg`}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/60 to-carbon/0" />
          <h1 className="absolute bottom-6 left-6 right-6 text-[44px] font-medium leading-[1] tracking-[-0.02em] text-blanco">
            {historia.titulo.map((linea) => linea.join(" ")).join(" ")}
          </h1>
        </div>
        <div className="px-3 py-8">
          <p className="etiqueta text-eucalipto">{historia.paso1.etiqueta}</p>
          <p className="mt-3 text-[26px] font-medium leading-tight text-carbon">
            {historia.paso1.titulo} {historia.paso2.titulo}
          </p>
        </div>
        {categorias.map((c) => (
          <div key={c.nombre} className="relative aspect-[4/5] overflow-hidden rounded-tarjeta">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.foto} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon/70 to-carbon/0" />
            <div className="absolute bottom-6 left-6 right-6 text-blanco">
              <p className="etiqueta text-turquesa">{c.nombre}</p>
              <p className="mt-2 text-[28px] font-medium leading-tight">{c.titulo}</p>
              <p className="mt-2 text-[15px] text-blanco/80">{c.texto}</p>
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center gap-4 py-6">
          <Boton href={historia.cierre.boton.href}>{historia.cierre.boton.texto}</Boton>
          <Link href={historia.cierre.enlace.href} className="text-[12px] font-bold uppercase text-bosque">
            {historia.cierre.enlace.texto} →
          </Link>
        </div>
      </section>
    </>
  );
}
