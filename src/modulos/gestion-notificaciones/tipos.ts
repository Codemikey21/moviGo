// Tipos compartidos del módulo de notificaciones.

export type NotificacionFila = {
  id: string;
  asunto: string;
  mensaje: string;
  enviadaEn: Date;
  leida: boolean;
};

/** Motivos del formulario de contacto, en el orden en que se muestran. */
export const MOTIVOS_CONTACTO = ["PEDIDO", "PRODUCTO", "TALLER", "EMPRESAS", "OTRO"] as const;
export type MotivoContacto = (typeof MOTIVOS_CONTACTO)[number];

export const NOMBRE_MOTIVO: Record<MotivoContacto, string> = {
  PEDIDO: "Un pedido o alquiler",
  PRODUCTO: "Un producto o precio",
  TALLER: "Mantenimiento y taller",
  EMPRESAS: "Flotas para empresas",
  OTRO: "Otro tema",
};

export type MensajeContactoFila = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string | null;
  motivo: MotivoContacto;
  mensaje: string;
  creadoEn: Date;
  atendido: boolean;
};
