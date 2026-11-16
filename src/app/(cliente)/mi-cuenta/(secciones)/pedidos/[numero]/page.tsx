import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { LineaTiempo, type Paso } from "@/compartido/interfaz/ui/LineaTiempo";
import { formatoFechaHora, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { PortadaServicio } from "../../../_componentes/PortadaServicio";
import { EstadoPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/EstadoPedido";
import { cancelarMiPedidoAccion, obtenerMiPedido } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import type { PedidoDetalle } from "@/modulos/gestion-pedidos/tipos";
import { EstadoDomicilio } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/EstadoDomicilio";
import { CodigoEntrega } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/CodigoEntrega";
import { MapaSeguimiento } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaSeguimiento";
import { obtenerDomicilio, obtenerSeguimiento } from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import type { DomicilioVista } from "@/modulos/gestion-servicios/tipos";
import { EsqueletoDetalle } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Seguir pedido · MoviGo" };

export default function PaginaPedido({ params }: PageProps<"/mi-cuenta/pedidos/[numero]">) {
  return (
    <div className="contenedor">
      <Suspense fallback={<EsqueletoDetalle etiqueta="Cargando tu pedido…" />}>
        <Contenido params={params} />
      </Suspense>
    </div>
  );
}

/** Pasos del pedido según cómo se entrega. */
function pasos(p: PedidoDetalle, d: DomicilioVista | null): Paso[] {
  const orden = ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO", "ENTREGADO"];
  const nivel = orden.indexOf(p.estado);

  if (p.entrega === "EN_PUNTO") {
    return [
      { titulo: "Pedido creado", detalle: formatoFechaHora.format(p.creadoEn), estado: "hecho" },
      { titulo: "Pagado", detalle: p.pagadoEn ? formatoFechaHora.format(p.pagadoEn) : "Esperando pago", estado: nivel >= 1 ? "hecho" : "actual" },
      { titulo: "Listo para recoger", detalle: p.punto?.nombre, estado: nivel >= 3 ? "hecho" : nivel === 2 ? "actual" : "pendiente" },
      { titulo: "Entregado", estado: nivel >= 3 ? "hecho" : "pendiente" },
    ];
  }
  const enCamino = d?.estado === "EN_CURSO";
  return [
    { titulo: "Pedido creado", detalle: formatoFechaHora.format(p.creadoEn), estado: "hecho" },
    { titulo: "Pagado", detalle: p.pagadoEn ? formatoFechaHora.format(p.pagadoEn) : "Esperando pago", estado: nivel >= 1 ? "hecho" : "actual" },
    {
      titulo: "Preparando",
      detalle: d?.domiciliario ? `Asignado a ${d.domiciliario.nombre}` : undefined,
      estado: enCamino || nivel >= 3 ? "hecho" : nivel >= 1 ? "actual" : "pendiente",
    },
    { titulo: "En camino", detalle: enCamino ? "Síguelo en el mapa" : undefined, estado: nivel >= 3 ? "hecho" : enCamino ? "actual" : "pendiente" },
    { titulo: "Entregado", detalle: d?.entregadoEn ? formatoFechaHora.format(d.entregadoEn) : undefined, estado: nivel >= 3 ? "hecho" : "pendiente" },
  ];
}

/** Una línea bajo el titular con lo que sigue. */
function detallePortada(p: PedidoDetalle, d: DomicilioVista | null) {
  const nombres = p.lineas.map((l) => `${l.marca} ${l.nombre}`).join(" + ");
  if (p.estado === "PENDIENTE_PAGO") return `${nombres}. Completa el pago para apartar tus unidades.`;
  if (p.estado === "CANCELADO") return nombres;
  if (p.estado === "ENTREGADO") return `${nombres}. ¡Disfrútalo!`;
  if (p.entrega === "EN_PUNTO") return `${nombres}. Recógelo en ${p.punto?.nombre ?? "tu punto"}.`;
  if (d?.estado === "EN_CURSO") return `${nombres}. ${d.domiciliario?.nombre ?? "Tu domiciliario"} va hacia ${d.destino.barrio ?? "tu casa"}.`;
  return `${nombres}. Te avisamos cuando salga hacia tu casa.`;
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

/** Frase grande del estado actual. */
function titular(p: PedidoDetalle, d: DomicilioVista | null) {
  if (p.estado === "CANCELADO") return "Pedido cancelado";
  if (p.estado === "PENDIENTE_PAGO") return "Falta el pago";
  if (p.estado === "ENTREGADO") return "¡Entregado!";
  if (p.entrega === "EN_PUNTO") return p.estado === "PREPARANDO" ? "Listo para recoger" : "Lo estamos alistando";
  if (d?.estado === "EN_CURSO") return "Va en camino";
  return "Lo estamos preparando";
}

async function Contenido({ params }: Pick<PageProps<"/mi-cuenta/pedidos/[numero]">, "params">) {
  await connection();
  const { numero } = await params;
  const pedido = await obtenerMiPedido(numero);
  if (!pedido) notFound();

  // Pedidos y domicilios son módulos distintos: la página los junta
  const domicilio = pedido.entrega === "A_DOMICILIO" ? await obtenerDomicilio({ pedidoId: pedido.id }) : null;
  const seguimiento = domicilio ? await obtenerSeguimiento(domicilio.id) : null;
  const activo = !["CANCELADO", "ENTREGADO"].includes(pedido.estado);

  return (
    <>
      <PortadaServicio
        volver={{ href: "/mi-cuenta/pedidos", texto: "Pedidos y alquileres" }}
        etiqueta={`Pedido ${pedido.numero}`}
        titulo={titular(pedido, domicilio)}
        detalle={detallePortada(pedido, domicilio)}
        estado={
          domicilio && ["ASIGNADO", "EN_CURSO"].includes(domicilio.estado) && pedido.estado !== "ENTREGADO" ? (
            <EstadoDomicilio estado={domicilio.estado} />
          ) : (
            <EstadoPedido estado={pedido.estado} entrega={pedido.entrega} />
          )
        }
        foto={pedido.lineas[0]?.foto ?? null}
        categoria={pedido.lineas[0]?.categoria ?? "scooters"}
        accion={pedido.estado === "PENDIENTE_PAGO" && pedido.referenciaPago ? { href: `/pagar/${pedido.referenciaPago}`, texto: "Pagar ahora" } : undefined}
        muesca={
          <>
            <Dato titulo="Productos" valor={String(pedido.lineas.reduce((s, l) => s + l.cantidad, 0))} />
            <Dato titulo="Total" valor={formatoPesos.format(pedido.total)} />
            <Dato titulo="Entrega" valor={pedido.entrega === "A_DOMICILIO" ? "A domicilio" : "En punto"} />
          </>
        }
      />
      <div className="h-6" />

      {pedido.estado !== "CANCELADO" && (
        <div className="rounded-tarjeta border border-carbon/10 px-6 py-7 sm:px-8">
          <LineaTiempo pasos={pasos(pedido, domicilio)} />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Mapa o punto de recogida */}
        <div>
          {domicilio ? (
            <div className="overflow-hidden rounded-tarjeta bg-escarcha">
              <MapaSeguimiento
                key={domicilio.estado}
                domicilioId={domicilio.id}
                origen={{ ...domicilio.origen }}
                destino={{ ...domicilio.destino }}
                inicial={seguimiento}
                className="h-[420px] md:h-[520px]"
              />
              <div className="flex flex-wrap items-center gap-4 p-6">
                <span className="grid size-12 place-items-center rounded-full bg-carbon text-turquesa">
                  <Icono nombre="domicilios" className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[17px] text-carbon">
                    {domicilio.domiciliario ? domicilio.domiciliario.nombre : "Asignando tu domiciliario"}
                  </p>
                  <p className="text-[14px] text-pizarra">
                    {domicilio.domiciliario ? `${domicilio.domiciliario.vehiculo} · sale de ${domicilio.origen.nombre}` : `Sale de ${domicilio.origen.nombre}`}
                  </p>
                </div>
                <div className="text-right text-[14px] text-pizarra">
                  <p className="text-carbon">{domicilio.destino.direccion}</p>
                  <p>{domicilio.destino.barrio}</p>
                </div>
                <CodigoEntrega codigo={domicilio.codigoEntrega} estado={domicilio.estado} className="w-full" />
              </div>
            </div>
          ) : (
            pedido.punto && (
              <div className="relative overflow-hidden rounded-tarjeta bg-bosque p-8 text-blanco sm:p-10">
                <span aria-hidden className="absolute -bottom-20 -right-20 size-64 rounded-full bg-turquesa/15" />
                <p className="etiqueta text-blanco/70">Recógelo en</p>
                <p className="mt-3 text-[clamp(30px,3vw,44px)] leading-tight">{pedido.punto.nombre}</p>
                <p className="mt-2 text-[16px] text-blanco/75">{pedido.punto.direccion}</p>
                <p className="mt-1 text-[16px] text-blanco/75">{pedido.punto.horario}</p>
                <div className="mt-8 inline-flex flex-col rounded-[22px] bg-blanco/10 px-6 py-4">
                  <span className="text-[13px] text-blanco/60">Muestra este número en el punto</span>
                  <span className="mt-1 font-mono text-[26px] tracking-[0.06em] text-turquesa">{pedido.numero}</span>
                </div>
              </div>
            )
          )}
        </div>

        {/* Resumen */}
        <aside className="rounded-tarjeta bg-escarcha p-6 sm:p-8">
          <h2 className="text-[22px] text-carbon">Tu pedido</h2>
          <ul className="mt-5 space-y-4">
            {pedido.lineas.map((l) => (
              <li key={l.productoId} className="flex items-center gap-4">
                <VitrinaProducto foto={l.foto} categoria={l.categoria} tamanos="72px" className="size-16 shrink-0 rounded-[18px]" />
                <div className="min-w-0 flex-1">
                  <Link href={`/producto/${l.slug}`} className="block truncate text-[16px] text-carbon">
                    {l.marca} {l.nombre}
                  </Link>
                  <p className="text-[13px] text-pizarra">
                    {l.cantidad} × {formatoPesos.format(l.precioUnitario)}
                  </p>
                </div>
                <span className="text-[15px] tabular-nums text-carbon">{formatoPesos.format(l.cantidad * l.precioUnitario)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-carbon/10 pt-5 text-[15px]">
            <div className="flex justify-between text-pizarra">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatoPesos.format(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-pizarra">
              <span>Entrega</span>
              <span className="tabular-nums">{pedido.envio ? formatoPesos.format(pedido.envio) : "Gratis"}</span>
            </div>
            <div className="flex justify-between pt-1 text-[22px] text-carbon">
              <span>Total</span>
              <span className="tabular-nums">{formatoPesos.format(pedido.total)}</span>
            </div>
          </div>

          {pedido.estado === "PENDIENTE_PAGO" && pedido.referenciaPago && (
            <div className="mt-6 space-y-3">
              <Boton href={`/pagar/${pedido.referenciaPago}`} className="w-full">
                Pagar ahora
              </Boton>
              <form action={cancelarMiPedidoAccion}>
                <input type="hidden" name="numero" value={pedido.numero} />
                <BotonAccion type="submit" variante="secundario" className="w-full">
                  Cancelar pedido
                </BotonAccion>
              </form>
            </div>
          )}
          {activo && pedido.estado !== "PENDIENTE_PAGO" && (
            <p className="mt-6 flex items-start gap-2 text-[13px] text-pizarra">
              <Icono nombre="escudo" className="mt-0.5 size-4 text-eucalipto" />
              Pagado con referencia {pedido.referenciaPago}. Te avisamos en Novedades cada vez que avance.
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
