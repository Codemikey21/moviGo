// Tipos compartidos del módulo de pedidos (interfaz y servidor).
import type { Foto } from "@/modulos/gestion-catalogo/tipos";

export type EstadoPedido = "PENDIENTE_PAGO" | "PAGADO" | "PREPARANDO" | "ENTREGADO" | "CANCELADO" | "FALLIDO";
export type ModalidadEntrega = "EN_PUNTO" | "A_DOMICILIO";

export type ItemCarrito = {
  id: string;
  productoId: string;
  slug: string;
  nombre: string;
  marca: string;
  categoria: string;
  foto: Foto | null;
  cantidad: number;
  precioUnitario: number;
  /** Color elegido (null si el producto no tiene colores) */
  color: { id: string; nombre: string; hex: string } | null;
};

export type Carrito = {
  items: ItemCarrito[];
  /** Suma de cantidad × precio */
  subtotal: number;
  /** Unidades en total (para el numerito del encabezado) */
  unidades: number;
};

/** Datos de entrega que elige el cliente al pagar. */
export type DatosEntrega =
  | { tipo: "EN_PUNTO"; puntoId: string }
  | { tipo: "A_DOMICILIO"; direccion: string; barrio: string; indicaciones: string };

export type LineaVista = {
  productoId: string;
  slug: string;
  nombre: string;
  marca: string;
  categoria: string;
  foto: Foto | null;
  cantidad: number;
  precioUnitario: number;
  seriales: string[];
};

export type PedidoResumen = {
  id: string;
  numero: string;
  estado: EstadoPedido;
  entrega: ModalidadEntrega;
  total: number;
  creadoEn: Date;
  cliente: { id: string; nombre: string; correo: string };
  /** Productos agrupados (una línea por producto) */
  lineas: LineaVista[];
};

export type PedidoDetalle = PedidoResumen & {
  subtotal: number;
  envio: number;
  direccion: { linea: string; barrio: string | null; ciudad: string } | null;
  /** Punto donde se recoge (o de donde sale el domicilio) */
  punto: { id: string; nombre: string; direccion: string; horario: string } | null;
  unidadIds: string[];
  referenciaPago: string | null;
  pagadoEn: Date | null;
};
