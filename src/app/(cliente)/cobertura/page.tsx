import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { barrios } from "@/compartido/utilidades/barrios";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { obtenerPuntos } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { MapaFlota } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaFlota";
import { COSTO_DOMICILIO } from "@/modulos/gestion-servicios/servidor/domicilios/servicio";
import { Esqueleto } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Zonas de cobertura · MoviGo" };

const ciudades = [...new Set(barrios.map((b) => b.ciudad))].map((ciudad) => ({
  ciudad,
  barrios: barrios.filter((b) => b.ciudad === ciudad).map((b) => b.nombre),
}));

const pasos = [
  ["Elige “a domicilio”", "En el carrito o al alquilar, escoge tu dirección y el barrio."],
  ["Sale del punto más cercano", "Un domiciliario de MoviGo recoge tu vehículo en el punto que lo tiene."],
  ["Síguelo en el mapa", "Desde tu cuenta ves por dónde va, en vivo, hasta tu puerta."],
];

export default function PaginaCobertura() {
  return (
    <main className="bg-blanco pb-[120px] text-carbon">
      <header className="contenedor pt-[130px] md:pt-[170px]">
        <p className="etiqueta text-carbon/70">Zonas de cobertura</p>
        <h1 className="titular mt-6 max-w-[980px] text-[clamp(44px,6.4vw,96px)]">
          Te lo llevamos a <span className="text-eucalipto">toda el área metropolitana</span>
        </h1>
        <div className="mt-8 grid gap-6 border-b border-carbon/10 pb-12 md:grid-cols-[1fr_auto] md:items-end">
          <p className="max-w-[620px] text-[18px] leading-[1.55] text-pizarra">
            Bucaramanga, Floridablanca, Girón y Piedecuesta. Recoge en un punto MoviGo o pídelo a domicilio por un valor fijo.
          </p>
          <dl className="flex gap-10">
            <div>
              <dt className="text-[13px] text-pizarra">Municipios</dt>
              <dd className="titular mt-1 text-[44px]">{ciudades.length}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-pizarra">Barrios</dt>
              <dd className="titular mt-1 text-[44px]">{barrios.length}</dd>
            </div>
            <div>
              <dt className="text-[13px] text-pizarra">Domicilio</dt>
              <dd className="titular mt-1 text-[44px]">{formatoPesos.format(COSTO_DOMICILIO)}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="px-3 pt-12 md:px-5">
        <Suspense fallback={<Esqueleto className="h-[560px] rounded-tarjeta" />}>
          <MapaYPuntos />
        </Suspense>
      </section>

      <section className="contenedor py-[100px]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="etiqueta text-carbon/70">Dónde entregamos</p>
            <h2 className="titular mt-4 text-[clamp(36px,4vw,60px)]">Barrios con domicilio</h2>
          </div>
          <p className="max-w-[380px] text-[16px] text-pizarra">
            ¿Tu barrio no está? Escríbenos: estamos sumando zonas cada mes.
          </p>
        </div>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ciudades.map((c) => (
            <li key={c.ciudad} className="rounded-[30px] bg-escarcha p-7">
              <p className="text-[24px]">{c.ciudad}</p>
              <p className="mt-1 text-[13px] text-pizarra">
                {c.barrios.length} barrio{c.barrios.length === 1 ? "" : "s"}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {c.barrios.map((b) => (
                  <li key={b} className="rounded-full bg-blanco px-3.5 py-2 text-[14px]">
                    {b}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="px-3 md:px-5">
        <div className="rounded-tarjeta bg-salvia px-6 py-16 sm:px-12 md:py-20">
          <div className="mx-auto max-w-[1164px]">
            <p className="etiqueta text-bosque">Cómo funciona</p>
            <h2 className="titular mt-4 max-w-[700px] text-[clamp(36px,4vw,60px)]">
              Un valor fijo de {formatoPesos.format(COSTO_DOMICILIO)}, a cualquier barrio de la lista.
            </h2>
            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {pasos.map(([t, d], i) => (
                <li key={t} className="border-t border-carbon/15 pt-6">
                  <p className="font-mono text-[14px] text-bosque">0{i + 1}</p>
                  <h3 className="mt-3 text-[24px]">{t}</h3>
                  <p className="mt-2 text-[16px] leading-relaxed text-pizarra">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-12 flex flex-wrap gap-3">
              <Boton href="/catalogo">Ver catálogo</Boton>
              <Boton href="/contacto" variante="secundario">
                Escríbenos
              </Boton>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

async function MapaYPuntos() {
  await connection();
  const puntos = await obtenerPuntos();

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <div className="relative isolate h-[460px] overflow-hidden rounded-tarjeta bg-escarcha sm:rounded-bl-none md:h-[620px]">
        <div className="absolute inset-0">
          <MapaFlota
            puntos={puntos.map((p) => ({ nombre: p.nombre, latitud: p.latitud, longitud: p.longitud }))}
            entregas={barrios.map((b) => ({
              id: b.nombre,
              enRuta: false,
              titulo: b.nombre,
              destino: { latitud: b.latitud, longitud: b.longitud, direccion: b.ciudad },
            }))}
            className="h-full"
          />
        </div>
        <Muesca lado="izquierda" fondo="var(--color-blanco)" className="z-[500] pr-[18px] pt-4 max-sm:hidden">
          <Leyenda />
        </Muesca>
      </div>
      <div className="px-2 sm:hidden">
        <Leyenda />
      </div>

      <div className="flex flex-col gap-4">
        {puntos.map((p, i) => (
          <article key={p.id} className={`flex flex-1 flex-col justify-between rounded-tarjeta p-7 ${i === 0 ? "bg-bosque text-blanco" : "bg-escarcha"}`}>
            <div>
              <p className={`etiqueta ${i === 0 ? "text-turquesa" : "text-bosque"}`}>Punto MoviGo</p>
              <h2 className="mt-3 text-[28px] leading-tight">{p.nombre.replace("MoviGo ", "")}</h2>
              <p className={`mt-2 text-[15px] ${i === 0 ? "text-blanco/75" : "text-pizarra"}`}>{p.direccion}</p>
              <p className={`mt-1 text-[15px] ${i === 0 ? "text-blanco/75" : "text-pizarra"}`}>{p.horario}</p>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${p.latitud},${p.longitud}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group mt-6 inline-flex items-center gap-2 text-[12px] font-bold uppercase ${i === 0 ? "text-blanco" : "text-carbon"}`}
            >
              Cómo llegar
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                ›
              </span>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

function Leyenda() {
  return (
    <div className="flex flex-wrap items-center gap-5 rounded-[18px] px-1 text-[13px] text-carbon">
      <span className="flex items-center gap-2">
        <i className="grid size-6 place-items-center rounded-full border-2 border-blanco bg-bosque text-[10px] font-bold not-italic text-blanco shadow">M</i>
        Punto MoviGo
      </span>
      <span className="flex items-center gap-2">
        <i className="size-3 rounded-full border-2 border-blanco bg-turquesa shadow" />
        Barrio con domicilio
      </span>
    </div>
  );
}
