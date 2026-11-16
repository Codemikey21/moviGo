// Tipos compartidos del módulo de catálogo (interfaz y servidor).
// Los precios llegan como number (pesos colombianos) para que se puedan pasar
// tal cual a componentes de cliente.

export type Modalidad = "VENTA" | "ALQUILER";

/** Una fila de la ficha técnica: { etiqueta: "Autonomía", valor: "60 km" } */
export type Especificacion = { etiqueta: string; valor: string };

export type CategoriaResumen = {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  /** Productos activos en la categoría */
  totalProductos: number;
  /** Precio de venta más bajo de la categoría (null si no tiene productos) */
  desdeVenta: number | null;
  /** Tarifa de alquiler por día más baja (null si nada se alquila) */
  desdeAlquiler: number | null;
  /** Foto sin fondo de un producto de la categoría (null: se usa el dibujo) */
  foto: Foto | null;
};

export type Foto = {
  id: string;
  url: string;
  textoAlt: string;
  orden: number;
};

/** Vistas de una foto del producto (como en un configurador de carros). */
export const VISTAS = ["LATERAL", "FRENTE", "DETALLE", "AMBIENTE"] as const;
export type Vista = (typeof VISTAS)[number];

export const NOMBRE_VISTA: Record<Vista, string> = {
  LATERAL: "De lado",
  FRENTE: "De frente",
  DETALLE: "Detalle",
  AMBIENTE: "En la calle",
};

/** Foto de la ficha del producto: puede ser de un color y de una vista. */
export type FotoProducto = Foto & {
  /** null = sirve para todos los colores */
  colorId: string | null;
  vista: Vista | null;
};

/** Un color en que viene el producto. */
export type ColorProducto = {
  id: string;
  nombre: string;
  /** #24272a */
  hex: string;
};

/** Lo necesario para una tarjeta del catálogo. */
export type ProductoResumen = {
  id: string;
  slug: string;
  nombre: string;
  marca: string;
  modelo: string;
  categoria: { slug: string; nombre: string };
  precioVenta: number;
  tarifaAlquilerDia: number | null;
  modalidades: Modalidad[];
  activo: boolean;
  /** La primera foto (orden más bajo), si tiene */
  foto: Foto | null;
};

/** La ficha completa del producto. */
export type ProductoDetalle = ProductoResumen & {
  descripcion: string;
  especificaciones: Especificacion[];
  fotos: FotoProducto[];
  colores: ColorProducto[];
};

/** Filtros del catálogo público. */
export type FiltroCatalogo = {
  categoria?: string;
  modalidad?: Modalidad;
  busqueda?: string;
};
