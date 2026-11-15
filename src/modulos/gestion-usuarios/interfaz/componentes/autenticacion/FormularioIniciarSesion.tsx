"use client";

import Link from "next/link";
import { Suspense, useActionState } from "react";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { iniciarSesionAccion } from "../../../servidor/acciones";
import { estadoInicial } from "../../../tipos";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { GOOGLE_ACTIVO } from "@/compartido/configuracion/acceso";
import { BotonGoogle } from "./BotonGoogle";
import { CampoContrasena } from "./CampoContrasena";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { AvisoDesdeUrl, CampoSiguiente } from "./ParametrosUrl";
import { Separador } from "./Separador";

type Props = {
  /** Pasa a la pestaña de crear cuenta */
  alCambiar: () => void;
};

export function FormularioIniciarSesion({ alCambiar }: Props) {
  const [estado, accion, pendiente] = useActionState(iniciarSesionAccion, estadoInicial);
  const errores = estado.estado === "error" ? estado.errores : undefined;
  const valores = estado.estado === "error" ? estado.valores : undefined;

  return (
    <>
      <Suspense fallback={null}>
        <AvisoDesdeUrl />
      </Suspense>

      <form action={accion} className="space-y-5" noValidate>
        {estado.estado === "error" && estado.mensaje && (
          <Aviso tipo="error">{estado.mensaje}</Aviso>
        )}

        <Suspense fallback={null}>
          <CampoSiguiente />
        </Suspense>

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
        <CampoContrasena
          etiqueta="Contraseña"
          name="contrasena"
          autoComplete="current-password"
          error={errores?.contrasena}
          required
          extra={
            <Link
              href="/recuperar-contrasena"
              className="text-[13px] font-medium text-eucalipto underline-offset-4 hover:underline"
            >
              ¿La olvidaste?
            </Link>
          }
        />
        <BotonAccion type="submit" className="w-full" disabled={pendiente}>
          {pendiente ? "Entrando…" : "Entrar"}
        </BotonAccion>
      </form>

      {GOOGLE_ACTIVO && (
        <>
          <Separador texto="o continúa con" />
          <BotonGoogle texto="Continuar con Google" />
        </>
      )}

      <p className="mt-8 text-center text-[15px] text-pizarra">
        ¿Aún no tienes cuenta?{" "}
        <button
          type="button"
          onClick={alCambiar}
          className="font-medium text-carbon underline underline-offset-4"
        >
          Crea una
        </button>
      </p>
    </>
  );
}
