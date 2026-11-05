/** Línea con texto en el medio: "o con tu correo". */
export function Separador({ texto }: { texto: string }) {
  return (
    <div className="my-6 flex items-center gap-4">
      <span className="h-px flex-1 bg-carbon/10" />
      <span className="etiqueta text-bruma">{texto}</span>
      <span className="h-px flex-1 bg-carbon/10" />
    </div>
  );
}
