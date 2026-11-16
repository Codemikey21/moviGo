import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatoFechaLarga, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { EstadoMantenimiento } from "@/modulos/gestion-servicios/interfaz/componentes/mantenimiento/EstadoMantenimiento";
import { GestionMantenimiento } from "@/modulos/gestion-servicios/interfaz/componentes/mantenimiento/GestionMantenimiento";
import { listarMantenimientosAdmin } from "@/modulos/gestion-servicios/servidor/mantenimiento/acciones";
import { EncabezadoAdmin } from "../_componentes/EncabezadoAdmin";
import { EsqueletoLista } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Taller · Administración MoviGo" };

export default function PaginaTallerAdmin() {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<EsqueletoLista etiqueta="Cargando el taller…" />}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  await connection();
  const lista = await listarMantenimientosAdmin();
  return (
    <>
      <EncabezadoAdmin
        etiqueta="Taller"
        titulo={
          <>
            Mantenimiento <span className="text-eucalipto">agendado</span>
          </>
        }
        descripcion="Las revisiones y reparaciones que piden los clientes para los vehículos que compraron."
      />
      <section className="rounded-tarjeta bg-blanco p-3 sm:p-5">
        {lista.length === 0 ? (
          <p className="px-4 py-16 text-center text-[17px] text-pizarra">No hay mantenimientos agendados.</p>
        ) : (
          <ul className="divide-y divide-carbon/[0.07]">
            {lista.map((m) => (
              <li key={m.id} className="grid items-center gap-4 px-3 py-4 md:grid-cols-[auto_1.3fr_1fr_auto_auto]">
                <VitrinaProducto foto={m.producto.foto} categoria={m.producto.categoria} tamanos="64px" className="size-14 rounded-[16px]" />
                <div className="min-w-0">
                  <p className="text-[16px] text-carbon">
                    {m.producto.marca} {m.producto.nombre} <span className="font-mono text-[13px] text-pizarra">{m.unidad.serial}</span>
                  </p>
                  <p className="truncate text-[13px] text-pizarra">
                    {m.tipo === "PREVENTIVO" ? "Revisión" : "Reparación"} · {m.descripcion}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-[15px] text-carbon">{m.cliente?.nombre ?? "—"}</p>
                  <p className="text-[13px] text-pizarra">{formatoFechaLarga.format(m.programadoPara)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <EstadoMantenimiento estado={m.estado} />
                  {m.estado === "REALIZADO" && <span className="text-[15px] text-carbon">{formatoPesos.format(m.costo)}</span>}
                </div>
                <GestionMantenimiento id={m.id} estado={m.estado} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
