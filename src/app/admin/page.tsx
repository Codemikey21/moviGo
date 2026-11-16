import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Contador } from "@/compartido/interfaz/animaciones/Contador";
import { Revelador } from "@/compartido/interfaz/animaciones/Revelador";
import { TextoPalabras } from "@/compartido/interfaz/animaciones/TextoPalabras";
import { Icono, type NombreIcono } from "@/compartido/interfaz/ui/Icono";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import { formatoPesos } from "@/compartido/utilidades/formato";
import {
  obtenerInventarioDetallado,
  obtenerPuntos,
  obtenerUnidadesPorEstado,
} from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { ordenarCategorias } from "@/modulos/gestion-catalogo/interfaz/componentes/categorias/MosaicoCategorias";
import { IconoProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/IconoProducto";
import type { Foto } from "@/modulos/gestion-catalogo/tipos";
import { obtenerCategorias } from "@/modulos/gestion-catalogo/servidor/categorias/acciones";
import { listarProductosAdmin } from "@/modulos/gestion-catalogo/servidor/productos/acciones";
import { obtenerResumenIngresos } from "@/modulos/gestion-pagos/servidor/acciones";
import { conteosPedidosAdmin, listarPedidosAdmin } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { MapaFlota } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaFlota";
import { conteosAlquileresAdmin, listarAlquileresAdmin } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";
import { listarDomiciliariosAdmin, listarDomiciliosAdmin } from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import { listarSolicitudesAdmin } from "@/modulos/portal-empresarial/servidor/acciones";
import { GraficaIngresos } from "./_componentes/GraficaIngresos";
import { InventarioCategorias, type FilaInventario } from "./_componentes/InventarioCategorias";
import { EsqueletoResumenAdmin } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Resumen · Administración MoviGo" };

export default function PaginaResumen() {
  return (
    <main className="-mt-[76px] bg-carbon">
      <Suspense fallback={<EsqueletoResumenAdmin />}>
        <Contenido />
      </Suspense>
    </main>
  );
}

function saludo() {
  const hora = Number(new Intl.DateTimeFormat("es-CO", { hour: "numeric", hourCycle: "h23", timeZone: "America/Bogota" }).format(new Date()));
  return hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";
}

/** "22 minutos", "3 horas", "2 días" */
function hace(fecha: Date) {
  const minutos = Math.max(1, Math.round((Date.now() - fecha.getTime()) / 60_000));
  if (minutos < 60) return `${minutos} minuto${minutos === 1 ? "" : "s"}`;
  const horas = Math.round(minutos / 60);
  if (horas < 48) return `${horas} hora${horas === 1 ? "" : "s"}`;
  const dias = Math.round(horas / 24);
  return `${dias} días`;
}

type Fila = {
  id: string;
  categoria: string | null;
  foto?: Foto | null;
  icono?: NombreIcono;
  titulo: string;
  referencia: string;
  cliente: string;
  entrega: string;
  estado: string;
  tono: "turquesa" | "eucalipto" | "ambar";
  total: number | null;
  accion: string;
  href: string;
  desde: Date;
};

async function Contenido() {
  await connection();
  const admin = await requerirAdministrador();
  const [ingresos, pedidos, alquileres, pagados, preparando, porEntregar, domicilios, domiciliarios, unidades, puntos, inventario, productos, categorias, solicitudes] =
    await Promise.all([
      obtenerResumenIngresos(),
      conteosPedidosAdmin(),
      conteosAlquileresAdmin(),
      listarPedidosAdmin("PAGADO"),
      listarPedidosAdmin("PREPARANDO"),
      listarAlquileresAdmin("ASIGNADO"),
      listarDomiciliosAdmin(),
      listarDomiciliariosAdmin(),
      obtenerUnidadesPorEstado(),
      obtenerPuntos(),
      obtenerInventarioDetallado(),
      listarProductosAdmin(),
      obtenerCategorias(),
      listarSolicitudesAdmin(),
    ]);

  const activos = domicilios.filter((d) => ["SOLICITADO", "ASIGNADO", "EN_CURSO"].includes(d.estado));
  const enRuta = activos.filter((d) => d.estado === "EN_CURSO");
  const sinAsignar = activos.filter((d) => d.estado === "SOLICITADO" && d.listoParaDespachar);
  const domicilioDe = (filtro: { pedidoId?: string; alquilerId?: string }) =>
    domicilios.find((d) => (filtro.pedidoId && d.pedidoId === filtro.pedidoId) || (filtro.alquilerId && d.alquilerId === filtro.alquilerId));

  // Todo lo que espera una acción del equipo, lo más antiguo primero
  const filas: Fila[] = [
    ...[...pagados, ...preparando]
      .filter((p) => !(p.estado === "PREPARANDO" && p.entrega === "A_DOMICILIO" && domicilioDe({ pedidoId: p.id })?.estado === "EN_CURSO"))
      .map((p): Fila => {
        const d = p.entrega === "A_DOMICILIO" ? domicilioDe({ pedidoId: p.id }) : undefined;
        const asignar = d?.estado === "SOLICITADO";
        return {
          id: p.id,
          categoria: p.lineas[0]?.categoria ?? null,
          foto: p.lineas[0]?.foto ?? null,
          titulo: `${p.lineas[0]?.marca ?? ""} ${p.lineas[0]?.nombre ?? "Pedido"}${p.lineas.length > 1 ? ` y ${p.lineas.length - 1} más` : ""}`,
          referencia: p.numero,
          cliente: p.cliente.nombre,
          entrega: p.entrega === "A_DOMICILIO" ? `A domicilio${d ? ` · ${d.origen.nombre.replace("MoviGo ", "")}` : ""}` : "Recoge en punto",
          estado: p.estado === "PAGADO" ? "Pagado" : "Listo para entregar",
          tono: "turquesa",
          total: p.total,
          accion: asignar ? "Asignar" : p.estado === "PAGADO" ? "Preparar" : "Entregar",
          href: asignar ? "/admin/domicilios" : `/admin/pedidos/${p.numero}`,
          desde: p.creadoEn,
        };
      }),
    ...porEntregar.map(
      (a): Fila => ({
        id: a.id,
        categoria: a.producto.categoria,
        foto: a.producto.foto,
        titulo: `${a.producto.marca} ${a.producto.nombre} · ${a.dias} día${a.dias === 1 ? "" : "s"}`,
        referencia: a.codigoRecogida ?? "Alquiler",
        cliente: a.cliente.nombre,
        entrega: a.entrega === "EN_PUNTO" ? `Recoge · ${a.punto?.nombre.replace("MoviGo ", "") ?? ""}` : "A domicilio",
        estado: "Alquiler pagado",
        tono: "eucalipto",
        total: a.total,
        accion: a.entrega === "A_DOMICILIO" && domicilioDe({ alquilerId: a.id })?.estado === "SOLICITADO" ? "Asignar" : "Entregar",
        href: a.entrega === "A_DOMICILIO" ? "/admin/domicilios" : "/admin/alquileres?estado=ASIGNADO",
        desde: a.creadaEn,
      }),
    ),
    ...solicitudes
      .filter((s) => s.estado === "ENVIADA")
      .map(
        (s): Fila => ({
          id: s.id,
          categoria: null,
          icono: "usuarios",
          titulo: `${s.cantidad} ${s.tipo === "FLOTA_ALQUILER" ? "vehículos para su equipo" : "domicilios en lote"}`,
          referencia: s.empresa.razonSocial,
          cliente: `NIT ${s.empresa.nit}`,
          entrega: "Empresa",
          estado: "Por cotizar",
          tono: "ambar",
          total: null,
          accion: "Cotizar",
          href: "/admin/empresas",
          desde: s.creadaEn,
        }),
      ),
  ].sort((a, b) => a.desde.getTime() - b.desde.getTime());

  // Inventario por categoría (almacén y catálogo son módulos distintos: aquí se juntan)
  const categoriaDe = new Map(productos.map((p) => [p.id, p.categoria.slug]));
  const filasInventario: FilaInventario[] = inventario.map((f) => ({
    categoria: categoriaDe.get(f.productoId) ?? "otros",
    puntoId: f.puntoId,
    estado: f.estado,
    cantidad: f.cantidad,
  }));
  const categoriasOrden = ordenarCategorias(categorias).map((c) => ({ slug: c.slug, nombre: c.nombre, foto: c.foto }));

  const hoy = ingresos.dias.at(-1)?.total ?? 0;
  const periodo = ingresos.periodo.ventas + ingresos.periodo.alquileres;
  const libres = unidades.DISPONIBLE ?? 0;
  const totalUnidades = Object.values(unidades).reduce((s, n) => s + (n ?? 0), 0) - (unidades.VENDIDA ?? 0) - (unidades.BAJA ?? 0);
  const fecha = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(new Date());

  // Línea de tendencia de los ingresos (14 días)
  const max = Math.max(...ingresos.dias.map((d) => d.total), 1);
  const tendencia = ingresos.dias
    .map((d, i) => `${i === 0 ? "M" : "L"}${(i / (ingresos.dias.length - 1)) * 200} ${36 - (d.total / max) * 32}`)
    .join(" ");

  const cifras: {
    etiqueta: string;
    valor: number;
    decimales?: number;
    prefijo?: string;
    sufijo?: string;
    nota: string;
    href: string;
    tono?: string;
    linea?: boolean;
  }[] = [
    {
      etiqueta: "Ingresos del mes",
      // En millones para que quepa en la tarjeta: $ 7,56 M
      valor: ingresos.mes.total >= 1_000_000 ? ingresos.mes.total / 1_000_000 : ingresos.mes.total,
      decimales: ingresos.mes.total >= 1_000_000 ? 2 : 0,
      prefijo: "$ ",
      sufijo: ingresos.mes.total >= 1_000_000 ? " M" : "",
      nota: `${ingresos.mes.cantidad} pago${ingresos.mes.cantidad === 1 ? "" : "s"} aprobado${ingresos.mes.cantidad === 1 ? "" : "s"}`,
      href: "/admin/pedidos",
      linea: true,
    },
    { etiqueta: "Por atender", valor: filas.length, nota: `${pedidos.PENDIENTE_PAGO ?? 0} pedidos esperando pago`, href: "#por-atender", tono: filas.length ? "text-[#e9b43c]" : undefined },
    { etiqueta: "Alquileres activos", valor: (alquileres.ASIGNADO ?? 0) + (alquileres.EN_CURSO ?? 0), nota: `${alquileres.EN_CURSO ?? 0} en la calle ahora`, href: "/admin/alquileres" },
    { etiqueta: "Domicilios en ruta", valor: enRuta.length, nota: `${sinAsignar.length} por asignar`, href: "/admin/domicilios" },
    { etiqueta: "Unidades libres", valor: libres, nota: `de ${totalUnidades} en ${puntos.length} puntos`, href: "/admin/inventario" },
  ];

  return (
    <>
      {/* 1. Saludo */}
      <section className="contenedor pb-16 pt-[150px] text-center text-blanco md:pt-[170px]">
        <p className="etiqueta text-turquesa">Panel de administración</p>
        <h1 className="titular mx-auto mt-5 max-w-[1100px] text-[clamp(40px,5vw,66px)]">
          {saludo()}, {admin.nombre.split(" ")[0]}. Hoy entraron <span className="text-turquesa">{formatoPesos.format(hoy)}</span>{" "}
          {filas.length ? `y tienes ${filas.length} cosa${filas.length === 1 ? "" : "s"} por atender.` : "y todo está al día."}
        </h1>
        <p className="mt-6 font-mono text-[13px] uppercase text-niebla">{fecha} · Bucaramanga</p>
      </section>

      {/* 2. Cifras: lo primero que se ve */}
      <section className="contenedor grid gap-3.5 pb-14 pt-2 sm:grid-cols-2 lg:grid-cols-5" aria-label="Cifras">
        {cifras.map((c) => (
          <Link
            key={c.etiqueta}
            href={c.href}
            className="group flex min-h-[230px] flex-col rounded-[28px] bg-[#172022] p-6 text-blanco transition-[background-color,translate] duration-500 ease-salida hover:-translate-y-1.5 hover:bg-bosque"
          >
            <p className="etiqueta text-niebla">{c.etiqueta}</p>
            <p className="mt-auto whitespace-nowrap pt-6 text-[clamp(34px,3vw,48px)] leading-none tracking-[-0.045em]">
              <Contador valor={c.valor} decimales={c.decimales} prefijo={c.prefijo} sufijo={c.sufijo} />
            </p>
            <p className={`mt-2.5 text-[13px] ${c.tono ?? "text-turquesa"}`}>{c.nota}</p>
            {c.linea && (
              <svg viewBox="0 0 200 40" className="mt-3 h-9 w-full overflow-visible" aria-hidden>
                <path d={tendencia} fill="none" stroke="#64d5b3" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </Link>
        ))}
      </section>

      {/* 3. Flota en vivo */}
      <section aria-label="Flota en vivo" className="px-3 pb-14 md:px-5">
        <div className="relative h-[min(78svh,760px)] w-full overflow-hidden rounded-tarjeta rounded-b-none bg-[#1a2426]">
          <div className="absolute inset-0">
            <MapaFlota
              puntos={puntos.map((p) => ({ nombre: p.nombre, latitud: p.latitud, longitud: p.longitud }))}
              entregas={activos.map((d) => ({
                id: d.id,
                enRuta: d.estado === "EN_CURSO",
                destino: d.destino,
                titulo: d.pedidoNumero ? `Pedido ${d.pedidoNumero}` : "Alquiler",
              }))}
              className="h-full"
            />
          </div>

          <div className="absolute left-4 top-4 z-[500] flex flex-wrap gap-2">
            {[
              <>
                <span className="punto-vivo" /> {enRuta.length} en ruta
              </>,
              <>{puntos.length} puntos abiertos</>,
              <>{domiciliarios.filter((d) => d.disponible && d.enCurso === 0).length} libres</>,
            ].map((contenido, i) => (
              <span key={i} className="flex items-center gap-2 rounded-[14px] bg-carbon/75 px-3.5 py-2.5 text-[12px] font-semibold text-blanco backdrop-blur">
                {contenido}
              </span>
            ))}
          </div>

          <Muesca lado="izquierda" fondo="var(--color-carbon)" className="z-[600] w-[min(440px,92%)] pb-5 pr-8 pt-7 text-blanco">
            <p className="etiqueta pb-3 text-niebla">Domiciliarios</p>
            <ul>
              {domiciliarios.slice(0, 4).map((d) => {
                const entrega = activos.find((a) => a.domiciliario?.id === d.id);
                return (
                  <li key={d.id} className="grid grid-cols-[44px_1fr_auto] items-center gap-3.5 border-t border-blanco/10 py-3">
                    <span
                      className={`grid size-11 place-items-center rounded-[13px] text-[14px] font-semibold ${
                        d.enCurso ? "bg-turquesa text-carbon" : "bg-blanco/10 text-blanco"
                      }`}
                    >
                      {d.nombre
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[16px]">{d.nombre}</span>
                      <span className="block truncate text-[13px] text-niebla">
                        {entrega
                          ? `${entrega.estado === "EN_CURSO" ? "En ruta" : "Asignado"} · ${entrega.destino.barrio ?? entrega.destino.direccion}`
                          : `Libre · ${d.vehiculo.toLowerCase()}`}
                      </span>
                    </span>
                    {!d.enCurso && sinAsignar.length > 0 ? (
                      <Link href="/admin/domicilios" className="rounded-[12px] bg-turquesa px-3.5 py-2 text-[11px] font-bold uppercase text-carbon">
                        Asignar
                      </Link>
                    ) : (
                      <span className="font-mono text-[12px] text-niebla">{d.enCurso ? `${d.enCurso} entrega${d.enCurso === 1 ? "" : "s"}` : ""}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Muesca>
          <Muesca lado="derecha" fondo="var(--color-carbon)" className="z-[600] hidden pl-[18px] pt-4 md:block">
            <nav aria-label="Operación" className="flex gap-1">
              {[
                ["Domicilios", "/admin/domicilios"],
                ["Pedidos", "/admin/pedidos"],
                ["Taller", "/admin/mantenimiento"],
              ].map(([texto, href], i) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex h-10 items-center rounded-full px-4 text-[11px] font-bold uppercase transition-colors ${
                    i === 0 ? "bg-blanco text-carbon" : "text-blanco hover:bg-blanco/10"
                  }`}
                >
                  {texto}
                </Link>
              ))}
            </nav>
          </Muesca>
        </div>
      </section>

      <Revelador>
        {/* 4. Por atender */}
        <section id="por-atender" className="scroll-mt-24 rounded-t-[48px] bg-blanco pb-24 pt-24 md:pt-28">
          <div className="contenedor">
            <p className="etiqueta text-center text-bruma">Por atender</p>
            <TextoPalabras
              estatico
              className="titular mx-auto mt-5 max-w-[900px] text-center text-[clamp(32px,4vw,50px)] text-carbon"
              partes={
                filas.length
                  ? [
                      { texto: `${filas.length === 1 ? "Una solicitud espera" : `${filas.length} solicitudes esperan`} por ti. ` },
                      { texto: `La más antigua lleva ${hace(filas[0].desde)}.`, resaltado: true },
                    ]
                  : [{ texto: "Todo al día. " }, { texto: "Cuando entre un pedido pagado, aparece aquí.", resaltado: true }]
              }
            />
            {filas.length > 0 && (
              <div className="mt-14 overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-carbon text-[11px] font-semibold uppercase tracking-[0.05em] text-bruma">
                      <th className="w-14 py-3.5 font-semibold">#</th>
                      <th className="py-3.5 font-semibold">Solicitud</th>
                      <th className="py-3.5 font-semibold">Cliente</th>
                      <th className="py-3.5 font-semibold">Entrega</th>
                      <th className="py-3.5 font-semibold">Estado</th>
                      <th className="py-3.5 text-right font-semibold">Total</th>
                      <th className="w-36 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filas.slice(0, 8).map((f, i) => (
                      <tr key={f.id} data-revelar className="group border-b border-carbon/10 transition-colors hover:bg-escarcha/60">
                        <td className="py-5 font-mono text-[13px] text-bruma">{String(i + 1).padStart(2, "0")}</td>
                        <td className="py-5">
                          <span className="flex items-center gap-3.5">
                            <span className="grid h-12 w-16 shrink-0 place-items-center rounded-[14px] bg-escarcha text-bosque">
                              {f.categoria ? <IconoProducto foto={f.foto ?? null} categoria={f.categoria} className="w-[54px]" /> : <Icono nombre={f.icono ?? "paquete"} className="size-5" />}
                            </span>
                            <span className="min-w-0">
                              <span className="block max-w-[300px] truncate text-[16px] text-carbon">{f.titulo}</span>
                              <span className="block font-mono text-[12px] text-bruma">{f.referencia}</span>
                            </span>
                          </span>
                        </td>
                        <td className="py-5 text-[16px] text-carbon">{f.cliente}</td>
                        <td className="py-5 text-[16px] text-carbon">{f.entrega}</td>
                        <td className="py-5">
                          <span className="flex items-center gap-2 text-[14px] text-carbon">
                            <i className={`size-2 rounded-full ${{ turquesa: "bg-turquesa", eucalipto: "bg-eucalipto", ambar: "bg-[#e9b43c]" }[f.tono]}`} />
                            {f.estado}
                          </span>
                        </td>
                        <td className="py-5 text-right text-[16px] tabular-nums text-carbon">{f.total !== null ? formatoPesos.format(f.total) : "—"}</td>
                        <td className="py-5 text-right">
                          <Link
                            href={f.href}
                            className={`inline-flex h-11 items-center rounded-[13px] px-4 text-[12px] font-bold uppercase transition-colors ${
                              ["Asignar", "Entregar"].includes(f.accion)
                                ? "bg-turquesa text-carbon hover:bg-[#4cc7a1]"
                                : "border border-carbon/70 text-carbon hover:bg-carbon hover:text-blanco"
                            }`}
                          >
                            {f.accion} ›
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filas.length > 8 && (
                  <p className="mt-6 text-center text-[14px] text-pizarra">
                    Y {filas.length - 8} más.{" "}
                    <Link href="/admin/pedidos" className="font-medium text-carbon underline underline-offset-4">
                      Ver todos los pedidos
                    </Link>
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 5. Ingresos */}
        <section className="bg-salvia py-24 md:py-28" aria-label="Ingresos">
          <div className="contenedor grid gap-5 lg:grid-cols-[1fr_2fr]">
            <div data-revelar className="pr-4 pt-2">
              <p className="etiqueta text-bosque">Ingresos · últimos 14 días</p>
              <p className="mt-5 whitespace-nowrap text-[clamp(44px,4.6vw,68px)] leading-none tracking-[-0.05em] text-carbon">
                <Contador valor={periodo} prefijo="$ " />
              </p>
              <dl className="mt-10">
                <Dato etiqueta="Ventas" valor={formatoPesos.format(ingresos.periodo.ventas)} />
                <Dato etiqueta="Alquileres" valor={formatoPesos.format(ingresos.periodo.alquileres)} />
                <Dato etiqueta="Este mes" valor={formatoPesos.format(ingresos.mes.total)} />
                <Dato etiqueta="Desde que abrimos" valor={formatoPesos.format(ingresos.total.total)} />
              </dl>
            </div>
            <div data-revelar className="rounded-tarjeta bg-blanco p-6 sm:p-9">
              <p className="etiqueta mb-12 text-bruma">Por día</p>
              <GraficaIngresos dias={ingresos.dias} tono="claro" />
            </div>
          </div>
        </section>

        {/* 6. Inventario */}
        <section className="bg-bosque py-24 md:py-28" aria-label="Inventario">
          <div className="contenedor">
            <InventarioCategorias
              puntos={puntos.map((p) => ({ id: p.id, nombre: p.nombre, capacidad: p.capacidad }))}
              categorias={categoriasOrden}
              filas={filasInventario}
            />
            <div className="mt-12 flex flex-wrap justify-end gap-3">
              <Accion href="/admin/inventario">Ver inventario</Accion>
              {admin.rol === "ADMIN_SISTEMA" && <Accion href="/admin/inventario/nuevo">Agregar producto</Accion>}
            </div>
          </div>
        </section>
      </Revelador>
    </>
  );
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-t border-carbon/[0.12] py-3.5 text-[16px]">
      <dt className="text-pizarra">{etiqueta}</dt>
      <dd className="font-medium tabular-nums text-carbon">{valor}</dd>
    </div>
  );
}

function Accion({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-[50px] items-center rounded-boton bg-turquesa px-[22px] text-[12px] font-bold uppercase text-carbon transition-colors hover:bg-[#4cc7a1]">
      {children} ›
    </Link>
  );
}
