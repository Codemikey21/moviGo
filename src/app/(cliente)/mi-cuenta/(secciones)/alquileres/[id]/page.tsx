import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { LineaTiempo, type Paso } from "@/compartido/interfaz/ui/LineaTiempo";
import { formatoDia, formatoFechaLarga, formatoPesos, hoyEnColombia } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { PortadaServicio } from "../../../_componentes/PortadaServicio";
import { EstadoAlquiler } from "@/modulos/gestion-servicios/interfaz/componentes/alquiler/EstadoAlquiler";
import { CodigoEntrega } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/CodigoEntrega";
import { MapaSeguimiento } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaSeguimiento";
import { cancelarMiAlquilerAccion, obtenerMiAlquiler } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";
import { obtenerDomicilio, obtenerSeguimiento } from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import type { AlquilerVista } from "@/modulos/gestion-servicios/tipos";

export const metadata: Metadata = { title: "Mi alquiler · MoviGo" };

export default function PaginaAlquiler({ params }: PageProps<"/mi-cuenta/alquileres/[id]">) {
  return (
    <div className="contenedor">
      <Suspense fallback={<p className="mt-10 text-pizarra">Cargando tu alquiler…</p>}>
        <Contenido params={params} />
      </Suspense>
    </div>
  );
}

function pasos(a: AlquilerVista, enCamino: boolean): Paso[] {
  const orden = ["SOLICITADO", "ASIGNADO", "EN_CURSO", "COMPLETADO"];
  const nivel = orden.indexOf(a.estado);
  const recibir = a.entrega === "EN_PUNTO" ? "Lo recoges" : enCamino ? "Va en camino" : "Te lo llevamos";
  return [
    { titulo: "Reservado", estado: "hecho" },
    { titulo: "Pagado", detalle: nivel >= 1 ? "Unidad apartada" : "Esperando pago", estado: nivel >= 1 ? "hecho" : "actual" },
    { titulo: recibir, detalle: formatoFechaLarga.format(a.fechaInicio), estado: nivel >= 2 ? "hecho" : nivel === 1 ? "actual" : "pendiente" },
    { titulo: "Lo devuelves", detalle: formatoFechaLarga.format(a.fechaFin), estado: nivel >= 3 ? "hecho" : nivel === 2 ? "actual" : "pendiente" },
  ];
}

/** Días que faltan para devolverlo (en hora de Colombia). */
function diasParaDevolver(a: AlquilerVista) {
  const hoy = new Date(`${hoyEnColombia()}T00:00:00Z`).getTime();
  const fin = new Date(`${a.fechaFin.toISOString().slice(0, 10)}T00:00:00Z`).getTime();
  return Math.round((fin - hoy) / 86_400_000);
}

function detalleAlquiler(a: AlquilerVista) {
  if (a.estado === "SOLICITADO") return "Completa el pago para apartar la unidad.";
  if (a.estado === "ASIGNADO") return a.entrega === "EN_PUNTO" ? `Recógelo en ${a.punto?.nombre ?? "tu punto"} con tu código.` : "Te avisamos cuando salga hacia tu casa.";
  if (a.estado === "EN_CURSO") {
    const dias = diasParaDevolver(a);
    return dias > 1 ? `Te quedan ${dias} días. Devuélvelo a tiempo para no pagar un día extra.` : dias === 1 ? "Mañana es el último día: devuélvelo a tiempo." : dias === 0 ? "Hoy es el día de devolverlo." : "Ya pasó la fecha de devolución: cada día extra se cobra.";
  }
  if (a.estado === "COMPLETADO") return "Gracias por rodar con MoviGo. ¿Te gustó? También lo vendemos.";
  return "Este alquiler se canceló.";
}

/** Dato corto de la pestaña de la portada. */
function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <span className="leading-tight">
      <span className="block text-[12px] text-pizarra">{titulo}</span>
      <span className="text-[17px] tabular-nums">{valor}</span>
    </span>
  );
}

async function Contenido({ params }: Pick<PageProps<"/mi-cuenta/alquileres/[id]">, "params">) {
  await connection();
  const { id } = await params;
  const alquiler = await obtenerMiAlquiler(id);
  if (!alquiler) notFound();

  // Alquileres y domicilios: la página junta los dos
  const domicilio = alquiler.entrega === "A_DOMICILIO" ? await obtenerDomicilio({ alquilerId: alquiler.id }) : null;
  const seguimiento = domicilio ? await obtenerSeguimiento(domicilio.id) : null;
  const enCamino = domicilio?.estado === "EN_CURSO";
  const titulo = enCamino ? "Va en camino" : {
    SOLICITADO: "Falta el pago",
    ASIGNADO: alquiler.entrega === "EN_PUNTO" ? "Todo listo para recogerlo" : "Todo listo para llevártelo",
    EN_CURSO: "¡A rodar!",
    COMPLETADO: "Alquiler terminado",
    CANCELADO: "Alquiler cancelado",
  }[alquiler.estado];

  return (
    <>
      <PortadaServicio
        volver={{ href: "/mi-cuenta/pedidos", texto: "Pedidos y alquileres" }}
        etiqueta={`Alquiler · ${alquiler.producto.marca} ${alquiler.producto.nombre}`}
        titulo={titulo}
        detalle={detalleAlquiler(alquiler)}
        estado={<EstadoAlquiler estado={alquiler.estado} />}
        foto={alquiler.producto.foto}
        categoria={alquiler.producto.categoria}
        accion={alquiler.estado === "SOLICITADO" && alquiler.referenciaPago ? { href: `/pagar/${alquiler.referenciaPago}`, texto: "Pagar ahora" } : undefined}
        muesca={
          <>
            <Dato titulo="Días" valor={String(alquiler.dias)} />
            <Dato titulo="Devolución" valor={formatoDia.format(alquiler.fechaFin)} />
            <Dato titulo="Total" valor={formatoPesos.format(alquiler.total)} />
          </>
        }
      />
      <div className="h-6" />

      {alquiler.estado !== "CANCELADO" && (
        <div className="rounded-tarjeta border border-carbon/10 px-6 py-7 sm:px-8">
          <LineaTiempo pasos={pasos(alquiler, enCamino)} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {/* Código de recogida */}
          {alquiler.entrega === "EN_PUNTO" && ["ASIGNADO", "EN_CURSO"].includes(alquiler.estado) && (
            <div className="relative overflow-hidden rounded-tarjeta bg-bosque p-8 text-blanco sm:p-10">
              <span aria-hidden className="absolute -bottom-20 -right-20 size-64 rounded-full bg-turquesa/15" />
              <p className="etiqueta text-blanco/70">Código de recogida</p>
              <p className="mt-4 font-mono text-[clamp(48px,7vw,84px)] leading-none tracking-[0.12em] text-turquesa">
                {alquiler.codigoRecogida}
              </p>
              <p className="mt-6 text-[17px] text-blanco/85">{alquiler.punto?.nombre}</p>
              <p className="text-[15px] text-blanco/65">
                {alquiler.punto?.direccion} · {alquiler.punto?.horario}
              </p>
            </div>
          )}

          {domicilio && (
            <div className="overflow-hidden rounded-tarjeta bg-escarcha">
              <MapaSeguimiento
                key={domicilio.estado}
                domicilioId={domicilio.id}
                origen={{ ...domicilio.origen }}
                destino={{ ...domicilio.destino }}
                inicial={seguimiento}
                className="h-[420px]"
              />
              <p className="p-6 text-[15px] text-pizarra">
                {domicilio.domiciliario
                  ? `${domicilio.domiciliario.nombre} te lo lleva en ${domicilio.domiciliario.vehiculo.toLowerCase()}.`
                  : "Te avisamos cuando asignemos a tu domiciliario."}{" "}
                Destino: {domicilio.destino.direccion}, {domicilio.destino.barrio}.
              </p>
              <CodigoEntrega codigo={domicilio.codigoEntrega} estado={domicilio.estado} className="mx-6 mb-6" />
            </div>
          )}

          {!domicilio && alquiler.entrega === "EN_PUNTO" && !["ASIGNADO", "EN_CURSO"].includes(alquiler.estado) && (
            <VitrinaProducto
              foto={alquiler.producto.foto}
              categoria={alquiler.producto.categoria}
              tamanos="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[16/9] rounded-tarjeta"
              tamanoDibujo="w-[50%]"
            />
          )}
        </div>

        <aside className="rounded-tarjeta bg-escarcha p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <VitrinaProducto foto={alquiler.producto.foto} categoria={alquiler.producto.categoria} tamanos="80px" className="size-20 shrink-0 rounded-[22px]" />
            <div>
              <Link href={`/producto/${alquiler.producto.slug}`} className="text-[18px] text-carbon">
                {alquiler.producto.marca} {alquiler.producto.nombre}
              </Link>
              <p className="font-mono text-[13px] text-pizarra">{alquiler.unidad.serial}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 border-t border-carbon/10 pt-5 text-[15px]">
            {[
              ["Desde", formatoFechaLarga.format(alquiler.fechaInicio)],
              ["Hasta", formatoFechaLarga.format(alquiler.fechaFin)],
              ["Días", String(alquiler.dias)],
              ["Entrega", alquiler.entrega === "EN_PUNTO" ? `En ${alquiler.punto?.nombre}` : "A domicilio"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4">
                <dt className="text-pizarra">{k}</dt>
                <dd className="text-right text-carbon">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between border-t border-carbon/10 pt-3 text-[22px] text-carbon">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatoPesos.format(alquiler.total)}</dd>
            </div>
          </dl>

          {alquiler.estado === "SOLICITADO" && alquiler.referenciaPago && (
            <div className="mt-6">
              <Boton href={`/pagar/${alquiler.referenciaPago}`} className="w-full">
                Pagar ahora
              </Boton>
            </div>
          )}
          {["SOLICITADO", "ASIGNADO"].includes(alquiler.estado) && !enCamino && (
            <form action={cancelarMiAlquilerAccion} className="mt-3">
              <input type="hidden" name="id" value={alquiler.id} />
              <BotonAccion type="submit" variante="secundario" className="w-full">
                Cancelar alquiler
              </BotonAccion>
            </form>
          )}
          <p className="mt-6 flex items-start gap-2 text-[13px] text-pizarra">
            <Icono nombre="escudo" className="mt-0.5 size-4 text-eucalipto" />
            Casco incluido y batería cargada. Si lo devuelves tarde, se cobra un día más.
          </p>
        </aside>
      </div>
    </>
  );
}
