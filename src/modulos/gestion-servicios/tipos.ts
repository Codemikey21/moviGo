// Tipos compartidos del módulo de servicios: alquileres y domicilios.
import type { Foto } from "@/modulos/gestion-catalogo/tipos";

export type EstadoServicio = "SOLICITADO" | "ASIGNADO" | "EN_CURSO" | "COMPLETADO" | "CANCELADO";

export type Coordenada = { latitud: number; longitud: number };

export type AlquilerVista = {
  id: string;
  estado: EstadoServicio;
  fechaInicio: Date;
  fechaFin: Date;
  dias: number;
  entrega: "EN_PUNTO" | "A_DOMICILIO";
  codigoRecogida: string | null;
  total: number;
  creadaEn: Date;
  cliente: { id: string; nombre: string; correo: string };
  producto: { id: string; slug: string; nombre: string; marca: string; categoria: string; foto: Foto | null };
  unidad: { id: string; serial: string };
  punto: { id: string; nombre: string; direccion: string; horario: string } | null;
  pagado: boolean;
  referenciaPago: string | null;
  domicilioId: string | null;
};

export type DomicilioVista = {
  id: string;
  estado: EstadoServicio;
  costo: number;
  descripcion: string;
  creadaEn: Date;
  asignadoEn: Date | null;
  /** Cuándo el domiciliario aceptó (null: todavía no responde) */
  aceptadoEn: Date | null;
  entregadoEn: Date | null;
  pedidoId: string | null;
  pedidoNumero: string | null;
  alquilerId: string | null;
  cliente: { id: string; nombre: string; telefono: string | null };
  origen: { nombre: string; direccion: string } & Coordenada;
  destino: { direccion: string; barrio: string | null; indicaciones: string } & Coordenada;
  domiciliario: { id: string; nombre: string; vehiculo: string; telefono: string | null } | null;
  /** Lo ve el cliente (y el administrador). Nunca se le manda al domiciliario. */
  codigoEntrega: string;
  /** Si el servicio que lleva ya está pagado (si no, aún no se despacha) */
  listoParaDespachar: boolean;
};

/** Dónde va el domiciliario (ubicación simulada a partir de la ruta). */
export type Seguimiento = {
  estado: EstadoServicio;
  ruta: Coordenada[];
  posicion: Coordenada | null;
  /** 0 a 1 */
  progreso: number;
  minutosRestantes: number | null;
};

export type DomiciliarioVista = {
  id: string;
  nombre: string;
  vehiculo: string;
  disponible: boolean;
  enCurso: number;
};

/** Entregas que un domiciliario puede llevar al tiempo. */
export const MAXIMO_ACTIVAS_REPARTO = 3;

/** Vehículos con los que puede repartir un domiciliario. */
export const VEHICULOS_REPARTO = ["Scooter eléctrico", "Bicicleta eléctrica", "Moto eléctrica", "Auto eléctrico"] as const;

/**
 * Una entrega vista por el domiciliario: lo mismo que el domicilio, pero
 * sin el código de entrega (ese se lo dice el cliente en la puerta).
 */
export type EntregaReparto = Omit<DomicilioVista, "codigoEntrega" | "domiciliario" | "costo"> & {
  /** Distancia en línea recta del punto al destino, en metros */
  distancia: number;
  evidencia: { url: string | null; nombreReceptor: string | null } | null;
};

/** Datos del domiciliario que inició sesión. */
export type PerfilReparto = {
  id: string;
  nombre: string;
  vehiculo: string;
  disponible: boolean;
  calificacion: number | null;
};

export type ResumenReparto = { hoy: number; semana: number; total: number };

export type EstadoMantenimiento = "PROGRAMADO" | "EN_CURSO" | "REALIZADO";

export type MantenimientoVista = {
  id: string;
  tipo: "PREVENTIVO" | "CORRECTIVO";
  descripcion: string;
  programadoPara: Date;
  realizadoEn: Date | null;
  costo: number;
  estado: EstadoMantenimiento;
  creadoEn: Date;
  cliente: { id: string; nombre: string } | null;
  unidad: { id: string; serial: string };
  producto: { nombre: string; marca: string; categoria: string; foto: Foto | null };
};

/** Vehículo del cliente que puede ir a mantenimiento (comprado en MoviGo). */
export type VehiculoPropio = { unidadId: string; serial: string; nombre: string; marca: string; categoria: string };
