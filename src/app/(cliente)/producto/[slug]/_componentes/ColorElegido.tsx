"use client";

import Image from "next/image";
import { createContext, useContext, useState, type ReactNode } from "react";
import { IlustracionVehiculo } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/IlustracionVehiculo";
import type { ColorProducto, FotoProducto, Vista } from "@/modulos/gestion-catalogo/tipos";

type Estado = {
  categoria: string;
  nombre: string;
  colores: ColorProducto[];
  color: ColorProducto | null;
  elegir: (id: string) => void;
  /** Fotos del color elegido (o las generales si ese color no tiene) */
  fotos: FotoProducto[];
};

const Contexto = createContext<Estado | null>(null);

/** Fotos que tocan para un color: las suyas; si no tiene, las que sirven para todos. */
export function fotosDelColor(fotos: FotoProducto[], colorId: string | null) {
  const propias = colorId ? fotos.filter((f) => f.colorId === colorId) : [];
  return propias.length ? propias : fotos.filter((f) => f.colorId === null);
}

/**
 * Guarda el color que la persona eligió en el configurador. Todas las
 * secciones de la ficha (vitrina, detalles, ficha técnica) muestran el
 * producto en ese color.
 */
export function ProveedorColor({
  categoria,
  nombre,
  colores,
  fotos,
  children,
}: {
  categoria: string;
  nombre: string;
  colores: ColorProducto[];
  fotos: FotoProducto[];
  children: ReactNode;
}) {
  const [colorId, setColorId] = useState<string | null>(colores[0]?.id ?? null);
  const color = colores.find((c) => c.id === colorId) ?? null;
  return (
    <Contexto.Provider
      value={{ categoria, nombre, colores, color, elegir: setColorId, fotos: fotosDelColor(fotos, colorId) }}
    >
      {children}
    </Contexto.Provider>
  );
}

export function useColorElegido() {
  const estado = useContext(Contexto);
  if (!estado) throw new Error("useColorElegido va dentro de <ProveedorColor>.");
  return estado;
}

/**
 * El producto en el color elegido: su foto de esa vista (PNG sin fondo,
 * ideal) o, si no hay fotos, el dibujo de su categoría pintado de ese color.
 */
export function ProductoEnColor({
  vista = "LATERAL",
  espejo = false,
  className = "",
  tamanos = "(min-width: 1024px) 60vw, 100vw",
  prioridad = false,
  children,
}: {
  vista?: Vista;
  /** Voltea el dibujo (para ver "el otro lado") */
  espejo?: boolean;
  className?: string;
  tamanos?: string;
  prioridad?: boolean;
  /** Se pinta encima del dibujo (puntos de detalle) */
  children?: ReactNode;
}) {
  const { categoria, nombre, color, fotos } = useColorElegido();
  const foto = fotos.find((f) => f.vista === vista) ?? fotos.find((f) => f.vista === "LATERAL") ?? fotos[0];

  return (
    <div className={`relative aspect-[900/560] ${className}`}>
      {foto ? (
        <Image
          key={foto.id}
          src={foto.url}
          alt={foto.textoAlt}
          fill
          sizes={tamanos}
          priority={prioridad}
          className="object-contain transition-opacity duration-500 [animation:vehiculo-entra_0.8s_var(--ease-salida)_both]"
        />
      ) : (
        <>
          <IlustracionVehiculo
            categoria={categoria}
            color={color?.hex}
            titulo={`${nombre}${color ? ` en ${color.nombre}` : ""}`}
            className={`absolute inset-0 size-full transition-transform duration-700 ease-salida ${espejo ? "-scale-x-100" : ""}`}
          />
          {children}
        </>
      )}
    </div>
  );
}

/** Muestras de color para elegir (las del configurador). */
export function MuestrasColor({ tamano = "grande" }: { tamano?: "grande" | "pequeno" }) {
  const { colores, color, elegir } = useColorElegido();
  if (!colores.length) return null;
  return (
    <div role="radiogroup" aria-label="Color" className={`flex flex-wrap ${tamano === "grande" ? "gap-3" : "gap-2"}`}>
      {colores.map((c) => {
        const activo = c.id === color?.id;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={activo}
            aria-label={c.nombre}
            title={c.nombre}
            onClick={() => elegir(c.id)}
            className={`relative rounded-full ring-1 ring-carbon/15 transition-transform duration-300 ease-salida hover:scale-110 ${
              tamano === "grande" ? "size-11" : "size-7"
            } ${activo ? "after:absolute after:-inset-1.5 after:rounded-full after:border-[1.5px] after:border-carbon" : ""}`}
            style={{ background: c.hex }}
          />
        );
      })}
    </div>
  );
}

/** El nombre del color elegido (para textos). */
export function NombreColor({ className = "" }: { className?: string }) {
  const { color } = useColorElegido();
  return color ? <span className={className}>{color.nombre}</span> : null;
}
