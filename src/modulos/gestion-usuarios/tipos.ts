// Tipos compartidos del modulo (interfaz y servidor).

export { estadoInicial, type EstadoFormulario } from "@/compartido/tipos/formulario";

/** Perfil de MoviGo de la persona que inició sesión. */
export type PerfilUsuario = {
  id: string;
  correo: string;
  nombre: string;
  telefono: string | null;
  rol: "CLIENTE" | "EMPRESA" | "DOMICILIARIO" | "ADMIN_PUNTO" | "ADMIN_SISTEMA";
  creadoEn: Date;
};

/** Fila de la lista de usuarios del panel. */
export type UsuarioFila = PerfilUsuario & {
  activo: boolean;
  pedidos: number;
  alquileres: number;
  puntoAsignado: string | null;
  /** Solo domiciliarios: con qué reparte */
  vehiculo: string | null;
};
