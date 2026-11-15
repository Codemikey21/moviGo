"use client";

import Image from "next/image";
import { useState } from "react";
import { borrarFotoAccion, hacerPrincipalAccion } from "../../../servidor/medios/acciones";
import type { Foto } from "../../../tipos";
import { useSubirFotos } from "../../hooks/useSubirFotos";

const MAX_FOTOS = 8;

type Props = {
  productoId: string;
  fotos: Foto[];
  /** Solo el administrador del sistema sube y borra fotos */
  puedeEditar: boolean;
};

/** Fotos del producto: la primera es la que sale en el catálogo. */
export function GaleriaFotos({ productoId, fotos, puedeEditar }: Props) {
  const { subidas, subir, limpiar } = useSubirFotos(productoId);
  const [encima, setEncima] = useState(false);
  const subiendo = subidas.some((s) => s.estado === "subiendo");
  const espacio = MAX_FOTOS - fotos.length;

  function elegir(lista: FileList | null) {
    if (!lista?.length) return;
    limpiar();
    void subir(Array.from(lista).slice(0, Math.max(espacio, 0)));
  }

  return (
    <div className="space-y-4">
      {fotos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {fotos.map((foto, i) => (
            <li
              key={foto.id}
              className={`group relative overflow-hidden rounded-[20px] bg-salvia ${
                i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square"
              }`}
            >
              <Image
                src={foto.url}
                alt={foto.textoAlt}
                fill
                sizes={i === 0 ? "(min-width: 640px) 360px, 100vw" : "180px"}
                className="object-cover"
              />
              {i === 0 && (
                <span className="etiqueta absolute left-3 top-3 rounded-full bg-blanco/90 px-3 py-1.5 text-carbon">
                  Principal
                </span>
              )}
              {puedeEditar && (
                <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5">
                  {i > 0 && (
                    <form action={hacerPrincipalAccion}>
                      <input type="hidden" name="id" value={foto.id} />
                      <button
                        type="submit"
                        className="rounded-full bg-blanco/90 px-3 py-1.5 text-[12px] font-medium text-carbon backdrop-blur transition-colors hover:bg-blanco"
                      >
                        Principal
                      </button>
                    </form>
                  )}
                  <form action={borrarFotoAccion}>
                    <input type="hidden" name="id" value={foto.id} />
                    <button
                      type="submit"
                      aria-label="Borrar foto"
                      className="rounded-full bg-carbon/75 px-3 py-1.5 text-[12px] font-medium text-blanco backdrop-blur transition-colors hover:bg-carbon"
                    >
                      Borrar
                    </button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-[20px] bg-escarcha px-5 py-4 text-[14px] text-pizarra">
          Este producto aún no tiene fotos. Sin foto se muestra con sus iniciales en el catálogo.
        </p>
      )}

      {puedeEditar && espacio > 0 && (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setEncima(true);
          }}
          onDragLeave={() => setEncima(false)}
          onDrop={(e) => {
            e.preventDefault();
            setEncima(false);
            elegir(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[20px] border-2 border-dashed px-6 py-8 text-center transition-colors ${
            encima ? "border-carbon bg-blanco" : "border-carbon/15 hover:border-carbon/40"
          } ${subiendo ? "pointer-events-none opacity-60" : ""}`}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            disabled={subiendo}
            onChange={(e) => {
              elegir(e.target.files);
              e.target.value = "";
            }}
          />
          <span className="text-[15px] font-medium text-carbon">
            {subiendo ? "Subiendo fotos…" : "Arrastra fotos aquí o haz clic para elegirlas"}
          </span>
          <span className="text-[13px] text-pizarra">
            JPG, PNG o WebP. Se reducen a 1600 px automáticamente. Te quedan {espacio} de {MAX_FOTOS}.
          </span>
        </label>
      )}

      {subidas.length > 0 && (
        <ul className="space-y-1 text-[13px]" aria-live="polite">
          {subidas.map((s, i) => (
            <li key={`${s.nombre}-${i}`} className="flex gap-2">
              <span
                className={
                  s.estado === "error" ? "text-[#c0392b]" : s.estado === "lista" ? "text-eucalipto" : "text-pizarra"
                }
              >
                {s.estado === "subiendo" ? "Subiendo" : s.estado === "lista" ? "Lista" : "Error"}
              </span>
              <span className="truncate text-pizarra">{s.nombre}</span>
              {s.mensaje && <span className="text-[#c0392b]">— {s.mensaje}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
