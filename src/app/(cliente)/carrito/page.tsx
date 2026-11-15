import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { obtenerDisponibilidad } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { VitrinaProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/VitrinaProducto";
import { cambiarCantidadAccion, obtenerMiCarrito } from "@/modulos/gestion-pedidos/servidor/carrito/acciones";
import { COSTO_DOMICILIO } from "@/modulos/gestion-servicios/servidor/domicilios/servicio";
import { FormularioEntrega } from "./_componentes/FormularioEntrega";

export const metadata: Metadata = { title: "Carrito · MoviGo" };

export default function PaginaCarrito() {
  return (
    <main className="min-h-svh bg-blanco pb-[120px] pt-[140px]">
      <div className="contenedor">
        <Suspense fallback={<p className="text-pizarra">Cargando tu carrito…</p>}>
          <Contenido />
        </Suspense>
      </div>
    </main>
  );
}

/** Botón − o + que cambia la cantidad (o quita con 0). */
function BotonCantidad({ itemId, cantidad, icono, etiqueta, deshabilitado }: { itemId: string; cantidad: number; icono: "mas" | "menos" | "cerrar"; etiqueta: string; deshabilitado?: boolean }) {
  return (
    <form action={cambiarCantidadAccion}>
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="cantidad" value={cantidad} />
      <button
        type="submit"
        aria-label={etiqueta}
        disabled={deshabilitado}
        className="grid size-9 place-items-center rounded-[12px] text-carbon transition-colors hover:bg-blanco disabled:opacity-30"
      >
        <Icono nombre={icono} className="size-4" />
      </button>
    </form>
  );
}

async function Contenido() {
  await connection();
  const carrito = await obtenerMiCarrito();

  if (!carrito.items.length) {
    return (
      <div className="mx-auto max-w-[640px] py-16 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-salvia text-bosque">
          <Icono nombre="carrito" className="size-9" />
        </span>
        <h1 className="titular mt-8 text-[clamp(40px,5vw,64px)] text-carbon">Tu carrito está vacío</h1>
        <p className="mt-4 text-[18px] text-pizarra">Elige tu próximo vehículo en el catálogo.</p>
        <div className="mt-8">
          <Boton href="/catalogo">Ver catálogo</Boton>
        </div>
      </div>
    );
  }

  // Disponibilidad por punto de cada producto (almacén) para elegir dónde recoger
  const disponibilidades = await Promise.all(carrito.items.map((i) => obtenerDisponibilidad(i.productoId, i.color?.id ?? null)));

  return (
    <>
      <p className="etiqueta text-carbon/70">Tu carrito</p>
      <h1 className="titular mt-4 text-[clamp(40px,5vw,72px)] text-carbon">
        {carrito.unidades} producto{carrito.unidades === 1 ? "" : "s"} <span className="text-eucalipto">listos para salir</span>
      </h1>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14">
        <ul className="space-y-4">
          {carrito.items.map((item) => (
            <li key={item.id} className="flex gap-4 rounded-tarjeta bg-escarcha p-3 sm:gap-6 sm:p-4">
              <Link href={`/producto/${item.slug}`} className="shrink-0">
                <VitrinaProducto
                  foto={item.foto}
                  categoria={item.categoria}
                  color={item.color?.hex}
                  tamanos="160px"
                  className="size-28 rounded-[28px] sm:size-40"
                  tamanoDibujo="w-[78%]"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col py-2 pr-2">
                <p className="etiqueta text-eucalipto">{item.marca}</p>
                <Link href={`/producto/${item.slug}`} className="mt-1.5 text-[20px] leading-tight text-carbon">
                  {item.nombre}
                </Link>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[14px] text-pizarra">
                  {item.color && (
                    <span className="flex items-center gap-1.5">
                      <span className="size-3 rounded-full ring-1 ring-carbon/15" style={{ background: item.color.hex }} />
                      {item.color.nombre} ·
                    </span>
                  )}
                  {formatoPesos.format(item.precioUnitario)} c/u
                </p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                  <div className="flex items-center rounded-[14px] bg-salvia/70 p-0.5">
                    <BotonCantidad itemId={item.id} cantidad={item.cantidad - 1} icono="menos" etiqueta="Quitar uno" />
                    <span className="w-8 text-center text-[16px] tabular-nums">{item.cantidad}</span>
                    <BotonCantidad itemId={item.id} cantidad={item.cantidad + 1} icono="mas" etiqueta="Agregar uno" deshabilitado={item.cantidad >= 5} />
                  </div>
                  <p className="text-[20px] tabular-nums text-carbon">{formatoPesos.format(item.precioUnitario * item.cantidad)}</p>
                </div>
              </div>
              <div className="pt-1">
                <BotonCantidad itemId={item.id} cantidad={0} icono="cerrar" etiqueta={`Quitar ${item.nombre}`} />
              </div>
            </li>
          ))}
          <li className="px-2 pt-2">
            <Link href="/catalogo" className="inline-flex items-center gap-2 text-[12px] font-bold uppercase text-carbon">
              <Icono nombre="atras" className="size-4" /> Seguir comprando
            </Link>
          </li>
        </ul>

        <aside className="lg:sticky lg:top-[110px] lg:self-start">
          <div className="rounded-tarjeta border border-carbon/10 p-6 sm:p-8">
            <h2 className="text-[24px] text-carbon">Entrega y pago</h2>
            <div className="mt-6">
              <FormularioEntrega
                subtotal={carrito.subtotal}
                costoDomicilio={COSTO_DOMICILIO}
                items={carrito.items.map((item, i) => ({ cantidad: item.cantidad, disponibilidad: disponibilidades[i] }))}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
