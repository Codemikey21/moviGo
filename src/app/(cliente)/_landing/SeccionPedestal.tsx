import { Boton } from "@/compartido/interfaz/ui/Boton";
import { VideoLoop } from "@/compartido/interfaz/ui/VideoLoop";
import { pedestal } from "./contenido";

/**
 * Pantalla completa con tu producto estrella (video de fondo) y el texto
 * abajo a la izquierda, como en la referencia.
 */
export function SeccionPedestal() {
  return (
    <section className="relative h-svh min-h-[640px] overflow-hidden bg-blanco">
      <VideoLoop nombre={pedestal.video} tono="arena" />

      <div className="absolute bottom-[60px] left-5 w-[338px] max-w-[calc(100%-40px)] md:left-[50px] md:bottom-[80px]">
        <h2 data-revelar className="etiqueta pb-4 text-carbon/70">
          {pedestal.etiqueta}
        </h2>
        <p data-revelar className="pb-4 text-[20px] leading-[1.5] text-carbon">
          {pedestal.texto}
        </p>
        <div data-revelar className="pt-2">
          <Boton href={pedestal.boton.href}>{pedestal.boton.texto}</Boton>
        </div>
      </div>
    </section>
  );
}
