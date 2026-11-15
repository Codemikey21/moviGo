import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { formatoDia, formatoPesos, hoyEnColombia } from "@/compartido/utilidades/formato";
import { obtenerMiPerfil } from "@/modulos/gestion-usuarios/servidor/acciones";
import { EstadoSolicitud } from "@/modulos/portal-empresarial/interfaz/componentes/EstadoSolicitud";
import { FormularioSolicitud } from "@/modulos/portal-empresarial/interfaz/componentes/FormularioSolicitud";
import { obtenerMiEmpresa, responderCotizacionAccion } from "@/modulos/portal-empresarial/servidor/acciones";

export const metadata: Metadata = { title: "Portal empresarial · MoviGo" };

const beneficios = [
  ["Flotas a tu medida", "Scooters, bicicletas o motos para tu equipo, por días o meses."],
  ["Domicilios en lote", "Nuestros domiciliarios reparten tus pedidos con la misma flota."],
  ["Mantenimiento incluido", "Revisamos cada vehículo y lo cambiamos si falla."],
];

export default function PaginaEmpresas() {
  return (
    <main className="bg-blanco pb-[120px]">
      {/* Portada: verde bosque como la sección de empresas de la landing */}
      <section className="px-3 pt-[96px] md:px-5">
        <div className="relative overflow-hidden rounded-tarjeta bg-bosque text-blanco">
          <div className="absolute inset-y-0 right-0 hidden w-[45%] md:block">
            <Image src="/img/landing/palabra-trabajo.jpg" alt="" fill sizes="45vw" className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-r from-bosque to-transparent" />
          </div>
          <div className="relative px-6 py-16 sm:px-12 md:w-[60%] md:py-24">
            <p className="etiqueta text-blanco/70">Portal empresarial</p>
            <h1 className="titular mt-5 text-[clamp(44px,6vw,92px)]">
              Flotas para <span className="text-turquesa">tu equipo</span>
            </h1>
            <p className="mt-6 max-w-[480px] text-[18px] leading-relaxed text-blanco/80">
              Cotiza, administra y mantén los vehículos de tu empresa desde un solo panel.
            </p>
          </div>
        </div>
      </section>

      <section className="contenedor grid gap-8 py-20 md:grid-cols-3">
        {beneficios.map(([t, d], i) => (
          <div key={t}>
            <p className="font-mono text-[14px] text-eucalipto">0{i + 1}</p>
            <h2 className="mt-3 text-[24px] text-carbon">{t}</h2>
            <p className="mt-2 text-[16px] leading-relaxed text-pizarra">{d}</p>
          </div>
        ))}
      </section>

      <div className="contenedor">
        <Suspense fallback={<p className="text-pizarra">Cargando…</p>}>
          <Portal />
        </Suspense>
      </div>
    </main>
  );
}

async function Portal() {
  await connection();
  const perfil = await obtenerMiPerfil();
  if (!perfil) {
    return (
      <div className="rounded-tarjeta bg-salvia px-6 py-16 text-center">
        <h2 className="text-[clamp(26px,2.5vw,36px)] text-carbon">Inicia sesión para pedir tu cotización</h2>
        <div className="mt-8 flex justify-center gap-3">
          <Boton href="/iniciar-sesion?siguiente=/empresas">Iniciar sesión</Boton>
          <Boton href="/registro" variante="secundario">
            Crear cuenta
          </Boton>
        </div>
      </div>
    );
  }

  const { empresa, solicitudes } = await obtenerMiEmpresa();
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="rounded-tarjeta border border-carbon/10 p-6 sm:p-8">
        <p className="etiqueta text-carbon/70">{empresa ? empresa.razonSocial : "Nueva solicitud"}</p>
        <h2 className="mt-3 text-[28px] text-carbon">Solicitar cotización</h2>
        <div className="mt-6">
          <FormularioSolicitud conEmpresa={Boolean(empresa)} hoy={hoyEnColombia()} />
        </div>
      </section>

      <section>
        <p className="etiqueta mb-5 text-carbon/70">Mis solicitudes</p>
        {solicitudes.length === 0 ? (
          <p className="rounded-tarjeta bg-escarcha px-6 py-10 text-[16px] text-pizarra">
            Cuando envíes una solicitud, aquí verás la cotización para aceptarla o rechazarla.
          </p>
        ) : (
          <ul className="space-y-3">
            {solicitudes.map((s) => (
              <li key={s.id} className="rounded-[28px] bg-escarcha p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[18px] text-carbon">
                      {s.cantidad} {s.tipo === "FLOTA_ALQUILER" ? "vehículos en alquiler" : "domicilios"}
                    </p>
                    <p className="text-[14px] text-pizarra">
                      {formatoDia.format(s.desde)} → {formatoDia.format(s.hasta)}
                    </p>
                  </div>
                  <EstadoSolicitud estado={s.estado} cotizada={Boolean(s.cotizacion)} />
                </div>
                {s.cotizacion && (
                  <div className="mt-5 rounded-[22px] bg-blanco p-5">
                    <p className="text-[13px] text-pizarra">Cotización</p>
                    <p className="text-[30px] leading-tight text-carbon">{formatoPesos.format(s.cotizacion.valor)}</p>
                    <p className="text-[13px] text-pizarra">
                      {s.cotizacion.descuento ? `${s.cotizacion.descuento}% de descuento · ` : ""}Válida hasta el {formatoDia.format(s.cotizacion.validaHasta)}
                    </p>
                    {s.estado === "ENVIADA" && (
                      <div className="mt-4 flex gap-2">
                        {(["APROBADA", "RECHAZADA"] as const).map((r) => (
                          <form key={r} action={responderCotizacionAccion}>
                            <input type="hidden" name="solicitudId" value={s.id} />
                            <input type="hidden" name="respuesta" value={r} />
                            <BotonAccion type="submit" tamano="compacto" variante={r === "APROBADA" ? "primario" : "secundario"}>
                              {r === "APROBADA" ? "Aceptar" : "Rechazar"}
                            </BotonAccion>
                          </form>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
