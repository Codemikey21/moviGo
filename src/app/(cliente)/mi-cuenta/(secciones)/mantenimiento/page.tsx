import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { formatoFechaLarga, formatoPesos, hoyEnColombia } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { EstadoMantenimiento } from "@/modulos/gestion-servicios/interfaz/componentes/mantenimiento/EstadoMantenimiento";
import { FormularioMantenimiento } from "@/modulos/gestion-servicios/interfaz/componentes/mantenimiento/FormularioMantenimiento";
import { obtenerMisMantenimientos, obtenerMisVehiculos } from "@/modulos/gestion-servicios/servidor/mantenimiento/acciones";

export const metadata: Metadata = { title: "Mantenimiento · MoviGo" };

export default function PaginaMantenimiento() {
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
  const [vehiculos, mantenimientos] = await Promise.all([obtenerMisVehiculos(), obtenerMisMantenimientos()]);

  return (
    <>
      <section className="pb-12 pt-12">
        <p className="etiqueta text-carbon/70">Taller MoviGo</p>
        <h1 className="titular mt-4 text-[clamp(44px,6vw,88px)] text-carbon">
          Sin filas <span className="text-eucalipto">ni esperas</span>
        </h1>
        <p className="mt-5 max-w-[620px] text-[20px] leading-[1.4] text-pizarra">
          Agenda una revisión o reparación del vehículo que compraste y sigue su estado desde aquí.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="relative min-h-[320px] overflow-hidden rounded-tarjeta">
          <Image src="/img/landing/mantenimiento.jpg" alt="Mecánico de MoviGo revisando una bicicleta" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </div>
        <section className="rounded-tarjeta border border-carbon/10 p-6 sm:p-8">
          <h2 className="text-[24px] text-carbon">Agendar</h2>
          <div className="mt-6">
            {vehiculos.length ? (
              <FormularioMantenimiento vehiculos={vehiculos} desde={hoyEnColombia(1)} hasta={hoyEnColombia(30)} />
            ) : (
              <div className="rounded-[24px] bg-escarcha p-6">
                <p className="text-[17px] text-carbon">Aún no tienes vehículos comprados en MoviGo.</p>
                <p className="mt-1 text-[15px] text-pizarra">Cuando recibas tu compra, aparece aquí para agendar su mantenimiento.</p>
                <div className="mt-5">
                  <Boton href="/catalogo?modo=comprar">Ver catálogo</Boton>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {mantenimientos.length > 0 && (
        <section className="mt-16">
          <h2 className="etiqueta mb-5 text-carbon/70">Mis mantenimientos</h2>
          <ul className="divide-y divide-carbon/[0.08] border-y border-carbon/[0.08]">
            {mantenimientos.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-5 py-5">
                <VitrinaProducto foto={m.producto.foto} categoria={m.producto.categoria} tamanos="80px" className="size-20 rounded-[22px]" />
                <div className="min-w-0 flex-1">
                  <p className="etiqueta text-eucalipto">{m.tipo === "PREVENTIVO" ? "Revisión general" : "Reparación"}</p>
                  <p className="mt-1 text-[19px] text-carbon">
                    {m.producto.marca} {m.producto.nombre}
                  </p>
                  <p className="text-[14px] text-pizarra">
                    {formatoFechaLarga.format(m.programadoPara)} · {m.descripcion}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <EstadoMantenimiento estado={m.estado} />
                  {m.estado === "REALIZADO" && <span className="text-[15px] text-carbon">{formatoPesos.format(m.costo)}</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
