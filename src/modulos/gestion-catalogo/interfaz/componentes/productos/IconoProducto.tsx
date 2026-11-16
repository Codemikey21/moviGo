import Image from "next/image";
import type { Foto } from "../../../tipos";
import { IlustracionVehiculo } from "./IlustracionVehiculo";

/** Miniatura de una lista: la foto del producto o, si no tiene, el dibujo de su categoría. */
export function IconoProducto({ foto, categoria, className = "w-[46px]" }: { foto: Foto | null; categoria: string; className?: string }) {
  if (!foto) return <IlustracionVehiculo categoria={categoria} className={className} />;
  return (
    <span className={`relative block aspect-[900/560] ${className}`}>
      <Image src={foto.url} alt="" fill sizes="96px" className="object-contain" />
    </span>
  );
}
