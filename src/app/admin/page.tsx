import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icono, type NombreIcono } from "@/compartido/interfaz/ui/Icono";
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import { formatoFechaHora, formatoPesos } from "@/compartido/utilidades/formato";
import { OcupacionPuntos } from "@/modulos/gestion-almacen/interfaz/componentes/stock/OcupacionPuntos";
import { obtenerPuntos, obtenerUnidadesPorEstado } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { obtenerResumenIngresos } from "@/modulos/gestion-pagos/servidor/acciones";
import { EstadoPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/EstadoPedido";
import { conteosPedidosAdmin, listarPedidosAdmin } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { conteosAlquileresAdmin, listarAlquileresAdmin } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";
import { listarDomiciliosAdmin } from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import { EncabezadoAdmin } from "./_componentes/EncabezadoAdmin";
import { GraficaIngresos } from "./_componentes/GraficaIngresos";

export const metadata: Metadata = { title: "Resumen · Administración MoviGo" };

export default function PaginaResumen() {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<p className="pt-16 text-pizarra">Cargando el resumen…</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}

function saludo() {
  const hora = Number(new Intl.DateTimeFormat("es-CO", { hour: "numeric", hourCycle: "h23", timeZone: "America/Bogota" }).format(new Date()));
  return hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
}

async function Contenido() {
  await connection();
  const admin = await requerirAdministrador();
  const [ingresos, pedidos, alquileres, porAtender, alquileresPorEntregar, domicilios, unidades, puntos] = await Promise.all([
    obtenerResumenIngresos(),
    conteosPedidosAdmin(),
    conteosAlquileresAdmin(),
    listarPedidosAdmin("PAGADO"),
    listarAlquileresAdmin("ASIGNADO"),
    listarDomiciliosAdmin(),
    obtenerUnidadesPorEstado(),
    obtenerPuntos(),
  ]);
  const enRuta = domicilios.filter((d) => d.estado === "EN_CURSO").length;
  const sinAsignar = domicilios.filter((d) => d.estado === "SOLICITADO" && d.listoParaDespachar);

  const indicadores: { etiqueta: string; valor: string; nota: string; icono: NombreIcono; href: string }[] = [
    {
      etiqueta: "Pedidos por atender",
      valor: String((pedidos.PAGADO ?? 0) + (pedidos.PREPARANDO ?? 0)),
      nota: `${pedidos.PENDIENTE_PAGO ?? 0} esperando pago`,
      icono: "pedidos",
      href: "/admin/pedidos?estado=PAGADO",
    },
    {
      etiqueta: "Alquileres activos",
      valor: String((alquileres.ASIGNADO ?? 0) + (alquileres.EN_CURSO ?? 0)),
      nota: `${alquileres.EN_CURSO ?? 0} en la calle`,
      icono: "alquileres",
      href: "/admin/alquileres",
    },
    {
      etiqueta: "Domicilios en ruta",
      valor: String(enRuta),
      nota: `${sinAsignar.length} por asignar`,
      icono: "domicilios",
      href: "/admin/domicilios",
    },
    {
      etiqueta: "Unidades disponibles",
      valor: String(unidades.DISPONIBLE ?? 0),
      nota: `${unidades.RESERVADA ?? 0} apartadas · ${unidades.EN_TALLER ?? 0} en taller`,
      icono: "inventario",
      href: "/admin/inventario",
    },
  ];

  return (
    <>
      <EncabezadoAdmin
        etiqueta="Panel de administración"
        titulo={
          <>
            {saludo()}, <span className="text-eucalipto">{admin.nombre.split(" ")[0]}</span>
          </>
        }
        descripcion="Así va MoviGo hoy: ventas, alquileres, entregas e inventario en un solo lugar."
      />

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        {/* Ingresos */}
        <section className="relative overflow-hidden rounded-tarjeta bg-bosque p-7 text-blanco sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="etiqueta text-blanco/70">Ingresos de este mes</p>
              <p className="titular mt-3 text-[clamp(40px,4.4vw,64px)]">{formatoPesos.format(ingresos.mes.total)}</p>
              <p className="mt-2 text-[15px] text-blanco/70">
                {ingresos.mes.cantidad} pago{ingresos.mes.cantidad === 1 ? "" : "s"} aprobado{ingresos.mes.cantidad === 1 ? "" : "s"} ·{" "}
                {formatoPesos.format(ingresos.total.total)} en total
              </p>
            </div>
            <span className="etiqueta rounded-full bg-blanco/10 px-3 py-1.5 text-blanco/80">Últimos 14 días</span>
          </div>
          <div className="mt-8">
            <GraficaIngresos dias={ingresos.dias} />
          </div>
        </section>

        {/* Indicadores */}
        <section className="grid grid-cols-2 gap-4">
          {indicadores.map((k) => (
            <Link key={k.etiqueta} href={k.href} className="flex flex-col rounded-[28px] bg-blanco p-5 sm:p-6">
              <span className="grid size-10 place-items-center rounded-full bg-escarcha text-bosque">
                <Icono nombre={k.icono} className="size-5" />
              </span>
              <p className="mt-auto pt-6 text-[clamp(36px,3.4vw,52px)] leading-none tracking-[-0.03em] text-carbon">{k.valor}</p>
              <p className="mt-2 text-[15px] text-carbon">{k.etiqueta}</p>
              <p className="mt-0.5 text-[13px] text-pizarra">{k.nota}</p>
            </Link>
          ))}
        </section>
      </div>

      {/* Por atender */}
      <section className="mt-4 rounded-tarjeta bg-blanco p-6 sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="etiqueta text-carbon/70">Por atender</p>
            <h2 className="mt-3 text-[clamp(26px,2.5vw,36px)] leading-[1.15] text-carbon">
              Lo que <span className="text-eucalipto">necesita tu atención</span>
            </h2>
          </div>
          <Link href="/admin/pedidos" className="text-[12px] font-bold uppercase text-carbon">
            Ver todos los pedidos →
          </Link>
        </div>

        {porAtender.length + alquileresPorEntregar.length + sinAsignar.length === 0 ? (
          <p className="mt-8 rounded-[24px] bg-escarcha px-6 py-10 text-center text-[17px] text-pizarra">
            Todo al día. Cuando entre un pedido pagado, aparece aquí.
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-carbon/[0.08]">
            {porAtender.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/pedidos/${p.numero}`} className="flex flex-wrap items-center gap-4 rounded-[20px] px-3 py-4 hover:bg-escarcha">
                  <span className="grid size-10 place-items-center rounded-full bg-turquesa/25 text-bosque">
                    <Icono nombre="pedidos" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] text-carbon">
                      Pedido {p.numero} · {p.cliente.nombre}
                    </p>
                    <p className="truncate text-[13px] text-pizarra">
                      {p.lineas.map((l) => `${l.cantidad}× ${l.marca} ${l.nombre}`).join(", ")} ·{" "}
                      {p.entrega === "A_DOMICILIO" ? "A domicilio" : "Recoge en punto"}
                    </p>
                  </div>
                  <EstadoPedido estado={p.estado} entrega={p.entrega} />
                  <span className="w-28 text-right text-[16px] tabular-nums text-carbon">{formatoPesos.format(p.total)}</span>
                </Link>
              </li>
            ))}
            {alquileresPorEntregar.map((a) => (
              <li key={a.id}>
                <Link href="/admin/alquileres?estado=ASIGNADO" className="flex flex-wrap items-center gap-4 rounded-[20px] px-3 py-4 hover:bg-escarcha">
                  <span className="grid size-10 place-items-center rounded-full bg-salvia text-bosque">
                    <Icono nombre="alquileres" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] text-carbon">
                      Entregar alquiler a {a.cliente.nombre} · código {a.codigoRecogida}
                    </p>
                    <p className="truncate text-[13px] text-pizarra">
                      {a.producto.marca} {a.producto.nombre} · {a.dias} día{a.dias === 1 ? "" : "s"} ·{" "}
                      {a.entrega === "EN_PUNTO" ? a.punto?.nombre : "A domicilio"}
                    </p>
                  </div>
                  <span className="text-[13px] text-pizarra">{formatoFechaHora.format(a.creadaEn)}</span>
                </Link>
              </li>
            ))}
            {sinAsignar.map((d) => (
              <li key={d.id}>
                <Link href="/admin/domicilios" className="flex flex-wrap items-center gap-4 rounded-[20px] px-3 py-4 hover:bg-escarcha">
                  <span className="grid size-10 place-items-center rounded-full bg-[#f6e7c1] text-[#7a5a12]">
                    <Icono nombre="domicilios" className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] text-carbon">Asignar domiciliario · {d.cliente.nombre}</p>
                    <p className="truncate text-[13px] text-pizarra">
                      {d.origen.nombre} → {d.destino.direccion}, {d.destino.barrio}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Puntos */}
      <section className="mt-4">
        <OcupacionPuntos puntos={puntos} />
      </section>
    </>
  );
}
