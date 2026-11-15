import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { EscenaScroll } from "@/compartido/interfaz/animaciones/EscenaScroll";
import { ListaGrande } from "@/compartido/interfaz/animaciones/ListaGrande";
import { PilaTarjetas } from "@/compartido/interfaz/animaciones/PilaTarjetas";
import { Revelador } from "@/compartido/interfaz/animaciones/Revelador";
import { TextoPalabras } from "@/compartido/interfaz/animaciones/TextoPalabras";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { EnlaceFlecha } from "@/compartido/interfaz/ui/EnlaceFlecha";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { formatoPesos, hoyEnColombia } from "@/compartido/utilidades/formato";
import {
  obtenerConteos,
  obtenerDisponibilidad,
  obtenerDisponibilidadPorColor,
} from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { TarjetaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/TarjetaProducto";
import { listarCatalogo, obtenerProducto } from "@/modulos/gestion-catalogo/servidor/productos/acciones";
import { MAX_ANTICIPACION_DIAS } from "@/modulos/gestion-servicios/servidor/alquiler/validaciones";
import { COSTO_DOMICILIO } from "@/modulos/gestion-servicios/servidor/domicilios/servicio";
import { obtenerMiPerfil } from "@/modulos/gestion-usuarios/servidor/acciones";
import { ProductoEnColor, ProveedorColor } from "./_componentes/ColorElegido";
import { Configurador } from "./_componentes/Configurador";
import { DetallesProducto } from "./_componentes/DetallesProducto";
import { FichaTecnica } from "./_componentes/FichaTecnica";

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const producto = await obtenerProducto(slug);
  return { title: producto ? `${producto.marca} ${producto.nombre} · MoviGo` : "Producto · MoviGo" };
}

// Cómo se nombra cada categoría en singular ("Conoce tu moto")
const singular: Record<string, string> = {
  "autos-electricos": "auto eléctrico",
  motos: "moto",
  scooters: "scooter",
  bicicletas: "bicicleta",
  patinetas: "patineta",
  drones: "dron",
  accesorios: "accesorio",
};

// Foto de ambiente (de la landing) para la sección "Llévalo"
const fotoAmbiente: Record<string, string> = {
  "autos-electricos": "/img/landing/pie.jpg",
  motos: "/img/landing/palabra-escape.jpg",
  scooters: "/video/recorrido-poster.jpg",
  bicicletas: "/img/landing/palabra-domingo.jpg",
  drones: "/img/landing/palabra-perspectiva.jpg",
  patinetas: "/img/landing/recorrido-1.jpg",
  accesorios: "/img/landing/comprar.jpg",
};

const fotosPuntos = ["/img/landing/recorrido-1.jpg", "/img/landing/palabra-perspectiva.jpg", "/img/landing/palabra-trabajo.jpg"];

export default function PaginaProducto({ params, searchParams }: PageProps<"/producto/[slug]">) {
  return (
    <main className="bg-blanco pb-[120px]">
      <Suspense fallback={<Escenario className="h-svh" />}>
        <Contenido params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({
  params,
  searchParams,
}: Pick<PageProps<"/producto/[slug]">, "params" | "searchParams">) {
  await connection();
  const { slug } = await params;
  const { modo } = await searchParams;
  const producto = await obtenerProducto(slug);
  if (!producto) notFound();

  // Catálogo y almacén son módulos separados: la página junta los dos
  const [disponibilidad, porColor, relacionados, perfil] = await Promise.all([
    obtenerDisponibilidad(producto.id),
    obtenerDisponibilidadPorColor(producto.id),
    listarCatalogo({ categoria: producto.categoria.slug }),
    obtenerMiPerfil(),
  ]);
  const otros = relacionados.filter((p) => p.id !== producto.id).slice(0, 3);
  const conteos = await obtenerConteos(otros.map((p) => p.id));
  const disponibles = disponibilidad.reduce((s, d) => s + d.disponibles, 0);
  const alquila = producto.tarifaAlquilerDia !== null;
  const cat = producto.categoria.slug;

  return (
    <ProveedorColor categoria={cat} nombre={`${producto.marca} ${producto.nombre}`} colores={producto.colores} fotos={producto.fotos}>
      {/* 1. Vitrina: el producto a pantalla completa que se encoge al bajar */}
      <EscenaScroll className="h-svh md:h-[250vh]" classNamePin="bg-blanco" data-cabecera-clara="">
        <div className="escena-lado absolute left-[6vw] top-1/2 hidden w-[36vw] md:block">
          <p className="etiqueta text-eucalipto">
            {producto.marca} · {producto.categoria.nombre}
          </p>
          <h2 className="titular mt-4 text-[clamp(36px,3.4vw,52px)] text-carbon">
            {producto.marca} {producto.nombre}.
          </h2>
          <p className="mt-4 max-w-[480px] text-[17px] leading-relaxed text-pizarra">{producto.descripcion}</p>
          <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="text-[34px] tracking-[-0.02em] text-carbon">{formatoPesos.format(producto.precioVenta)}</span>
            {alquila && <span className="text-pizarra">o {formatoPesos.format(producto.tarifaAlquilerDia!)} por día</span>}
          </div>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Boton href="#configurar">Comprar</Boton>
            {alquila && (
              <Boton href={`/producto/${producto.slug}?modo=alquilar#configurar`} variante="secundario">
                Alquilar por días
              </Boton>
            )}
          </div>
        </div>

        <Escenario className="escena-encoge absolute inset-0">
          <div className="escena-vehiculo absolute left-1/2 top-[42%] w-[min(840px,90vw)] md:top-[40%] md:w-[min(840px,62vw)]">
            <ProductoEnColor prioridad tamanos="(min-width: 768px) 62vw, 90vw" />
          </div>

          <nav aria-label="Ruta" className="escena-desvanece absolute left-5 top-[100px] z-10 flex items-center gap-2 rounded-[14px] bg-blanco/10 px-4 py-2.5 text-[13px] text-blanco/80 backdrop-blur md:left-10 md:top-[108px]">
            <Link href="/catalogo" className="hover:text-blanco">
              Catálogo
            </Link>
            <span className="text-blanco/40">/</span>
            <Link href={`/catalogo?categoria=${cat}`} className="hover:text-blanco">
              {producto.categoria.nombre}
            </Link>
          </nav>

          <div className="escena-desvanece absolute inset-x-5 bottom-[11vh] text-center text-blanco">
            <p className="etiqueta text-turquesa">Conoce tu {singular[cat] ?? "vehículo"}</p>
            <h1 className="titular mx-auto mt-4 max-w-[900px] text-[clamp(40px,5.4vw,72px)]">
              {producto.marca} {producto.nombre}
            </h1>
            <p className="mx-auto mt-4 max-w-[620px] text-[16px] text-blanco/75 md:text-[18px]">
              {formatoPesos.format(producto.precioVenta)}
              {alquila && ` · o ${formatoPesos.format(producto.tarifaAlquilerDia!)} por día`}
              {" · "}
              {disponibles ? `${disponibles} disponible${disponibles === 1 ? "" : "s"}` : "agotado por ahora"}
            </p>
          </div>
        </Escenario>
      </EscenaScroll>

      <Revelador>
        {/* 2. Detalles */}
        <section className="contenedor pb-24 pt-16 md:pb-32 md:pt-10" aria-label="Detalles">
          <div data-revelar>
            <DetallesProducto especificaciones={producto.especificaciones} descripcion={producto.descripcion} />
          </div>
        </section>

        {/* 3. Configurador */}
        <section id="configurar" className="scroll-mt-24 bg-salvia py-24 md:py-32">
          <div className="contenedor">
            <p className="etiqueta text-center text-bosque">Hazlo tuyo</p>
            <TextoPalabras
              className="titular mx-auto mb-16 mt-5 max-w-[1000px] text-center text-[clamp(32px,4vw,52px)] text-carbon md:mb-20"
              partes={[
                { texto: producto.colores.length > 1 ? "Escoge el color, el punto y cómo te lo llevas. " : "Escoge el punto y cómo te lo llevas. " },
                { texto: "Nosotros nos encargamos del resto.", resaltado: true },
              ]}
            />
            <Configurador
              marca={producto.marca}
              categoriaNombre={producto.categoria.nombre}
              disponibilidad={disponibilidad}
              porColor={porColor}
              producto={{
                id: producto.id,
                slug: producto.slug,
                nombre: producto.nombre,
                precioVenta: producto.precioVenta,
                tarifaAlquilerDia: producto.tarifaAlquilerDia,
              }}
              haySesion={Boolean(perfil)}
              modoInicial={modo === "alquilar" ? "alquilar" : "comprar"}
              hoy={hoyEnColombia()}
              maxFecha={hoyEnColombia(MAX_ANTICIPACION_DIAS)}
              costoDomicilio={COSTO_DOMICILIO}
            />
          </div>
        </section>

        {/* 4. Cómo te llega */}
        <section className="contenedor pb-16 pt-24 md:pt-32" aria-labelledby="como-llega">
          <p className="etiqueta text-center text-bruma">Cómo te llega</p>
          <div id="como-llega">
            <TextoPalabras
              className="titular mx-auto mb-16 mt-5 max-w-[980px] text-center text-[clamp(32px,4vw,52px)] text-carbon"
              partes={[
                { texto: "Tú decides cómo empezar: " },
                { texto: alquila ? "lo recoges, te lo llevamos o lo alquilas por días." : "lo recoges hoy o te lo llevamos.", resaltado: true },
              ]}
            />
          </div>
          <PilaTarjetas>
            <CartaComo foto="/img/landing/recorrido-1.jpg" titulo="Recógelo hoy" texto="En cualquiera de nuestros tres puntos. Muestras el número de tu pedido y te lo llevas." />
            <CartaComo foto="/img/landing/domicilio.jpg" titulo="Te lo llevamos" texto={`Sigue la entrega en el mapa, en vivo, hasta la puerta de tu casa. Domicilio de ${formatoPesos.format(COSTO_DOMICILIO)}.`} />
            {alquila && (
              <CartaComo
                foto={fotoAmbiente[cat] ?? "/img/landing/alquilar.jpg"}
                titulo="Alquílalo por días"
                texto={`Pruébalo antes de comprarlo o úsalo para un viaje, desde ${formatoPesos.format(producto.tarifaAlquilerDia!)} por día.`}
              />
            )}
            <CartaComo foto="/img/landing/mantenimiento.jpg" titulo="Taller MoviGo" texto="Revisiones, frenos y ajustes cuando lo necesites. Agéndalo desde tu cuenta." />
          </PilaTarjetas>
        </section>

        {/* 5. Ficha técnica */}
        {producto.especificaciones.length > 0 && (
          <section className="bg-bosque py-24 md:py-28" aria-label="Ficha técnica">
            <div className="contenedor">
              <FichaTecnica especificaciones={producto.especificaciones} nombre={producto.nombre} />
            </div>
          </section>
        )}

        {/* 6. Llévalo */}
        <section className="bg-salvia py-24 md:py-32">
          <div className="contenedor grid items-center gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
            <div data-revelar className="text-center">
              <p className="etiqueta text-bosque">Tu próximo trayecto</p>
              <p className="titular mx-auto mt-5 max-w-[320px] text-[clamp(36px,3.6vw,48px)] text-carbon">
                Llévalo hoy y empieza a moverte distinto.
              </p>
              <div className="mt-9">
                <Boton href="#configurar">{disponibles ? "Comprar ahora" : "Ver colores"}</Boton>
              </div>
            </div>
            <div data-revelar className="relative aspect-[4/3] overflow-hidden rounded-tarjeta">
              <Image src={fotoAmbiente[cat] ?? "/img/landing/catalogo.jpg"} alt="" fill sizes="(min-width: 768px) 55vw, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* 7. Dónde lo encuentras */}
        <section className="contenedor pt-24 md:pt-32" aria-labelledby="donde">
          <h2 id="donde" className="etiqueta mb-8 text-bruma">
            Dónde lo encuentras
          </h2>
          <ListaGrande
            elementos={disponibilidad.map((d, i) => ({
              titulo: d.punto.nombre,
              href: "#configurar",
              detalle: [
                d.disponibles ? `${d.disponibles} disponible${d.disponibles === 1 ? "" : "s"}` : "Agotado por ahora",
                `${d.punto.direccion} · ${d.punto.horario}`,
              ],
              foto: fotosPuntos[i % fotosPuntos.length],
            }))}
          />
        </section>

        {otros.length > 0 && (
          <section className="contenedor mt-[120px]">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <h2 className="titular text-[clamp(28px,3vw,40px)] text-carbon">También te puede gustar</h2>
              <EnlaceFlecha href={`/catalogo?categoria=${cat}`}>Ver todos</EnlaceFlecha>
            </div>
            <ul className="grid gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {otros.map((p) => (
                <li key={p.id} data-revelar>
                  <TarjetaProducto producto={p} disponibles={conteos[p.id]?.disponibles ?? 0} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </Revelador>
    </ProveedorColor>
  );
}

/** Tarjeta de foto de la pila "Cómo te llega". */
function CartaComo({ foto, titulo, texto }: { foto: string; titulo: string; texto: string }) {
  return (
    <div className="relative h-full">
      <Image src={foto} alt="" fill sizes="(min-width: 1240px) 1200px, 100vw" className="object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(200deg,rgb(13_18_18/0.65),rgb(13_18_18/0)_55%)]" />
      <div className="absolute right-6 top-6 max-w-[430px] text-right text-blanco md:right-12 md:top-12">
        <p className="etiqueta">{titulo}</p>
        <p className="mt-3 text-[18px] leading-relaxed md:text-[20px]">{texto}</p>
      </div>
    </div>
  );
}
