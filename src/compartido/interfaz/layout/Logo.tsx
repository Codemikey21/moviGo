import Link from "next/link";

/** Marca provisional apilada ("MOVI" sobre "GO") hasta tener el logo real. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="MoviGo, inicio"
      className={`flex flex-col items-center text-[13px] font-bold leading-[1.05] tracking-[0.22em] text-bosque ${className}`}
    >
      {/* El margen negativo compensa el espacio que deja el tracking */}
      <span className="-mr-[0.22em]">MOVI</span>
      <span className="-mr-[0.22em]">GO</span>
    </Link>
  );
}
