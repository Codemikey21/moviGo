// Esquemas zod de entrada y salida de este modulo.
import { z } from "zod";

const correo = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Escribe un correo válido, por ejemplo tu@correo.com."));

const contrasenaNueva = z
  .string()
  .min(8, "La contraseña debe tener mínimo 8 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña debe tener al menos una letra.")
  .regex(/[0-9]/, "La contraseña debe tener al menos un número.");

export const esquemaRegistro = z.object({
  nombre: z
    .string()
    .trim()
    .min(3, "Escribe tu nombre completo.")
    .max(80, "El nombre es demasiado largo."),
  correo,
  telefono: z
    .string()
    .trim()
    .regex(/^[0-9 +()-]{7,20}$/, "Escribe un celular válido, por ejemplo 300 123 4567.")
    .optional()
    .or(z.literal("")),
  contrasena: contrasenaNueva,
  terminos: z.literal("on", {
    error: "Debes aceptar los términos para crear tu cuenta.",
  }),
});

export const esquemaInicioSesion = z.object({
  correo,
  contrasena: z.string().min(1, "Escribe tu contraseña."),
  siguiente: z.string().optional(),
});

export const esquemaRecuperar = z.object({ correo });

export const esquemaNuevaContrasena = z
  .object({
    contrasena: contrasenaNueva,
    confirmacion: z.string(),
  })
  .refine((datos) => datos.contrasena === datos.confirmacion, {
    path: ["confirmacion"],
    message: "Las dos contraseñas no coinciden.",
  });

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

export const esquemaCambioRol = z.object({
  usuarioId: z.uuid(),
  rol: z.enum(["CLIENTE", "ADMIN_SISTEMA", "ADMIN_PUNTO"]),
  puntoId: z.uuid().nullable(),
});
