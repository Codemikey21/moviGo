import { Revelador } from "@/compartido/interfaz/animaciones/Revelador";
import { Hero } from "./_landing/Hero";
import { SeccionHorizontal } from "./_landing/SeccionHorizontal";
import { SeccionPalabras } from "./_landing/SeccionPalabras";
import { SeccionPedestal } from "./_landing/SeccionPedestal";
import { SeccionOscura } from "./_landing/SeccionOscura";
import { SeccionSalvia } from "./_landing/SeccionSalvia";
import { SeccionCategorias } from "./_landing/SeccionCategorias";

// Misma secuencia de secciones que el sitio de referencia.
export default function Inicio() {
  return (
    <Revelador>
      <main>
        <Hero />
        <SeccionHorizontal />
        <SeccionPalabras />
        <SeccionPedestal />
        <SeccionOscura />
        <SeccionSalvia />
        <SeccionCategorias />
      </main>
    </Revelador>
  );
}
