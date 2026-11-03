"use client";

import { useEffect, useRef, useState } from "react";
import { ImagenSlot } from "./ImagenSlot";
import type { Tono } from "./MarcoPlaceholder";

type Props = {
  /**
   * Nombre base del video. Convención de archivos en /public/video:
   *   <nombre>-1080.mp4    escritorio
   *   <nombre>-720.mp4     celular
   *   <nombre>-poster.jpg  imagen mientras carga (y si hay movimiento reducido)
   */
  nombre: string;
  tono?: Tono;
  /** Muestra el botón redondo de pausa/reproducir abajo a la izquierda. */
  conControl?: boolean;
  /**
   * Envuelve el video en una capa más alta que el marco (marcada con
   * `data-paralaje`) para que el padre la desplace al hacer scroll.
   */
  paralaje?: boolean;
  className?: string;
};

/**
 * Video decorativo en bucle, pensado para ser liviano:
 * - No descarga nada hasta estar cerca de la pantalla.
 * - Se pausa al salir de pantalla.
 * - Sin audio, con poster, y sin autoplay si la persona pidió menos movimiento.
 * - Si el archivo no existe, se ve el placeholder (no hay errores en pantalla).
 * Llena a su contenedor (que debe ser `relative`).
 */
export function VideoLoop({
  nombre,
  tono = "salvia",
  conControl = false,
  paralaje = false,
  className = "",
}: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [cargar, setCargar] = useState(false);
  const [listo, setListo] = useState(false);
  const [fallo, setFallo] = useState(false);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setCargar(true);
          const v = video.current;
          if (v && v.readyState >= 2 && !pausado && !movimientoReducido()) {
            v.play().catch(() => {});
          }
        } else {
          video.current?.pause();
        }
      },
      { rootMargin: "200px" },
    );

    observador.observe(el);
    return () => observador.disconnect();
  }, [pausado]);

  const alternar = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      v.play().catch(() => {});
      setPausado(false);
    } else {
      v.pause();
      setPausado(true);
    }
  };

  const base = `/video/${nombre}`;

  return (
    <div ref={contenedor} className={`absolute inset-0 overflow-hidden ${className}`}>
      <div
        data-paralaje={paralaje ? "" : undefined}
        className={paralaje ? "absolute -inset-y-[9%] inset-x-0" : "absolute inset-0"}
      >
        <ImagenSlot src={`${base}-poster.jpg`} alt="" tono={tono} />
        {cargar && !fallo && (
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden
            tabIndex={-1}
            onLoadedData={(e) => {
              setListo(true);
              if (!movimientoReducido()) e.currentTarget.play().catch(() => {});
            }}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
              listo ? "opacity-100" : "opacity-0"
            }`}
          >
            <source
              src={`${base}-720.mp4`}
              media="(max-width: 767px)"
              type="video/mp4"
            />
            <source
              src={`${base}-1080.mp4`}
              type="video/mp4"
              onError={() => setFallo(true)}
            />
          </video>
        )}
      </div>

      {conControl && listo && !fallo && (
        <button
          type="button"
          onClick={alternar}
          aria-label={pausado ? "Reproducir video" : "Pausar video"}
          className="absolute bottom-5 left-5 flex h-10 w-10 items-center justify-center rounded-full bg-carbon text-blanco transition-transform duration-300 hover:scale-105 md:bottom-6 md:left-6"
        >
          {pausado ? (
            <svg aria-hidden viewBox="0 0 12 12" className="ml-[2px] h-3 w-3 fill-current">
              <path d="M2 1.5v9l8-4.5z" />
            </svg>
          ) : (
            <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 fill-current">
              <rect x="2" y="1.5" width="3" height="9" rx="0.5" />
              <rect x="7" y="1.5" width="3" height="9" rx="0.5" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}

function movimientoReducido() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
