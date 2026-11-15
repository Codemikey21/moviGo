import type { DisponibilidadPunto } from "../../../tipos";

/** Unidades de un producto en cada punto: disponibles y en total. */
export function DisponibilidadProducto({ puntos }: { puntos: DisponibilidadPunto[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {puntos.map(({ punto, disponibles, total }) => (
        <li key={punto.id} className="rounded-[20px] bg-escarcha px-5 py-4">
          <p className="text-[14px] font-medium text-carbon">{punto.nombre.replace("MoviGo ", "")}</p>
          <p className="mt-2 text-[28px] font-medium leading-none tracking-[-0.02em] text-carbon">
            {disponibles}
            <span className="ml-1.5 text-[14px] font-normal tracking-normal text-pizarra">
              disponible{disponibles === 1 ? "" : "s"}
            </span>
          </p>
          <p className="mt-1.5 text-[13px] text-bruma">{total} en el punto</p>
        </li>
      ))}
    </ul>
  );
}
