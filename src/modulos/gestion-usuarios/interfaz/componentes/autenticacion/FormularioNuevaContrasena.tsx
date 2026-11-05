"use client";

import { useActionState } from "react";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { nuevaContrasenaAccion } from "../../../servidor/acciones";
import { estadoInicial } from "../../../tipos";
import { Aviso } from "./Aviso";
import { CampoContrasena } from "./CampoContrasena";

export function FormularioNuevaContrasena() {
  const [estado, accion, pendiente] = useActionState(nuevaContrasenaAccion, estadoInicial);
  const errores = estado.estado === "error" ? estado.errores : undefined;

  return (
    <>
      <p className="etiqueta text-eucalipto">Nueva contraseña</p>
      <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-carbon">
        Crea tu nueva contraseña
      </h1>
      <p className="mt-3 text-[16px] text-pizarra">
        Escríbela dos veces para confirmar. Después entrarás directo a tu cuenta.
      </p>

      <form action={accion} className="mt-8 space-y-5" noValidate>
        {estado.estado === "error" && estado.mensaje && (
          <Aviso tipo="error">{estado.mensaje}</Aviso>
        )}
        <CampoContrasena
          etiqueta="Contraseña nueva"
          name="contrasena"
          autoComplete="new-password"
          ayuda="Mínimo 8 caracteres, con al menos una letra y un número."
          error={errores?.contrasena}
          required
        />
        <CampoContrasena
          etiqueta="Repite la contraseña"
          name="confirmacion"
          autoComplete="new-password"
          error={errores?.confirmacion}
          required
        />
        <BotonAccion type="submit" className="w-full" disabled={pendiente}>
          {pendiente ? "Guardando…" : "Guardar contraseña"}
        </BotonAccion>
      </form>
    </>
  );
}
