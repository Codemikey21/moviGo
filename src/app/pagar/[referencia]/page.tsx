import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { formatoFechaHora, formatoPesos } from "@/compartido/utilidades/formato";
import { obtenerPago } from "@/modulos/gestion-pagos/servidor/acciones";
import { BANCOS_PSE } from "@/modulos/gestion-pagos/servidor/pasarela";
import { FormularioPago } from "./_componentes/FormularioPago";
import { EsqueletoPago } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Pagar · MoviGo Pay" };

export default function PaginaPago({ params }: PageProps<"/pagar/[referencia]">) {
  return (
    <main className="px-3 pt-8 md:px-5 md:pt-12">
      <Suspense fallback={<EsqueletoPago />}>
        <Contenido params={params} />
      </Suspense>
    </main>
  );
}

async function Contenido({ params }: Pick<PageProps<"/pagar/[referencia]">, "params">) {
  await connection();
  const { referencia } = await params;
  const pago = await obtenerPago(referencia);
  if (!pago) notFound();

  return (
    <div className="mx-auto grid max-w-[1100px] gap-4 lg:grid-cols-[1fr_1.1fr]">
      {/* Resumen: bloque verde bosque como las secciones oscuras de la landing */}
      <section className="relative overflow-hidden rounded-tarjeta bg-bosque p-8 text-blanco sm:p-10">
        <span aria-hidden className="absolute -bottom-24 -right-24 size-72 rounded-full bg-turquesa/15" />
        <div className="relative flex h-full flex-col">
          <p className="etiqueta text-blanco/70">Vas a pagar</p>
          <p className="titular mt-4 text-[clamp(44px,5vw,72px)]">{formatoPesos.format(pago.monto)}</p>
          <p className="mt-5 max-w-[420px] text-[17px] leading-relaxed text-blanco/80">{pago.concepto}</p>

          <dl className="mt-10 space-y-3 border-t border-blanco/15 pt-6 text-[14px]">
            <div className="flex justify-between gap-4">
              <dt className="text-blanco/60">Referencia</dt>
              <dd className="font-mono">{pago.referencia}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-blanco/60">Comercio</dt>
              <dd>MoviGo S.A.S.</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-blanco/60">Creado</dt>
              <dd>{formatoFechaHora.format(pago.creadoEn)}</dd>
            </div>
          </dl>

          <p className="mt-auto flex items-center gap-2 pt-10 text-[13px] text-blanco/60">
            <Icono nombre="escudo" className="size-5 text-turquesa" />
            Tus datos viajan cifrados y MoviGo nunca guarda el número de tu tarjeta.
          </p>
        </div>
      </section>

      <section className="rounded-tarjeta bg-blanco p-6 sm:p-10">
        {pago.estado === "APROBADO" ? (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-turquesa text-carbon">
              <Icono nombre="check" className="size-10" />
            </span>
            <h1 className="titular mt-6 text-[40px] text-carbon">Pago aprobado</h1>
            <p className="mt-2 text-[16px] text-pizarra">
              {pago.ultimoEvento?.detalle ?? "Pago confirmado"}
              {pago.confirmadoEn ? ` · ${formatoFechaHora.format(pago.confirmadoEn)}` : ""}
            </p>
            <div className="mt-8">
              <Boton href={pago.destino}>{pago.tipo === "pedido" ? "Seguir mi pedido" : "Ver mi alquiler"}</Boton>
            </div>
          </div>
        ) : pago.estado === "REEMBOLSADO" ? (
          <div className="py-6 text-center">
            <h1 className="titular text-[36px] text-carbon">Este pago fue cancelado</h1>
            <p className="mt-2 text-pizarra">El dinero se devolvió a tu medio de pago.</p>
            <div className="mt-8">
              <Boton href="/mi-cuenta/pedidos" variante="secundario">
                Ver mis pedidos
              </Boton>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-[28px] text-carbon">¿Cómo quieres pagar?</h1>
            {pago.estado === "RECHAZADO" && pago.ultimoEvento && (
              <p className="mt-3 rounded-campo bg-[#fdf1ef] px-4 py-3 text-[14px] text-[#8e2a1f]">
                El intento anterior con {pago.ultimoEvento.detalle} fue rechazado: {pago.ultimoEvento.motivo}.
              </p>
            )}
            <div className="mt-6">
              <FormularioPago referencia={pago.referencia} monto={pago.monto} destino={pago.destino} bancos={BANCOS_PSE} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
