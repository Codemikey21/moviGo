import Link from "next/link";
import type { ReactNode } from "react";
import { Chevron } from "./Chevron";

type Props = {
  href: string;
  children: ReactNode;
  /** `claro` para fondos oscuros */
  tono?: "oscuro" | "claro";
  className?: string;
};

const curva =
  "duration-[334ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

/**
 * Enlace de texto en mayúsculas con flechita (12px, negrita). Al pasar el
 * mouse, el texto se corre y entra una flecha por la izquierda.
 */
export function EnlaceFlecha({
  href,
  children,
  tono = "oscuro",
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex h-[30px] items-center text-[12px] font-bold uppercase leading-none ${
        tono === "claro" ? "text-blanco" : "text-carbon"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`absolute left-0 -translate-x-[24px] opacity-0 transition-[translate,opacity] group-hover:-translate-x-[14px] group-hover:opacity-100 ${curva}`}
      >
        <Chevron />
      </span>
      <span
        className={`flex items-center gap-2 transition-[translate] group-hover:translate-x-[14px] ${curva}`}
      >
        <span className="whitespace-nowrap">{children}</span>
        <span
          aria-hidden
          className={`transition-[translate,opacity] group-hover:translate-x-[24px] group-hover:opacity-0 ${curva}`}
        >
          <Chevron />
        </span>
      </span>
    </Link>
  );
}
