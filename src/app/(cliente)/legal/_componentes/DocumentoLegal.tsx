import Link from "next/link";
import type { ReactNode } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";

export type SeccionLegal = {
  titulo: string;
  /** Cada elemento es un párrafo */
  parrafos?: ReactNode[];
  /** Lista con viñetas después de los párrafos */
  lista?: ReactNode[];
  /** Tabla sencilla: la primera fila son los encabezados */
  tabla?: string[][];
};

const documentos = [
  { slug: "terminos", texto: "Términos de uso" },
  { slug: "privacidad", texto: "Privacidad" },
  { slug: "cookies", texto: "Cookies" },
] as const;

export const ACTUALIZACION = "15 de noviembre de 2026";

const idSeccion = (i: number) => `seccion-${i + 1}`;

/**
 * Plantilla de los documentos legales: portada con el título y las pestañas
 * entre documentos, índice fijo a la izquierda y las secciones numeradas.
 */
export function DocumentoLegal({
  actual,
  titulo,
  intro,
  secciones,
}: {
  actual: (typeof documentos)[number]["slug"];
  titulo: ReactNode;
  intro: ReactNode;
  secciones: SeccionLegal[];
}) {
  return (
    <main className="bg-blanco pb-[120px] text-carbon">
      <header className="contenedor pt-[130px] md:pt-[170px]">
        <nav aria-label="Documentos legales" className="flex flex-wrap gap-2">
          {documentos.map((d) => (
            <Link
              key={d.slug}
              href={`/legal/${d.slug}`}
              aria-current={d.slug === actual ? "page" : undefined}
              className={`flex h-10 items-center rounded-full px-4 text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
                d.slug === actual ? "bg-bosque text-blanco" : "bg-escarcha text-carbon hover:bg-salvia"
              }`}
            >
              {d.texto}
            </Link>
          ))}
        </nav>
        <h1 className="titular mt-10 max-w-[900px] text-[clamp(44px,6.4vw,96px)]">{titulo}</h1>
        <div className="mt-8 flex flex-col gap-6 border-b border-carbon/10 pb-12 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[640px] text-[18px] leading-[1.55] text-pizarra">{intro}</p>
          <p className="shrink-0 font-mono text-[12px] uppercase text-pizarra">Actualizado el {ACTUALIZACION}</p>
        </div>
      </header>

      <div className="contenedor grid gap-12 pt-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-20">
        <aside className="hidden lg:block">
          <nav aria-label="En este documento" className="sticky top-28">
            <p className="etiqueta pb-5 text-carbon/70">En este documento</p>
            <ol className="flex flex-col gap-1">
              {secciones.map((s, i) => (
                <li key={s.titulo}>
                  <a
                    href={`#${idSeccion(i)}`}
                    className="flex gap-3 rounded-[12px] px-3 py-2 text-[15px] leading-snug text-pizarra transition-colors hover:bg-escarcha hover:text-carbon"
                  >
                    <span className="font-mono text-[12px] leading-[1.6] text-eucalipto">{String(i + 1).padStart(2, "0")}</span>
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </aside>

        <article className="max-w-[760px]">
          {secciones.map((s, i) => (
            <section key={s.titulo} id={idSeccion(i)} className="scroll-mt-28 border-b border-carbon/10 py-10 first:pt-0">
              <p className="font-mono text-[13px] text-eucalipto">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 text-[clamp(26px,2.4vw,34px)] leading-tight">{s.titulo}</h2>
              <div className="mt-5 space-y-4 text-[17px] leading-[1.65] text-pizarra">
                {s.parrafos?.map((p, j) => <p key={j}>{p}</p>)}
                {s.lista && (
                  <ul className="space-y-2.5">
                    {s.lista.map((item, j) => (
                      <li key={j} className="flex gap-3">
                        <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-turquesa" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.tabla && (
                  <div className="overflow-x-auto rounded-[20px] border border-carbon/10">
                    <table className="w-full min-w-[520px] text-left text-[15px]">
                      <thead className="bg-escarcha text-carbon">
                        <tr>
                          {s.tabla[0].map((c) => (
                            <th key={c} scope="col" className="px-4 py-3 font-medium">
                              {c}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-carbon/[0.07]">
                        {s.tabla.slice(1).map((fila, j) => (
                          <tr key={j}>
                            {fila.map((c, k) => (
                              <td key={k} className={`px-4 py-3 align-top ${k === 0 ? "font-mono text-[13px] text-carbon" : ""}`}>
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ))}

          <div className="mt-12 flex flex-col gap-6 rounded-tarjeta bg-salvia p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <p className="titular text-[30px]">¿Te quedó alguna duda?</p>
              <p className="mt-2 text-[16px] text-pizarra">Escríbenos y te respondemos en menos de un día hábil.</p>
            </div>
            <Boton href="/contacto">Contáctanos</Boton>
          </div>
        </article>
      </div>
    </main>
  );
}

/** Enlace interno dentro del texto legal. */
export function EnlaceLegal({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-carbon underline underline-offset-4 hover:text-bosque">
      {children}
    </Link>
  );
}
