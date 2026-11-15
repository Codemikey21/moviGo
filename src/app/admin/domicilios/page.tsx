import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { formatoFechaHora, formatoPesos } from "@/compartido/utilidades/formato";
import { obtenerPuntos } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { EstadoDomicilio } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/EstadoDomicilio";
import { GestionDomicilio } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/GestionDomicilio";
import { MapaFlota } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaFlota";
import { listarDomiciliariosAdmin, listarDomiciliosAdmin } from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import { EncabezadoAdmin } from "../_componentes/EncabezadoAdmin";

export const metadata: Metadata = { title: "Domicilios · Administración MoviGo" };

export default function PaginaDomiciliosAdmin() {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<p className="pt-16 text-pizarra">Cargando domicilios…</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  await connection();
  const [domicilios, domiciliarios, puntos] = await Promise.all([listarDomiciliosAdmin(), listarDomiciliariosAdmin(), obtenerPuntos()]);
  const activos = domicilios.filter((d) => ["SOLICITADO", "ASIGNADO", "EN_CURSO"].includes(d.estado));
  const entregados = domicilios.filter((d) => d.estado === "COMPLETADO").slice(0, 6);

  return (
    <>
      <EncabezadoAdmin
        etiqueta="Logística"
        titulo={
          <>
            Domicilios <span className="text-eucalipto">en vivo</span>
          </>
        }
        descripcion="Asigna un domiciliario, márcalo en ruta y el cliente lo sigue en su mapa hasta que lo entregue."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="relative overflow-hidden rounded-tarjeta bg-blanco">
          <MapaFlota
            puntos={puntos.map((p) => ({ nombre: p.nombre, latitud: p.latitud, longitud: p.longitud }))}
            entregas={activos.map((d) => ({
              id: d.id,
              enRuta: d.estado === "EN_CURSO",
              destino: d.destino,
              titulo: d.pedidoNumero ? `Pedido ${d.pedidoNumero}` : "Alquiler",
            }))}
            className="h-[460px] xl:h-full xl:min-h-[620px]"
          />
          <div className="pointer-events-none absolute left-4 top-4 z-[500] flex flex-wrap gap-2">
            {[
              ["mapa-origen", "Punto MoviGo"],
              ["mapa-destino", "Destino"],
              ["mapa-moto", "En ruta"],
            ].map(([clase, texto]) => (
              <span key={texto} className="flex items-center gap-2 rounded-full bg-blanco px-3 py-1.5 text-[12px] text-carbon shadow-[0_2px_12px_rgba(13,18,18,0.12)]">
                <span className={`mapa-punto ${clase} size-3.5! border-0! shadow-none!`} /> {texto}
              </span>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Por asignar", activos.filter((d) => d.estado === "SOLICITADO" && d.listoParaDespachar).length],
              ["Asignados", activos.filter((d) => d.estado === "ASIGNADO").length],
              ["En ruta", activos.filter((d) => d.estado === "EN_CURSO").length],
            ].map(([t, n]) => (
              <div key={t} className="rounded-[24px] bg-blanco p-5">
                <p className="text-[36px] leading-none tracking-[-0.02em] text-carbon">{n}</p>
                <p className="mt-2 text-[13px] text-pizarra">{t}</p>
              </div>
            ))}
          </div>

          {activos.length === 0 && (
            <p className="rounded-tarjeta bg-blanco px-6 py-12 text-center text-[17px] text-pizarra">No hay domicilios activos.</p>
          )}
          {activos.map((d) => (
            <article key={d.id} className="rounded-[28px] bg-blanco p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="etiqueta text-eucalipto">
                    {d.pedidoNumero ? (
                      <Link href={`/admin/pedidos/${d.pedidoNumero}`}>Pedido {d.pedidoNumero}</Link>
                    ) : (
                      "Alquiler a domicilio"
                    )}
                  </p>
                  <p className="mt-2 text-[17px] text-carbon">{d.cliente.nombre}</p>
                  <p className="text-[13px] text-pizarra">{d.descripcion}</p>
                </div>
                <EstadoDomicilio estado={d.estado} />
              </div>
              <p className="mt-4 flex items-center gap-2 text-[14px] text-pizarra">
                <Icono nombre="punto" className="size-4 text-eucalipto" />
                {d.origen.nombre.replace("MoviGo ", "")} → {d.destino.direccion}, {d.destino.barrio}
              </p>
              <div className="mt-4">
                <GestionDomicilio domicilio={d} domiciliarios={domiciliarios} />
              </div>
            </article>
          ))}

          {entregados.length > 0 && (
            <div className="rounded-[28px] bg-blanco p-6">
              <p className="etiqueta text-carbon/70">Entregados hace poco</p>
              <ul className="mt-3 divide-y divide-carbon/[0.07]">
                {entregados.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-3 text-[14px]">
                    <span className="truncate text-carbon">
                      {d.cliente.nombre} · {d.destino.barrio}
                    </span>
                    <span className="shrink-0 text-pizarra">
                      {d.entregadoEn ? formatoFechaHora.format(d.entregadoEn) : ""} · {formatoPesos.format(d.costo)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      {/* Domiciliarios */}
      <section className="mt-4 rounded-tarjeta bg-blanco p-6 sm:p-8">
        <p className="etiqueta text-carbon/70">Equipo</p>
        <h2 className="mt-3 text-[28px] text-carbon">Domiciliarios</h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {domiciliarios.map((d) => (
            <li key={d.id} className="flex items-center gap-4 rounded-[22px] bg-escarcha p-4">
              <span className="grid size-12 place-items-center rounded-full bg-carbon text-[14px] font-semibold text-turquesa">
                {d.nombre
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <div>
                <p className="text-[16px] text-carbon">{d.nombre}</p>
                <p className="text-[13px] text-pizarra">
                  {d.vehiculo} · {d.enCurso ? `${d.enCurso} en curso` : "Libre"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
