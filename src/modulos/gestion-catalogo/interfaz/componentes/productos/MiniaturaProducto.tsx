import Image from "next/image";
import type { Foto } from "../../../tipos";

/** La foto principal del producto o, si aún no tiene, sus iniciales. */
export function MiniaturaProducto({
  foto,
  nombre,
  className = "size-14",
  tamanos = "56px",
}: {
  foto: Foto | null;
  nombre: string;
  className?: string;
  tamanos?: string;
}) {
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-[14px] bg-salvia ${className}`}>
      {foto ? (
        <Image src={foto.url} alt={foto.textoAlt} fill sizes={tamanos} className="object-contain p-[6%]" />
      ) : (
        <span
          aria-hidden
          className="grid size-full place-items-center text-[13px] font-semibold uppercase tracking-wide text-eucalipto"
        >
          {nombre
            .split(/\s+/)
            .slice(0, 2)
            .map((p) => p[0])
            .join("")}
        </span>
      )}
    </div>
  );
}
