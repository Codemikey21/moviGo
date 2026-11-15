// Tipos que comparten todos los módulos.

/** Lo que devuelve cada acción de un formulario para que la interfaz lo pinte. */
export type EstadoFormulario =
  | { estado: "inicial" }
  | {
      estado: "error";
      /** Mensaje general arriba del formulario */
      mensaje?: string;
      /** Mensaje por campo: { correo: "Escribe un correo válido." } */
      errores?: Partial<Record<string, string>>;
      /** Lo que la persona escribió, para no hacerla escribir todo de nuevo */
      valores?: Record<string, string>;
    }
  | { estado: "exito"; mensaje: string; correo?: string };

export const estadoInicial: EstadoFormulario = { estado: "inicial" };
