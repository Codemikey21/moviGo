import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatoDia, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { AccionesAlquiler } from "@/modulos/gestion-servicios/interfaz/componentes/alquiler/AccionesAlquiler";
import { EstadoAlquiler } from "@/modulos/gestion-servicios/interfaz/componentes/alquiler/EstadoAlquiler";
import { conteosAlquileresAdmin, listarAlquileresAdmin } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";
import { EncabezadoAdmin, FiltroEstados } from "../_componentes/EncabezadoAdmin";

export const metadata: Metadata = { title: "Alquileres · Administración MoviGo" };

export default function PaginaAlquileresAdmin({ searchParams }: PageProps<"/admin/alquileres">) {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<p className="pt-16 text-pizarra">Cargando alquileres…</p>}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/admin/alquileres">, "searchParams">) {
  await connection();
  const { estado } = await searchParams;
  const filtro = typeof estado === "string" ? estado : undefined;
  const [alquileres, conteos] = await Promise.all([listarAlquileresAdmin(filtro), conteosAlquileresAdmin()]);
  const total = Object.values(conteos).reduce((s, n) => s + (n ?? 0), 0);
  const hoy = new Date();

  return (
    <>
      <EncabezadoAdmin
        etiqueta="Flota"
        titulo={
          <>
            Alquileres <span className="text-eucalipto">por días</span>
          </>
        }
        descripcion="Entrega el vehículo con el código del cliente y recíbelo cuando lo devuelva: el inventario se actualiza solo."
      />
      <FiltroEstados
        base="/admin/alquileres"
        actual={filtro}
        opciones={[
          { texto: "Todos", cantidad: total },
          { valor: "ASIGNADO", texto: "Por entregar", cantidad: conteos.ASIGNADO ?? 0 },
          { valor: "EN_CURSO", texto: "En la calle", cantidad: conteos.EN_CURSO ?? 0 },
          { valor: "SOLICITADO", texto: "Esperando pago", cantidad: conteos.SOLICITADO ?? 0 },
          { valor: "COMPLETADO", texto: "Devueltos", cantidad: conteos.COMPLETADO ?? 0 },
          { valor: "CANCELADO", texto: "Cancelados", cantidad: conteos.CANCELADO ?? 0 },
        ]}
      />

      <section className="rounded-tarjeta bg-blanco p-3 sm:p-5">
        {alquileres.length === 0 ? (
          <p className="px-4 py-16 text-center text-[17px] text-pizarra">No hay alquileres con este filtro.</p>
        ) : (
          <ul className="divide-y divide-carbon/[0.07]">
            {alquileres.map((a) => {
              const vencido = a.estado === "EN_CURSO" && a.fechaFin < hoy;
              return (
                <li key={a.id} className="grid items-center gap-4 px-3 py-4 md:grid-cols-[auto_1.3fr_1fr_auto_auto]">
                  <VitrinaProducto foto={a.producto.foto} categoria={a.producto.categoria} tamanos="64px" className="size-14 rounded-[16px]" />
                  <div className="min-w-0">
                    <p className="text-[16px] text-carbon">
                      {a.producto.marca} {a.producto.nombre}
                    </p>
                    <p className="text-[13px] text-pizarra">
                      <span className="font-mono">{a.unidad.serial}</span> · código{" "}
                      <span className="font-mono text-carbon">{a.codigoRecogida}</span>
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] text-carbon">{a.cliente.nombre}</p>
                    <p className={`text-[13px] ${vencido ? "text-[#c0392b]" : "text-pizarra"}`}>
                      {formatoDia.format(a.fechaInicio)} → {formatoDia.format(a.fechaFin)} {vencido && "· vencido"} ·{" "}
                      {a.entrega === "EN_PUNTO" ? a.punto?.nombre.replace("MoviGo ", "") : "A domicilio"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <EstadoAlquiler estado={a.estado} />
                    <span className="w-28 text-right text-[15px] tabular-nums text-carbon">{formatoPesos.format(a.total)}</span>
                  </div>
                  <AccionesAlquiler alquiler={a} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
