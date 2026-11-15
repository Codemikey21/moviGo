import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
// Los demás módulos llaman a notificar() cuando pasa algo que el cliente
// debe saber (pago aprobado, pedido en camino, alquiler listo…).
import * as repositorio from "./repositorio";

export async function notificar(usuarioId: string, asunto: string, mensaje: string) {
  try {
    await repositorio.crear({ usuarioId, asunto, mensaje });
  } catch (error) {
    // Una notificación que falla no debe tumbar un pago o un pedido
    console.error("No se pudo guardar la notificación:", error);
  }
}

export const recientes = (usuarioId: string) => repositorio.listar(usuarioId, 8);
export const marcarLeidas = (usuarioId: string) => repositorio.marcarLeidas(usuarioId);
