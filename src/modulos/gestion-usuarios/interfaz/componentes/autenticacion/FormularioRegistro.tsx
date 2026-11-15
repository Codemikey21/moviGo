"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { registrarseAccion } from "../../../servidor/acciones";
import { estadoInicial } from "../../../tipos";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonGoogle } from "./BotonGoogle";
import { CampoContrasena } from "./CampoContrasena";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { RevisaTuCorreo } from "./RevisaTuCorreo";
import { Separador } from "./Separador";

type Props = {
  /** Pasa a la pestaña de iniciar sesión */
  alCambiar: () => void;
};

export function FormularioRegistro({ alCambiar }: Props) {
  const [estado, accion, pendiente] = useActionState(registrarseAccion, estadoInicial);

  // Cuenta creada: en vez del formulario, el aviso de revisar el correo
  if (estado.estado === "exito") {
    return (
      <RevisaTuCorreo correo={estado.correo} mensaje={estado.mensaje}>
        <BotonAccion onClick={alCambiar} className="w-full">
          Ir a iniciar sesión
        </BotonAccion>
      </RevisaTuCorreo>
    );
  }

  const errores = estado.estado === "error" ? estado.errores : undefined;
  const valores = estado.estado === "error" ? estado.valores : undefined;

  return (
    <>
      <form action={accion} className="space-y-5" noValidate>
        {estado.estado === "error" && estado.mensaje && (
          <Aviso tipo="error">{estado.mensaje}</Aviso>
        )}

        <CampoTexto
          etiqueta="Nombre completo"
          name="nombre"
          autoComplete="name"
          placeholder="Como aparece en tu documento"
          defaultValue={valores?.nombre}
          error={errores?.nombre}
          required
        />
        <CampoTexto
          etiqueta="Correo"
          name="correo"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          defaultValue={valores?.correo}
          error={errores?.correo}
          required
        />
        <CampoTexto
          etiqueta="Celular (opcional)"
          name="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="300 123 4567"
          defaultValue={valores?.telefono}
          error={errores?.telefono}
        />
        <CampoContrasena
          etiqueta="Contraseña"
          name="contrasena"
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres, con al menos una letra y un número."
          error={errores?.contrasena}
          required
        />

        <div>
          <label className="flex items-start gap-3 text-[14px] text-pizarra">
            <input
              type="checkbox"
              name="terminos"
              required
              aria-invalid={errores?.terminos ? true : undefined}
              className="mt-0.5 h-5 w-5 shrink-0 accent-bosque"
            />
            <span>
              Acepto los{" "}
              <Link href="/legal/terminos" target="_blank" className="text-carbon underline underline-offset-4">
                términos de uso
              </Link>{" "}
              y la{" "}
              <Link href="/legal/privacidad" target="_blank" className="text-carbon underline underline-offset-4">
                política de privacidad
              </Link>
              .
            </span>
          </label>
          {errores?.terminos && (
            <p className="mt-2 text-[13px] text-[#c0392b]">{errores.terminos}</p>
          )}
        </div>

        <BotonAccion type="submit" className="w-full" disabled={pendiente}>
          {pendiente ? "Creando tu cuenta…" : "Crear cuenta"}
        </BotonAccion>
      </form>

      <Separador texto="o continúa con" />

      <BotonGoogle texto="Registrarme con Google" />

      <p className="mt-8 text-center text-[15px] text-pizarra">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={alCambiar}
          className="font-medium text-carbon underline underline-offset-4"
        >
          Inicia sesión
        </button>
      </p>
    </>
  );
}
