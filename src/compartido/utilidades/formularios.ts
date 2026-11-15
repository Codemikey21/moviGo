import { z } from "zod";

/** Lee un campo de texto de un FormData ("" si no viene). */
export function texto(formData: FormData, campo: string) {
  const valor = formData.get(campo);
  return typeof valor === "string" ? valor : "";
}

/** Convierte los errores de zod en { campo: "primer mensaje" }. */
export function erroresPorCampo(error: z.ZodError): Record<string, string> {
  const { fieldErrors } = z.flattenError(error);
  const resultado: Record<string, string> = {};
  for (const [campo, mensajes] of Object.entries(fieldErrors)) {
    const lista = mensajes as string[] | undefined;
    if (lista?.[0]) resultado[campo] = lista[0];
  }
  return resultado;
}
