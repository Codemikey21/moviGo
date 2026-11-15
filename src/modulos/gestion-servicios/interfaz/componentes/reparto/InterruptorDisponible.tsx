import { cambiarDisponibleAccion } from "../../../servidor/reparto/acciones";

/** Interruptor grande para conectarse o desconectarse del reparto. */
export function InterruptorDisponible({ disponible }: { disponible: boolean }) {
  return (
    <form action={cambiarDisponibleAccion}>
      <input type="hidden" name="disponible" value={disponible ? "0" : "1"} />
      <button
        type="submit"
        role="switch"
        aria-checked={disponible}
        className={`group flex h-14 items-center gap-4 rounded-full pl-5 pr-2 text-[13px] font-bold uppercase tracking-[0.04em] transition-colors ${
          disponible ? "bg-turquesa text-carbon" : "bg-blanco/10 text-blanco hover:bg-blanco/15"
        }`}
      >
        {disponible ? "Disponible" : "Desconectado"}
        <span className={`relative h-10 w-[68px] rounded-full transition-colors ${disponible ? "bg-carbon" : "bg-blanco/20"}`}>
          <span
            className={`absolute top-1 size-8 rounded-full transition-[left,background-color] duration-300 ease-salida ${
              disponible ? "left-[32px] bg-turquesa" : "left-1 bg-blanco"
            }`}
          />
        </span>
      </button>
    </form>
  );
}
