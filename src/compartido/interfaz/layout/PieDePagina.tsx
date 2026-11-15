import type { ReactNode } from "react";
import { Chevron } from "../ui/Chevron";
import { IconoCuadrado } from "../ui/IconoCuadrado";
import { ImagenSlot } from "../ui/ImagenSlot";
import { hayRedes, RedesSociales } from "./RedesSociales";

type Enlace = { texto: string; href: string };

type Props = {
  mapa: Enlace[];
  cuenta: Enlace[];
  boletin: { etiqueta: string; texto: string };
  /** Formulario del boletín (lo pone el layout, que conoce el módulo de notificaciones). */
  formularioBoletin: ReactNode;
  legales: Enlace[];
  /** Foto grande del cierre (parte trasera de un vehículo, por ejemplo). */
  foto: string;
  legal: string;
  anio: number;
};

/**
 * Pie como el de la referencia: un panel blanco con las esquinas inferiores
 * redondeadas (columnas arriba, enlaces legales y redes abajo) sobre un
 * fondo casi negro con una foto grande, el copyright y la marca.
 */
export function PieDePagina({
  mapa,
  cuenta,
  boletin,
  formularioBoletin,
  legales,
  foto,
  legal,
  anio,
}: Props) {
  return (
    <footer id="contacto" className="bg-[#0b0e0e] text-blanco">
      {/* Panel blanco */}
      <div className="rounded-b-tarjeta bg-blanco text-carbon">
        <div className="px-5 pb-[70px] pt-[55px]">
          <div className="mx-auto grid max-w-[1164px] gap-12 md:grid-cols-3 md:gap-[20px]">
            <Columna titulo="Mapa del sitio" enlaces={mapa} />
            <Columna titulo="Tu cuenta" enlaces={cuenta} />

            <div>
              <h2 className="etiqueta pb-[22px] text-carbon/70">{boletin.etiqueta}</h2>
              <p className="pb-5 text-[16px] text-pizarra">{boletin.texto}</p>
              {formularioBoletin}
            </div>
          </div>
        </div>

        {/* Fila inferior: legales y redes */}
        <div className="border-t border-carbon/10 px-5 py-6 md:px-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {legales.map((e) => (
                <li key={e.texto}>
                  <a
                    href={e.href}
                    className="group inline-flex items-center gap-3 text-[12px] font-bold uppercase leading-none text-carbon"
                  >
                    {e.texto}
                    <Chevron className="transition-transform duration-300 group-hover:translate-x-[2px]" />
                  </a>
                </li>
              ))}
            </ul>
            {hayRedes && (
              <div className="flex items-center gap-5">
                <span className="text-[12px] font-bold uppercase text-bosque">Redes</span>
                <RedesSociales
                  className="gap-3"
                  claseEnlace="flex h-8 w-8 items-center justify-center rounded-[10px] border border-carbon/15 text-carbon transition-colors hover:bg-escarcha"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Foto grande, copyright y marca */}
      <div className="relative h-[460px] md:h-[560px]">
        <ImagenSlot src={foto} alt="" tono="carbon" />
        {/* Degradado para que el texto se lea sobre la foto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0b0e0e] to-transparent"
        />
        <div className="absolute inset-x-5 bottom-10 flex flex-col gap-6 md:inset-x-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[560px] text-[16px] font-semibold leading-[1.4] text-blanco">
            © {anio} MoviGo. Todos los derechos reservados.
            <span className="mt-2 block text-[12px] font-normal leading-[1.5] text-niebla">
              {legal}
            </span>
          </p>
          <p
            aria-hidden
            className="text-[28px] font-bold uppercase leading-none tracking-[0.3em] text-blanco"
          >
            MoviGo
          </p>
        </div>
      </div>
    </footer>
  );
}

function Columna({ titulo, enlaces }: { titulo: string; enlaces: Enlace[] }) {
  return (
    <nav aria-label={titulo}>
      <h2 className="etiqueta pb-[40px] text-carbon/70">{titulo}</h2>
      <ul className="flex flex-col gap-4">
        {enlaces.map((e) => (
          <li key={e.texto}>
            <a
              href={e.href}
              className="group inline-flex items-center gap-3 text-[20px] leading-[1.5] text-carbon"
            >
              {e.texto}
              <IconoCuadrado
                variante="borde"
                className="transition-[translate,background-color] duration-300 group-hover:translate-x-1 group-hover:bg-escarcha"
              />
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
