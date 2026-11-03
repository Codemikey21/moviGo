export type Tono = "salvia" | "escarcha" | "bosque" | "eucalipto" | "carbon" | "arena";

const fondos: Record<Tono, string> = {
  salvia: "linear-gradient(160deg,#d3e4df 0%,#bdd3cc 100%)",
  escarcha: "linear-gradient(160deg,#edf4f2 0%,#d3e4df 100%)",
  bosque: "linear-gradient(160deg,#3f5659 0%,#2a3b3d 100%)",
  eucalipto: "linear-gradient(160deg,#6b948a 0%,#4d7168 100%)",
  carbon: "linear-gradient(160deg,#1c2626 0%,#0d1212 100%)",
  // Beige del pedestal de la referencia
  arena: "linear-gradient(180deg,#bfae9f 0%,#a08d81 100%)",
};

const textoClaro: Tono[] = ["bosque", "eucalipto", "carbon"];

type Props = {
  tono?: Tono;
  /** Nombre del archivo que falta. Solo se muestra en desarrollo. */
  etiqueta?: string;
};

/**
 * Lo que se ve mientras no existe la foto o el video real. En producción
 * es solo un degradado liso de la paleta; en desarrollo lleva una marca
 * pequeña en la esquina con el archivo que falta.
 */
export function MarcoPlaceholder({ tono = "salvia", etiqueta }: Props) {
  const mostrarEtiqueta =
    process.env.NODE_ENV !== "production" && Boolean(etiqueta);

  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{ backgroundImage: fondos[tono] }}
    >
      {mostrarEtiqueta && (
        <span
          className={`absolute left-4 top-4 text-[11px] uppercase tracking-[0.05em] ${
            textoClaro.includes(tono) ? "text-blanco/45" : "text-carbon/40"
          }`}
        >
          {etiqueta}
        </span>
      )}
    </div>
  );
}
