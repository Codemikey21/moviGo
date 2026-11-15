import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { Escenario } from "@/compartido/interfaz/ui/Escenario";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { Muesca } from "@/compartido/interfaz/ui/Muesca";
import { IlustracionVehiculo } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/IlustracionVehiculo";
import type { Foto } from "@/modulos/gestion-catalogo/tipos";

/**
 * Portada de un pedido o un alquiler: el escenario oscuro con el vehículo
 * bajo el carril de luz, el estado en grande a la izquierda y una pestaña
 * recortada abajo con el dato clave (número, código, total…).
 */
export function PortadaServicio({
  volver,
  etiqueta,
  titulo,
  detalle,
  estado,
  foto,
  categoria,
  muesca,
  accion,
}: {
  volver: { href: string; texto: string };
  etiqueta: string;
  titulo: string;
  detalle?: ReactNode;
  /** Pastilla del estado */
  estado: ReactNode;
  foto: Foto | null;
  categoria: string;
  /** Lo que va en la pestaña recortada de abajo */
  muesca?: ReactNode;
  /** Botón principal (por ejemplo, pagar) para no tener que bajar a buscarlo */
  accion?: { href: string; texto: string };
}) {
  return (
    <section className="pt-8">
      <Escenario
        className={`relative overflow-hidden rounded-tarjeta text-blanco ${muesca ? "rounded-bl-none" : ""}`}
        carril="polygon(52% 0, 80% 0, 100% 100%, 34% 100%)"
        haz={false}
      >
        <div className={`relative grid items-center gap-6 px-6 pt-8 sm:px-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] md:pt-10 ${muesca ? "pb-24" : "pb-10"}`}>
          <div>
            <Link href={volver.href} className="inline-flex items-center gap-1.5 text-[14px] text-blanco/65 hover:text-blanco">
              <Icono nombre="atras" className="size-4" /> {volver.texto}
            </Link>
            <p className="etiqueta mt-8 text-turquesa">{etiqueta}</p>
            <h1 className="titular mt-4 text-[clamp(42px,5.4vw,80px)]">{titulo}</h1>
            {detalle && <div className="mt-4 max-w-[480px] text-[16px] leading-relaxed text-blanco/70">{detalle}</div>}
            <div className="mt-6 flex flex-wrap items-center gap-4">
              {estado}
              {accion && <Boton href={accion.href}>{accion.texto}</Boton>}
            </div>
          </div>
          <div className="relative mx-auto aspect-[16/10] w-full max-w-[560px]">
            {foto ? (
              <Image src={foto.url} alt={foto.textoAlt} fill sizes="(min-width: 768px) 46vw, 90vw" className="vehiculo-entra object-contain" priority />
            ) : (
              <IlustracionVehiculo categoria={categoria} className="vehiculo-entra absolute inset-x-0 top-1/2 w-full -translate-y-1/2" />
            )}
          </div>
        </div>
        {muesca && (
          <Muesca lado="izquierda" fondo="var(--color-blanco)" className="pr-[18px] pt-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-1 text-carbon">{muesca}</div>
          </Muesca>
        )}
      </Escenario>
    </section>
  );
}
