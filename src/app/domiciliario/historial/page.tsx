import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatoFechaHora } from "@/compartido/utilidades/formato";
import { kilometros } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/TarjetaEntrega";
import { obtenerHistorialReparto } from "@/modulos/gestion-servicios/servidor/reparto/acciones";

export const metadata: Metadata = { title: "Historial · Reparto MoviGo" };

export default function PaginaHistorialReparto() {
  return (
    <main className="mx-auto max-w-[1180px] px-3 pb-24 pt-6 md:px-5">
      <Suspense fallback={<p className="pt-10 text-pizarra">Cargando historial…</p>}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  await connection();
  const { resumen, entregas } = await obtenerHistorialReparto();
  const recorrido = entregas.reduce((s, e) => s + e.distancia, 0);

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-8 pt-4 md:pt-8">
        <div>
          <p className="etiqueta text-carbon/70">Historial</p>
          <h1 className="titular mt-4 text-[clamp(40px,5vw,76px)] text-carbon">
            Tus entregas <span className="text-eucalipto">hechas</span>
          </h1>
        </div>
        <dl className="flex gap-3">
          {[
            ["Hoy", String(resumen.hoy)],
            ["7 días", String(resumen.semana)],
            ["Recorrido", kilometros(recorrido)],
          ].map(([t, v]) => (
            <div key={t} className="rounded-[22px] bg-blanco px-5 py-4">
              <dd className="titular text-[30px] leading-none text-carbon">{v}</dd>
              <dt className="mt-2 text-[13px] text-pizarra">{t}</dt>
            </div>
          ))}
        </dl>
      </div>

      {entregas.length === 0 ? (
        <p className="rounded-tarjeta bg-blanco px-6 py-16 text-center text-[17px] text-pizarra">
          Aquí verás cada entrega que completes.
        </p>
      ) : (
        <ul className="divide-y divide-carbon/[0.07] rounded-tarjeta bg-blanco px-3 sm:px-5">
          {entregas.map((e) => (
            <li key={e.id}>
              <Link href={`/domiciliario/entregas/${e.id}`} className="grid items-center gap-2 px-3 py-5 sm:grid-cols-[1fr_auto] sm:gap-6">
                <div className="min-w-0">
                  <p className="truncate text-[17px] text-carbon">
                    {e.destino.direccion}
                    {e.destino.barrio ? `, ${e.destino.barrio}` : ""}
                  </p>
                  <p className="truncate text-[14px] text-pizarra">
                    {e.descripcion} · desde {e.origen.nombre.replace("MoviGo ", "")}
                    {e.pedidoNumero ? ` · ${e.pedidoNumero}` : ""}
                  </p>
                </div>
                <p className="font-mono text-[12px] uppercase text-pizarra sm:text-right">
                  {e.entregadoEn ? formatoFechaHora.format(e.entregadoEn) : ""} · {kilometros(e.distancia)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
