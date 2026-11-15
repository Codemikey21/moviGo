"use client";

import Image from "next/image";
import { useState } from "react";
import { borrarFotoAccion, etiquetarFotoAccion, hacerPrincipalAccion } from "../../../servidor/medios/acciones";
import { NOMBRE_VISTA, VISTAS, type ColorProducto, type FotoProducto, type Vista } from "../../../tipos";
import { useSubirFotos } from "../../hooks/useSubirFotos";

const MAX_FOTOS = 24;

type Props = {
  productoId: string;
  fotos: FotoProducto[];
  colores: ColorProducto[];
  /** Solo el administrador del sistema sube y borra fotos */
  puedeEditar: boolean;
};

const claseSelect =
  "h-11 w-full appearance-none rounded-[14px] border border-transparent bg-escarcha px-3 text-[14px] text-carbon outline-none focus:border-carbon focus:bg-blanco";

/**
 * Fotos del producto. Cada foto puede ser de un color y de una vista
 * (de lado, de frente, detalle, en la calle): así el configurador de la
 * ficha muestra las fotos del color que la persona elige.
 * La primera es la que sale en el catálogo.
 */
export function GaleriaFotos({ productoId, fotos, colores, puedeEditar }: Props) {
  const { subidas, subir, limpiar } = useSubirFotos(productoId);
  const [encima, setEncima] = useState(false);
  const [filtro, setFiltro] = useState<string>("todas");
  const [colorSubida, setColorSubida] = useState<string>(colores[0]?.id ?? "");
  const [vistaSubida, setVistaSubida] = useState<Vista | "">("LATERAL");
  const subiendo = subidas.some((s) => s.estado === "subiendo");
  const espacio = MAX_FOTOS - fotos.length;
  const nombreColor = new Map(colores.map((c) => [c.id, c]));

  const visibles = fotos.filter((f) =>
    filtro === "todas" ? true : filtro === "generales" ? f.colorId === null : f.colorId === filtro,
  );

  function elegir(lista: FileList | null) {
    if (!lista?.length) return;
    limpiar();
    void subir(Array.from(lista).slice(0, Math.max(espacio, 0)), {
      colorId: colorSubida || null,
      vista: vistaSubida || null,
    });
  }

  return (
    <div className="space-y-4">
      {/* Filtro por color */}
      {colores.length > 0 && fotos.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "todas", texto: `Todas · ${fotos.length}`, hex: null },
            { id: "generales", texto: "Sin color", hex: null },
            ...colores.map((c) => ({ id: c.id, texto: c.nombre, hex: c.hex })),
          ].map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setFiltro(o.id)}
              className={`flex h-9 items-center gap-2 rounded-full px-3.5 text-[12px] font-bold uppercase transition-colors ${
                filtro === o.id ? "bg-bosque text-blanco" : "bg-escarcha text-carbon hover:bg-salvia"
              }`}
            >
              {o.hex && <span className="size-3 rounded-full ring-1 ring-blanco/60" style={{ background: o.hex }} />}
              {o.texto}
            </button>
          ))}
        </div>
      )}

      {visibles.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {visibles.map((foto) => {
            const principal = foto.id === fotos[0]?.id;
            const color = foto.colorId ? nombreColor.get(foto.colorId) : null;
            return (
              <li key={foto.id} className="overflow-hidden rounded-[20px] bg-escarcha">
                <div className="relative aspect-[4/3] bg-[radial-gradient(120%_100%_at_50%_0%,#edf4f2_0%,#d3e4df_70%)]">
                  <Image src={foto.url} alt={foto.textoAlt} fill sizes="240px" className="object-contain" />
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {principal && <span className="etiqueta rounded-full bg-carbon px-2.5 py-1 text-blanco">Principal</span>}
                    <span className="flex items-center gap-1.5 rounded-full bg-blanco/90 px-2.5 py-1 text-[11px] text-carbon">
                      {color && <span className="size-2.5 rounded-full" style={{ background: color.hex }} />}
                      {color?.nombre ?? "Todos los colores"}
                      {foto.vista && ` · ${NOMBRE_VISTA[foto.vista]}`}
                    </span>
                  </div>
                </div>
                {puedeEditar && (
                  <div className="space-y-2 p-2.5">
                    <form action={etiquetarFotoAccion} className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                      <input type="hidden" name="id" value={foto.id} />
                      <select name="colorId" defaultValue={foto.colorId ?? ""} aria-label="Color de la foto" className={claseSelect}>
                        <option value="">Todos</option>
                        {colores.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nombre}
                          </option>
                        ))}
                      </select>
                      <select name="vista" defaultValue={foto.vista ?? ""} aria-label="Vista de la foto" className={claseSelect}>
                        <option value="">Sin vista</option>
                        {VISTAS.map((v) => (
                          <option key={v} value={v}>
                            {NOMBRE_VISTA[v]}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="rounded-[14px] bg-bosque px-3 text-[12px] font-bold uppercase text-blanco hover:bg-carbon">
                        OK
                      </button>
                    </form>
                    <div className="flex justify-end gap-1.5">
                      {!principal && (
                        <form action={hacerPrincipalAccion}>
                          <input type="hidden" name="id" value={foto.id} />
                          <button type="submit" className="rounded-full bg-blanco px-3 py-1.5 text-[12px] font-medium text-carbon hover:bg-salvia">
                            Hacer principal
                          </button>
                        </form>
                      )}
                      <form action={borrarFotoAccion}>
                        <input type="hidden" name="id" value={foto.id} />
                        <button
                          type="submit"
                          aria-label="Borrar foto"
                          className="rounded-full bg-carbon/80 px-3 py-1.5 text-[12px] font-medium text-blanco hover:bg-carbon"
                        >
                          Borrar
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="rounded-[20px] bg-escarcha px-5 py-4 text-[14px] text-pizarra">
          {fotos.length ? "No hay fotos con ese filtro." : "Este producto aún no tiene fotos. Mientras tanto se muestra el dibujo de su categoría."}
        </p>
      )}

      {puedeEditar && espacio > 0 && (
        <div className="space-y-3 rounded-[20px] border border-carbon/10 p-4">
          <p className="text-[14px] font-medium text-carbon">Subir fotos nuevas</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-[13px] text-pizarra">
              Color
              <select value={colorSubida} onChange={(e) => setColorSubida(e.target.value)} className={`${claseSelect} mt-1`}>
                <option value="">Todos los colores</option>
                {colores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[13px] text-pizarra">
              Vista
              <select value={vistaSubida} onChange={(e) => setVistaSubida(e.target.value as Vista | "")} className={`${claseSelect} mt-1`}>
                <option value="">Sin vista</option>
                {VISTAS.map((v) => (
                  <option key={v} value={v}>
                    {NOMBRE_VISTA[v]}
                  </option>
                ))}
              </select>
            </label>
          </div>
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
            className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] border-2 border-dashed px-6 py-7 text-center transition-colors ${
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
              Ideal: PNG sin fondo, de lado, 2400 × 1600 px. Te quedan {espacio} de {MAX_FOTOS}.
            </span>
          </label>
        </div>
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
