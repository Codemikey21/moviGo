// Tipos compartidos del módulo de pagos (interfaz y servidor).

export type EstadoPago = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "REEMBOLSADO";
export type MetodoPago = "TARJETA" | "NEQUI" | "PSE";

/** Lo que se muestra en la pantalla de pago. */
export type PagoParaPagar = {
  referencia: string;
  monto: number;
  estado: EstadoPago;
  creadoEn: Date;
  confirmadoEn: Date | null;
  concepto: string;
  /** A dónde volver después de pagar */
  destino: string;
  tipo: "pedido" | "alquiler";
  /** Último resultado guardado de la pasarela (método, últimos 4, motivo) */
  ultimoEvento: { metodo: MetodoPago; detalle: string; motivo: string | null; transaccionId: string } | null;
};

export type ResultadoPago =
  | { estado: "APROBADO"; transaccionId: string }
  | { estado: "RECHAZADO"; motivo: string }
  | { estado: "ERROR"; mensaje: string; errores?: Record<string, string> };
