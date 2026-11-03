"use client";

import { useRef } from "react";
import { useIndiceAlScroll } from "@/compartido/interfaz/animaciones/useIndiceAlScroll";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { ImagenSlot } from "@/compartido/interfaz/ui/ImagenSlot";
import type { Tono } from "@/compartido/interfaz/ui/MarcoPlaceholder";
import { palabras } from "./contenido";

const tonos: Tono[] = ["salvia", "eucalipto", "bosque", "escarcha", "carbon"];

/**
 * Lista de palabras que se van encendiendo una a una mientras haces scroll.
 * A la derecha, la foto cambia con cada palabra. La parte visible queda fija
 * (sticky) dentro de una sección más alta que la pantalla.
 */
export function SeccionPalabras() {
  const raiz = useRef<HTMLElement>(null);
  const total = palabras.items.length;
  const activo = useIndiceAlScroll(raiz, total);

  return (
    <section
      ref={raiz}
      className="bg-blanco"
      style={{ height: `${(total + 1) * 55}svh` }}
    >
      <div className="sticky top-0 flex h-svh items-center p-5">
        <div className="grid h-full w-full grid-rows-[auto_1fr] gap-4 lg:grid-cols-[1fr_1fr] lg:grid-rows-1 lg:gap-5">
          {/* Lista */}
          <div className="relative flex flex-col justify-center rounded-tarjeta bg-salvia px-7 py-10 text-center md:px-12">
            <h2 className="etiqueta text-carbon/70">{palabras.etiqueta}</h2>
            <ul className="mt-8 flex flex-col md:mt-12">
              {palabras.items.map((p, i) => (
                <li
                  key={p.palabra}
                  aria-current={i === activo}
                  className={`text-[clamp(30px,3.9vw,56px)] leading-[1.42] tracking-[-0.01em] transition-colors duration-500 ease-salida ${
                    i === activo ? "text-carbon" : "text-bosque/65"
                  }`}
                >
                  {p.palabra}
                </li>
              ))}
            </ul>
            <div className="mt-10 md:absolute md:bottom-10 md:left-1/2 md:mt-0 md:-translate-x-1/2">
              <Boton href={palabras.boton.href}>{palabras.boton.texto}</Boton>
            </div>
          </div>

          {/* Foto que cambia */}
          <div className="relative overflow-hidden rounded-tarjeta">
            {palabras.items.map((p, i) => (
              <div
                key={p.palabra}
                aria-hidden={i !== activo}
                className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-salida ${
                  i === activo ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              >
                <ImagenSlot src={p.foto} alt={p.palabra} tono={tonos[i % tonos.length]} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
