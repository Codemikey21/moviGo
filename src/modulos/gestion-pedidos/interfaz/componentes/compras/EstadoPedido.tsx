import { Insignia, type TonoInsignia } from "@/compartido/interfaz/ui/Insignia";
import type { EstadoPedido as Estado, ModalidadEntrega } from "../../../tipos";

const textos: Record<Estado, [string, TonoInsignia]> = {
  PENDIENTE_PAGO: ["Esperando pago", "ambar"],
  PAGADO: ["Pagado", "turquesa"],
  PREPARANDO: ["Preparando", "salvia"],
  ENTREGADO: ["Entregado", "oscuro"],
  CANCELADO: ["Cancelado", "gris"],
  FALLIDO: ["Pago fallido", "coral"],
};

/** Estado del pedido como pastilla. Si es para recoger, "Preparando" se lee "Listo para recoger". */
export function EstadoPedido({ estado, entrega }: { estado: Estado; entrega?: ModalidadEntrega }) {
  const [texto, tono] = textos[estado];
  return <Insignia tono={tono}>{estado === "PREPARANDO" && entrega === "EN_PUNTO" ? "Listo para recoger" : texto}</Insignia>;
}
