import { Insignia, type TonoInsignia } from "@/compartido/interfaz/ui/Insignia";
import type { EstadoServicio } from "../../../tipos";

const textos: Record<EstadoServicio, [string, TonoInsignia]> = {
  SOLICITADO: ["Sin asignar", "ambar"],
  ASIGNADO: ["Asignado", "turquesa"],
  EN_CURSO: ["En camino", "oscuro"],
  COMPLETADO: ["Entregado", "salvia"],
  CANCELADO: ["Cancelado", "gris"],
};

export function EstadoDomicilio({ estado }: { estado: EstadoServicio }) {
  const [texto, tono] = textos[estado];
  return <Insignia tono={tono}>{texto}</Insignia>;
}
