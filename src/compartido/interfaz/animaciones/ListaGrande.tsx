"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type ElementoListaGrande = {
  titulo: string;
  href: string;
  /** Dos líneas pequeñas a la derecha */
  detalle: [string, string];
  /** Foto que aparece siguiendo el cursor */
  foto: string;
};

/**
 * Lista de enlaces con letra grande y flecha turquesa. Al pasar el mouse
 * aparece una foto que sigue el cursor.
 */
export function ListaGrande({ elementos }: { elementos: ElementoListaGrande[] }) {
  const flotante = useRef<HTMLDivElement>(null);
  const [foto, setFoto] = useState<string | null>(null);

  useEffect(() => {
    const mover = (e: MouseEvent) => {
      if (!flotante.current) return;
      flotante.current.style.left = `${e.clientX}px`;
      flotante.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", mover);
    return () => window.removeEventListener("mousemove", mover);
  }, []);

  return (
    <>
      <ul className="border-b border-carbon/10">
        {elementos.map((e) => (
          <li key={e.href} data-revelar className="border-t border-carbon/10">
            <Link
              href={e.href}
              onMouseEnter={() => setFoto(e.foto)}
              onMouseLeave={() => setFoto(null)}
              className="group flex items-center gap-5 py-6 text-[clamp(36px,5vw,64px)] leading-none tracking-[-0.03em] text-carbon"
            >
              {e.titulo}
              <span className="grid size-11 shrink-0 place-items-center rounded-[13px] bg-turquesa text-[18px] transition-transform duration-500 ease-salida group-hover:translate-x-2.5 group-hover:-rotate-45">
                ›
              </span>
              <span className="ml-auto hidden text-right text-[15px] leading-snug tracking-normal text-bruma md:block">
                {e.detalle[0]}
                <br />
                {e.detalle[1]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div ref={flotante} aria-hidden className="foto-flotante hidden md:block" data-visible={foto !== null}>
        {foto && <Image src={foto} alt="" fill sizes="260px" className="object-cover" />}
      </div>
    </>
  );
}
