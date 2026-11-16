import Link from "next/link";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { formatoPesos } from "@/compartido/utilidades/formato";
import type { CategoriaResumen } from "../../../tipos";
import { FotoOVehiculo } from "../productos/FotoOVehiculo";

type Fondo = "oscuro" | "salvia" | "escarcha";
type Tamano = "grande" | "ancha" | "normal";

/** Orden, nombre corto y estilo de cada categoría en las vitrinas y el mosaico. */
export const estiloCategorias: Record<string, { orden: number; corto: string; fondo: Fondo; tamano: Tamano }> = {
  "autos-electricos": { orden: 1, corto: "Autos", fondo: "oscuro", tamano: "grande" },
  motos: { orden: 2, corto: "Motos", fondo: "salvia", tamano: "ancha" },
  scooters: { orden: 3, corto: "Scooters", fondo: "escarcha", tamano: "normal" },
  bicicletas: { orden: 4, corto: "Bicis", fondo: "escarcha", tamano: "normal" },
  drones: { orden: 5, corto: "Drones", fondo: "oscuro", tamano: "normal" },
  patinetas: { orden: 6, corto: "Patinetas", fondo: "salvia", tamano: "normal" },
  accesorios: { orden: 7, corto: "Accesorios", fondo: "escarcha", tamano: "normal" },
};

/** Categorías con productos, en el orden de la vitrina. */
export function ordenarCategorias<T extends Pick<CategoriaResumen, "slug" | "totalProductos">>(categorias: T[]): T[] {
  return categorias
    .filter((c) => c.totalProductos > 0)
    .sort((a, b) => (estiloCategorias[a.slug]?.orden ?? 99) - (estiloCategorias[b.slug]?.orden ?? 99));
}

const celdas: Record<Tamano, number> = { grande: 4, ancha: 2, normal: 1 };
const anchoPromo: Record<number, string> = { 1: "", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4" };

function enlace(slug: string | null, modo?: "comprar" | "alquilar") {
  const p = new URLSearchParams();
  if (slug) p.set("categoria", slug);
  if (modo) p.set("modo", modo);
  return `/catalogo?${p.toString()}`;
}

/**
 * Mosaico de categorías del catálogo (autos en grande, motos a lo ancho y
 * el resto en tarjetas). Cada tarjeta lleva el dibujo de su categoría y
 * abre el catálogo filtrado. En modo alquilar solo salen las categorías que
 * se alquilan, con su tarifa por día.
 */
export function MosaicoCategorias({
  categorias,
  modo,
}: {
  categorias: CategoriaResumen[];
  modo?: "comprar" | "alquilar";
}) {
  const alquilar = modo === "alquilar";
  const lista = ordenarCategorias(categorias).filter((c) => !alquilar || c.desdeAlquiler !== null);

  // La tarjeta final ocupa lo que falte para cerrar la última fila (4 columnas)
  const usadas = lista.reduce((s, c) => s + celdas[estiloCategorias[c.slug]?.tamano ?? "normal"], 0);
  const promo = 1 + ((4 - ((usadas + 1) % 4)) % 4);

  return (
    <ul className="grid auto-rows-[300px] grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[330px] lg:grid-cols-4">
      {lista.map((c) => (
        <TarjetaCategoria key={c.slug} categoria={c} modo={modo} />
      ))}
      <li data-revelar className={anchoPromo[promo]}>
        <Link
          href={alquilar ? "/catalogo?modo=comprar" : "/catalogo?modo=alquilar"}
          className="group flex h-full flex-col justify-between rounded-[30px] bg-bosque p-7 text-blanco transition-transform duration-700 ease-salida hover:-translate-y-1.5"
        >
          <div>
            <p className="etiqueta text-turquesa">{alquilar ? "Comprar" : "Alquiler por días"}</p>
            <p className="titular mt-4 max-w-[420px] text-[32px]">
              {alquilar ? "¿Te gustó? Llévatelo para siempre." : "Pruébalo antes de comprarlo."}
            </p>
          </div>
          <div className="flex items-end justify-between gap-4">
            <p className="text-[14px] text-blanco/75">
              {alquilar ? "Recógelo hoy o te lo llevamos a la puerta." : "Con seguro y casco incluidos."}
            </p>
            <Flecha />
          </div>
        </Link>
      </li>
    </ul>
  );
}

function Flecha() {
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-turquesa text-[18px] text-carbon transition-transform duration-500 ease-salida group-hover:-rotate-45">
      ›
    </span>
  );
}

function TarjetaCategoria({ categoria: c, modo }: { categoria: CategoriaResumen; modo?: "comprar" | "alquilar" }) {
  const estilo = estiloCategorias[c.slug] ?? { fondo: "escarcha" as Fondo, tamano: "normal" as Tamano };
  const oscuro = estilo.fondo === "oscuro";
  const tamano = { grande: "sm:col-span-2 lg:row-span-2", ancha: "sm:col-span-2", normal: "" }[estilo.tamano];
  const fondo = { oscuro: "", salvia: "bg-salvia", escarcha: "bg-escarcha" }[estilo.fondo];
  const dibujo = { grande: "inset-x-[6%]", ancha: "left-[36%] right-[6%]", normal: "inset-x-[8%]" }[estilo.tamano];
  const precio =
    modo === "alquilar" && c.desdeAlquiler !== null
      ? `desde ${formatoPesos.format(c.desdeAlquiler)} por día`
      : c.desdeVenta !== null
        ? `desde ${formatoPesos.format(c.desdeVenta)}`
        : null;

  const contenido = (
    <>
      <div
        className={`absolute ${dibujo} top-1/2 -translate-y-[56%] transition-transform duration-700 ease-salida group-hover:translate-x-3.5 group-hover:scale-[1.04]`}
      >
        <FotoOVehiculo foto={c.foto} categoria={c.slug} titulo={c.nombre} tamanos="(min-width: 1024px) 40vw, 90vw" />
      </div>
      <p className={`etiqueta relative ${oscuro ? "text-turquesa" : "text-bosque"}`}>{c.nombre}</p>
      <div className="relative flex items-end justify-between gap-3">
        <div>
          <h3 className={`titular ${estilo.tamano === "grande" ? "text-[clamp(34px,3.4vw,46px)]" : "text-[28px]"}`}>{c.nombre}</h3>
          <p className="mt-1.5 text-[14px] opacity-70">
            {c.totalProductos} modelo{c.totalProductos === 1 ? "" : "s"}
            {precio && ` · ${precio}`}
          </p>
        </div>
        <Flecha />
      </div>
    </>
  );

  return (
    <li data-revelar className={tamano}>
      <Link
        href={enlace(c.slug, modo)}
        className="group block h-full transition-transform duration-700 ease-salida hover:-translate-y-1.5"
      >
        {oscuro ? (
          <Escenario
            className={`flex h-full flex-col justify-between rounded-[30px] text-blanco ${estilo.tamano === "grande" ? "p-8" : "p-6"}`}
            haz={false}
          >
            {contenido}
          </Escenario>
        ) : (
          <div className={`relative flex h-full flex-col justify-between overflow-hidden rounded-[30px] p-6 text-carbon ${fondo}`}>
            {contenido}
          </div>
        )}
      </Link>
    </li>
  );
}
