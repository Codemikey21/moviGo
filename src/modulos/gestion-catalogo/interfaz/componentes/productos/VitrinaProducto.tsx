import Image from "next/image";
import type { Foto } from "../../../tipos";
import { IlustracionVehiculo } from "./IlustracionVehiculo";

/**
 * El producto "en pedestal": su foto o, mientras no tenga, el dibujo de su
 * categoría sobre el degradado salvia con una sombra en el piso.
 */
export function VitrinaProducto({
  foto,
  categoria,
  tamanos,
  className = "",
  tamanoDibujo = "w-[78%]",
  color,
}: {
  foto: Foto | null;
  categoria: string;
  tamanos: string;
  className?: string;
  tamanoDibujo?: string;
  /** Color de la carrocería del dibujo (si no hay foto) */
  color?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,#edf4f2_0%,#d3e4df_62%,#c4d9d2_100%)] ${className}`}
    >
      {foto ? (
        <Image src={foto.url} alt={foto.textoAlt} fill sizes={tamanos} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <IlustracionVehiculo categoria={categoria} color={color} className={`relative ${tamanoDibujo}`} />
        </div>
      )}
    </div>
  );
}
