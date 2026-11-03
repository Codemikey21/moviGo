"use client";

import { useState } from "react";
import { MarcoPlaceholder, type Tono } from "./MarcoPlaceholder";

type Props = {
  /** Ruta dentro de /public, por ejemplo /img/landing/hero.jpg */
  src: string;
  alt: string;
  tono?: Tono;
  className?: string;
};

/**
 * Foto con respaldo: si el archivo todavía no existe, se queda el
 * placeholder. Cuando agregues la foto real en /public, aparece sola.
 * Llena a su contenedor (que debe ser `relative`).
 */
export function ImagenSlot({ src, alt, tono = "salvia", className = "" }: Props) {
  const [fallo, setFallo] = useState(false);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <MarcoPlaceholder tono={tono} etiqueta={`FOTO · ${src.split("/").pop()}`} />
      {!fallo && (
        // eslint-disable-next-line @next/next/no-img-element -- respaldo con onError; las fotos reales se optimizan antes de subirlas
        <img
          // Si la foto falló antes de que React hidratara, el evento onError
          // ya pasó: lo detectamos al montar.
          ref={(img) => {
            if (img && img.complete && img.naturalWidth === 0) setFallo(true);
          }}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFallo(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}
