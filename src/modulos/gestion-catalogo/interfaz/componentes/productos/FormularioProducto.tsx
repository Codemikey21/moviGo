"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { CampoArea } from "@/compartido/interfaz/ui/CampoArea";
import { CampoSelect } from "@/compartido/interfaz/ui/CampoSelect";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { guardarProductoAccion } from "../../../servidor/productos/acciones";
import type { CategoriaResumen, Especificacion } from "../../../tipos";

type Inicial = {
  id: string;
  categoriaId: string;
  nombre: string;
  marca: string;
  modelo: string;
  descripcion: string;
  precioVenta: number;
  tarifaAlquilerDia: number | null;
  especificaciones: Especificacion[];
};

type Props = {
  categorias: Pick<CategoriaResumen, "id" | "nombre">[];
  /** Sin producto, el formulario crea uno nuevo */
  producto?: Inicial;
};

/** 3299000 → "3.299.000" mientras se escribe */
function conPuntos(valor: string) {
  const digitos = valor.replace(/\D/g, "").replace(/^0+/, "");
  return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

type Fila = Especificacion & { clave: string };

/** Crear o editar un producto del catálogo. */
export function FormularioProducto({ categorias, producto }: Props) {
  const [estado, accion, enviando] = useActionState(guardarProductoAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;

  // React limpia el formulario después de cada envío. Al cambiar la "key"
  // los campos se vuelven a pintar con lo último: lo que la persona escribió
  // (si hubo errores) o lo que quedó guardado.
  const llave = JSON.stringify(error?.valores ?? producto ?? {});

  return (
    <form action={accion} className="space-y-8" noValidate>
      {producto && <input type="hidden" name="id" value={producto.id} />}

      {error?.mensaje && <Aviso tipo="error">{error.mensaje}</Aviso>}
      {estado.estado === "exito" && <Aviso tipo="exito">{estado.mensaje}</Aviso>}

      <Campos
        key={llave}
        categorias={categorias}
        producto={producto}
        valores={error?.valores}
        errores={error?.errores ?? {}}
      />

      <div className="flex flex-wrap items-center gap-4 border-t border-carbon/[0.08] pt-6">
        <BotonAccion type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : producto ? "Guardar cambios" : "Crear producto"}
        </BotonAccion>
        {!producto && (
          <p className="text-[14px] text-pizarra">Después de crearlo podrás subir fotos y registrar unidades.</p>
        )}
      </div>
    </form>
  );
}

function Campos({
  categorias,
  producto,
  valores: v,
  errores,
}: Props & { valores?: Record<string, string>; errores: Partial<Record<string, string>> }) {
  const especInicial: Especificacion[] = v?.especificaciones
    ? JSON.parse(v.especificaciones)
    : (producto?.especificaciones ?? []);

  const [alquila, setAlquila] = useState(
    v ? v.alquila === "on" : producto ? producto.tarifaAlquilerDia !== null : true,
  );
  const [filas, setFilas] = useState<Fila[]>(() =>
    (especInicial.length ? especInicial : [{ etiqueta: "", valor: "" }]).map((f, i) => ({
      ...f,
      clave: `fila-${i}`,
    })),
  );

  return (
    <>
      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="etiqueta mb-4 text-eucalipto">Datos básicos</legend>
        <CampoSelect
          etiqueta="Categoría"
          name="categoriaId"
          vacio="Elige una categoría"
          defaultValue={v?.categoriaId ?? producto?.categoriaId ?? ""}
          opciones={categorias.map((c) => ({ valor: c.id, texto: c.nombre }))}
          error={errores.categoriaId}
        />
        <CampoTexto
          etiqueta="Marca"
          name="marca"
          placeholder="Xiaomi, Trek, Yamaha…"
          defaultValue={v?.marca ?? producto?.marca}
          error={errores.marca}
        />
        <CampoTexto
          etiqueta="Nombre"
          name="nombre"
          placeholder="Electric Scooter 4 Pro"
          defaultValue={v?.nombre ?? producto?.nombre}
          error={errores.nombre}
        />
        <CampoTexto
          etiqueta="Modelo"
          name="modelo"
          placeholder="4 Pro (2.ª generación)"
          defaultValue={v?.modelo ?? producto?.modelo}
          error={errores.modelo}
        />
        <CampoArea
          className="md:col-span-2"
          etiqueta="Descripción"
          name="descripcion"
          rows={4}
          placeholder="Para qué sirve y por qué elegirlo, en dos o tres frases."
          defaultValue={v?.descripcion ?? producto?.descripcion}
          error={errores.descripcion}
        />
      </fieldset>

      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="etiqueta mb-4 text-eucalipto">Precios en pesos</legend>
        <CampoTexto
          etiqueta="Precio de venta"
          name="precioVenta"
          inputMode="numeric"
          placeholder="3.299.000"
          defaultValue={conPuntos(v?.precioVenta ?? String(producto?.precioVenta ?? ""))}
          onChange={(e) => (e.currentTarget.value = conPuntos(e.currentTarget.value))}
          error={errores.precioVenta}
        />
        <div>
          <label className="mb-2 flex h-[21px] cursor-pointer items-center gap-3 text-[14px] font-medium text-carbon">
            <input
              type="checkbox"
              name="alquila"
              checked={alquila}
              onChange={(e) => setAlquila(e.target.checked)}
              className="size-4 accent-carbon"
            />
            También se alquila — tarifa por día
          </label>
          <input
            name="tarifaAlquilerDia"
            aria-label="Tarifa de alquiler por día"
            inputMode="numeric"
            placeholder={alquila ? "45.000" : "Solo venta"}
            disabled={!alquila}
            defaultValue={conPuntos(v?.tarifaAlquilerDia ?? String(producto?.tarifaAlquilerDia ?? ""))}
            onChange={(e) => (e.currentTarget.value = conPuntos(e.currentTarget.value))}
            aria-invalid={errores.tarifaAlquilerDia ? true : undefined}
            className={`h-14 w-full rounded-campo border bg-escarcha px-4 text-[16px] text-carbon outline-none transition-colors placeholder:text-niebla focus:bg-blanco disabled:opacity-50 ${
              errores.tarifaAlquilerDia ? "border-[#c0392b]" : "border-transparent focus:border-carbon"
            }`}
          />
          {errores.tarifaAlquilerDia && (
            <p className="mt-2 text-[13px] text-[#c0392b]">{errores.tarifaAlquilerDia}</p>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend className="etiqueta mb-1 text-eucalipto">Ficha técnica</legend>
        <p className="mb-4 text-[14px] text-pizarra">
          Lo que el cliente compara: autonomía, velocidad, peso, motor… Las filas vacías no se guardan.
        </p>
        <ul className="space-y-2">
          {filas.map((fila, i) => (
            <li key={fila.clave} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
              <input
                name="especEtiqueta"
                aria-label={`Característica ${i + 1}`}
                placeholder="Autonomía"
                defaultValue={fila.etiqueta}
                className="h-12 rounded-campo border border-transparent bg-escarcha px-4 text-[15px] outline-none focus:border-carbon focus:bg-blanco"
              />
              <input
                name="especValor"
                aria-label={`Valor ${i + 1}`}
                placeholder="Hasta 60 km"
                defaultValue={fila.valor}
                className="h-12 rounded-campo border border-transparent bg-escarcha px-4 text-[15px] outline-none focus:border-carbon focus:bg-blanco"
              />
              <button
                type="button"
                onClick={() => setFilas((actual) => actual.filter((f) => f.clave !== fila.clave))}
                aria-label={`Quitar la fila ${i + 1}`}
                className="grid size-12 place-items-center rounded-campo text-[20px] text-bruma transition-colors hover:bg-carbon/[0.06] hover:text-carbon"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        {errores.especificaciones && (
          <p className="mt-2 text-[13px] text-[#c0392b]">{errores.especificaciones}</p>
        )}
        {filas.length < 12 && (
          <button
            type="button"
            onClick={() => setFilas((actual) => [...actual, { etiqueta: "", valor: "", clave: crypto.randomUUID() }])}
            className="mt-3 rounded-full px-4 py-2 text-[14px] font-medium text-bosque transition-colors hover:bg-carbon/[0.06]"
          >
            + Agregar fila
          </button>
        )}
      </fieldset>

    </>
  );
}
