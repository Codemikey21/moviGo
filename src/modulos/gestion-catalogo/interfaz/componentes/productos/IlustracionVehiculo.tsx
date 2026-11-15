import type { CSSProperties } from "react";

// Qué dibujo usa cada categoría y su color por defecto.
const dibujos: Record<string, { simbolo: string; color: string }> = {
  "autos-electricos": { simbolo: "mv-auto", color: "#e7ebea" },
  motos: { simbolo: "mv-moto", color: "#b8392f" },
  scooters: { simbolo: "mv-scooter", color: "#24272a" },
  bicicletas: { simbolo: "mv-bici", color: "#64d5b3" },
  patinetas: { simbolo: "mv-patineta", color: "#c4553f" },
  drones: { simbolo: "mv-dron", color: "#7b8287" },
  accesorios: { simbolo: "mv-casco", color: "#e7ebea" },
};

/** Color por defecto del dibujo de una categoría. */
export function colorDeCategoria(categoria: string) {
  return (dibujos[categoria] ?? dibujos.scooters).color;
}

/**
 * Dibujo del vehículo de una categoría, de lado. Usa los símbolos de
 * <DefinicionesVehiculos /> (que está una sola vez en el layout raíz).
 * El color de la carrocería se cambia con la prop `color`.
 */
export function IlustracionVehiculo({
  categoria,
  color,
  className = "",
  titulo,
}: {
  /** Slug de la categoría: autos-electricos, motos, scooters... */
  categoria: string;
  color?: string;
  className?: string;
  /** Texto para lectores de pantalla; sin él, el dibujo es decorativo */
  titulo?: string;
}) {
  const dibujo = dibujos[categoria] ?? dibujos.scooters;
  return (
    <svg
      viewBox="0 0 900 560"
      className={className}
      style={{ "--pintura": color ?? dibujo.color } as CSSProperties}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <use href={`#${dibujo.simbolo}`} />
    </svg>
  );
}
