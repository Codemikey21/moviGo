import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Revelador } from "@/compartido/interfaz/animaciones/Revelador";
import { EnlaceFlecha } from "@/compartido/interfaz/ui/EnlaceFlecha";
import { obtenerConteos } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { MosaicoCategorias } from "@/modulos/gestion-catalogo/interfaz/componentes/categorias/MosaicoCategorias";
import { TarjetaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/TarjetaProducto";
import { obtenerCategorias } from "@/modulos/gestion-catalogo/servidor/categorias/acciones";
import { listarCatalogo } from "@/modulos/gestion-catalogo/servidor/productos/acciones";

export const metadata: Metadata = {
  title: "Catálogo · MoviGo",
  description: "Bicicletas, scooters, motos, autos eléctricos, drones, patinetas y accesorios para comprar o alquilar.",
};

type Modo = "comprar" | "alquilar" | undefined;

function enlace(categoria?: string, modo?: Modo) {
  const p = new URLSearchParams();
  if (categoria) p.set("categoria", categoria);
  if (modo) p.set("modo", modo);
  const texto = p.toString();
  return texto ? `/catalogo?${texto}` : "/catalogo";
}

/** Pastilla del menú, igual a las de la landing. */
function Pastilla({ href, activa, children }: { href: string; activa: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={activa ? "page" : undefined}
      className={`flex h-10 items-center whitespace-nowrap rounded-full px-5 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
        activa ? "bg-bosque text-blanco" : "text-carbon hover:bg-carbon/[0.06]"
      }`}
    >
      {children}
    </Link>
  );
}

export default function PaginaCatalogo({ searchParams }: PageProps<"/catalogo">) {
  return (
    <main className="bg-blanco pb-[120px]">
      <Suspense fallback={<div className="min-h-svh" />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/catalogo">, "searchParams">) {
  await connection();
  const sp = await searchParams;
  const categoria = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const modo: Modo = sp.modo === "comprar" || sp.modo === "alquilar" ? sp.modo : undefined;

  const categorias = await obtenerCategorias();
  const actual = categorias.find((c) => c.slug === categoria);

  // Sin categoría elegida (o una que no existe): el mosaico de categorías
  if (!actual) {
    return (
      <>
        <Encabezado modo={modo} />
        <Revelador>
          <div className="contenedor">
            <MosaicoCategorias categorias={categorias} modo={modo} />
          </div>
        </Revelador>
      </>
    );
  }

  // Con categoría: todos sus productos.
  // Catálogo y almacén son módulos separados: la página junta los dos
  const productos = await listarCatalogo({ categoria, modalidad: modo === "alquilar" ? "ALQUILER" : undefined });
  const conteos = await obtenerConteos(productos.map((p) => p.id));
  const secciones = productos.length ? [{ categoria: actual, productos }] : [];

  return (
    <>
      <Encabezado modo={modo} categoria={actual} />

      {/* Categorías */}
      <nav
        aria-label="Categorías"
        className="sticky top-[88px] z-30 mx-auto mb-12 w-fit max-w-[calc(100%-40px)] overflow-x-auto rounded-full border border-carbon/10 bg-blanco/95 p-1 backdrop-blur"
      >
        <div className="flex">
          <Pastilla href={enlace(undefined, modo)} activa={false}>
            Todas
          </Pastilla>
          {categorias.map((c) => (
            <Pastilla key={c.id} href={enlace(c.slug, modo)} activa={categoria === c.slug}>
              {c.nombre}
            </Pastilla>
          ))}
        </div>
      </nav>

      {secciones.length === 0 ? (
        <div className="contenedor">
          <div className="rounded-tarjeta bg-escarcha px-6 py-20 text-center">
            <p className="text-[24px] text-carbon">
              {modo === "alquilar" ? "No hay productos para alquilar en esta categoría." : "Pronto tendremos productos en esta categoría."}
            </p>
            <div className="mt-6">
              <EnlaceFlecha href={enlace(categoria, "comprar")}>Ver para comprar</EnlaceFlecha>
            </div>
          </div>
        </div>
      ) : (
        <div className="contenedor space-y-24">
          {secciones.map((s) => (
            <section key={s.categoria.id} aria-labelledby={`cat-${s.categoria.slug}`}>
              <h2 id={`cat-${s.categoria.slug}`} className="sr-only">
                {s.categoria.nombre}
              </h2>
              <ul className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {s.productos.map((p) => (
                  <li key={p.id}>
                    <TarjetaProducto
                      producto={p}
                      disponibles={conteos[p.id]?.disponibles ?? 0}
                      modo={modo === "alquilar" ? "alquilar" : "comprar"}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

/** Título centrado del catálogo, como las secciones de la landing, con Comprar / Alquilar. */
function Encabezado({ modo, categoria }: { modo: Modo; categoria?: { slug: string; nombre: string; descripcion: string | null } }) {
  return (
    <section className="px-5 pb-12 pt-[150px] text-center md:pt-[180px]">
      <p className="etiqueta pb-4 text-carbon/70">{categoria ? "Catálogo" : "Catálogo MoviGo"}</p>
      <h1 className="titular mx-auto max-w-[900px] text-[clamp(44px,6vw,88px)] text-carbon">
        {categoria ? (
          categoria.nombre
        ) : modo === "alquilar" ? (
          <>
            Alquila y <span className="text-eucalipto">sal hoy</span>
          </>
        ) : (
          <>
            Elige cómo <span className="text-eucalipto">te mueves</span>
          </>
        )}
      </h1>
      <p className="mx-auto mt-5 max-w-[560px] text-[18px] leading-[1.5] text-pizarra">
        {categoria?.descripcion ??
          "Autos, motos, scooters, bicis y más. Cómpralo o alquílalo por días, recógelo hoy o te lo llevamos a la puerta."}
      </p>

      {/* Comprar o alquilar */}
      <div className="mt-10 inline-flex rounded-full bg-escarcha p-1">
        {([
          [undefined, "Todo"],
          ["comprar", "Comprar"],
          ["alquilar", "Alquilar"],
        ] as const).map(([valor, texto]) => (
          <Pastilla key={texto} href={enlace(categoria?.slug, valor)} activa={modo === valor}>
            {texto}
          </Pastilla>
        ))}
      </div>
    </section>
  );
}
