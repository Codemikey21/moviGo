import Image from "next/image";
import type { Foto } from "../../../tipos";
import { IlustracionCategoria } from "./IlustracionCategoria";

/**
 * El producto "en pedestal": su foto o, mientras no tenga, el dibujo de su
 * categoría sobre el degradado salvia con una sombra en el piso.
 */
export function VitrinaProducto({
  foto,
  categoria,
  tamanos,
  className = "",
  tamanoDibujo = "w-[72%]",
}: {
  foto: Foto | null;
  categoria: string;
  tamanos: string;
  className?: string;
  tamanoDibujo?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,#edf4f2_0%,#d3e4df_62%,#c4d9d2_100%)] [--fondo-ilustracion:#d3e4df] ${className}`}
    >
      {foto ? (
        <Image src={foto.url} alt={foto.textoAlt} fill sizes={tamanos} className="object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <div className={`relative ${tamanoDibujo}`}>
            <IlustracionCategoria categoria={categoria} className="relative z-10 w-full text-bosque" />
            {/* Sombra en el piso */}
            <span
              aria-hidden
              className="absolute -bottom-[6%] left-[8%] right-[8%] h-[14%] rounded-[50%] bg-bosque/15 blur-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
