import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { formatoFechaHora, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { AccionesPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/AccionesPedido";
import { EstadoPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/EstadoPedido";
import { obtenerPedidoAdmin } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { EstadoDomicilio } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/EstadoDomicilio";
import { GestionDomicilio } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/GestionDomicilio";
import { MapaSeguimiento } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaSeguimiento";
import {
  listarDomiciliariosAdmin,
  obtenerDomicilio,
  obtenerSeguimiento,
} from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import { EsqueletoDetalle } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Pedido · Administración MoviGo" };

export default function PaginaPedidoAdmin({ params }: PageProps<"/admin/pedidos/[numero]">) {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<EsqueletoDetalle etiqueta="Cargando el pedido…" className="pt-16" />}>
        <Contenido params={params} />
      </Suspense>
    </main>
  );
}

async function Contenido({ params }: Pick<PageProps<"/admin/pedidos/[numero]">, "params">) {
  await connection();
  const { numero } = await params;
  const pedido = await obtenerPedidoAdmin(numero);
  if (!pedido) notFound();

  // Pedidos y domicilios: la página junta los dos módulos
  const [domicilio, domiciliarios] = await Promise.all([
    pedido.entrega === "A_DOMICILIO" ? obtenerDomicilio({ pedidoId: pedido.id }) : null,
    listarDomiciliariosAdmin(),
  ]);
  const seguimiento = domicilio ? await obtenerSeguimiento(domicilio.id) : null;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-8 pt-10 md:pt-14">
        <div>
          <Link href="/admin/pedidos" className="inline-flex items-center gap-1.5 text-[14px] text-pizarra hover:text-carbon">
            <Icono nombre="atras" className="size-4" /> Pedidos
          </Link>
          <p className="etiqueta mt-6 text-carbon/70">Pedido · {formatoFechaHora.format(pedido.creadoEn)}</p>
          <h1 className="titular mt-4 font-mono text-[clamp(36px,4.4vw,64px)] tracking-[-0.03em] text-carbon">{pedido.numero}</h1>
        </div>
        <EstadoPedido estado={pedido.estado} entrega={pedido.entrega} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {/* Productos */}
          <section className="rounded-tarjeta bg-blanco p-6 sm:p-8">
            <h2 className="text-[22px] text-carbon">Productos</h2>
            <ul className="mt-5 divide-y divide-carbon/[0.07]">
              {pedido.lineas.map((l) => (
                <li key={l.productoId} className="flex items-center gap-4 py-4">
                  <VitrinaProducto foto={l.foto} categoria={l.categoria} tamanos="80px" className="size-20 shrink-0 rounded-[20px]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[17px] text-carbon">
                      {l.marca} {l.nombre}
                    </p>
                    <p className="text-[13px] text-pizarra">
                      {l.cantidad} × {formatoPesos.format(l.precioUnitario)}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-1.5">
                      {l.seriales.map((s) => (
                        <span key={s} className="rounded-full bg-escarcha px-2.5 py-0.5 font-mono text-[12px] text-bosque">
                          {s}
                        </span>
                      ))}
                    </p>
                  </div>
                  <span className="text-[16px] tabular-nums text-carbon">{formatoPesos.format(l.cantidad * l.precioUnitario)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1.5 border-t border-carbon/10 pt-4 text-[15px]">
              <div className="flex justify-between text-pizarra">
                <span>Subtotal</span>
                <span>{formatoPesos.format(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between text-pizarra">
                <span>Domicilio</span>
                <span>{pedido.envio ? formatoPesos.format(pedido.envio) : "—"}</span>
              </div>
              <div className="flex justify-between text-[22px] text-carbon">
                <span>Total</span>
                <span className="tabular-nums">{formatoPesos.format(pedido.total)}</span>
              </div>
            </div>
          </section>

          {/* Entrega */}
          {domicilio ? (
            <section className="overflow-hidden rounded-tarjeta bg-blanco">
              <MapaSeguimiento
                key={domicilio.estado}
                domicilioId={domicilio.id}
                origen={{ ...domicilio.origen }}
                destino={{ ...domicilio.destino }}
                inicial={seguimiento}
                className="h-[380px]"
              />
              <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-[22px] text-carbon">Domicilio</h2>
                    <EstadoDomicilio estado={domicilio.estado} />
                  </div>
                  <p className="mt-3 text-[15px] text-pizarra">
                    Sale de <span className="text-carbon">{domicilio.origen.nombre}</span>
                  </p>
                  <p className="text-[15px] text-pizarra">
                    Va a <span className="text-carbon">{domicilio.destino.direccion}</span>, {domicilio.destino.barrio}
                  </p>
                  {domicilio.domiciliario && (
                    <p className="mt-2 text-[15px] text-pizarra">
                      Lo lleva <span className="text-carbon">{domicilio.domiciliario.nombre}</span> ({domicilio.domiciliario.vehiculo})
                    </p>
                  )}
                </div>
                <GestionDomicilio domicilio={domicilio} domiciliarios={domiciliarios} />
              </div>
            </section>
          ) : (
            pedido.punto && (
              <section className="rounded-tarjeta bg-bosque p-6 text-blanco sm:p-8">
                <p className="etiqueta text-blanco/70">Recoge en</p>
                <p className="mt-3 text-[28px]">{pedido.punto.nombre}</p>
                <p className="mt-1 text-[15px] text-blanco/70">
                  {pedido.punto.direccion} · {pedido.punto.horario}
                </p>
              </section>
            )
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-tarjeta bg-blanco p-6 sm:p-8">
            <h2 className="text-[22px] text-carbon">Cliente</h2>
            <p className="mt-3 text-[17px] text-carbon">{pedido.cliente.nombre}</p>
            <p className="text-[15px] text-pizarra">{pedido.cliente.correo}</p>
            <dl className="mt-5 space-y-2 border-t border-carbon/10 pt-4 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-pizarra">Pago</dt>
                <dd className="font-mono text-carbon">{pedido.referenciaPago ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-pizarra">Pagado</dt>
                <dd className="text-carbon">{pedido.pagadoEn ? formatoFechaHora.format(pedido.pagadoEn) : "No"}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-tarjeta bg-blanco p-6 sm:p-8">
            <h2 className="mb-4 text-[22px] text-carbon">Acciones</h2>
            <AccionesPedido numero={pedido.numero} estado={pedido.estado} entrega={pedido.entrega} />
          </section>
        </aside>
      </div>
    </>
  );
}
