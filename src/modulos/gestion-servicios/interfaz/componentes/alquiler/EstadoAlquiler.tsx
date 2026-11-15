import { Insignia, type TonoInsignia } from "@/compartido/interfaz/ui/Insignia";
import type { EstadoServicio } from "../../../tipos";

const textos: Record<EstadoServicio, [string, TonoInsignia]> = {
  SOLICITADO: ["Esperando pago", "ambar"],
  ASIGNADO: ["Confirmado", "turquesa"],
  EN_CURSO: ["En curso", "oscuro"],
  COMPLETADO: ["Devuelto", "salvia"],
  CANCELADO: ["Cancelado", "gris"],
};

export function EstadoAlquiler({ estado }: { estado: EstadoServicio }) {
  const [texto, tono] = textos[estado];
  return <Insignia tono={tono}>{texto}</Insignia>;
}
