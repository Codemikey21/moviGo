import Image from "next/image";
import type { Foto } from "../../../tipos";
import { IlustracionVehiculo } from "./IlustracionVehiculo";

/**
 * El vehículo en escena: su foto sin fondo si la tiene o, si no, el dibujo
 * de su categoría. Ocupa el mismo espacio en los dos casos (900 × 560).
 */
export function FotoOVehiculo({
  foto,
  categoria,
  titulo,
  tamanos = "(min-width: 768px) 50vw, 90vw",
  prioridad = false,
  className = "",
}: {
  foto: Foto | null;
  categoria: string;
  titulo?: string;
  tamanos?: string;
  prioridad?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative aspect-[900/560] ${className}`}>
      {foto ? (
        <Image src={foto.url} alt={foto.textoAlt || titulo || ""} fill sizes={tamanos} priority={prioridad} className="object-contain" />
      ) : (
        <IlustracionVehiculo categoria={categoria} titulo={titulo} className="absolute inset-0 size-full" />
      )}
    </div>
  );
}
