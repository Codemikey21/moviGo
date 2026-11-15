import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { formatoDia, formatoFechaHora, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import type { Foto } from "@/modulos/gestion-catalogo/tipos";
import { EstadoPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/EstadoPedido";
import { obtenerMisPedidos } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { EstadoAlquiler } from "@/modulos/gestion-servicios/interfaz/componentes/alquiler/EstadoAlquiler";
import { obtenerMisAlquileres } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";

export const metadata: Metadata = { title: "Pedidos y alquileres · MoviGo" };

const filtros = [
  { valor: "todo", texto: "Todo" },
  { valor: "curso", texto: "En curso" },
  { valor: "compras", texto: "Compras" },
  { valor: "alquileres", texto: "Alquileres" },
] as const;
type Filtro = (typeof filtros)[number]["valor"];

type Fila = {
  clave: string;
  tipo: "compra" | "alquiler";
  fecha: Date;
  href: string;
  etiqueta: string;
  titulo: string;
  extra: string;
  /** Lo que toca hacer ahora, si algo */
  siguiente: string | null;
  foto: Foto | null;
  categoria: string;
  total: number;
  activo: boolean;
  estado: ReactNode;
};

const mesAnio = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "America/Bogota" });

export default function PaginaPedidos({ searchParams }: PageProps<"/mi-cuenta/pedidos">) {
  return (
    <div className="contenedor">
      <Suspense fallback={<p className="mt-10 text-pizarra">Cargando…</p>}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/mi-cuenta/pedidos">, "searchParams">) {
  await connection();
  const [{ ver }, pedidos, alquileres] = await Promise.all([searchParams, obtenerMisPedidos(), obtenerMisAlquileres()]);
  const filtro: Filtro = filtros.some((f) => f.valor === ver) ? (ver as Filtro) : "todo";

  // Compras y alquileres en una sola lista, lo más reciente primero
  const todas: Fila[] = [
    ...pedidos.map((p) => ({
      clave: p.id,
      tipo: "compra" as const,
      fecha: p.creadoEn,
      href: `/mi-cuenta/pedidos/${p.numero}`,
      etiqueta: `Compra · ${p.numero}`,
      titulo: `${p.lineas[0]?.marca ?? ""} ${p.lineas[0]?.nombre ?? ""}`.trim(),
      extra: p.lineas.length > 1 ? `y ${p.lineas.length - 1} producto${p.lineas.length > 2 ? "s" : ""} más` : p.entrega === "A_DOMICILIO" ? "A domicilio" : "Recoger en punto",
      siguiente:
        p.estado === "PENDIENTE_PAGO"
          ? "Completa el pago"
          : p.estado === "PREPARANDO" && p.entrega === "EN_PUNTO"
            ? "Ya puedes recogerlo"
            : ["PAGADO", "PREPARANDO"].includes(p.estado)
              ? p.entrega === "A_DOMICILIO" ? "Sigue la entrega en el mapa" : "Te avisamos cuando esté listo"
              : null,
      foto: p.lineas[0]?.foto ?? null,
      categoria: p.lineas[0]?.categoria ?? "scooters",
      total: p.total,
      activo: ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO"].includes(p.estado),
      estado: <EstadoPedido estado={p.estado} entrega={p.entrega} />,
    })),
    ...alquileres.map((a) => ({
      clave: a.id,
      tipo: "alquiler" as const,
      fecha: a.creadaEn,
      href: `/mi-cuenta/alquileres/${a.id}`,
      etiqueta: `Alquiler · ${a.dias} día${a.dias === 1 ? "" : "s"}`,
      titulo: `${a.producto.marca} ${a.producto.nombre}`,
      extra: `Del ${formatoDia.format(a.fechaInicio)} al ${formatoDia.format(a.fechaFin)}`,
      siguiente:
        a.estado === "SOLICITADO"
          ? "Completa el pago"
          : a.estado === "ASIGNADO"
            ? a.entrega === "EN_PUNTO" ? "Recógelo con tu código" : "Te lo llevamos"
            : a.estado === "EN_CURSO"
              ? `Devuélvelo el ${formatoDia.format(a.fechaFin)}`
              : null,
      foto: a.producto.foto,
      categoria: a.producto.categoria,
      total: a.total,
      activo: ["SOLICITADO", "ASIGNADO", "EN_CURSO"].includes(a.estado),
      estado: <EstadoAlquiler estado={a.estado} />,
    })),
  ].sort((x, y) => y.fecha.getTime() - x.fecha.getTime());

  const filas = todas.filter(
    (f) => filtro === "todo" || (filtro === "curso" && f.activo) || (filtro === "compras" && f.tipo === "compra") || (filtro === "alquileres" && f.tipo === "alquiler"),
  );
  const activas = filas.filter((f) => f.activo);
  const terminadas = filtro === "curso" ? [] : filas.filter((f) => !f.activo);

  // Terminadas agrupadas por mes
  const meses = new Map<string, Fila[]>();
  for (const f of terminadas) {
    const mes = mesAnio.format(f.fecha);
    meses.set(mes, [...(meses.get(mes) ?? []), f]);
  }

  const cuenta = (pred: (f: Fila) => boolean) => todas.filter(pred).length;

  return (
    <>
      <section className="flex flex-wrap items-end justify-between gap-8 pb-10 pt-12">
        <div>
          <p className="etiqueta text-carbon/70">Historial</p>
          <h1 className="titular mt-4 text-[clamp(44px,6vw,88px)] text-carbon">
            Pedidos y <span className="text-eucalipto">alquileres</span>
          </h1>
        </div>
        <dl className="flex gap-8">
          {[
            ["En curso", cuenta((f) => f.activo)],
            ["Compras", cuenta((f) => f.tipo === "compra")],
            ["Alquileres", cuenta((f) => f.tipo === "alquiler")],
          ].map(([t, n]) => (
            <div key={t}>
              <dt className="text-[13px] text-pizarra">{t}</dt>
              <dd className="titular mt-1 text-[40px] leading-none text-carbon">{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label="Filtrar" className="mb-10 flex flex-wrap gap-1.5">
        {filtros.map((f) => {
          const activo = f.valor === filtro;
          return (
            <Link
              key={f.valor}
              href={f.valor === "todo" ? "/mi-cuenta/pedidos" : `/mi-cuenta/pedidos?ver=${f.valor}`}
              aria-current={activo ? "page" : undefined}
              scroll={false}
              className={`flex h-11 items-center rounded-full px-5 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
                activo ? "bg-bosque text-blanco" : "bg-escarcha text-carbon hover:bg-salvia"
              }`}
            >
              {f.texto}
            </Link>
          );
        })}
      </nav>

      {todas.length === 0 ? (
        <div className="rounded-tarjeta bg-escarcha px-6 py-20 text-center">
          <p className="titular text-[34px] text-carbon">Todavía no has comprado ni alquilado nada.</p>
          <p className="mt-3 text-[16px] text-pizarra">Cuando lo hagas, aquí lo sigues paso a paso.</p>
          <div className="mt-8">
            <Boton href="/catalogo">Ver catálogo</Boton>
          </div>
        </div>
      ) : filas.length === 0 ? (
        <p className="rounded-tarjeta bg-escarcha px-6 py-16 text-center text-[17px] text-pizarra">No hay nada en esta lista.</p>
      ) : (
        <>
          {activas.length > 0 && (
            <section aria-labelledby="titulo-curso">
              <h2 id="titulo-curso" className="etiqueta mb-5 text-carbon/70">
                En curso
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {activas.map((f) => (
                  <li key={f.clave}>
                    <TarjetaActiva fila={f} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {[...meses].map(([mes, lista]) => (
            <section key={mes} className="mt-14" aria-label={mes}>
              <h2 className="etiqueta mb-2 text-carbon/70 first-letter:uppercase">{mes}</h2>
              <ul className="divide-y divide-carbon/[0.08] border-y border-carbon/[0.08]">
                {lista.map((f) => (
                  <li key={f.clave}>
                    <Link href={f.href} className="group flex items-center gap-5 rounded-[24px] py-4 transition-colors hover:bg-escarcha sm:px-4">
                      <VitrinaProducto foto={f.foto} categoria={f.categoria} tamanos="80px" className="size-16 shrink-0 rounded-[18px] sm:size-20" />
                      <div className="min-w-0 flex-1">
                        <p className="etiqueta text-eucalipto">{f.etiqueta}</p>
                        <p className="mt-1 truncate text-[18px] text-carbon">{f.titulo}</p>
                        <p className="text-[14px] text-pizarra">
                          {f.extra} · {formatoFechaHora.format(f.fecha)}
                        </p>
                      </div>
                      <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                        {f.estado}
                        <span className="text-[17px] tabular-nums text-carbon">{formatoPesos.format(f.total)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </>
  );
}

/**
 * Lo que está en curso va en tarjetas grandes: el producto en su vitrina con
 * el estado en una pestaña recortada, y abajo lo que toca hacer ahora.
 */
function TarjetaActiva({ fila: f }: { fila: Fila }) {
  const urgente = f.siguiente === "Completa el pago";
  return (
    <Link href={f.href} className="group block rounded-[30px] bg-escarcha p-3 transition-transform duration-700 ease-salida hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-[24px] rounded-bl-none">
        <VitrinaProducto
          foto={f.foto}
          categoria={f.categoria}
          tamanos="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
          tamanoDibujo="w-[62%]"
          className="aspect-[16/9] transition-transform duration-700 ease-salida group-hover:scale-[1.03]"
        />
        <Muesca lado="izquierda" fondo="var(--color-escarcha)" className="pr-3 pt-3">
          {f.estado}
        </Muesca>
        <p className="absolute right-4 top-4 rounded-full bg-blanco/85 px-3 py-1.5 font-mono text-[11px] uppercase text-carbon backdrop-blur">
          {f.tipo === "compra" ? "Compra" : "Alquiler"}
        </p>
      </div>
      <div className="px-3 pb-3 pt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="etiqueta min-w-0 truncate text-eucalipto">{f.etiqueta}</p>
          <p className="shrink-0 text-[17px] tabular-nums text-carbon">{formatoPesos.format(f.total)}</p>
        </div>
        <p className="mt-1.5 truncate text-[20px] text-carbon">{f.titulo}</p>
        <p className="text-[14px] text-pizarra">{f.extra}</p>
        {f.siguiente && (
          <p className={`mt-3 text-[13px] font-bold uppercase ${urgente ? "text-[#7a5a12]" : "text-bosque"}`}>
            {f.siguiente}{" "}
            <span aria-hidden className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              ›
            </span>
          </p>
        )}
      </div>
    </Link>
  );
}
