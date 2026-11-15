import Link from "next/link";
import { formatoPesos } from "@/compartido/utilidades/formato";
import type { ProductoResumen } from "../../../tipos";
import { VitrinaProducto } from "./VitrinaProducto";

type Props = {
  producto: ProductoResumen;
  /** Unidades listas en todos los puntos (vienen del almacén; la página las junta) */
  disponibles: number;
  /** "alquilar" muestra primero la tarifa por día */
  modo?: "comprar" | "alquilar";
};

/** Tarjeta del catálogo: el producto en su vitrina, precio y disponibilidad. */
export function TarjetaProducto({ producto: p, disponibles, modo = "comprar" }: Props) {
  const alquila = p.tarifaAlquilerDia !== null;
  const primeroAlquiler = modo === "alquilar" && alquila;
  return (
    <article className="group relative flex flex-col">
      <VitrinaProducto
        foto={p.foto}
        categoria={p.categoria.slug}
        tamanos="(min-width: 1280px) 400px, (min-width: 768px) 45vw, 100vw"
        className="aspect-[4/3] rounded-tarjeta"
      />
      <span
        className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[12px] font-medium ${
          disponibles ? "bg-blanco/90 text-bosque" : "bg-carbon/80 text-blanco"
        }`}
      >
        {disponibles ? `${disponibles} disponibles` : "Agotado por ahora"}
      </span>

      <div className="flex flex-1 flex-col px-1 pt-5">
        <p className="etiqueta text-eucalipto">{p.marca}</p>
        <h3 className="mt-2 text-[22px] leading-[1.25] text-carbon">
          {/* El enlace cubre toda la tarjeta */}
          <Link href={`/producto/${p.slug}`} className="after:absolute after:inset-0">
            {p.nombre}
          </Link>
        </h3>
        <p className="mt-1 text-[14px] text-bruma">{p.modelo}</p>
        <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {primeroAlquiler ? (
            <>
              <span className="text-[20px] text-carbon">
                {formatoPesos.format(p.tarifaAlquilerDia!)}
                <span className="text-[14px] text-pizarra"> / día</span>
              </span>
              <span className="text-[14px] text-pizarra">o {formatoPesos.format(p.precioVenta)}</span>
            </>
          ) : (
            <>
              <span className="text-[20px] text-carbon">{formatoPesos.format(p.precioVenta)}</span>
              {alquila && (
                <span className="text-[14px] text-pizarra">
                  o {formatoPesos.format(p.tarifaAlquilerDia!)} / día
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}
