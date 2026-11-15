import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EnlaceFlecha } from "@/compartido/interfaz/ui/EnlaceFlecha";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { hoyEnColombia } from "@/compartido/utilidades/formato";
import { obtenerConteos, obtenerDisponibilidad } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { TarjetaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/TarjetaProducto";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { listarCatalogo, obtenerProducto } from "@/modulos/gestion-catalogo/servidor/productos/acciones";
import { obtenerMiPerfil } from "@/modulos/gestion-usuarios/servidor/acciones";
import { COSTO_DOMICILIO } from "@/modulos/gestion-servicios/servidor/domicilios/servicio";
import { MAX_ANTICIPACION_DIAS } from "@/modulos/gestion-servicios/servidor/alquiler/validaciones";
import { PanelReserva } from "./_componentes/PanelReserva";

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const producto = await obtenerProducto(slug);
  return { title: producto ? `${producto.marca} ${producto.nombre} · MoviGo` : "Producto · MoviGo" };
}

export default function PaginaProducto({ params, searchParams }: PageProps<"/producto/[slug]">) {
  return (
    <main className="bg-blanco pb-[120px] pt-[110px]">
      <Suspense fallback={<div className="min-h-svh" />}>
        <Contenido params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({
  params,
  searchParams,
}: Pick<PageProps<"/producto/[slug]">, "params" | "searchParams">) {
  await connection();
  const { slug } = await params;
  const { modo } = await searchParams;
  const producto = await obtenerProducto(slug);
  if (!producto) notFound();

  // Catálogo y almacén son módulos separados: la página junta los dos
  const [disponibilidad, relacionados, perfil] = await Promise.all([
    obtenerDisponibilidad(producto.id),
    listarCatalogo({ categoria: producto.categoria.slug }),
    obtenerMiPerfil(),
  ]);
  const otros = relacionados.filter((p) => p.id !== producto.id).slice(0, 3);
  const conteos = await obtenerConteos(otros.map((p) => p.id));
  const disponibles = disponibilidad.reduce((s, d) => s + d.disponibles, 0);

  return (
    <>
      <div className="contenedor">
        <nav aria-label="Ruta" className="flex flex-wrap items-center gap-2 pb-6 text-[14px] text-pizarra">
          <Link href="/catalogo" className="hover:text-carbon">
            Catálogo
          </Link>
          <span className="text-niebla">/</span>
          <Link href={`/catalogo?categoria=${producto.categoria.slug}`} className="hover:text-carbon">
            {producto.categoria.nombre}
          </Link>
          <span className="text-niebla">/</span>
          <span className="text-carbon">{producto.nombre}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          {/* Vitrina y fotos */}
          <div className="lg:sticky lg:top-[100px] lg:self-start">
            <VitrinaProducto
              foto={producto.fotos[0] ?? null}
              categoria={producto.categoria.slug}
              tamanos="(min-width: 1024px) 55vw, 100vw"
              className="aspect-square rounded-tarjeta md:aspect-[5/4]"
              tamanoDibujo="w-[66%]"
            />
            {producto.fotos.length > 1 && (
              <ul className="mt-3 grid grid-cols-4 gap-3">
                {producto.fotos.slice(1, 5).map((f) => (
                  <li key={f.id} className="relative aspect-square overflow-hidden rounded-[24px] bg-salvia">
                    <Image src={f.url} alt={f.textoAlt} fill sizes="160px" className="object-cover" />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Datos y compra */}
          <div>
            <p className="etiqueta text-eucalipto">
              {producto.categoria.nombre} · {producto.marca}
            </p>
            <h1 className="titular mt-4 text-[clamp(40px,4.4vw,64px)] text-carbon">{producto.nombre}</h1>
            <p className="mt-3 text-[16px] text-bruma">{producto.modelo}</p>
            <p className="mt-6 max-w-[520px] text-[18px] leading-[1.55] text-pizarra">{producto.descripcion}</p>

            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-escarcha px-4 py-2 text-[14px] text-bosque">
              <span className={`size-2 rounded-full ${disponibles ? "bg-turquesa" : "bg-[#c0392b]"}`} />
              {disponibles
                ? `${disponibles} disponible${disponibles === 1 ? "" : "s"} en ${disponibilidad.filter((d) => d.disponibles > 0).length} punto(s)`
                : "Agotado por ahora"}
            </p>

            <div className="mt-10 rounded-tarjeta border border-carbon/10 p-6 sm:p-8">
              <PanelReserva
                producto={{
                  id: producto.id,
                  slug: producto.slug,
                  nombre: producto.nombre,
                  precioVenta: producto.precioVenta,
                  tarifaAlquilerDia: producto.tarifaAlquilerDia,
                }}
                disponibilidad={disponibilidad}
                haySesion={Boolean(perfil)}
                modoInicial={modo === "alquilar" ? "alquilar" : "comprar"}
                hoy={hoyEnColombia()}
                maxFecha={hoyEnColombia(MAX_ANTICIPACION_DIAS)}
                costoDomicilio={COSTO_DOMICILIO}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ficha técnica, en verde salvia como la landing */}
      {producto.especificaciones.length > 0 && (
        <section className="mt-[120px] bg-salvia px-5 py-[100px]">
          <div className="mx-auto max-w-[1164px]">
            <p className="etiqueta text-center text-carbon/70">Ficha técnica</p>
            <h2 className="mx-auto mt-4 max-w-[692px] text-center text-[clamp(26px,2.5vw,36px)] leading-[1.2] text-carbon">
              Lo que trae tu <span className="text-eucalipto">{producto.nombre}</span>
            </h2>
            <dl className="mt-14 grid gap-px overflow-hidden rounded-tarjeta bg-carbon/10 sm:grid-cols-2 lg:grid-cols-3">
              {producto.especificaciones.map((e) => (
                <div key={e.etiqueta} className="bg-escarcha px-7 py-6">
                  <dt className="etiqueta text-bruma">{e.etiqueta}</dt>
                  <dd className="mt-2 text-[22px] leading-tight text-carbon">{e.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Dónde está */}
      <section className="contenedor mt-[100px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <p className="etiqueta text-carbon/70">Dónde lo encuentras</p>
            <h2 className="mt-4 text-[clamp(26px,2.5vw,36px)] leading-[1.2] text-carbon">
              Tres puntos en el área metropolitana, <span className="text-eucalipto">o a tu puerta</span>.
            </h2>
          </div>
          <ul className="grid gap-3 sm:grid-cols-3">
            {disponibilidad.map(({ punto, disponibles: n }) => (
              <li key={punto.id} className="rounded-[28px] bg-escarcha p-6">
                <Icono nombre="punto" className="size-6 text-eucalipto" />
                <p className="mt-4 text-[18px] text-carbon">{punto.nombre.replace("MoviGo ", "")}</p>
                <p className="mt-1 text-[13px] text-pizarra">{punto.direccion}</p>
                <p className="mt-4 text-[32px] leading-none tracking-[-0.02em] text-carbon">{n}</p>
                <p className="mt-1 text-[13px] text-pizarra">disponible{n === 1 ? "" : "s"}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {otros.length > 0 && (
        <section className="contenedor mt-[120px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-[clamp(28px,3vw,40px)] leading-[1.1] text-carbon">También te puede gustar</h2>
            <EnlaceFlecha href={`/catalogo?categoria=${producto.categoria.slug}`}>Ver todos</EnlaceFlecha>
          </div>
          <ul className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {otros.map((p) => (
              <li key={p.id}>
                <TarjetaProducto producto={p} disponibles={conteos[p.id]?.disponibles ?? 0} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
