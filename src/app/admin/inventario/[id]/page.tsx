import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { ListaMovimientos } from "@/modulos/gestion-almacen/interfaz/componentes/movimientos/ListaMovimientos";
import { DisponibilidadProducto } from "@/modulos/gestion-almacen/interfaz/componentes/stock/DisponibilidadProducto";
import { RegistrarUnidades } from "@/modulos/gestion-almacen/interfaz/componentes/unidades/RegistrarUnidades";
import { TablaUnidades } from "@/modulos/gestion-almacen/interfaz/componentes/unidades/TablaUnidades";
import { listarMovimientosAdmin } from "@/modulos/gestion-almacen/servidor/movimientos/acciones";
import { obtenerDisponibilidad, obtenerDisponibilidadPorColor } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { listarUnidadesAdmin } from "@/modulos/gestion-almacen/servidor/unidades/acciones";
import { ColoresProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/colores/ColoresProducto";
import { GaleriaFotos } from "@/modulos/gestion-catalogo/interfaz/componentes/medios/GaleriaFotos";
import { FormularioProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/FormularioProducto";
import { obtenerCategorias } from "@/modulos/gestion-catalogo/servidor/categorias/acciones";
import {
  cambiarActivoProductoAccion,
  obtenerProductoAdmin,
} from "@/modulos/gestion-catalogo/servidor/productos/acciones";
import { EsqueletoLista } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Producto · Administración MoviGo" };

export default function PaginaProductoAdmin({ params, searchParams }: PageProps<"/admin/inventario/[id]">) {
  return (
    <main className="mx-auto max-w-[1200px] px-3 pb-24 pt-10 md:px-5 md:pt-14">
      <Link href="/admin/inventario" className="text-[14px] text-pizarra hover:text-carbon">
        ← Inventario
      </Link>
      <Suspense fallback={<EsqueletoLista etiqueta="Cargando producto…" filas={4} className="mt-6" />}>
        <Contenido params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

function Seccion({ titulo, descripcion, children }: { titulo: string; descripcion?: string; children: ReactNode }) {
  return (
    <section className="rounded-tarjeta bg-blanco p-6 sm:p-8">
      <h2 className="text-[22px] font-medium tracking-[-0.01em] text-carbon">{titulo}</h2>
      {descripcion && <p className="mt-1 text-[14px] text-pizarra">{descripcion}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

async function Contenido({
  params,
  searchParams,
}: Pick<PageProps<"/admin/inventario/[id]">, "params" | "searchParams">) {
  await connection();
  const admin = await requerirAdministrador();
  const { id } = await params;
  const { aviso } = await searchParams;

  const producto = await obtenerProductoAdmin(id);
  if (!producto) notFound();

  // Catálogo y almacén son módulos separados: la página junta los dos
  const [categorias, disponibilidad, porColor, unidades, movimientos] = await Promise.all([
    obtenerCategorias(),
    obtenerDisponibilidad(producto.id),
    obtenerDisponibilidadPorColor(producto.id),
    listarUnidadesAdmin(producto.id),
    listarMovimientosAdmin(producto.id),
  ]);
  const puntos = disponibilidad.map((d) => ({ id: d.punto.id, nombre: d.punto.nombre }));
  // Unidades de cada color (en todos los puntos)
  const unidadesPorColor: Record<string, number> = {};
  for (const fila of porColor) if (fila.colorId) unidadesPorColor[fila.colorId] = (unidadesPorColor[fila.colorId] ?? 0) + fila.total;
  const esSistema = admin.rol === "ADMIN_SISTEMA";

  return (
    <div className="mt-4 space-y-6">
      {aviso === "creado" && (
        <Aviso tipo="exito">Producto creado. Ahora súbele fotos y registra sus unidades.</Aviso>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="etiqueta text-eucalipto">
            {producto.categoria.nombre} · {producto.marca}
          </p>
          <h1 className="titular mt-4 text-[clamp(40px,4.6vw,68px)] text-carbon">
            {producto.nombre}
          </h1>
          <p className="mt-2 text-[15px] text-pizarra">
            {formatoPesos.format(producto.precioVenta)}
            {producto.tarifaAlquilerDia
              ? ` · ${formatoPesos.format(producto.tarifaAlquilerDia)} por día`
              : " · solo venta"}
          </p>
        </div>
        {esSistema && (
          <form action={cambiarActivoProductoAccion} className="flex items-center gap-3">
            <input type="hidden" name="id" value={producto.id} />
            <input type="hidden" name="activo" value={producto.activo ? "false" : "true"} />
            <span className="text-[14px] text-pizarra">
              {producto.activo ? "Visible en el catálogo" : "Oculto del catálogo"}
            </span>
            <button
              type="submit"
              role="switch"
              aria-checked={producto.activo}
              aria-label="Mostrar en el catálogo"
              className={`relative h-7 w-12 rounded-full transition-colors ${producto.activo ? "bg-turquesa" : "bg-carbon/15"}`}
            >
              <span
                className={`absolute top-1 size-5 rounded-full bg-blanco transition-[left] ${producto.activo ? "left-6" : "left-1"}`}
              />
            </button>
          </form>
        )}
      </div>

      <Seccion
        titulo="Colores"
        descripcion="Los colores del configurador. Marca cada foto y cada unidad con su color para que la ficha muestre el stock por color."
      >
        <ColoresProducto productoId={producto.id} colores={producto.colores} conteo={unidadesPorColor} puedeEditar={esSistema} />
      </Seccion>

      <Seccion
        titulo="Fotos"
        descripcion="Sube las fotos de cada color y vista. La primera es la que se ve en el catálogo."
      >
        <GaleriaFotos productoId={producto.id} fotos={producto.fotos} colores={producto.colores} puedeEditar={esSistema} />
      </Seccion>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-start">

        <Seccion titulo="Unidades por punto" descripcion="Disponibles para vender o alquilar hoy.">
          <DisponibilidadProducto puntos={disponibilidad} />
          <div className="mt-8 border-t border-carbon/[0.08] pt-6">
            <h3 className="mb-4 text-[16px] font-medium text-carbon">Registrar ingreso</h3>
            <RegistrarUnidades productoId={producto.id} puntos={puntos} colores={producto.colores} puntoFijo={admin.puntoId} />
          </div>
        </Seccion>

        <Seccion
          titulo={`Unidades (${unidades.length})`}
          descripcion="Cada vehículo físico con su serial y su color. Desde aquí lo mandas al taller o lo trasladas."
        >
          <TablaUnidades unidades={unidades} puntos={puntos} puntoFijo={admin.puntoId} />
        </Seccion>
      </div>

      {esSistema && (
        <Seccion titulo="Datos del producto">
          <FormularioProducto
            categorias={categorias}
            producto={{
              id: producto.id,
              categoriaId: producto.categoriaId,
              nombre: producto.nombre,
              marca: producto.marca,
              modelo: producto.modelo,
              descripcion: producto.descripcion,
              precioVenta: producto.precioVenta,
              tarifaAlquilerDia: producto.tarifaAlquilerDia,
              especificaciones: producto.especificaciones,
            }}
          />
        </Seccion>
      )}

      <Seccion titulo="Movimientos recientes">
        <ListaMovimientos movimientos={movimientos} />
      </Seccion>
    </div>
  );
}
