import "server-only";

// Reglas de negocio de este módulo. No conoce HTTP ni React.
// Los demás módulos llaman a notificar() cuando pasa algo que el cliente
// debe saber (pago aprobado, pedido en camino, alquiler listo…).
import { NOMBRE_MOTIVO, type MotivoContacto } from "../tipos";
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

/* --- Contacto --- */

/**
 * Guarda el mensaje para que lo atienda un administrador. Si quien escribe
 * tiene sesión, le deja una novedad en su cuenta como constancia.
 */
export async function recibirMensaje(
  datos: { nombre: string; correo: string; telefono: string | null; motivo: MotivoContacto; mensaje: string },
  usuarioId: string | null,
) {
  await repositorio.crearMensaje(datos);
  if (usuarioId) {
    await notificar(
      usuarioId,
      "Recibimos tu mensaje",
      `Sobre «${NOMBRE_MOTIVO[datos.motivo].toLowerCase()}». Te respondemos a ${datos.correo} en menos de un día hábil.`,
    );
  }
}

export const mensajes = (atendidos: boolean) => repositorio.listarMensajes(atendidos);
export const conteoMensajes = () => repositorio.contarMensajes();
export const marcarAtendido = (id: string, atendido: boolean) => repositorio.marcarAtendido(id, atendido);

/* --- Boletín --- */

export const suscribir = (correo: string) => repositorio.suscribir(correo);
export const suscriptores = () => repositorio.contarSuscriptores();
