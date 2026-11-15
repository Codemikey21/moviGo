import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { formatoFechaHora, formatoFechaLarga, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { EstadoPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/EstadoPedido";
import { obtenerMisPedidos } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { EstadoAlquiler } from "@/modulos/gestion-servicios/interfaz/componentes/alquiler/EstadoAlquiler";
import { obtenerMisAlquileres } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";

export const metadata: Metadata = { title: "Pedidos y alquileres · MoviGo" };

export default function PaginaPedidos() {
  return (
    <div className="contenedor">
      <Suspense fallback={<p className="mt-10 text-pizarra">Cargando…</p>}>
        <Contenido />
      </Suspense>
    </div>
  );
}

async function Contenido() {
  await connection();
  const [pedidos, alquileres] = await Promise.all([obtenerMisPedidos(), obtenerMisAlquileres()]);

  // Compras y alquileres en una sola lista, lo más reciente primero
  const filas = [
    ...pedidos.map((p) => ({
      clave: p.id,
      fecha: p.creadoEn,
      href: `/mi-cuenta/pedidos/${p.numero}`,
      etiqueta: `Compra · ${p.numero}`,
      titulo: `${p.lineas[0]?.marca ?? ""} ${p.lineas[0]?.nombre ?? ""}`,
      extra: p.lineas.length > 1 ? `y ${p.lineas.length - 1} más` : p.entrega === "A_DOMICILIO" ? "A domicilio" : "Recoger en punto",
      foto: p.lineas[0]?.foto ?? null,
      categoria: p.lineas[0]?.categoria ?? "bicicletas",
      total: p.total,
      estado: <EstadoPedido estado={p.estado} entrega={p.entrega} />,
    })),
    ...alquileres.map((a) => ({
      clave: a.id,
      fecha: a.creadaEn,
      href: `/mi-cuenta/alquileres/${a.id}`,
      etiqueta: `Alquiler · ${a.dias} día${a.dias === 1 ? "" : "s"}`,
      titulo: `${a.producto.marca} ${a.producto.nombre}`,
      extra: `Desde el ${formatoFechaLarga.format(a.fechaInicio)}`,
      foto: a.producto.foto,
      categoria: a.producto.categoria,
      total: a.total,
      estado: <EstadoAlquiler estado={a.estado} />,
    })),
  ].sort((x, y) => y.fecha.getTime() - x.fecha.getTime());

  return (
    <>
      <section className="pb-12 pt-12">
        <p className="etiqueta text-carbon/70">Historial</p>
        <h1 className="titular mt-4 text-[clamp(44px,6vw,88px)] text-carbon">
          Pedidos y <span className="text-eucalipto">alquileres</span>
        </h1>
      </section>

      {filas.length === 0 ? (
        <div className="rounded-tarjeta bg-escarcha px-6 py-20 text-center">
          <p className="text-[24px] text-carbon">Todavía no has comprado ni alquilado nada.</p>
          <div className="mt-8">
            <Boton href="/catalogo">Ver catálogo</Boton>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-carbon/[0.08] border-y border-carbon/[0.08]">
          {filas.map((f) => (
            <li key={f.clave}>
              <Link href={f.href} className="flex items-center gap-5 rounded-[28px] py-5 transition-colors hover:bg-escarcha sm:px-4">
                <VitrinaProducto foto={f.foto} categoria={f.categoria} tamanos="96px" className="size-20 shrink-0 rounded-[22px] sm:size-24" />
                <div className="min-w-0 flex-1">
                  <p className="etiqueta text-eucalipto">{f.etiqueta}</p>
                  <p className="mt-1.5 truncate text-[19px] text-carbon">{f.titulo}</p>
                  <p className="mt-0.5 text-[14px] text-pizarra">
                    {f.extra} · {formatoFechaHora.format(f.fecha)}
                  </p>
                </div>
                <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                  {f.estado}
                  <span className="text-[18px] tabular-nums text-carbon">{formatoPesos.format(f.total)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
