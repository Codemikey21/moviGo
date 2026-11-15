"use client";

import { useActionState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { gestionarPedidoAccion } from "../../../servidor/compras/acciones";
import type { EstadoPedido, ModalidadEntrega } from "../../../tipos";

/** Botones del administrador según el estado del pedido. */
export function AccionesPedido({ numero, estado, entrega }: { numero: string; estado: EstadoPedido; entrega: ModalidadEntrega }) {
  const [resultado, accion, enviando] = useActionState(gestionarPedidoAccion, estadoInicial);
  const cancelable = ["PENDIENTE_PAGO", "PAGADO", "PREPARANDO"].includes(estado);

  return (
    <form action={accion} className="space-y-3">
      <input type="hidden" name="numero" value={numero} />
      {resultado.estado === "error" && <Aviso tipo="error">{resultado.mensaje}</Aviso>}

      {entrega === "EN_PUNTO" && estado === "PAGADO" && (
        <BotonAccion type="submit" name="accion" value="preparar" disabled={enviando} className="w-full">
          Marcar listo para recoger
        </BotonAccion>
      )}
      {entrega === "EN_PUNTO" && estado === "PREPARANDO" && (
        <BotonAccion type="submit" name="accion" value="entregar" disabled={enviando} className="w-full">
          Entregado al cliente
        </BotonAccion>
      )}
      {entrega === "A_DOMICILIO" && ["PAGADO", "PREPARANDO"].includes(estado) && (
        <p className="rounded-campo bg-escarcha px-4 py-3 text-[14px] text-pizarra">
          Este pedido va a domicilio: asigna un domiciliario y márcalo entregado desde la entrega.
        </p>
      )}
      {estado === "PENDIENTE_PAGO" && (
        <p className="rounded-campo bg-[#f6e7c1]/60 px-4 py-3 text-[14px] text-[#7a5a12]">
          El cliente aún no ha pagado. Las unidades siguen apartadas.
        </p>
      )}
      {cancelable && (
        <BotonAccion type="submit" name="accion" value="cancelar" variante="secundario" disabled={enviando} className="w-full">
          Cancelar pedido{estado !== "PENDIENTE_PAGO" ? " y reembolsar" : ""}
        </BotonAccion>
      )}
    </form>
  );
}
