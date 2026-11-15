import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { EnlaceFlecha } from "@/compartido/interfaz/ui/EnlaceFlecha";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { formatoFechaHora, formatoFechaLarga, formatoPesos } from "@/compartido/utilidades/formato";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { obtenerMisNotificaciones } from "@/modulos/gestion-notificaciones/servidor/acciones";
import { EstadoPedido } from "@/modulos/gestion-pedidos/interfaz/componentes/compras/EstadoPedido";
import { obtenerMisPedidos } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { EstadoAlquiler } from "@/modulos/gestion-servicios/interfaz/componentes/alquiler/EstadoAlquiler";
import { obtenerMisAlquileres } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";
import { ResumenCuenta } from "@/modulos/gestion-usuarios/interfaz/componentes/cuenta/ResumenCuenta";
import { obtenerMiPerfil } from "@/modulos/gestion-usuarios/servidor/acciones";

export const metadata: Metadata = { title: "Mi cuenta · MoviGo" };

const avisos: Record<string, string> = {
  "contrasena-actualizada": "Listo, tu contraseña quedó actualizada.",
  "sin-permiso": "No tienes permiso para entrar a esa sección.",
};

// Accesos rápidos con las fotos de la landing (como la sección salvia)
const accesos = [
  { foto: "/img/landing/comprar.jpg", etiqueta: "Comprar", texto: "Llévate el tuyo y recógelo hoy.", href: "/catalogo?modo=comprar" },
  { foto: "/img/landing/alquilar.jpg", etiqueta: "Alquilar", texto: "Por días, con casco incluido.", href: "/catalogo?modo=alquilar" },
  { foto: "/img/landing/domicilio.jpg", etiqueta: "A domicilio", texto: "Te lo llevamos y lo sigues en el mapa.", href: "/catalogo" },
];

export default function PaginaMiCuenta({ searchParams }: PageProps<"/mi-cuenta">) {
  return (
    <Suspense fallback={<p className="contenedor mt-10 text-pizarra">Cargando tu cuenta…</p>}>
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/mi-cuenta">, "searchParams">) {
  // Esta parte depende de quién entra: se arma en cada visita, nunca al compilar.
  await connection();
  const { aviso } = await searchParams;
  const perfil = await obtenerMiPerfil();

  if (!perfil) {
    return (
      <div className="contenedor mt-10 max-w-[760px]">
        <Aviso tipo="error">
          Tu sesión está abierta, pero no encontramos tu perfil de MoviGo. Revisa que la base de datos tenga aplicada la
          migración gestion_usuarios_autenticacion.sql.
        </Aviso>
      </div>
    );
  }

  const [pedidos, alquileres, novedades] = await Promise.all([
    obtenerMisPedidos(),
    obtenerMisAlquileres(),
    obtenerMisNotificaciones(),
  ]);
  const pedidosActivos = pedidos.filter((p) => ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO"].includes(p.estado));
  const alquileresActivos = alquileres.filter((a) => ["SOLICITADO", "ASIGNADO", "EN_CURSO"].includes(a.estado));
  const esAdmin = perfil.rol === "ADMIN_SISTEMA" || perfil.rol === "ADMIN_PUNTO";
  const total = pedidosActivos.length + alquileresActivos.length;

  return (
    <div className="contenedor">
      {typeof aviso === "string" && avisos[aviso] && (
        <div className="mt-6 max-w-[640px]">
          <Aviso tipo={aviso === "sin-permiso" ? "error" : "exito"}>{avisos[aviso]}</Aviso>
        </div>
      )}

      <section className="pb-16 pt-12">
        <p className="etiqueta text-carbon/70">Mi cuenta</p>
        <h1 className="titular mt-4 text-[clamp(56px,8vw,120px)] text-carbon">Hola, {perfil.nombre.split(" ")[0]}</h1>
        <p className="mt-5 max-w-[620px] text-[clamp(20px,1.8vw,26px)] leading-[1.35] text-pizarra">
          {total === 0 ? (
            <>
              No tienes nada en curso. <span className="text-eucalipto">¿A dónde vamos hoy?</span>
            </>
          ) : (
            <>
              Tienes <span className="text-eucalipto">{total === 1 ? "algo en curso" : `${total} cosas en curso`}</span>. Aquí lo sigues paso a paso.
            </>
          )}
        </p>
      </section>

      {/* En curso */}
      {total > 0 && (
        <section aria-labelledby="en-curso" className="pb-20">
          <h2 id="en-curso" className="etiqueta mb-5 text-carbon/70">
            En curso
          </h2>
          <ul className="grid gap-4 lg:grid-cols-2">
            {pedidosActivos.map((p) => (
              <li key={p.id}>
                <Link href={`/mi-cuenta/pedidos/${p.numero}`} className="group flex gap-5 rounded-tarjeta bg-bosque p-4 pr-6 text-blanco">
                  <VitrinaProducto
                    foto={p.lineas[0]?.foto ?? null}
                    categoria={p.lineas[0]?.categoria ?? "bicicletas"}
                    tamanos="140px"
                    className="size-32 shrink-0 rounded-[28px] sm:size-36"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="etiqueta text-blanco/60">Pedido {p.numero}</p>
                    <p className="mt-2 truncate text-[22px]">
                      {p.lineas[0]?.marca} {p.lineas[0]?.nombre}
                      {p.lineas.length > 1 && <span className="text-blanco/60"> y {p.lineas.length - 1} más</span>}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-blanco">
                        <EstadoPedido estado={p.estado} entrega={p.entrega} />
                      </span>
                      <span className="text-[14px] text-blanco/70">{p.entrega === "A_DOMICILIO" ? "A domicilio" : "Recoger en punto"}</span>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-[12px] font-bold uppercase text-turquesa">
                      {p.estado === "PENDIENTE_PAGO" ? "Terminar el pago" : "Seguir mi pedido"} <Icono nombre="flecha" className="size-4" />
                    </p>
                  </div>
                </Link>
              </li>
            ))}
            {alquileresActivos.map((a) => (
              <li key={a.id}>
                <Link href={`/mi-cuenta/alquileres/${a.id}`} className="group flex gap-5 rounded-tarjeta bg-salvia p-4 pr-6 text-carbon">
                  <VitrinaProducto
                    foto={a.producto.foto}
                    categoria={a.producto.categoria}
                    tamanos="140px"
                    className="size-32 shrink-0 rounded-[28px] bg-escarcha sm:size-36"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="etiqueta text-bosque/70">Alquiler · {a.dias} día{a.dias === 1 ? "" : "s"}</p>
                    <p className="mt-2 truncate text-[22px]">
                      {a.producto.marca} {a.producto.nombre}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <EstadoAlquiler estado={a.estado} />
                      <span className="text-[14px] text-pizarra">Desde el {formatoFechaLarga.format(a.fechaInicio)}</span>
                    </div>
                    <p className="mt-4 flex items-center gap-2 text-[12px] font-bold uppercase text-bosque">
                      {a.estado === "SOLICITADO" ? "Terminar el pago" : "Ver mi alquiler"} <Icono nombre="flecha" className="size-4" />
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Accesos rápidos */}
      <section aria-labelledby="accesos" className="pb-20">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="accesos" className="etiqueta text-carbon/70">
            ¿Qué quieres hacer?
          </h2>
          <EnlaceFlecha href="/catalogo">Ver catálogo</EnlaceFlecha>
        </div>
        <ul className="grid gap-5 md:grid-cols-3">
          {accesos.map((a) => (
            <li key={a.etiqueta}>
              <Link href={a.href} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-tarjeta">
                  <Image src={a.foto} alt={a.etiqueta} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <p className="etiqueta mt-5 text-carbon/70">{a.etiqueta}</p>
                <p className="mt-2 text-[20px] leading-snug text-carbon">{a.texto}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        {/* Novedades */}
        <section aria-labelledby="novedades">
          <h2 id="novedades" className="etiqueta mb-5 text-carbon/70">
            Novedades
          </h2>
          {novedades.length === 0 ? (
            <p className="rounded-[28px] bg-escarcha px-6 py-8 text-[16px] text-pizarra">
              Aquí te avisamos cuando tu pago se apruebe, tu pedido salga o tu alquiler esté listo.
            </p>
          ) : (
            <ul className="divide-y divide-carbon/[0.08] rounded-[28px] bg-escarcha px-6">
              {novedades.map((n) => (
                <li key={n.id} className="flex gap-4 py-5">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-blanco text-bosque">
                    <Icono nombre="campana" className="size-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[16px] text-carbon">{n.asunto}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-pizarra">{n.mensaje}</p>
                    <p className="mt-1.5 text-[12px] text-bruma">{formatoFechaHora.format(n.enviadaEn)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Datos y panel */}
        <section aria-labelledby="mis-datos" className="space-y-5">
          <h2 id="mis-datos" className="etiqueta text-carbon/70">
            Mis datos
          </h2>
          {esAdmin && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-carbon p-6 text-blanco">
              <div>
                <p className="etiqueta text-turquesa">Administración</p>
                <p className="mt-2 text-[20px]">Pedidos, alquileres, domicilios e inventario.</p>
              </div>
              <Boton href="/admin">Abrir panel</Boton>
            </div>
          )}
          <ResumenCuenta perfil={perfil} />
          {pedidos.length + alquileres.length > 0 && (
            <p className="text-[14px] text-pizarra">
              Has hecho {pedidos.length} compra{pedidos.length === 1 ? "" : "s"} y {alquileres.length} alquiler
              {alquileres.length === 1 ? "" : "es"} por {formatoPesos.format(
                [...pedidos, ...alquileres].filter((x) => x.estado !== "CANCELADO").reduce((suma, x) => suma + x.total, 0),
              )}.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
