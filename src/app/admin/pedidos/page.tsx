import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatoFechaHora, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { EstadoPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/EstadoPedido";
import { conteosPedidosAdmin, listarPedidosAdmin } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { EncabezadoAdmin, FiltroEstados } from "../_componentes/EncabezadoAdmin";
import { EsqueletoLista } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Pedidos · Administración MoviGo" };

export default function PaginaPedidosAdmin({ searchParams }: PageProps<"/admin/pedidos">) {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<EsqueletoLista etiqueta="Cargando pedidos…" />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/admin/pedidos">, "searchParams">) {
  await connection();
  const { estado } = await searchParams;
  const filtro = typeof estado === "string" ? estado : undefined;
  const [pedidos, conteos] = await Promise.all([listarPedidosAdmin(filtro), conteosPedidosAdmin()]);
  const total = Object.values(conteos).reduce((s, n) => s + (n ?? 0), 0);

  return (
    <>
      <EncabezadoAdmin
        etiqueta="Ventas"
        titulo={
          <>
            Pedidos <span className="text-eucalipto">de compra</span>
          </>
        }
        descripcion="Cada compra que hacen los clientes: quién, qué, cómo se entrega y en qué va."
      />
      <FiltroEstados
        base="/admin/pedidos"
        actual={filtro}
        opciones={[
          { texto: "Todos", cantidad: total },
          { valor: "PAGADO", texto: "Por atender", cantidad: conteos.PAGADO ?? 0 },
          { valor: "PREPARANDO", texto: "Preparando", cantidad: conteos.PREPARANDO ?? 0 },
          { valor: "PENDIENTE_PAGO", texto: "Esperando pago", cantidad: conteos.PENDIENTE_PAGO ?? 0 },
          { valor: "ENTREGADO", texto: "Entregados", cantidad: conteos.ENTREGADO ?? 0 },
          { valor: "CANCELADO", texto: "Cancelados", cantidad: conteos.CANCELADO ?? 0 },
        ]}
      />

      <section className="rounded-tarjeta bg-blanco p-3 sm:p-5">
        {pedidos.length === 0 ? (
          <p className="px-4 py-16 text-center text-[17px] text-pizarra">No hay pedidos con este filtro.</p>
        ) : (
          <ul className="divide-y divide-carbon/[0.07]">
            {pedidos.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/pedidos/${p.numero}`}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[22px] px-3 py-4 hover:bg-escarcha md:grid-cols-[auto_1.3fr_1fr_auto_auto]"
                >
                  <VitrinaProducto foto={p.lineas[0]?.foto ?? null} categoria={p.lineas[0]?.categoria ?? "bicicletas"} tamanos="64px" className="size-14 rounded-[16px]" />
                  <div className="min-w-0">
                    <p className="font-mono text-[13px] text-pizarra">{p.numero}</p>
                    <p className="truncate text-[16px] text-carbon">
                      {p.lineas.map((l) => `${l.cantidad}× ${l.marca} ${l.nombre}`).join(", ")}
                    </p>
                  </div>
                  <div className="hidden min-w-0 md:block">
                    <p className="truncate text-[15px] text-carbon">{p.cliente.nombre}</p>
                    <p className="text-[13px] text-pizarra">
                      {p.entrega === "A_DOMICILIO" ? "A domicilio" : "Recoge en punto"} · {formatoFechaHora.format(p.creadoEn)}
                    </p>
                  </div>
                  <EstadoPedido estado={p.estado} entrega={p.entrega} />
                  <span className="hidden w-32 text-right text-[16px] tabular-nums text-carbon md:block">{formatoPesos.format(p.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
