import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense, type ReactNode } from "react";
import { EscenaScroll } from "@/compartido/interfaz/animaciones/EscenaScroll";
import { ListaGrande } from "@/compartido/interfaz/animaciones/ListaGrande";
import { PilaTarjetas } from "@/compartido/interfaz/animaciones/PilaTarjetas";
import { Revelador } from "@/compartido/interfaz/animaciones/Revelador";
import { TextoPalabras } from "@/compartido/interfaz/animaciones/TextoPalabras";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { formatoDia, formatoFechaHora, formatoFechaLarga, formatoPesos } from "@/compartido/utilidades/formato";
import {
  estiloCategorias,
  MosaicoCategorias,
  ordenarCategorias,
} from "@/modulos/gestion-catalogo/interfaz/componentes/categorias/MosaicoCategorias";
import { obtenerCategorias } from "@/modulos/gestion-catalogo/servidor/categorias/acciones";
import { obtenerMisNotificaciones } from "@/modulos/gestion-notificaciones/servidor/acciones";
import { obtenerMisPedidos } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import type { PedidoResumen } from "@/modulos/gestion-pedidos/tipos";
import { FotoOVehiculo } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/FotoOVehiculo";
import type { Foto } from "@/modulos/gestion-catalogo/tipos";
import { MapaSeguimiento } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/MapaSeguimiento";
import { obtenerMisAlquileres } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";
import { obtenerDomicilio, obtenerSeguimiento } from "@/modulos/gestion-servicios/servidor/domicilios/acciones";
import { obtenerMisMantenimientos } from "@/modulos/gestion-servicios/servidor/mantenimiento/acciones";
import type { AlquilerVista, DomicilioVista, MantenimientoVista } from "@/modulos/gestion-servicios/tipos";
import { ResumenCuenta } from "@/modulos/gestion-usuarios/interfaz/componentes/cuenta/ResumenCuenta";
import { obtenerMiPerfil } from "@/modulos/gestion-usuarios/servidor/acciones";
import { HistorialCuenta, type FilaHistorial } from "./_componentes/HistorialCuenta";
import { VitrinaCuenta, type CategoriaVitrina, type ElementoEnCurso } from "./_componentes/VitrinaCuenta";

export const metadata: Metadata = { title: "Mi cuenta · MoviGo" };

const avisos: Record<string, string> = {
  "contrasena-actualizada": "Listo, tu contraseña quedó actualizada.",
  "sin-permiso": "No tienes permiso para entrar a esa sección.",
};

const textoPedido: Record<string, string> = {
  PENDIENTE_PAGO: "Falta el pago",
  PAGADO: "Pagado · lo estamos alistando",
  PREPARANDO: "Listo para entregar",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const textoAlquiler: Record<string, string> = {
  SOLICITADO: "Falta el pago",
  ASIGNADO: "Listo para empezar",
  EN_CURSO: "Activo",
  COMPLETADO: "Devuelto",
  CANCELADO: "Cancelado",
};

const textoTaller: Record<string, string> = {
  PROGRAMADO: "Agendado",
  EN_CURSO: "En el taller",
  REALIZADO: "Listo",
};

export default function PaginaMiCuenta({ searchParams }: PageProps<"/mi-cuenta">) {
  return (
    <Suspense
      fallback={
        <Escenario className="h-svh">
          <p className="absolute inset-x-0 bottom-16 text-center text-blanco/70">Cargando tu cuenta…</p>
        </Escenario>
      }
    >
      <Contenido searchParams={searchParams} />
    </Suspense>
  );
}

const nombreLineas = (p: PedidoResumen) =>
  `${p.lineas[0]?.marca ?? ""} ${p.lineas[0]?.nombre ?? "Pedido"}${p.lineas.length > 1 ? ` y ${p.lineas.length - 1} más` : ""}`.trim();

async function Contenido({ searchParams }: Pick<PageProps<"/mi-cuenta">, "searchParams">) {
  // Esta parte depende de quién entra: se arma en cada visita, nunca al compilar.
  await connection();
  const { aviso } = await searchParams;
  const perfil = await obtenerMiPerfil();

  if (!perfil) {
    return (
      <div className="contenedor max-w-[760px] pt-[140px]">
        <Aviso tipo="error">
          Tu sesión está abierta, pero no encontramos tu perfil de MoviGo. Revisa que la base de datos tenga aplicada la
          migración gestion_usuarios_autenticacion.sql.
        </Aviso>
      </div>
    );
  }

  // Los domiciliarios tienen su propio portal
  if (perfil.rol === "DOMICILIARIO") redirect("/domiciliario");
  // Y los administradores, su panel (salvo si el panel los devolvió por falta de permiso,
  // como un admin de punto sin punto asignado: así no quedan en un bucle)
  const esAdministrador = perfil.rol === "ADMIN_SISTEMA" || perfil.rol === "ADMIN_PUNTO";
  if (esAdministrador && aviso !== "sin-permiso") redirect("/admin");

  const [pedidos, alquileres, novedades, mantenimientos, categorias] = await Promise.all([
    obtenerMisPedidos(),
    obtenerMisAlquileres(),
    obtenerMisNotificaciones(),
    obtenerMisMantenimientos(),
    obtenerCategorias(),
  ]);
  const nombre = perfil.nombre.split(" ")[0];
  const pedidosActivos = pedidos.filter((p) => ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO"].includes(p.estado));
  const alquileresActivos = alquileres.filter((a) => ["SOLICITADO", "ASIGNADO", "EN_CURSO"].includes(a.estado));
  const tallerActivo = mantenimientos.filter((m) => m.estado !== "REALIZADO");
  const esAdmin = esAdministrador;

  // ¿Hay algo yendo a domicilio? (pedidos y alquileres son módulos distintos: la página los junta)
  const candidatos = [
    ...pedidosActivos
      .filter((p) => p.entrega === "A_DOMICILIO" && p.estado !== "PENDIENTE_PAGO")
      .map((p) => ({ tipo: "pedido", filtro: { pedidoId: p.id }, titulo: nombreLineas(p), etiqueta: `Pedido ${p.numero}`, categoria: p.lineas[0]?.categoria ?? "scooters", href: `/mi-cuenta/pedidos/${p.numero}` })),
    ...alquileresActivos
      .filter((a) => a.entrega === "A_DOMICILIO" && a.estado !== "SOLICITADO")
      .map((a) => ({ tipo: "alquiler", filtro: { alquilerId: a.id }, titulo: `${a.producto.marca} ${a.producto.nombre}`, etiqueta: `Alquiler · ${a.dias} día${a.dias === 1 ? "" : "s"}`, categoria: a.producto.categoria, href: `/mi-cuenta/alquileres/${a.id}` })),
  ];
  const domicilios = await Promise.all(candidatos.map((c) => obtenerDomicilio(c.filtro)));
  const enRuta = candidatos
    .map((c, i) => ({ ...c, domicilio: domicilios[i] }))
    .filter((c): c is typeof c & { domicilio: DomicilioVista } => !!c.domicilio && ["ASIGNADO", "EN_CURSO"].includes(c.domicilio.estado))
    .sort((a, b) => (a.domicilio.estado === "EN_CURSO" ? -1 : 0) - (b.domicilio.estado === "EN_CURSO" ? -1 : 0))[0];
  const seguimiento = enRuta ? await obtenerSeguimiento(enRuta.domicilio.id) : null;
  const minutos = seguimiento?.minutosRestantes ?? null;

  // Vitrina: todas las categorías con productos
  const categoriasVitrina: CategoriaVitrina[] = ordenarCategorias(categorias).map((c) => ({
      slug: c.slug,
      nombre: c.nombre,
      corto: estiloCategorias[c.slug]?.corto ?? c.nombre,
      total: c.totalProductos,
      desdeVenta: c.desdeVenta,
      desdeAlquiler: c.desdeAlquiler,
      foto: c.foto,
    }));

  const enCurso: ElementoEnCurso[] = [
    ...pedidosActivos.map((p) => ({
      categoria: p.lineas[0]?.categoria ?? "scooters",
      titulo: nombreLineas(p),
      detalle: `Pedido · ${enRuta?.href === `/mi-cuenta/pedidos/${p.numero}` && enRuta.domicilio.estado === "EN_CURSO" ? "va en camino" : textoPedido[p.estado].toLowerCase()}`,
      href: `/mi-cuenta/pedidos/${p.numero}`,
    })),
    ...alquileresActivos.map((a) => ({
      categoria: a.producto.categoria,
      titulo: `${a.producto.marca} ${a.producto.nombre}`,
      detalle: `Alquiler · ${a.estado === "EN_CURSO" ? `lo devuelves el ${formatoDia.format(a.fechaFin)}` : textoAlquiler[a.estado].toLowerCase()}`,
      href: `/mi-cuenta/alquileres/${a.id}`,
    })),
    ...tallerActivo.map((m) => ({
      categoria: m.producto.categoria,
      titulo: `${m.producto.marca} ${m.producto.nombre}`,
      detalle: `Taller · ${formatoFechaHora.format(m.programadoPara)}`,
      href: "/mi-cuenta/mantenimiento",
    })),
  ].slice(0, 4);

  const avisoVitrina = enRuta
    ? { texto: enRuta.domicilio.estado === "EN_CURSO" ? (minutos ? `Llega en ${minutos} min` : "Va en camino") : "Ya salió tu domiciliario", href: enRuta.href }
    : pedidosActivos.some((p) => p.estado === "PENDIENTE_PAGO")
      ? { texto: "Termina tu pago", href: `/mi-cuenta/pedidos/${pedidosActivos.find((p) => p.estado === "PENDIENTE_PAGO")!.numero}` }
      : null;

  // Historial por pestañas
  const pestanas: { nombre: string; filas: FilaHistorial[] }[] = [
    { nombre: "Compras", filas: pedidos.map(filaPedido) },
    { nombre: "Alquileres", filas: alquileres.map(filaAlquiler) },
    { nombre: "Taller", filas: mantenimientos.map(filaTaller) },
  ];

  const gastado = [...pedidos, ...alquileres].filter((x) => x.estado !== "CANCELADO").reduce((suma, x) => suma + x.total, 0);

  return (
    <>
      {typeof aviso === "string" && avisos[aviso] && (
        <div className="absolute inset-x-0 top-[100px] z-20 px-5">
          <div className="mx-auto max-w-[560px]">
            <Aviso tipo={aviso === "sin-permiso" ? "error" : "exito"}>{avisos[aviso]}</Aviso>
          </div>
        </div>
      )}

      {/* 1. Vitrina de todo el catálogo */}
      <VitrinaCuenta nombre={nombre} categorias={categoriasVitrina} enCurso={enCurso} aviso={avisoVitrina} />

      {/* 2. Seguimiento en vivo (si algo va en camino) */}
      {enRuta && (
        <EscenaScroll className="bg-salvia md:h-[200vh]" classNamePin="grid place-items-center">
          <div className="escena-titulo absolute inset-x-0 top-[104px] hidden text-center md:block">
            <p className="etiqueta text-bosque">{enRuta.domicilio.estado === "EN_CURSO" ? "En camino" : "Saliendo"}</p>
            <h2 className="titular mt-3 text-[52px] text-carbon">
              {enRuta.domicilio.estado === "EN_CURSO" ? (
                <>
                  Tu {enRuta.tipo} llega {minutos ? <span className="text-eucalipto">en {minutos} minuto{minutos === 1 ? "" : "s"}.</span> : <span className="text-eucalipto">muy pronto.</span>}
                </>
              ) : (
                <>
                  {enRuta.domicilio.domiciliario?.nombre ?? "Tu domiciliario"} <span className="text-eucalipto">ya lo tiene.</span>
                </>
              )}
            </h2>
          </div>
          <div className="escena-crece relative mt-[90px] h-[calc(100svh-150px)] w-[calc(100vw-40px)] overflow-hidden rounded-tarjeta rounded-bl-none bg-carbon">
            <div className="absolute inset-0">
              <MapaSeguimiento
                key={enRuta.domicilio.estado}
                domicilioId={enRuta.domicilio.id}
                origen={{ ...enRuta.domicilio.origen }}
                destino={{ ...enRuta.domicilio.destino }}
                inicial={seguimiento}
                className="h-full"
              />
            </div>
            <Muesca lado="izquierda" fondo="var(--color-salvia)" className="escena-aparece-final z-[600] w-[min(500px,92%)] pb-6 pr-8 pt-7 md:pr-10">
              <p className="etiqueta font-mono text-bosque">{enRuta.etiqueta}</p>
              <p className="titular mt-2 text-[clamp(26px,2.4vw,36px)] text-carbon">{enRuta.titulo}</p>
              <ol className="mt-5 hidden md:block">
                {pasosDomicilio(enRuta.domicilio).map((paso) => (
                  <li key={paso.texto} className="grid grid-cols-[28px_1fr_auto] items-center gap-3 border-t border-carbon/10 py-2.5 text-[15px]">
                    <span
                      className={`grid size-[26px] place-items-center rounded-[9px] text-[12px] ${
                        paso.estado === "hecho" ? "bg-bosque text-blanco" : paso.estado === "actual" ? "bg-turquesa text-carbon" : "bg-carbon/10 text-bruma"
                      }`}
                    >
                      {paso.estado === "hecho" ? "✓" : paso.estado === "actual" ? <span className="punto-vivo bg-carbon" /> : ""}
                    </span>
                    <span className={paso.estado === "pendiente" ? "text-bruma" : "text-carbon"}>{paso.texto}</span>
                    <span className="font-mono text-[12px] text-bruma">{paso.hora}</span>
                  </li>
                ))}
              </ol>
              <Link href={enRuta.href} className="mt-4 inline-flex items-center gap-2 text-[12px] font-bold uppercase text-bosque">
                Ver el detalle <Icono nombre="flecha" className="size-4" />
              </Link>
            </Muesca>
          </div>
        </EscenaScroll>
      )}

      <Revelador>
        {/* 3. Catálogo en mosaico */}
        <section className="contenedor pb-24 pt-28 md:pb-32 md:pt-36" aria-labelledby="titulo-catalogo">
          <p className="etiqueta text-center text-bruma">Catálogo</p>
          <div id="titulo-catalogo">
            <TextoPalabras
              className="titular mx-auto mt-5 max-w-[1000px] text-center text-[clamp(34px,4vw,52px)] text-carbon"
              partes={[
                { texto: "Autos, motos, scooters, bicis y más. " },
                { texto: "Cómpralo, alquílalo por días o recógelo hoy.", resaltado: true },
              ]}
            />
          </div>
          <div className="mt-16">
            <MosaicoCategorias categorias={categorias} />
          </div>
        </section>

        {/* 4. Lo que está en curso */}
        {(alquileresActivos.length > 0 || tallerActivo.length > 0) && (
          <section className="contenedor pb-20" aria-labelledby="titulo-curso">
            <div className="mb-14 text-center">
              <p className="etiqueta text-bruma">En curso</p>
              <h2 id="titulo-curso" className="titular mt-4 text-[clamp(34px,4vw,52px)] text-carbon">
                Lo que tienes andando
              </h2>
            </div>
            <PilaTarjetas>
              {alquileresActivos.map((a) => (
                <CartaAlquiler key={a.id} alquiler={a} />
              ))}
              {tallerActivo.map((m) => (
                <CartaTaller key={m.id} mantenimiento={m} />
              ))}
              <CartaPromo />
            </PilaTarjetas>
          </section>
        )}

        {/* 5. Historial */}
        <section className="bg-bosque py-24 md:py-28">
          <div className="contenedor">
            <HistorialCuenta pestanas={pestanas} />
          </div>
        </section>

        {/* 6. Novedades y datos */}
        <section className="contenedor grid gap-10 py-24 lg:grid-cols-2" aria-label="Tu cuenta">
          <div data-revelar>
            <h2 className="etiqueta mb-5 text-bruma">Novedades</h2>
            {novedades.length === 0 ? (
              <p className="rounded-[28px] bg-escarcha px-6 py-8 text-[16px] text-pizarra">
                Aquí te avisamos cuando tu pago se apruebe, tu pedido salga o tu alquiler esté listo.
              </p>
            ) : (
              <ul className="divide-y divide-carbon/[0.08] rounded-[28px] bg-escarcha px-6">
                {novedades.slice(0, 5).map((n) => (
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
          </div>
          <div data-revelar className="space-y-5">
            <h2 className="etiqueta text-bruma">Mis datos</h2>
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
            {gastado > 0 && (
              <p className="text-[14px] text-pizarra">
                Has hecho {pedidos.length} compra{pedidos.length === 1 ? "" : "s"} y {alquileres.length} alquiler
                {alquileres.length === 1 ? "" : "es"} por {formatoPesos.format(gastado)}.
              </p>
            )}
          </div>
        </section>

        {/* 7. Accesos */}
        <section className="contenedor pb-32" aria-labelledby="titulo-accesos">
          <h2 id="titulo-accesos" className="etiqueta mb-8 text-bruma">
            ¿Qué quieres hacer hoy?
          </h2>
          <ListaGrande
            elementos={[
              { titulo: "Comprar", href: "/catalogo?modo=comprar", detalle: ["Autos, motos, scooters, bicis y más", "Recoge hoy o te lo llevamos"], foto: "/img/landing/comprar.jpg" },
              { titulo: "Alquilar", href: "/catalogo?modo=alquilar", detalle: ["Por días, con seguro incluido", "En cualquiera de los 3 puntos"], foto: "/img/landing/alquilar.jpg" },
              { titulo: "Agendar taller", href: "/mi-cuenta/mantenimiento", detalle: ["Revisión, frenos, batería y aceite", "Para lo que compraste en MoviGo"], foto: "/img/landing/mantenimiento.jpg" },
              { titulo: "MoviGo Empresas", href: "/empresas", detalle: ["Flotas para tu equipo", "Cotiza en un minuto"], foto: "/img/landing/palabra-trabajo.jpg" },
            ]}
          />
        </section>
      </Revelador>
    </>
  );
}

/* ------------------------------------------------------------------
   Piezas de la página
------------------------------------------------------------------- */

function CartaFoto({ foto, children }: { foto: string; children: ReactNode }) {
  return (
    <div className="relative h-full">
      <Image src={foto} alt="" fill sizes="(min-width: 1240px) 1200px, 100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(200deg,rgb(13_18_18/0.7),rgb(13_18_18/0)_60%)]" />
      {children}
    </div>
  );
}

/**
 * Lo que está en curso va sobre el escenario oscuro con el vehículo real
 * (su foto sin fondo o el dibujo de su categoría) bajo el carril de luz.
 */
function CartaVehiculo({ foto, categoria, titulo, children }: { foto: Foto | null; categoria: string; titulo: string; children: ReactNode }) {
  return (
    <Escenario className="relative h-full" carril="polygon(8% 0, 46% 0, 62% 100%, 0 100%)" haz={false}>
      <div className="absolute bottom-[10%] left-[4%] w-[58%] max-w-[640px] md:bottom-[12%]">
        <FotoOVehiculo foto={foto} categoria={categoria} titulo={titulo} tamanos="(min-width: 1240px) 640px, 60vw" className="vehiculo-entra" />
      </div>
      {children}
    </Escenario>
  );
}

function CartaAlquiler({ alquiler: a }: { alquiler: AlquilerVista }) {
  return (
    <CartaVehiculo foto={a.producto.foto} categoria={a.producto.categoria} titulo={`${a.producto.marca} ${a.producto.nombre}`}>
      <div className="absolute right-6 top-6 max-w-[440px] text-right text-blanco md:right-12 md:top-12">
        <p className="etiqueta">
          Alquiler · {a.dias} día{a.dias === 1 ? "" : "s"} · {textoAlquiler[a.estado]}
        </p>
        <h3 className="titular mt-3 text-[clamp(32px,3.4vw,44px)]">
          {a.producto.marca} {a.producto.nombre}
        </h3>
        <p className="mt-3 text-[17px] leading-relaxed md:text-[19px]">
          {a.estado === "SOLICITADO"
            ? "Te lo apartamos. Termina el pago para confirmarlo."
            : `Del ${formatoDia.format(a.fechaInicio)} al ${formatoFechaLarga.format(a.fechaFin)}${a.punto ? ` en ${a.punto.nombre}` : ""}.`}
        </p>
        <div className="mt-6">
          <Boton href={a.estado === "SOLICITADO" && a.referenciaPago ? `/pagar/${a.referenciaPago}` : `/mi-cuenta/alquileres/${a.id}`}>
            {a.estado === "SOLICITADO" ? "Pagar ahora" : "Ver mi alquiler"}
          </Boton>
        </div>
      </div>
      {a.codigoRecogida && a.entrega === "EN_PUNTO" && a.estado !== "SOLICITADO" && (
        <div className="absolute bottom-6 left-6 rounded-[22px] border border-blanco/20 bg-carbon/50 px-6 py-5 text-blanco backdrop-blur-md md:bottom-8 md:left-8">
          <p className="etiqueta">Código de recogida</p>
          <p className="mt-1.5 font-mono text-[clamp(34px,4vw,54px)] font-medium tracking-[0.12em] text-turquesa">{a.codigoRecogida}</p>
        </div>
      )}
    </CartaVehiculo>
  );
}

function CartaTaller({ mantenimiento: m }: { mantenimiento: MantenimientoVista }) {
  return (
    <CartaVehiculo foto={m.producto.foto} categoria={m.producto.categoria} titulo={`${m.producto.marca} ${m.producto.nombre}`}>
      <div className="absolute right-6 top-6 max-w-[440px] text-right text-blanco md:right-12 md:top-12">
        <p className="etiqueta">Taller · {m.tipo === "PREVENTIVO" ? "Revisión" : "Arreglo"}</p>
        <h3 className="titular mt-3 text-[clamp(32px,3.4vw,44px)]">
          {m.producto.marca} {m.producto.nombre}
        </h3>
        <p className="mt-3 text-[17px] leading-relaxed md:text-[19px]">{formatoFechaHora.format(m.programadoPara).replace(/\.$/, "")}. Te avisamos cuando esté listo.</p>
        <div className="mt-6">
          <Boton href="/mi-cuenta/mantenimiento">Ver el taller</Boton>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 rounded-[22px] border border-blanco/20 bg-carbon/50 px-6 py-5 text-blanco backdrop-blur-md md:bottom-8 md:left-8">
        <p className="etiqueta">Estado</p>
        <p className="mt-1.5 text-[30px] text-turquesa">{textoTaller[m.estado]}</p>
      </div>
    </CartaVehiculo>
  );
}

function CartaPromo() {
  return (
    <CartaFoto foto="/img/landing/palabra-domingo.jpg">
      <div className="absolute right-6 top-6 max-w-[440px] text-right text-blanco md:right-12 md:top-12">
        <p className="etiqueta">Para el fin de semana</p>
        <h3 className="titular mt-3 text-[clamp(32px,3.4vw,44px)]">Alquila y sal de la ciudad</h3>
        <p className="mt-3 text-[17px] leading-relaxed md:text-[19px]">Bicis, motos y autos eléctricos por días, con seguro incluido.</p>
        <div className="mt-6">
          <Boton href="/catalogo?modo=alquilar">Ver qué alquilar</Boton>
        </div>
      </div>
    </CartaFoto>
  );
}

/* ------------------------------------------------------------------
   Datos para el historial y el seguimiento
------------------------------------------------------------------- */

function filaPedido(p: PedidoResumen): FilaHistorial {
  return {
    id: p.id,
    categoria: p.lineas[0]?.categoria ?? "scooters",
    titulo: nombreLineas(p),
    detalle: `${p.numero} · ${formatoDia.format(p.creadoEn)}`,
    monto: formatoPesos.format(p.total),
    estado: textoPedido[p.estado] ?? p.estado,
    tono: p.estado === "PENDIENTE_PAGO" ? "pendiente" : ["PAGADO", "PREPARANDO"].includes(p.estado) ? "activo" : "cerrado",
    href: `/mi-cuenta/pedidos/${p.numero}`,
  };
}

function filaAlquiler(a: AlquilerVista): FilaHistorial {
  return {
    id: a.id,
    categoria: a.producto.categoria,
    titulo: `${a.producto.marca} ${a.producto.nombre} · ${a.dias} día${a.dias === 1 ? "" : "s"}`,
    detalle: `${a.codigoRecogida ?? "Alquiler"} · ${formatoDia.format(a.fechaInicio)}`,
    monto: formatoPesos.format(a.total),
    estado: textoAlquiler[a.estado] ?? a.estado,
    tono: a.estado === "SOLICITADO" ? "pendiente" : ["ASIGNADO", "EN_CURSO"].includes(a.estado) ? "activo" : "cerrado",
    href: `/mi-cuenta/alquileres/${a.id}`,
  };
}

function filaTaller(m: MantenimientoVista): FilaHistorial {
  return {
    id: m.id,
    categoria: m.producto.categoria,
    titulo: `${m.tipo === "PREVENTIVO" ? "Revisión" : "Arreglo"} · ${m.producto.marca} ${m.producto.nombre}`,
    detalle: `${m.unidad.serial} · ${formatoDia.format(m.programadoPara)}`,
    monto: m.costo ? formatoPesos.format(m.costo) : "Por cotizar",
    estado: textoTaller[m.estado] ?? m.estado,
    tono: m.estado === "REALIZADO" ? "cerrado" : "activo",
    href: "/mi-cuenta/mantenimiento",
  };
}

type PasoDomicilio = { texto: string; hora: string; estado: "hecho" | "actual" | "pendiente" };

function pasosDomicilio(d: DomicilioVista): PasoDomicilio[] {
  const hora = (f: Date | null) => (f ? new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", timeZone: "America/Bogota" }).format(f) : "");
  const enCamino = d.estado === "EN_CURSO";
  return [
    { texto: "Pagado", hora: hora(d.creadaEn), estado: "hecho" },
    { texto: `Preparado en ${d.origen.nombre}`, hora: hora(d.asignadoEn), estado: enCamino ? "hecho" : "actual" },
    { texto: `En camino a ${d.destino.direccion}`, hora: enCamino ? "AHORA" : "", estado: enCamino ? "actual" : "pendiente" },
    { texto: "Entregado", hora: "", estado: "pendiente" },
  ];
}
