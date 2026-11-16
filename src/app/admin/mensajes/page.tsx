import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Insignia } from "@/compartido/interfaz/ui/Insignia";
import { formatoFechaHora } from "@/compartido/utilidades/formato";
import {
  listarMensajesAdmin,
  marcarMensajeAtendidoAccion,
  resumenBuzonAdmin,
} from "@/modulos/gestion-notificaciones/servidor/acciones";
import { NOMBRE_MOTIVO } from "@/modulos/gestion-notificaciones/tipos";
import { EncabezadoAdmin, FiltroEstados } from "../_componentes/EncabezadoAdmin";
import { EsqueletoLista } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Mensajes · Administración MoviGo" };

export default function PaginaMensajesAdmin({ searchParams }: PageProps<"/admin/mensajes">) {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<EsqueletoLista etiqueta="Cargando mensajes…" />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/admin/mensajes">, "searchParams">) {
  await connection();
  const { estado } = await searchParams;
  const atendidos = estado === "ATENDIDOS";
  const [mensajes, resumen] = await Promise.all([listarMensajesAdmin(atendidos), resumenBuzonAdmin()]);

  return (
    <>
      <EncabezadoAdmin
        etiqueta="Buzón"
        titulo={
          <>
            Mensajes <span className="text-eucalipto">de clientes</span>
          </>
        }
        descripcion="Lo que llega desde la página de contacto. Responde por correo y márcalo como atendido."
        acciones={
          <div className="rounded-[24px] bg-blanco px-6 py-4">
            <p className="text-[13px] text-pizarra">Suscritos al boletín</p>
            <p className="titular text-[40px] leading-none text-carbon">{resumen.suscriptores}</p>
          </div>
        }
      />

      <FiltroEstados
        base="/admin/mensajes"
        actual={atendidos ? "ATENDIDOS" : undefined}
        opciones={[
          { texto: "Por responder", cantidad: resumen.pendientes },
          { valor: "ATENDIDOS", texto: "Atendidos", cantidad: resumen.atendidos },
        ]}
      />

      {mensajes.length === 0 ? (
        <p className="rounded-tarjeta bg-blanco px-6 py-16 text-center text-[17px] text-pizarra">
          {atendidos ? "Todavía no hay mensajes atendidos." : "No hay mensajes por responder. ¡Todo al día!"}
        </p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {mensajes.map((m) => {
            const asunto = encodeURIComponent(`MoviGo · ${NOMBRE_MOTIVO[m.motivo]}`);
            const cuerpo = encodeURIComponent(`Hola, ${m.nombre.split(" ")[0]}:\n\n\n\n— Equipo MoviGo\n\n> ${m.mensaje.replace(/\n/g, "\n> ")}`);
            return (
              <li key={m.id} className="flex flex-col rounded-tarjeta bg-blanco p-6 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[18px] text-carbon">{m.nombre}</p>
                    <p className="truncate text-[14px] text-pizarra">
                      {m.correo}
                      {m.telefono ? ` · ${m.telefono}` : ""}
                    </p>
                  </div>
                  <Insignia tono={m.motivo === "EMPRESAS" ? "oscuro" : "salvia"}>{NOMBRE_MOTIVO[m.motivo]}</Insignia>
                </div>
                <p className="mt-5 flex-1 whitespace-pre-line text-[16px] leading-relaxed text-carbon">{m.mensaje}</p>
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-carbon/[0.07] pt-5">
                  <p className="font-mono text-[12px] uppercase text-pizarra">{formatoFechaHora.format(m.creadoEn)}</p>
                  <div className="flex gap-2">
                    <a
                      href={`mailto:${m.correo}?subject=${asunto}&body=${cuerpo}`}
                      className="flex h-10 items-center rounded-full bg-escarcha px-4 text-[12px] font-bold uppercase text-carbon transition-colors hover:bg-salvia"
                    >
                      Responder
                    </a>
                    <form action={marcarMensajeAtendidoAccion}>
                      <input type="hidden" name="id" value={m.id} />
                      <input type="hidden" name="atendido" value={m.atendido ? "0" : "1"} />
                      <button
                        type="submit"
                        className={`flex h-10 items-center rounded-full px-4 text-[12px] font-bold uppercase transition-colors ${
                          m.atendido ? "text-pizarra hover:bg-carbon/[0.06]" : "bg-bosque text-blanco hover:bg-carbon"
                        }`}
                      >
                        {m.atendido ? "Volver a pendientes" : "Marcar atendido"}
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
