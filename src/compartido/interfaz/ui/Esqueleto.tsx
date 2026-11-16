// Esqueletos de carga: la forma del contenido con un brillo suave que
// pasa de izquierda a derecha, en lugar de un texto "Cargando…". Así la
// página no salta cuando llegan los datos y se siente más rápida.
import type { CSSProperties, ReactNode } from "react";

type Tono = "claro" | "oscuro";

/** Un bloque gris con el brillo. Se le da forma con className. */
export function Esqueleto({
  className = "",
  tono = "claro",
  style,
}: {
  className?: string;
  tono?: Tono;
  style?: CSSProperties;
}) {
  return (
    <span aria-hidden style={style} className={`block ${tono === "oscuro" ? "esqueleto-oscuro" : "esqueleto"} ${className}`} />
  );
}

/** Envoltura accesible: el lector de pantalla oye "Cargando…" una sola vez. */
function Cargando({ etiqueta, className = "", children }: { etiqueta: string; className?: string; children: ReactNode }) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{etiqueta}</span>
      {children}
    </div>
  );
}

/** Lista o tabla: título, filtros y filas con miniatura, dos líneas y un estado. */
export function EsqueletoLista({
  filas = 6,
  etiqueta = "Cargando…",
  className = "pt-16",
  conTitulo = true,
}: {
  filas?: number;
  etiqueta?: string;
  className?: string;
  conTitulo?: boolean;
}) {
  return (
    <Cargando etiqueta={etiqueta} className={className}>
      {conTitulo && (
        <>
          <Esqueleto className="h-3 w-28 rounded-full" />
          <Esqueleto className="mt-5 h-10 w-[min(420px,80%)] rounded-[14px]" />
          <div className="mt-8 flex gap-2">
            {[88, 104, 96, 80].map((ancho, i) => (
              <Esqueleto key={i} className="h-10 rounded-full" style={{ width: ancho }} />
            ))}
          </div>
        </>
      )}
      <ul className="mt-8">
        {Array.from({ length: filas }, (_, i) => (
          <li key={i} className="flex items-center gap-4 border-t border-carbon/10 py-4">
            <Esqueleto className="aspect-[900/560] w-[64px] shrink-0 rounded-[12px]" />
            <span className="min-w-0 flex-1">
              <Esqueleto className="h-4 rounded-full" style={{ width: `${62 - (i % 3) * 12}%` }} />
              <Esqueleto className="mt-2.5 h-3 w-1/3 rounded-full" />
            </span>
            <Esqueleto className="hidden h-8 w-28 rounded-full sm:block" />
          </li>
        ))}
      </ul>
    </Cargando>
  );
}

/** Detalle de un pedido o alquiler: portada grande, pasos y dos columnas. */
export function EsqueletoDetalle({ etiqueta = "Cargando…", className = "mt-10" }: { etiqueta?: string; className?: string }) {
  return (
    <Cargando etiqueta={etiqueta} className={className}>
      <Esqueleto className="h-[300px] rounded-tarjeta md:h-[380px]" />
      <div className="mt-4 grid grid-cols-5 gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Esqueleto key={i} className="h-16 rounded-[18px]" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Esqueleto className="h-[320px] rounded-tarjeta" />
        <Esqueleto className="h-[320px] rounded-tarjeta" />
      </div>
    </Cargando>
  );
}

/** Pantalla de pago: resumen oscuro a la izquierda y formulario a la derecha. */
export function EsqueletoPago() {
  return (
    <Cargando etiqueta="Cargando el pago…" className="mx-auto grid max-w-[1100px] gap-4 lg:grid-cols-[1fr_1.1fr]">
      <Esqueleto className="h-[460px] rounded-tarjeta" tono="oscuro" />
      <div className="rounded-tarjeta bg-blanco p-8">
        <Esqueleto className="h-7 w-56 rounded-full" />
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          {[0, 1, 2].map((i) => (
            <Esqueleto key={i} className="h-16 rounded-[16px]" />
          ))}
        </div>
        {[0, 1, 2].map((i) => (
          <Esqueleto key={i} className="mt-5 h-12 rounded-campo" />
        ))}
        <Esqueleto className="mt-8 h-[50px] rounded-boton" />
      </div>
    </Cargando>
  );
}

/** Resumen del panel (fondo carbón): saludo y las cinco cifras. */
export function EsqueletoResumenAdmin() {
  return (
    <Cargando etiqueta="Cargando el resumen…" className="contenedor pb-[40vh] pt-[150px] md:pt-[170px]">
      <Esqueleto tono="oscuro" className="mx-auto h-3 w-40 rounded-full" />
      <Esqueleto tono="oscuro" className="mx-auto mt-6 h-14 w-[min(900px,90%)] rounded-[18px]" />
      <Esqueleto tono="oscuro" className="mx-auto mt-3 h-14 w-[min(640px,70%)] rounded-[18px]" />
      <div className="mt-16 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Esqueleto key={i} tono="oscuro" className="h-[230px] rounded-[28px]" />
        ))}
      </div>
    </Cargando>
  );
}
