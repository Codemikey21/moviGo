import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { canales } from "@/compartido/configuracion/contacto";
import { RedesSociales } from "@/compartido/interfaz/layout/RedesSociales";
import { obtenerPuntos } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { FormularioContacto } from "@/modulos/gestion-notificaciones/interfaz/componentes/FormularioContacto";
import { MOTIVOS_CONTACTO, type MotivoContacto } from "@/modulos/gestion-notificaciones/tipos";
import { obtenerMiPerfil } from "@/modulos/gestion-usuarios/servidor/acciones";

export const metadata: Metadata = { title: "Contacto · MoviGo" };

const atajos = [
  { titulo: "¿Dónde va mi pedido?", texto: "Síguelo en el mapa desde tu cuenta.", href: "/mi-cuenta/pedidos" },
  { titulo: "Pedir mantenimiento", texto: "Agenda el taller y aprueba la cotización.", href: "/mi-cuenta/mantenimiento" },
  { titulo: "Flotas para empresas", texto: "Cotiza vehículos o domicilios en lote.", href: "/empresas" },
  { titulo: "¿Llegan a mi barrio?", texto: "Mira las zonas de cobertura.", href: "/cobertura" },
];

export default function PaginaContacto({ searchParams }: PageProps<"/contacto">) {
  return (
    <main className="bg-blanco pb-[120px] text-carbon">
      <header className="contenedor pt-[130px] md:pt-[170px]">
        <p className="etiqueta text-carbon/70">Soporte</p>
        <h1 className="titular mt-6 max-w-[900px] text-[clamp(44px,6.4vw,96px)]">
          Hablemos. <span className="text-eucalipto">Te respondemos hoy.</span>
        </h1>
        <p className="mt-8 max-w-[620px] text-[18px] leading-[1.55] text-pizarra">
          Cuéntanos qué necesitas: un pedido, un alquiler, el taller o una flota para tu empresa. Respondemos en menos de un día hábil.
        </p>
      </header>

      <ul className="contenedor mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {atajos.map((a) => (
          <li key={a.href}>
            <Link href={a.href} className="group flex h-full flex-col justify-between gap-6 rounded-[26px] bg-escarcha p-6 transition-colors hover:bg-salvia">
              <div>
                <p className="text-[19px] leading-snug">{a.titulo}</p>
                <p className="mt-1.5 text-[14px] text-pizarra">{a.texto}</p>
              </div>
              <span
                aria-hidden
                className="grid size-10 place-items-center self-end rounded-[12px] bg-blanco text-[16px] transition-transform duration-500 ease-salida group-hover:-rotate-45"
              >
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="contenedor mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
        <section aria-labelledby="titulo-formulario" className="rounded-tarjeta border border-carbon/10 p-6 sm:p-10">
          <p className="etiqueta text-carbon/70">Escríbenos</p>
          <h2 id="titulo-formulario" className="titular mt-4 text-[clamp(30px,3vw,44px)]">
            Déjanos tu mensaje
          </h2>
          <div className="mt-8">
            <Suspense fallback={<FormularioContacto />}>
              <FormularioConPerfil searchParams={searchParams} />
            </Suspense>
          </div>
        </section>

        <aside className="flex flex-col gap-8">
          <Canales />
          <section>
            <p className="etiqueta pb-5 text-carbon/70">Visítanos</p>
            <Suspense fallback={<div className="h-56 animate-pulse rounded-tarjeta bg-escarcha" />}>
              <Puntos />
            </Suspense>
          </section>
        </aside>
      </div>
    </main>
  );
}

async function FormularioConPerfil({ searchParams }: Pick<PageProps<"/contacto">, "searchParams">) {
  await connection();
  const [perfil, { tema }] = await Promise.all([obtenerMiPerfil(), searchParams]);
  const motivo = typeof tema === "string" ? (tema.toUpperCase() as MotivoContacto) : undefined;
  return (
    <FormularioContacto
      nombre={perfil?.nombre}
      correo={perfil?.correo}
      telefono={perfil?.telefono ?? undefined}
      motivo={motivo && MOTIVOS_CONTACTO.includes(motivo) ? motivo : undefined}
    />
  );
}

function Canales() {
  const lista = [
    canales.whatsapp && { etiqueta: "WhatsApp", valor: `+${canales.whatsapp}`, href: `https://wa.me/${canales.whatsapp}` },
    canales.correo && { etiqueta: "Correo", valor: canales.correo, href: `mailto:${canales.correo}` },
  ].filter(Boolean) as { etiqueta: string; valor: string; href: string }[];

  return (
    <section className="rounded-tarjeta bg-bosque p-7 text-blanco sm:p-8">
      <p className="etiqueta text-turquesa">Atención</p>
      <p className="titular mt-4 text-[30px]">{canales.horario}</p>
      {lista.length > 0 && (
        <ul className="mt-6 divide-y divide-blanco/15 border-t border-blanco/15">
          {lista.map((c) => (
            <li key={c.etiqueta}>
              <a href={c.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-4">
                <span>
                  <span className="block text-[13px] text-blanco/60">{c.etiqueta}</span>
                  <span className="text-[17px]">{c.valor}</span>
                </span>
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  ›
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-[14px] text-blanco/70">Los mensajes que llegan fuera de ese horario se responden a primera hora.</p>
      <RedesSociales
        className="mt-6 gap-3"
        claseEnlace="grid size-10 place-items-center rounded-[12px] border border-blanco/20 text-blanco transition-colors hover:bg-blanco/10"
      />
    </section>
  );
}

async function Puntos() {
  await connection();
  const puntos = await obtenerPuntos();
  return (
    <ul className="divide-y divide-carbon/10 border-y border-carbon/10">
      {puntos.map((p) => (
        <li key={p.id} className="py-5">
          <p className="text-[19px]">{p.nombre}</p>
          <p className="mt-1 text-[15px] text-pizarra">{p.direccion}</p>
          <p className="text-[15px] text-pizarra">{p.horario}</p>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${p.latitud},${p.longitud}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 inline-flex items-center gap-2 text-[12px] font-bold uppercase text-bosque"
          >
            Cómo llegar
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              ›
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
