import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { formatoFechaLarga, formatoPesos, hoyEnColombia } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { EstadoMantenimiento } from "@/modulos/gestion-servicios/interfaz/componentes/mantenimiento/EstadoMantenimiento";
import { FormularioMantenimiento } from "@/modulos/gestion-servicios/interfaz/componentes/mantenimiento/FormularioMantenimiento";
import { obtenerMisMantenimientos, obtenerMisVehiculos } from "@/modulos/gestion-servicios/servidor/mantenimiento/acciones";

export const metadata: Metadata = { title: "Mantenimiento · MoviGo" };

const pasosTaller = [
  ["Agéndalo", "Elige el día y cuéntanos qué le pasa."],
  ["Lo revisamos", "Nuestro taller lo recibe y lo pone a punto."],
  ["Listo", "Te avisamos con el costo para recogerlo."],
];

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
  const activos = mantenimientos.filter((m) => m.estado !== "REALIZADO");
  const realizados = mantenimientos.filter((m) => m.estado === "REALIZADO");

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
        <div className="relative min-h-[420px] overflow-hidden rounded-tarjeta rounded-bl-none">
          <Image src="/img/landing/mantenimiento.jpg" alt="Mecánico de MoviGo revisando una bicicleta" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-carbon/30 to-transparent" />
          <ol className="absolute inset-x-6 bottom-24 grid gap-4 text-blanco sm:inset-x-8 sm:grid-cols-3">
            {pasosTaller.map(([t, d], i) => (
              <li key={t}>
                <p className="font-mono text-[13px] text-turquesa">0{i + 1}</p>
                <p className="mt-1 text-[18px] leading-tight">{t}</p>
                <p className="mt-1 text-[14px] leading-snug text-blanco/70">{d}</p>
              </li>
            ))}
          </ol>
          <Muesca lado="izquierda" fondo="var(--color-blanco)" className="pr-[18px] pt-4">
            <p className="flex items-center gap-2 pl-1 text-[14px] text-carbon">
              <Icono nombre="campana" className="size-[18px] text-eucalipto" /> Te avisamos en cada paso
            </p>
          </Muesca>
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

      {activos.length > 0 && (
        <section className="mt-16">
          <h2 className="etiqueta mb-5 text-carbon/70">En el taller</h2>
          <ul className="grid gap-4 md:grid-cols-2">
            {activos.map((m) => (
              <li key={m.id} className="rounded-[30px] bg-escarcha p-3">
                <div className="flex items-center gap-4 p-2">
                  <VitrinaProducto foto={m.producto.foto} categoria={m.producto.categoria} tamanos="96px" className="size-24 shrink-0 rounded-[22px]" />
                  <div className="min-w-0 flex-1">
                    <p className="etiqueta text-eucalipto">{m.tipo === "PREVENTIVO" ? "Revisión general" : "Reparación"}</p>
                    <p className="mt-1 truncate text-[20px] text-carbon">
                      {m.producto.marca} {m.producto.nombre}
                    </p>
                    <p className="text-[14px] text-pizarra">{formatoFechaLarga.format(m.programadoPara)}</p>
                  </div>
                  <EstadoMantenimiento estado={m.estado} />
                </div>
                <p className="px-2 pt-2 text-[15px] text-pizarra">{m.descripcion}</p>
                {/* Avance: agendado → en el taller → listo */}
                <ol className="mt-4 grid grid-cols-3 gap-1.5 rounded-[22px] bg-blanco p-2">
                  {(["PROGRAMADO", "EN_CURSO", "REALIZADO"] as const).map((e, i) => {
                    const nivel = ["PROGRAMADO", "EN_CURSO", "REALIZADO"].indexOf(m.estado);
                    return (
                      <li
                        key={e}
                        className={`rounded-[16px] px-3 py-2.5 text-center text-[13px] ${
                          i < nivel ? "bg-turquesa/25 text-bosque" : i === nivel ? "bg-carbon text-blanco" : "text-pizarra"
                        }`}
                      >
                        {["Agendado", "En el taller", "Listo"][i]}
                      </li>
                    );
                  })}
                </ol>
              </li>
            ))}
          </ul>
        </section>
      )}

      {realizados.length > 0 && (
        <section className="mt-16">
          <h2 className="etiqueta mb-2 text-carbon/70">Historial del taller</h2>
          <ul className="divide-y divide-carbon/[0.08] border-y border-carbon/[0.08]">
            {realizados.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center gap-5 py-4">
                <VitrinaProducto foto={m.producto.foto} categoria={m.producto.categoria} tamanos="80px" className="size-16 rounded-[18px] sm:size-20" />
                <div className="min-w-0 flex-1">
                  <p className="etiqueta text-eucalipto">{m.tipo === "PREVENTIVO" ? "Revisión general" : "Reparación"}</p>
                  <p className="mt-1 text-[18px] text-carbon">
                    {m.producto.marca} {m.producto.nombre}
                  </p>
                  <p className="text-[14px] text-pizarra">
                    {formatoFechaLarga.format(m.realizadoEn ?? m.programadoPara)} · {m.descripcion}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <EstadoMantenimiento estado={m.estado} />
                  <span className="text-[16px] tabular-nums text-carbon">{formatoPesos.format(m.costo)}</span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
