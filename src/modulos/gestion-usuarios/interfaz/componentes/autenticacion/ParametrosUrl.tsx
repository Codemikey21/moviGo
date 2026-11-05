"use client";

import { useSearchParams } from "next/navigation";
import { Aviso } from "./Aviso";

/**
 * Lee de la dirección a dónde volver después de entrar (?siguiente=...).
 * Va dentro de <Suspense> porque la página se genera estática.
 */
export function CampoSiguiente() {
  const parametros = useSearchParams();
  return <input type="hidden" name="siguiente" value={parametros.get("siguiente") ?? ""} />;
}

/** Muestra un aviso si la persona llegó desde un enlace que no funcionó. */
export function AvisoDesdeUrl() {
  const parametros = useSearchParams();
  if (parametros.get("error") !== "enlace") return null;
  return (
    <div className="mb-6">
      <Aviso tipo="error">
        Ese enlace ya no funciona: puede que haya vencido o que ya lo hayas usado. Inicia sesión
        o pide uno nuevo.
      </Aviso>
    </div>
  );
}
