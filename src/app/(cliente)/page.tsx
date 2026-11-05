import { Revelador } from "@/compartido/interfaz/animaciones/Revelador";
import { SeccionCategorias } from "./_landing/SeccionCategorias";
import { SeccionHistoria } from "./_landing/SeccionHistoria";
import { SeccionOscura } from "./_landing/SeccionOscura";
import { SeccionPedestal } from "./_landing/SeccionPedestal";
import { SeccionSalvia } from "./_landing/SeccionSalvia";

// La historia abre la landing y reemplaza a Hero, SeccionHorizontal y
// SeccionPalabras. Esos tres archivos siguen en _landing/ por si se quieren
// volver a usar: basta con importarlos y ponerlos aquí.
export default function Inicio() {
  return (
    <Revelador>
      <main>
        <SeccionHistoria />
        <SeccionPedestal />
        <SeccionOscura />
        <SeccionSalvia />
        <SeccionCategorias />
      </main>
    </Revelador>
  );
}
