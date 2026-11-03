import { Chevron } from "../ui/Chevron";
import { IconoCuadrado } from "../ui/IconoCuadrado";
import { ImagenSlot } from "../ui/ImagenSlot";

type Enlace = { texto: string; href: string };

type Props = {
  mapa: Enlace[];
  cuenta: Enlace[];
  boletin: { etiqueta: string; texto: string };
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
              <form className="flex flex-col gap-4" action="#" method="get">
                <label className="sr-only" htmlFor="pie-correo">
                  Correo electrónico
                </label>
                <input
                  id="pie-correo"
                  type="email"
                  name="correo"
                  placeholder="Tu correo"
                  className="h-14 w-full rounded-[18px] border border-carbon/20 bg-blanco px-5 text-[14px] text-carbon placeholder:text-niebla focus:border-carbon focus:outline-none"
                />
                <button
                  type="submit"
                  className="etiqueta h-[50px] w-full rounded-boton border border-carbon/70 font-bold text-carbon transition-colors duration-300 hover:bg-carbon hover:text-blanco"
                >
                  Unirme al boletín
                </button>
              </form>
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
            <div className="flex items-center gap-5">
              <span className="text-[12px] font-bold uppercase text-bosque">Redes</span>
              <Redes />
            </div>
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

function Redes() {
  const clase =
    "flex h-8 w-8 items-center justify-center rounded-[10px] border border-carbon/15 text-carbon transition-colors hover:bg-escarcha";
  return (
    <span className="flex items-center gap-3">
      <a href="#" aria-label="YouTube" className={clase}>
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M22 8.2a2.6 2.6 0 0 0-1.8-1.8C18.6 6 12 6 12 6s-6.6 0-8.2.4A2.6 2.6 0 0 0 2 8.2 27 27 0 0 0 1.6 12 27 27 0 0 0 2 15.8a2.6 2.6 0 0 0 1.8 1.8C5.4 18 12 18 12 18s6.6 0 8.2-.4a2.6 2.6 0 0 0 1.8-1.8 27 27 0 0 0 .4-3.8 27 27 0 0 0-.4-3.8zM10 14.6V9.4l4.6 2.6L10 14.6z" />
        </svg>
      </a>
      <a href="#" aria-label="Instagram" className={clase}>
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a href="#" aria-label="TikTok" className={clase}>
        <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 fill-current">
          <path d="M16 3c.3 2.4 1.8 4 4 4.2v3.1c-1.5 0-2.9-.5-4-1.3v6.4A5.6 5.6 0 1 1 10.4 10v3.2a2.5 2.5 0 1 0 2.5 2.5V3H16z" />
        </svg>
      </a>
    </span>
  );
}
