import { Insignia, type TonoInsignia } from "@/compartido/interfaz/ui/Insignia";
import type { EstadoMantenimiento as Estado } from "../../../tipos";

const textos: Record<Estado, [string, TonoInsignia]> = {
  PROGRAMADO: ["Agendado", "ambar"],
  EN_CURSO: ["En el taller", "oscuro"],
  REALIZADO: ["Listo", "turquesa"],
};

export function EstadoMantenimiento({ estado }: { estado: Estado }) {
  const [texto, tono] = textos[estado];
  return <Insignia tono={tono}>{texto}</Insignia>;
}
