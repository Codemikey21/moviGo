// Tipos del portal empresarial: empresas que piden flotas o domicilios en lote.

export type EstadoSolicitud = "BORRADOR" | "ENVIADA" | "APROBADA" | "RECHAZADA";
export type TipoSolicitud = "FLOTA_ALQUILER" | "DOMICILIOS_LOTE";

export type EmpresaVista = { id: string; razonSocial: string; nit: string; sector: string | null; cargo: string };

export type SolicitudVista = {
  id: string;
  tipo: TipoSolicitud;
  cantidad: number;
  desde: Date;
  hasta: Date;
  estado: EstadoSolicitud;
  notas: string | null;
  creadaEn: Date;
  empresa: { razonSocial: string; nit: string };
  contacto: { nombre: string; correo: string; cargo: string } | null;
  cotizacion: { valor: number; descuento: number; validaHasta: Date } | null;
};
