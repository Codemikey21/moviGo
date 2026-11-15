// Tipos compartidos del módulo de almacén (interfaz y servidor).

export type EstadoUnidad =
  | "DISPONIBLE"
  | "RESERVADA"
  | "ALQUILADA"
  | "VENDIDA"
  | "EN_TALLER"
  | "BAJA";

export type PuntoResumen = {
  id: string;
  nombre: string;
  direccion: string;
  horario: string;
  latitud: number;
  longitud: number;
  capacidad: number;
  /** Unidades que ocupan espacio en el punto (todas menos vendidas y de baja) */
  ocupadas: number;
};

/** Cuántas unidades de un producto hay en un punto, por estado. */
export type DisponibilidadPunto = {
  punto: { id: string; nombre: string; direccion: string; horario: string };
  disponibles: number;
  total: number;
};

export type UnidadFila = {
  id: string;
  serial: string;
  estado: EstadoUnidad;
  punto: { id: string; nombre: string };
  kilometraje: number;
  ingresoEn: Date;
};

export type TipoMovimiento =
  | "INGRESO"
  | "RESERVA"
  | "SALIDA_VENTA"
  | "SALIDA_ALQUILER"
  | "DEVOLUCION"
  | "A_TALLER"
  | "DE_TALLER"
  | "TRASLADO";

export type MovimientoFila = {
  id: string;
  tipo: TipoMovimiento;
  fecha: Date;
  nota: string | null;
  serial: string;
  registradoPor: string;
  destino: string | null;
};

/** Lo que el administrador puede hacer con una unidad desde el panel. */
export type CambioUnidad = "A_TALLER" | "DE_TALLER" | "TRASLADO";
