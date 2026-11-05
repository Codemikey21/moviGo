import "server-only";

/**
 * Error de negocio con un mensaje pensado para mostrarse al usuario.
 * Los servicios lo lanzan y las acciones lo convierten en un estado del
 * formulario; cualquier otro error se trata como inesperado.
 */
export class ErrorDominio extends Error {
  constructor(
    mensaje: string,
    /** Código corto para decidir qué hacer sin comparar textos */
    public readonly codigo: string = "general",
  ) {
    super(mensaje);
    this.name = "ErrorDominio";
  }
}

export function esErrorDominio(error: unknown): error is ErrorDominio {
  return error instanceof ErrorDominio;
}
