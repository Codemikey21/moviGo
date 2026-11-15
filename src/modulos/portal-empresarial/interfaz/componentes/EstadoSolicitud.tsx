import { Insignia, type TonoInsignia } from "@/compartido/interfaz/ui/Insignia";
import type { EstadoSolicitud as Estado } from "../../tipos";

const textos: Record<Estado, [string, TonoInsignia]> = {
  BORRADOR: ["Borrador", "gris"],
  ENVIADA: ["En revisión", "ambar"],
  APROBADA: ["Aprobada", "turquesa"],
  RECHAZADA: ["Rechazada", "gris"],
};

export function EstadoSolicitud({ estado, cotizada }: { estado: Estado; cotizada?: boolean }) {
  const [texto, tono] = textos[estado];
  return <Insignia tono={estado === "ENVIADA" && cotizada ? "salvia" : tono}>{estado === "ENVIADA" && cotizada ? "Cotizada" : texto}</Insignia>;
}
