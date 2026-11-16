"use client";

import { useEffect, useState } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { NombreColor, ProductoEnColor } from "./ColorElegido";

/**
 * Barra flotante con el precio y los botones de compra. Aparece cuando la
 * persona ya pasó la vitrina y se esconde mientras el configurador está en
 * pantalla (ahí ya tiene los botones de verdad). Así comprar queda siempre
 * a un clic, sin importar en qué parte de la página esté.
 */
export function BarraCompra({
  nombre,
  slug,
  precio,
  tarifaDia,
  disponibles,
}: {
  nombre: string;
  slug: string;
  precio: number;
  tarifaDia: number | null;
  disponibles: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const configurador = document.getElementById("configurar");
    let pasoVitrina = false;
    let configuradorEnPantalla = false;
    const actualizar = () => setVisible(pasoVitrina && !configuradorEnPantalla);

    const alBajar = () => {
      pasoVitrina = window.scrollY > window.innerHeight * 0.9;
      actualizar();
    };

    const observador = new IntersectionObserver(
      ([entrada]) => {
        configuradorEnPantalla = entrada.isIntersecting;
        actualizar();
      },
      // Cuenta como "en pantalla" cuando ocupa la franja central
      { rootMargin: "-25% 0px -25% 0px" },
    );
    if (configurador) observador.observe(configurador);

    alBajar();
    window.addEventListener("scroll", alBajar, { passive: true });
    return () => {
      window.removeEventListener("scroll", alBajar);
      observador.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-[translate,opacity] duration-500 ease-salida motion-reduce:transition-none md:bottom-5 md:px-5 md:pb-0 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[120%] opacity-0"
      }`}
    >
      <div className="mx-auto flex max-w-[860px] items-center gap-3 rounded-[22px] bg-carbon/92 p-2.5 text-blanco ring-1 ring-blanco/10 backdrop-blur-xl md:gap-4 md:p-3">
        <span className="hidden shrink-0 rounded-[14px] bg-escarcha px-2 py-1.5 sm:block">
          <ProductoEnColor className="w-[76px]" tamanos="96px" />
        </span>

        <div className="min-w-0 flex-1 pl-1.5 sm:pl-0">
          <p className="truncate text-[15px] md:text-[16px]">
            {nombre}
            <NombreColor className="hidden text-niebla md:inline before:mx-1.5 before:content-['·']" />
          </p>
          <p className="truncate text-[13px] text-niebla">
            <span className="font-semibold text-blanco">{formatoPesos.format(precio)}</span>
            {tarifaDia !== null && <span className="hidden sm:inline"> · o {formatoPesos.format(tarifaDia)} por día</span>}
            {!disponibles && " · agotado por ahora"}
          </p>
        </div>

        {tarifaDia !== null && (
          <span className="hidden md:block">
            <Boton href={`/producto/${slug}?modo=alquilar#configurar`} variante="oscuro" tamano="compacto">
              Alquilar
            </Boton>
          </span>
        )}
        <Boton href="#configurar" tamano="compacto">
          {disponibles ? "Comprar" : "Ver colores"}
        </Boton>
      </div>
    </div>
  );
}
