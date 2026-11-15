import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { LineaTiempo, type Paso } from "@/compartido/interfaz/ui/LineaTiempo";
import { formatoFechaHora } from "@/compartido/utilidades/formato";
import { EstadoDomicilio } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/EstadoDomicilio";
import { MapaSeguimiento } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaSeguimiento";
import { BotonesEntrega } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/BotonesEntrega";
import { CompartirUbicacion } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/CompartirUbicacion";
import { FormularioEntrega } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/FormularioEntrega";
import { kilometros } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/TarjetaEntrega";
import { obtenerSeguimiento } from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import { obtenerEntregaReparto } from "@/modulos/gestion-servicios/servidor/reparto/acciones";
import type { Coordenada, EntregaReparto } from "@/modulos/gestion-servicios/tipos";

export const metadata: Metadata = { title: "Entrega · Reparto MoviGo" };

export default function PaginaEntregaReparto({ params }: PageProps<"/domiciliario/entregas/[id]">) {
  return (
    <main className="mx-auto max-w-[1180px] px-3 pb-24 pt-6 md:px-5">
      <Suspense fallback={<div className="h-[560px] animate-pulse rounded-tarjeta bg-carbon/10" />}>
        <Contenido params={params} />
      </Suspense>
    </main>
  );
}

function pasos(e: EntregaReparto): Paso[] {
  const aceptada = Boolean(e.aceptadoEn);
  return [
    { titulo: "Aceptada", detalle: e.aceptadoEn ? formatoFechaHora.format(e.aceptadoEn) : "Esperando tu respuesta", estado: aceptada ? "hecho" : "actual" },
    {
      titulo: "En ruta",
      detalle: e.estado === "EN_CURSO" ? "Llévala al cliente" : aceptada && e.estado === "ASIGNADO" ? "Recógela en el punto" : undefined,
      estado: e.estado === "COMPLETADO" ? "hecho" : e.estado === "EN_CURSO" || aceptada ? "actual" : "pendiente",
    },
    {
      titulo: "Entregada",
      detalle: e.entregadoEn ? formatoFechaHora.format(e.entregadoEn) : "Con el código del cliente",
      estado: e.estado === "COMPLETADO" ? "hecho" : "pendiente",
    },
  ];
}

const enlaceGoogle = (c: Coordenada) => `https://www.google.com/maps/dir/?api=1&destination=${c.latitud},${c.longitud}&travelmode=driving`;
const enlaceWaze = (c: Coordenada) => `https://waze.com/ul?ll=${c.latitud},${c.longitud}&navigate=yes`;

async function Contenido({ params }: Pick<PageProps<"/domiciliario/entregas/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const e = await obtenerEntregaReparto(id);
  if (!e) notFound();
  const seguimiento = await obtenerSeguimiento(e.id);

  const enRuta = e.estado === "EN_CURSO";
  const terminada = e.estado === "COMPLETADO" || e.estado === "CANCELADO";
  const rumbo = enRuta ? e.destino : e.origen;
  const telefono = e.cliente.telefono?.replace(/\D/g, "");

  const titulo =
    e.estado === "COMPLETADO"
      ? "Entregada"
      : e.estado === "CANCELADO"
        ? "Cancelada"
        : enRuta
          ? `Rumbo a ${e.destino.barrio ?? "la entrega"}`
          : `Recoge en ${e.origen.nombre.replace("MoviGo ", "")}`;

  return (
    <>
      <Link href="/domiciliario" className="inline-flex items-center gap-2 text-[12px] font-bold uppercase text-bosque">
        <span aria-hidden>‹</span> Entregas
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="etiqueta text-carbon/70">{e.pedidoNumero ? `Pedido ${e.pedidoNumero}` : "Alquiler a domicilio"}</p>
          <h1 className="titular mt-3 text-[clamp(36px,5vw,64px)] text-carbon">{titulo}</h1>
        </div>
        <EstadoDomicilio estado={e.estado} />
      </div>

      <div className="mt-6 rounded-tarjeta bg-blanco px-6 py-6 sm:px-8">
        <LineaTiempo pasos={pasos(e)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Mapa y navegación */}
        <section className="self-start overflow-hidden rounded-tarjeta bg-blanco">
          <MapaSeguimiento
            key={e.estado}
            domicilioId={e.id}
            origen={{ ...e.origen }}
            destino={{ ...e.destino }}
            inicial={seguimiento}
            modo="domiciliario"
            className="h-[48vh] min-h-[340px] lg:h-[560px]"
          />
          {!terminada && (
            <div className="flex flex-wrap items-center gap-3 p-5">
              <p className="mr-auto text-[14px] text-pizarra">
                {enRuta ? "Navega hasta el cliente" : "Navega hasta el punto"} · {kilometros(e.distancia)} del punto al cliente
              </p>
              <a
                href={enlaceGoogle(rumbo)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center rounded-full bg-carbon px-5 text-[12px] font-bold uppercase text-blanco"
              >
                Google Maps
              </a>
              <a
                href={enlaceWaze(rumbo)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 items-center rounded-full bg-escarcha px-5 text-[12px] font-bold uppercase text-carbon"
              >
                Waze
              </a>
            </div>
          )}
        </section>

        <div className="flex flex-col gap-4">
          {/* Lo que toca hacer ahora */}
          <Tarjeta etiqueta="Ahora">
            {e.estado === "ASIGNADO" && !e.aceptadoEn && (
              <>
                <p className="mb-5 text-[16px] leading-relaxed text-pizarra">
                  Te asignaron esta entrega. Acéptala para que el cliente sepa quién va, o devuélvela si no puedes.
                </p>
                <BotonesEntrega domicilioId={e.id} acciones={["aceptar", "rechazar"]} ancho />
              </>
            )}
            {e.estado === "ASIGNADO" && e.aceptadoEn && (
              <>
                <p className="mb-5 text-[16px] leading-relaxed text-pizarra">
                  Ve a <b className="font-medium text-carbon">{e.origen.nombre}</b> y recoge el paquete.
                  {e.pedidoNumero ? (
                    <>
                      {" "}
                      Muestra el número <b className="font-mono font-medium text-carbon">{e.pedidoNumero}</b>.
                    </>
                  ) : (
                    " Di que vienes por un alquiler a domicilio."
                  )}
                </p>
                <BotonesEntrega domicilioId={e.id} acciones={["salir"]} ancho />
              </>
            )}
            {enRuta && (
              <div className="space-y-5">
                <CompartirUbicacion domicilioId={e.id} />
                <FormularioEntrega domicilioId={e.id} />
              </div>
            )}
            {e.estado === "COMPLETADO" && (
              <div>
                <p className="text-[16px] text-pizarra">
                  Entregada {e.entregadoEn ? `el ${formatoFechaHora.format(e.entregadoEn)}` : ""}
                  {e.evidencia?.nombreReceptor ? ` a ${e.evidencia.nombreReceptor}` : ""}.
                </p>
                {e.evidencia?.url && (
                  // eslint-disable-next-line @next/next/no-img-element -- enlace firmado temporal del bucket privado
                  <img src={e.evidencia.url} alt="Foto de la entrega" className="mt-5 aspect-[4/3] w-full rounded-[22px] object-cover" />
                )}
              </div>
            )}
            {e.estado === "CANCELADO" && <p className="text-[16px] text-pizarra">Esta entrega se canceló. No tienes que hacer nada.</p>}
          </Tarjeta>

          {/* Cliente y destino */}
          <Tarjeta etiqueta="Cliente">
            <p className="text-[20px] text-carbon">{e.cliente.nombre}</p>
            <p className="mt-1 text-[15px] text-pizarra">
              {e.destino.direccion}
              {e.destino.barrio ? `, ${e.destino.barrio}` : ""}
            </p>
            {e.destino.indicaciones && <p className="mt-1 text-[15px] text-pizarra">Indicaciones: {e.destino.indicaciones}</p>}
            {telefono && !terminada && (
              <div className="mt-5 flex gap-2">
                <a href={`tel:+57${telefono}`} className="flex h-11 flex-1 items-center justify-center rounded-full bg-escarcha text-[12px] font-bold uppercase text-carbon">
                  Llamar
                </a>
                <a
                  href={`https://wa.me/57${telefono}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 flex-1 items-center justify-center rounded-full bg-escarcha text-[12px] font-bold uppercase text-carbon"
                >
                  WhatsApp
                </a>
              </div>
            )}
          </Tarjeta>

          <Tarjeta etiqueta="Recoge en">
            <p className="text-[20px] text-carbon">{e.origen.nombre}</p>
            <p className="mt-1 text-[15px] text-pizarra">{e.origen.direccion}</p>
            <p className="mt-3 text-[15px] text-carbon">{e.descripcion}</p>
          </Tarjeta>
        </div>
      </div>
    </>
  );
}

function Tarjeta({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <section className="rounded-tarjeta bg-blanco p-6 sm:p-7">
      <p className="etiqueta mb-4 text-eucalipto">{etiqueta}</p>
      {children}
    </section>
  );
}
