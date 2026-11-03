import { Chevron } from "./Chevron";

type Props = {
  /** `relleno`: cuadrado turquesa de 32px. `borde`: solo contorno, 24px. `oscuro`: relleno carbón, 24px. */
  variante?: "relleno" | "borde" | "oscuro";
  className?: string;
};

/** Cuadradito con flecha que acompaña enlaces y filas (como en la referencia). */
export function IconoCuadrado({ variante = "relleno", className = "" }: Props) {
  const estilos = {
    relleno: "h-8 w-8 rounded-[12px] bg-turquesa text-carbon",
    borde: "h-6 w-6 rounded-[10px] border border-carbon/20 text-carbon",
    oscuro: "h-6 w-6 rounded-[10px] bg-bosque text-blanco",
  }[variante];

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ${estilos} ${className}`}
    >
      <Chevron />
    </span>
  );
}
