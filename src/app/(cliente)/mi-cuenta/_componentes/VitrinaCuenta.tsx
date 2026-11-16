"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EscenaScroll } from "@/compartido/interfaz/animaciones/EscenaScroll";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { FotoOVehiculo } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/FotoOVehiculo";
import { IconoProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/IconoProducto";
import type { Foto } from "@/modulos/gestion-catalogo/tipos";

export type CategoriaVitrina = {
  slug: string;
  nombre: string;
  /** Nombre corto para la pastilla */
  corto: string;
  total: number;
  desdeVenta: number | null;
  desdeAlquiler: number | null;
  /** Foto sin fondo de un producto de la categoría (si no hay, el dibujo) */
  foto: Foto | null;
};

export type ElementoEnCurso = {
  categoria: string;
  foto: Foto | null;
  titulo: string;
  detalle: string;
  href: string;
};

const DURACION = 4500;

/**
 * Inicio de la cuenta: vitrina a pantalla completa que rota por todas las
 * categorías del catálogo. Al bajar, el escenario se encoge a la derecha y
 * a la izquierda aparece el saludo con lo que la persona tiene en curso.
 */
export function VitrinaCuenta({
  nombre,
  categorias,
  enCurso,
  aviso,
}: {
  nombre: string;
  categorias: CategoriaVitrina[];
  enCurso: ElementoEnCurso[];
  /** Pastilla de arriba (por ejemplo, el pedido que va en camino) */
  aviso: { texto: string; href: string } | null;
}) {
  const [indice, setIndice] = useState(0);
  const [saliendo, setSaliendo] = useState(false);
  const [mostrado, setMostrado] = useState(0);
  const [pausado, setPausado] = useState(false);

  // Rota sola (salvo que la persona pida menos movimiento)
  useEffect(() => {
    if (pausado || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const reloj = setTimeout(() => ir((indice + 1) % categorias.length), DURACION);
    return () => clearTimeout(reloj);
  }, [indice, pausado, categorias.length]);

  function ir(i: number) {
    setIndice(i);
    setSaliendo(true);
    // Primero sale el vehículo anterior, luego entra el nuevo
    setTimeout(() => {
      setMostrado(i);
      setSaliendo(false);
    }, 430);
  }

  const c = categorias[mostrado];
  if (!c) return null;

  const resumen = [
    `${c.total} modelo${c.total === 1 ? "" : "s"}`,
    c.desdeVenta !== null ? `desde ${formatoPesos.format(c.desdeVenta)}` : null,
    c.desdeAlquiler !== null ? `alquiler desde ${formatoPesos.format(c.desdeAlquiler)} por día` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const panelSaludo = (
    <>
      <p className="etiqueta text-eucalipto">Mi cuenta</p>
      <h2 className="titular mt-4 text-[clamp(40px,3.6vw,56px)] text-carbon">
        Hola, {nombre}. {enCurso.length ? "Esto es lo que tienes en movimiento." : "¿A dónde vamos hoy?"}
      </h2>
      {enCurso.length > 0 ? (
        <ul className="mt-8 border-b border-carbon/10">
          {enCurso.map((e) => (
            <li key={e.href} className="border-t border-carbon/10">
              <Link href={e.href} className="group grid grid-cols-[52px_1fr_auto] items-center gap-4 py-4">
                <span className="grid size-[52px] place-items-center rounded-[15px] bg-escarcha">
                  <IconoProducto foto={e.foto} categoria={e.categoria} className="w-[42px]" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[17px] text-carbon">{e.titulo}</span>
                  <span className="block truncate text-[13px] text-bruma">{e.detalle}</span>
                </span>
                <span className="grid size-9 place-items-center rounded-[11px] bg-turquesa text-[15px] transition-transform duration-500 ease-salida group-hover:translate-x-1.5">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8">
          <Boton href="/catalogo">Ver el catálogo</Boton>
        </div>
      )}
    </>
  );

  return (
    <>
      <EscenaScroll className="h-svh md:h-[260vh]" classNamePin="bg-blanco" data-seccion="Inicio" data-cabecera-clara="">
        {/* Saludo (aparece a la izquierda al bajar; solo en pantallas grandes) */}
        <div className="escena-lado absolute left-[6vw] top-1/2 hidden w-[36vw] md:block">{panelSaludo}</div>

        <Escenario className="escena-encoge absolute inset-0">
          <div className="escena-vehiculo absolute left-1/2 top-[44%] w-[min(820px,86vw)] md:top-[42%] md:w-[min(820px,60vw)]">
            <FotoOVehiculo
              key={mostrado}
              foto={c.foto}
              categoria={c.slug}
              titulo={c.nombre}
              prioridad={mostrado === 0}
              tamanos="(min-width: 768px) 60vw, 86vw"
              className={`block w-full ${saliendo ? "vehiculo-sale" : "vehiculo-entra"}`}
            />
          </div>

          {/* Saludo corto y aviso en vivo */}
          <div className="escena-desvanece absolute left-5 top-[100px] z-10 flex items-center gap-3 rounded-[16px] bg-blanco py-2 pl-4 pr-2 text-[14px] text-carbon shadow-[0_8px_30px_rgb(0_0_0/0.18)] md:left-10 md:top-[108px]">
            <span>
              Hola, <b className="font-semibold">{nombre}</b>
            </span>
            {aviso && (
              <Link
                href={aviso.href}
                className="flex items-center gap-2 rounded-[11px] bg-escarcha px-3 py-2 text-[12px] font-bold uppercase"
              >
                <span className="punto-vivo" />
                {aviso.texto} ›
              </Link>
            )}
          </div>
          <p className="escena-desvanece absolute right-10 top-[112px] hidden font-mono text-[13px] text-blanco/60 md:block">
            {String(indice + 1).padStart(2, "0")} / {String(categorias.length).padStart(2, "0")}
          </p>

          {/* Categoría que se está mostrando */}
          <div className="escena-desvanece absolute bottom-[96px] left-5 max-w-[560px] text-blanco md:bottom-10 md:left-10">
            <div className={`transition-[opacity,transform] duration-500 ease-salida ${saliendo ? "translate-y-3 opacity-0" : ""}`}>
              <p className="etiqueta text-turquesa">Catálogo MoviGo</p>
              <h1 className="titular mt-3 text-[clamp(44px,6vw,76px)]">{c.nombre}</h1>
              <p className="mt-3 text-[16px] text-blanco/70 md:text-[18px]">{resumen}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Boton href={`/catalogo?categoria=${c.slug}`}>Ver {c.nombre.toLowerCase()}</Boton>
              {c.desdeAlquiler !== null && (
                <Link
                  href={`/catalogo?categoria=${c.slug}&modo=alquilar`}
                  className="inline-flex h-[50px] items-center rounded-boton bg-blanco/12 px-[22px] text-[12px] font-bold uppercase text-blanco backdrop-blur transition-colors hover:bg-blanco/22"
                >
                  Alquilar por días
                </Link>
              )}
            </div>
          </div>

          {/* Pastillas de categorías en la muesca */}
          <Muesca lado="derecha" className="escena-desvanece max-w-[calc(100%-20px)] overflow-x-auto pl-[18px] pt-4">
            <div
              role="tablist"
              aria-label="Categorías"
              className="flex gap-1"
              onMouseEnter={() => setPausado(true)}
              onMouseLeave={() => setPausado(false)}
            >
              {categorias.map((cat, i) => (
                <button
                  key={`${cat.slug}-${i === indice ? indice : "x"}`}
                  role="tab"
                  type="button"
                  aria-selected={i === indice}
                  onClick={() => ir(i)}
                  className={`h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[11px] font-bold uppercase transition-colors ${
                    i === indice ? "pastilla-avanza bg-bosque text-blanco" : "text-carbon hover:bg-escarcha"
                  }`}
                  style={{ ["--duracion" as string]: `${DURACION}ms` }}
                >
                  {cat.corto}
                </button>
              ))}
            </div>
          </Muesca>
        </Escenario>
      </EscenaScroll>

      {/* En celular el saludo va debajo de la vitrina */}
      <div className="contenedor py-14 md:hidden">{panelSaludo}</div>
    </>
  );
}
