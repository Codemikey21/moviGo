// Tipos compartidos del módulo de notificaciones.

export type NotificacionFila = {
  id: string;
  asunto: string;
  mensaje: string;
  enviadaEn: Date;
  leida: boolean;
};
