import Link from "next/link";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { IconoCuadrado } from "@/compartido/interfaz/ui/IconoCuadrado";
import { ImagenSlot } from "@/compartido/interfaz/ui/ImagenSlot";
import { categorias } from "./contenido";

/**
 * Sección blanca: título centrado con botón, y debajo una foto grande a la
 * izquierda con la lista de categorías a la derecha (filas con etiqueta y
 * cuadradito turquesa), como la lista de artículos de la referencia.
 */
export function SeccionCategorias() {
  return (
    <section id="categorias" className="bg-blanco text-carbon">
      <div className="px-5 pb-[60px] pt-[120px] text-center md:pt-[160px]">
        <p data-revelar className="etiqueta pb-4 text-carbon/70">
          {categorias.etiqueta}
        </p>
        <h2
          data-revelar
          className="mx-auto max-w-[692px] pb-4 text-[clamp(26px,2.5vw,36px)] font-normal leading-[1.2]"
        >
          {categorias.titulo}
        </h2>
        <div data-revelar className="pt-4">
          <Boton href={categorias.boton.href}>{categorias.boton.texto}</Boton>
        </div>
      </div>

      <div className="px-5 pb-[80px] pt-[60px]">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-[60px]">
          <div data-revelar className="relative aspect-[4/3] w-full overflow-hidden rounded-tarjeta lg:aspect-auto lg:min-h-[560px]">
            <ImagenSlot src={categorias.foto} alt="Catálogo MoviGo" tono="salvia" />
          </div>

          <ul className="flex flex-col">
            {categorias.items.map((c, i) => (
              <li
                key={c.nombre}
                data-revelar
                className={`border-t border-carbon/10 ${
                  i === categorias.items.length - 1 ? "border-b" : ""
                }`}
              >
                <Link
                  href={c.href}
                  className="group flex items-center gap-4 rounded-[16px] py-[21px] pr-2 transition-colors duration-300 hover:bg-escarcha md:gap-6 md:pl-4"
                >
                  <span className="flex-1 text-[20px] leading-[1.3]">{c.nombre}</span>
                  <span className="rounded-insignia bg-salvia/40 px-3 py-[7px] text-[14px] leading-[1.3]">
                    {c.modo}
                  </span>
                  <IconoCuadrado className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
