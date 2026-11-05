"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { recuperarContrasenaAccion } from "../../../servidor/acciones";
import { estadoInicial } from "../../../tipos";
import { Aviso } from "./Aviso";
import { CampoTexto } from "./CampoTexto";
import { RevisaTuCorreo } from "./RevisaTuCorreo";

export function FormularioRecuperar() {
  const [estado, accion, pendiente] = useActionState(recuperarContrasenaAccion, estadoInicial);

  if (estado.estado === "exito") {
    return (
      <RevisaTuCorreo correo={estado.correo} mensaje={estado.mensaje}>
        <Link href="/iniciar-sesion" className="text-[15px] font-medium text-carbon underline underline-offset-4">
          Volver a iniciar sesión
        </Link>
      </RevisaTuCorreo>
    );
  }

  const errores = estado.estado === "error" ? estado.errores : undefined;
  const valores = estado.estado === "error" ? estado.valores : undefined;

  return (
    <>
      <p className="etiqueta text-eucalipto">Recuperar contraseña</p>
      <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-carbon">
        ¿Olvidaste tu contraseña?
      </h1>
      <p className="mt-3 text-[16px] text-pizarra">
        Escribe tu correo y te enviamos un enlace para crear una nueva.
      </p>

      <form action={accion} className="mt-8 space-y-5" noValidate>
        {estado.estado === "error" && estado.mensaje && (
          <Aviso tipo="error">{estado.mensaje}</Aviso>
        )}
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
        <BotonAccion type="submit" className="w-full" disabled={pendiente}>
          {pendiente ? "Enviando…" : "Enviar enlace"}
        </BotonAccion>
      </form>

      <p className="mt-8 text-center text-[15px] text-pizarra">
        ¿Ya la recordaste?{" "}
        <Link href="/iniciar-sesion" className="font-medium text-carbon underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
