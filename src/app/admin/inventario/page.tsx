import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { OcupacionPuntos } from "@/modulos/gestion-almacen/interfaz/componentes/stock/OcupacionPuntos";
import { obtenerConteos, obtenerPuntos } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { obtenerCategorias } from "@/modulos/gestion-catalogo/servidor/categorias/acciones";
import { listarProductosAdmin } from "@/modulos/gestion-catalogo/servidor/productos/acciones";
import { EsqueletoLista } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Inventario · Administración MoviGo" };

export default function PaginaInventario({ searchParams }: PageProps<"/admin/inventario">) {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 pt-10 md:px-5 md:pt-14">
      <Suspense fallback={<EsqueletoLista etiqueta="Cargando inventario…" className="" />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/admin/inventario">, "searchParams">) {
  await connection();
  const admin = await requerirAdministrador();
  const parametros = await searchParams;
  const categoria = typeof parametros.categoria === "string" ? parametros.categoria : undefined;
  const busqueda = typeof parametros.q === "string" ? parametros.q : undefined;

  // Catálogo y almacén son módulos separados: la página junta los dos
  const [categorias, productos, puntos] = await Promise.all([
    obtenerCategorias(),
    listarProductosAdmin({ categoria, busqueda }),
    obtenerPuntos(),
  ]);
  const conteos = await obtenerConteos(productos.map((p) => p.id));

  const enlace = (slug?: string) => {
    const p = new URLSearchParams();
    if (slug) p.set("categoria", slug);
    if (busqueda) p.set("q", busqueda);
    const texto = p.toString();
    return texto ? `/admin/inventario?${texto}` : "/admin/inventario";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="etiqueta text-carbon/70">Catálogo y almacén</p>
          <h1 className="titular mt-4 text-[clamp(40px,5vw,76px)] text-carbon">
            Inventario
          </h1>
        </div>
        {admin.rol === "ADMIN_SISTEMA" && <Boton href="/admin/inventario/nuevo">Nuevo producto</Boton>}
      </div>

      <OcupacionPuntos puntos={puntos} />

      <section className="rounded-tarjeta bg-blanco p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Categorías" className="flex flex-wrap gap-1.5">
            <Link
              href={enlace()}
              aria-current={!categoria ? "page" : undefined}
              className={`flex h-10 items-center rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
                !categoria ? "bg-bosque text-blanco" : "bg-escarcha text-carbon hover:bg-carbon/[0.06]"
              }`}
            >
              Todas
            </Link>
            {categorias.map((c) => (
              <Link
                key={c.id}
                href={enlace(c.slug)}
                aria-current={categoria === c.slug ? "page" : undefined}
                className={`flex h-10 items-center rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
                  categoria === c.slug ? "bg-bosque text-blanco" : "bg-escarcha text-carbon hover:bg-carbon/[0.06]"
                }`}
              >
                {c.nombre}
              </Link>
            ))}
          </nav>
          <form action="/admin/inventario" className="ml-auto w-full sm:w-64">
            {categoria && <input type="hidden" name="categoria" value={categoria} />}
            <input
              type="search"
              name="q"
              defaultValue={busqueda}
              placeholder="Buscar marca o modelo"
              aria-label="Buscar producto"
              className="h-10 w-full rounded-full border border-transparent bg-escarcha px-4 text-[14px] outline-none focus:border-carbon focus:bg-blanco"
            />
          </form>
        </div>

        {productos.length === 0 ? (
          <p className="px-2 py-12 text-center text-pizarra">No hay productos con ese filtro.</p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead>
                <tr className="etiqueta text-bruma">
                  <th className="py-2 pr-4 font-medium">Producto</th>
                  <th className="py-2 pr-4 font-medium">Categoría</th>
                  <th className="py-2 pr-4 text-right font-medium">Venta</th>
                  <th className="py-2 pr-4 text-right font-medium">Alquiler / día</th>
                  <th className="py-2 pr-4 text-right font-medium">Unidades</th>
                  <th className="py-2 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-carbon/[0.06]">
                {productos.map((p) => {
                  const conteo = conteos[p.id] ?? { disponibles: 0, total: 0 };
                  return (
                    <tr key={p.id} className="group relative transition-colors hover:bg-escarcha/60">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <VitrinaProducto foto={p.foto} categoria={p.categoria.slug} className="size-12 shrink-0 rounded-[14px]" tamanos="48px" />
                          <div className="min-w-0">
                            {/* El enlace cubre toda la fila */}
                            <Link
                              href={`/admin/inventario/${p.id}`}
                              className="font-medium text-carbon after:absolute after:inset-0"
                            >
                              {p.nombre}
                            </Link>
                            <p className="truncate text-[13px] text-bruma">
                              {p.marca} · {p.modelo}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-pizarra">{p.categoria.nombre}</td>
                      <td className="py-3 pr-4 text-right tabular-nums text-carbon">
                        {formatoPesos.format(p.precioVenta)}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums text-pizarra">
                        {p.tarifaAlquilerDia ? formatoPesos.format(p.tarifaAlquilerDia) : "Solo venta"}
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">
                        <span className={conteo.disponibles ? "text-carbon" : "text-[#c0392b]"}>
                          {conteo.disponibles}
                        </span>
                        <span className="text-bruma"> / {conteo.total}</span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${
                            p.activo ? "bg-turquesa/25 text-bosque" : "bg-carbon/[0.06] text-bruma"
                          }`}
                        >
                          {p.activo ? "Publicado" : "Oculto"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 px-1 text-[13px] text-bruma">
          {productos.length} producto{productos.length === 1 ? "" : "s"} · Unidades: disponibles / total en
          los puntos
        </p>
      </section>
    </div>
  );
}
