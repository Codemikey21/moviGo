import Link from "next/link";
import { EnlaceFlecha } from "@/compartido/interfaz/ui/EnlaceFlecha";
import { ImagenSlot } from "@/compartido/interfaz/ui/ImagenSlot";
import { salvia } from "./contenido";

/**
 * Sección salvia: frase centrada con palabras resaltadas y dos tarjetas
 * cuadradas con etiqueta, texto y enlace debajo.
 */
export function SeccionSalvia() {
  return (
    <section id="servicios" className="bg-salvia text-carbon">
      <div className="px-5 pb-[60px] pt-[120px] text-center md:pt-[160px]">
        <h2 data-revelar className="etiqueta pb-4 text-carbon/70">
          {salvia.etiqueta}
        </h2>
        <p
          data-revelar
          className="mx-auto max-w-[692px] text-[clamp(26px,2.5vw,36px)] leading-[1.2]"
        >
          {salvia.frase.map((parte, i) => (
            <span key={i} className={parte.resaltar ? "text-eucalipto" : ""}>
              {parte.texto}
            </span>
          ))}
        </p>
      </div>

      <div className="px-5 pb-[120px] pt-[60px] md:pb-[160px]">
        <div className="mx-auto grid max-w-[1164px] gap-10 md:grid-cols-2 md:gap-[20px]">
          {salvia.tarjetas.map((t, i) => (
            <article key={t.etiqueta} data-revelar className="flex flex-col items-center">
              <Link
                href={t.href}
                className="group relative block aspect-square w-full max-w-[456px] overflow-hidden rounded-tarjeta"
              >
                <div className="absolute inset-0">
                  <ImagenSlot src={t.foto} alt={t.etiqueta} tono={i === 0 ? "eucalipto" : "bosque"} />
                </div>
              </Link>
              <div className="w-full max-w-[456px] pt-10 text-center">
                <h3 className="etiqueta pb-4 text-carbon/70">{t.etiqueta}</h3>
                <p className="pb-4 text-[20px] leading-[1.5]">{t.texto}</p>
                <EnlaceFlecha href={t.href}>{t.enlace}</EnlaceFlecha>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
