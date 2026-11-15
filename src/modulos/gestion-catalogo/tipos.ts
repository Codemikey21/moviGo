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
};

export type Foto = {
  id: string;
  url: string;
  textoAlt: string;
  orden: number;
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
  fotos: Foto[];
};

/** Filtros del catálogo público. */
export type FiltroCatalogo = {
  categoria?: string;
  modalidad?: Modalidad;
  busqueda?: string;
};
