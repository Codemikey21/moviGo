import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { IlustracionVehiculo } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/IlustracionVehiculo";
import { BotonesEntrega } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/BotonesEntrega";
import { InterruptorDisponible } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/InterruptorDisponible";
import { haceCuanto, TarjetaEntrega } from "@/modulos/gestion-servicios/interfaz/componentes/reparto/TarjetaEntrega";
import { MAXIMO_ACTIVAS_REPARTO } from "@/modulos/gestion-servicios/tipos";
import { obtenerInicioReparto } from "@/modulos/gestion-servicios/servidor/reparto/acciones";
import { categoriaDelVehiculo } from "./_componentes/vehiculo";
import { Esqueleto } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Entregas · Reparto MoviGo" };

export default function PaginaReparto() {
  return (
    <main className="mx-auto max-w-[1180px] px-3 pb-24 pt-4 md:px-5">
      <Suspense fallback={<Esqueleto className="h-[420px] rounded-tarjeta" />}>
        <Contenido />
      </Suspense>
    </main>
  );
}

async function Contenido() {
  await connection();
  const { perfil, resumen, activas, libres } = await obtenerInicioReparto();
  const enRuta = activas.filter((e) => e.estado === "EN_CURSO");
  const porRecoger = activas.filter((e) => e.estado === "ASIGNADO" && e.aceptadoEn);
  const nuevas = activas.filter((e) => e.estado === "ASIGNADO" && !e.aceptadoEn);
  const enMano = enRuta.length + porRecoger.length;
  const nombre = perfil.nombre.split(" ")[0];

  const titular = enRuta.length
    ? "Vas en camino. El cliente te ve en el mapa."
    : porRecoger.length
      ? `Tienes ${porRecoger.length === 1 ? "una entrega" : `${porRecoger.length} entregas`} por recoger.`
      : nuevas.length
        ? `Te ${nuevas.length === 1 ? "asignaron una entrega" : `asignaron ${nuevas.length} entregas`}.`
        : perfil.disponible
          ? "Listo para recibir entregas."
          : "Estás desconectado.";

  return (
    <>
      {/* Portada: saludo, interruptor y números del día */}
      <Escenario className="relative overflow-hidden rounded-tarjeta text-blanco" carril="polygon(62% 0, 82% 0, 100% 78%, 100% 100%, 46% 100%)" haz={false}>
        <div className="relative grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="etiqueta text-turquesa">Hola, {nombre}</p>
            <h1 className="titular mt-4 max-w-[620px] text-[clamp(36px,5vw,64px)]">{titular}</h1>
            <p className="mt-4 text-[15px] text-blanco/70">
              {perfil.vehiculo}
              {perfil.calificacion ? ` · ★ ${perfil.calificacion.toLocaleString("es-CO", { minimumFractionDigits: 1 })}` : ""}
            </p>
            <div className="mt-7">
              <InterruptorDisponible disponible={perfil.disponible} />
            </div>
          </div>
          <div className="hidden lg:block">
            <IlustracionVehiculo categoria={categoriaDelVehiculo(perfil.vehiculo)} className="vehiculo-entra mx-auto block w-full max-w-[460px]" />
          </div>
        </div>
        <dl className="relative grid grid-cols-3 border-t border-blanco/10 bg-carbon/60 backdrop-blur-sm">
          {[
            ["Hoy", resumen.hoy],
            ["Últimos 7 días", resumen.semana],
            ["En total", resumen.total],
          ].map(([t, n], i) => (
            <div key={t} className={`px-6 py-5 sm:px-10 ${i ? "border-l border-blanco/10" : ""}`}>
              <dd className="titular text-[clamp(30px,4vw,44px)]">{n}</dd>
              <dt className="mt-1 text-[13px] text-blanco/60">{t}</dt>
            </div>
          ))}
        </dl>
      </Escenario>

      {/* Lo que lleva en las manos */}
      {enMano > 0 && (
        <Seccion titulo="En curso" nota={`${activas.length} de ${MAXIMO_ACTIVAS_REPARTO} entregas a la vez`}>
          <div className="grid gap-3 md:grid-cols-2">
            {[...enRuta, ...porRecoger].map((e) => (
              <TarjetaEntrega key={e.id} entrega={e} etiqueta={e.estado === "EN_CURSO" ? "En ruta" : "Por recoger"} tono="oscuro">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Boton href={`/domiciliario/entregas/${e.id}`}>{e.estado === "EN_CURSO" ? "Ver mapa y entregar" : "Ver ruta al punto"}</Boton>
                </div>
              </TarjetaEntrega>
            ))}
          </div>
        </Seccion>
      )}

      {/* Asignadas por el administrador, esperando respuesta */}
      {nuevas.length > 0 && (
        <Seccion titulo="Nuevas para ti" nota="Acéptalas para que el cliente sepa quién va.">
          <div className="grid gap-3 md:grid-cols-2">
            {nuevas.map((e) => (
              <TarjetaEntrega key={e.id} entrega={e} etiqueta={`Asignada ${haceCuanto(e.asignadoEn)}`}>
                <BotonesEntrega domicilioId={e.id} acciones={["aceptar", "rechazar"]} ancho />
              </TarjetaEntrega>
            ))}
          </div>
        </Seccion>
      )}

      {/* Libres para tomar */}
      <Seccion titulo="Disponibles para tomar" nota={perfil.disponible ? "Las más antiguas primero." : undefined}>
        {!perfil.disponible ? (
          <p className="rounded-[28px] bg-blanco px-6 py-10 text-center text-[16px] text-pizarra">
            Conéctate con el interruptor de arriba para ver las entregas libres.
          </p>
        ) : libres.length === 0 ? (
          <p className="rounded-[28px] bg-blanco px-6 py-10 text-center text-[16px] text-pizarra">
            No hay entregas libres ahora. Esta página se actualiza cuando vuelvas a abrirla.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {libres.map((e) => (
              <TarjetaEntrega key={e.id} entrega={e} etiqueta={`Pagada ${haceCuanto(e.creadaEn)}`}>
                {activas.length < MAXIMO_ACTIVAS_REPARTO ? (
                  <BotonesEntrega domicilioId={e.id} acciones={["tomar"]} />
                ) : (
                  <p className="text-[14px] text-pizarra">Termina una de tus entregas para tomar otra.</p>
                )}
              </TarjetaEntrega>
            ))}
          </div>
        )}
      </Seccion>
    </>
  );
}

function Seccion({ titulo, nota, children }: { titulo: string; nota?: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2 px-1">
        <h2 className="titular text-[clamp(28px,3vw,40px)] text-carbon">{titulo}</h2>
        {nota && <p className="text-[14px] text-pizarra">{nota}</p>}
      </div>
      {children}
    </section>
  );
}
