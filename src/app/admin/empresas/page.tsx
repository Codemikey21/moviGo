import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { formatoDia, formatoPesos, hoyEnColombia } from "@/compartido/utilidades/formato";
import { EstadoSolicitud } from "@/modulos/portal-empresarial/interfaz/componentes/EstadoSolicitud";
import { FormularioCotizacion } from "@/modulos/portal-empresarial/interfaz/componentes/FormularioCotizacion";
import { listarSolicitudesAdmin } from "@/modulos/portal-empresarial/servidor/acciones";
import { EncabezadoAdmin } from "../_componentes/EncabezadoAdmin";
import { EsqueletoLista } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Empresas · Administración MoviGo" };

export default function PaginaEmpresasAdmin() {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<EsqueletoLista etiqueta="Cargando solicitudes…" />}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  await connection();
  const solicitudes = await listarSolicitudesAdmin();
  return (
    <>
      <EncabezadoAdmin
        etiqueta="Portal empresarial"
        titulo={
          <>
            Solicitudes <span className="text-eucalipto">de empresas</span>
          </>
        }
        descripcion="Flotas en alquiler y domicilios en lote. Responde con una cotización y la empresa la acepta desde su portal."
      />
      <section className="rounded-tarjeta bg-blanco p-3 sm:p-5">
        {solicitudes.length === 0 ? (
          <p className="px-4 py-16 text-center text-[17px] text-pizarra">Todavía no hay solicitudes de empresas.</p>
        ) : (
          <ul className="divide-y divide-carbon/[0.07]">
            {solicitudes.map((s) => (
              <li key={s.id} className="grid items-center gap-4 px-3 py-5 lg:grid-cols-[1.2fr_1fr_auto_1.4fr]">
                <div className="min-w-0">
                  <p className="text-[17px] text-carbon">{s.empresa.razonSocial}</p>
                  <p className="text-[13px] text-pizarra">
                    NIT {s.empresa.nit} · {s.contacto ? `${s.contacto.nombre} (${s.contacto.cargo})` : "Sin contacto"}
                  </p>
                </div>
                <div>
                  <p className="text-[15px] text-carbon">
                    {s.cantidad} {s.tipo === "FLOTA_ALQUILER" ? "vehículos en alquiler" : "domicilios"}
                  </p>
                  <p className="text-[13px] text-pizarra">
                    {formatoDia.format(s.desde)} → {formatoDia.format(s.hasta)}
                    {s.notas ? ` · ${s.notas}` : ""}
                  </p>
                </div>
                <EstadoSolicitud estado={s.estado} cotizada={Boolean(s.cotizacion)} />
                <div className="lg:justify-self-end">
                  {s.cotizacion ? (
                    <p className="text-right text-[15px] text-carbon">
                      {formatoPesos.format(s.cotizacion.valor)}
                      <span className="block text-[12px] text-pizarra">vence el {formatoDia.format(s.cotizacion.validaHasta)}</span>
                    </p>
                  ) : s.estado === "ENVIADA" ? (
                    <FormularioCotizacion solicitudId={s.id} validaHasta={hoyEnColombia(15)} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
