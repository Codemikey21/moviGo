import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { EnlaceFlecha } from "@/compartido/interfaz/ui/EnlaceFlecha";
import { obtenerConteos } from "@/modulos/gestion-almacen/servidor/stock/acciones";
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
function Pastilla({ href, activa, children }: { href: string; activa: boolean; children: React.ReactNode }) {
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

  // Catálogo y almacén son módulos separados: la página junta los dos
  const [categorias, productos] = await Promise.all([
    obtenerCategorias(),
    listarCatalogo({ categoria, modalidad: modo === "alquilar" ? "ALQUILER" : undefined }),
  ]);
  const conteos = await obtenerConteos(productos.map((p) => p.id));
  const actual = categorias.find((c) => c.slug === categoria);

  // Sin categoría elegida, el catálogo se arma por secciones
  const secciones = actual
    ? [{ categoria: actual, productos }]
    : categorias
        .map((c) => ({ categoria: c, productos: productos.filter((p) => p.categoria.slug === c.slug) }))
        .filter((s) => s.productos.length > 0);

  return (
    <>
      {/* Encabezado centrado, como las secciones de la landing */}
      <section className="px-5 pb-12 pt-[150px] text-center md:pt-[180px]">
        <p className="etiqueta pb-4 text-carbon/70">{actual ? "Catálogo" : "Catálogo MoviGo"}</p>
        <h1 className="titular mx-auto max-w-[900px] text-[clamp(44px,6vw,88px)] text-carbon">
          {actual ? (
            actual.nombre
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
          {actual?.descripcion ??
            "Compra o alquila por días. Recógelo en uno de nuestros tres puntos o te lo llevamos a la puerta."}
        </p>

        {/* Comprar o alquilar */}
        <div className="mt-10 inline-flex rounded-full bg-escarcha p-1">
          {([
            [undefined, "Todo"],
            ["comprar", "Comprar"],
            ["alquilar", "Alquilar"],
          ] as const).map(([valor, texto]) => (
            <Pastilla key={texto} href={enlace(categoria, valor)} activa={modo === valor}>
              {texto}
            </Pastilla>
          ))}
        </div>
      </section>

      {/* Categorías */}
      <nav
        aria-label="Categorías"
        className="sticky top-[88px] z-30 mx-auto mb-12 w-fit max-w-[calc(100%-40px)] overflow-x-auto rounded-full border border-carbon/10 bg-blanco/95 p-1 backdrop-blur"
      >
        <div className="flex">
          <Pastilla href={enlace(undefined, modo)} activa={!categoria}>
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
            <p className="text-[24px] text-carbon">No hay productos para alquilar en esta categoría.</p>
            <div className="mt-6">
              <EnlaceFlecha href={enlace(categoria, "comprar")}>Ver para comprar</EnlaceFlecha>
            </div>
          </div>
        </div>
      ) : (
        <div className="contenedor space-y-24">
          {secciones.map((s) => (
            <section key={s.categoria.id} aria-labelledby={`cat-${s.categoria.slug}`}>
              {!actual && (
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-carbon/10 pb-5">
                  <div>
                    <h2 id={`cat-${s.categoria.slug}`} className="text-[clamp(28px,3vw,40px)] leading-[1.1] tracking-[-0.01em] text-carbon">
                      {s.categoria.nombre}
                    </h2>
                    <p className="mt-2 text-[15px] text-pizarra">{s.categoria.descripcion}</p>
                  </div>
                  <EnlaceFlecha href={enlace(s.categoria.slug, modo)}>
                    Ver {s.productos.length} modelo{s.productos.length === 1 ? "" : "s"}
                  </EnlaceFlecha>
                </div>
              )}
              <ul className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {s.productos.slice(0, actual ? undefined : 3).map((p) => (
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
