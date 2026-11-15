"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { SelectorPunto } from "@/modulos/gestion-almacen/interfaz/componentes/stock/SelectorPunto";
import type { DisponibilidadPunto } from "@/modulos/gestion-almacen/tipos";
import { agregarAlCarritoAccion } from "@/modulos/gestion-pedidos/servidor/carrito/acciones";
import { CamposDireccion } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/CamposDireccion";
import { reservarAlquilerAccion } from "@/modulos/gestion-servicios/servidor/alquiler/acciones";

type Props = {
  producto: { id: string; slug: string; nombre: string; precioVenta: number; tarifaAlquilerDia: number | null };
  /** Color elegido en el configurador (null si el producto no tiene colores) */
  colorId: string | null;
  disponibilidad: DisponibilidadPunto[];
  haySesion: boolean;
  /** Pestaña con la que abre (?modo=alquilar) */
  modoInicial: "comprar" | "alquilar";
  hoy: string;
  maxFecha: string;
  costoDomicilio: number;
};

/** Botones +/− para la cantidad o los días. */
function Contador({
  nombre,
  valor,
  min,
  max,
  onCambio,
  sufijo,
}: {
  nombre: string;
  valor: number;
  min: number;
  max: number;
  onCambio: (v: number) => void;
  sufijo?: string;
}) {
  return (
    <div className="flex h-14 items-center justify-between rounded-campo bg-escarcha px-2">
      <input type="hidden" name={nombre} value={valor} />
      <button
        type="button"
        aria-label="Menos"
        disabled={valor <= min}
        onClick={() => onCambio(valor - 1)}
        className="grid size-10 place-items-center rounded-[12px] text-carbon transition-colors hover:bg-blanco disabled:opacity-30"
      >
        <Icono nombre="menos" className="size-4" />
      </button>
      <span className="text-[17px] tabular-nums text-carbon" aria-live="polite">
        {valor}
        {sufijo && <span className="text-pizarra"> {sufijo}</span>}
      </span>
      <button
        type="button"
        aria-label="Más"
        disabled={valor >= max}
        onClick={() => onCambio(valor + 1)}
        className="grid size-10 place-items-center rounded-[12px] text-carbon transition-colors hover:bg-blanco disabled:opacity-30"
      >
        <Icono nombre="mas" className="size-4" />
      </button>
    </div>
  );
}

function Fila({ etiqueta, valor, fuerte }: { etiqueta: string; valor: string; fuerte?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between ${fuerte ? "text-[20px] text-carbon" : "text-[15px] text-pizarra"}`}>
      <span>{etiqueta}</span>
      <span className="tabular-nums">{valor}</span>
    </div>
  );
}

export function PanelReserva({ producto, colorId, disponibilidad, haySesion, modoInicial, hoy, maxFecha, costoDomicilio }: Props) {
  const alquila = producto.tarifaAlquilerDia !== null;
  const [modo, setModo] = useState<"comprar" | "alquilar">(alquila ? modoInicial : "comprar");
  const totalDisponibles = disponibilidad.reduce((s, d) => s + d.disponibles, 0);
  const siguiente = `/producto/${producto.slug}${modo === "alquilar" ? "?modo=alquilar" : ""}`;
  const enlaceAcceso = `/iniciar-sesion?siguiente=${encodeURIComponent(siguiente)}`;

  return (
    <div>
      {/* Comprar o alquilar */}
      {alquila && (
        <div className="mb-8 grid grid-cols-2 rounded-full bg-escarcha p-1" role="tablist">
          {(["comprar", "alquilar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={modo === m}
              onClick={() => setModo(m)}
              className={`h-11 rounded-full text-[12px] font-bold uppercase tracking-[0.04em] transition-colors ${
                modo === m ? "bg-bosque text-blanco" : "text-carbon hover:bg-carbon/[0.06]"
              }`}
            >
              {m === "comprar" ? "Comprar" : "Alquilar por días"}
            </button>
          ))}
        </div>
      )}

      {totalDisponibles === 0 ? (
        <Aviso tipo="info">
          {colorId
            ? "No hay unidades de este color en este momento. Prueba con otro color o vuelve pronto."
            : "No hay unidades disponibles en este momento. Vuelve pronto: el inventario se actualiza cada día."}
        </Aviso>
      ) : modo === "comprar" ? (
        <FormularioCompra
          producto={producto}
          colorId={colorId}
          maximo={Math.min(5, totalDisponibles)}
          haySesion={haySesion}
          enlaceAcceso={enlaceAcceso}
        />
      ) : (
        <FormularioAlquiler
          producto={producto}
          colorId={colorId}
          disponibilidad={disponibilidad}
          haySesion={haySesion}
          enlaceAcceso={enlaceAcceso}
          hoy={hoy}
          maxFecha={maxFecha}
          costoDomicilio={costoDomicilio}
        />
      )}
    </div>
  );
}

function FormularioCompra({
  producto,
  colorId,
  maximo,
  haySesion,
  enlaceAcceso,
}: {
  producto: Props["producto"];
  colorId: string | null;
  maximo: number;
  haySesion: boolean;
  enlaceAcceso: string;
}) {
  const [estado, accion, enviando] = useActionState(agregarAlCarritoAccion, {});
  const [cantidad, setCantidad] = useState(1);

  return (
    <form action={accion} className="space-y-6">
      <input type="hidden" name="productoId" value={producto.id} />
      <input type="hidden" name="colorId" value={colorId ?? ""} />
      <div>
        <p className="text-[14px] text-pizarra">Precio</p>
        <p className="mt-1 text-[clamp(32px,3vw,44px)] leading-none tracking-[-0.02em] text-carbon">
          {formatoPesos.format(producto.precioVenta * cantidad)}
        </p>
        {cantidad > 1 && <p className="mt-2 text-[14px] text-pizarra">{formatoPesos.format(producto.precioVenta)} c/u</p>}
      </div>

      <div>
        <p className="mb-2 text-[14px] font-medium text-carbon">Cantidad</p>
        <Contador nombre="cantidad" valor={cantidad} min={1} max={maximo} onCambio={setCantidad} />
      </div>

      {estado.error && <Aviso tipo="error">{estado.error}</Aviso>}
      {estado.ok && (
        <Aviso tipo="exito">
          Listo, quedó en tu carrito.{" "}
          <Link href="/carrito" className="font-medium underline underline-offset-2">
            Ver carrito
          </Link>
        </Aviso>
      )}

      {haySesion ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <BotonAccion type="submit" name="irAlCarrito" value="1" disabled={enviando}>
            Comprar ahora
          </BotonAccion>
          <BotonAccion type="submit" variante="secundario" disabled={enviando}>
            {enviando ? "Agregando…" : "Agregar al carrito"}
          </BotonAccion>
        </div>
      ) : (
        <Boton href={enlaceAcceso} className="w-full">
          Inicia sesión para comprar
        </Boton>
      )}

      <ul className="space-y-2.5 border-t border-carbon/10 pt-6 text-[14px] text-pizarra">
        <li className="flex items-center gap-2.5">
          <Icono nombre="punto" className="size-[18px] text-eucalipto" /> Recógelo gratis en un punto MoviGo
        </li>
        <li className="flex items-center gap-2.5">
          <Icono nombre="domicilios" className="size-[18px] text-eucalipto" /> O te lo llevamos a la puerta
        </li>
        <li className="flex items-center gap-2.5">
          <Icono nombre="escudo" className="size-[18px] text-eucalipto" /> Revisado por nuestro taller antes de entregarlo
        </li>
      </ul>
    </form>
  );
}

function FormularioAlquiler({
  producto,
  colorId,
  disponibilidad,
  haySesion,
  enlaceAcceso,
  hoy,
  maxFecha,
  costoDomicilio,
}: Omit<Props, "modoInicial"> & { enlaceAcceso: string }) {
  const [estado, accion, enviando] = useActionState(reservarAlquilerAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;
  const v = error?.valores;

  const primerPunto = disponibilidad.find((d) => d.disponibles > 0)?.punto.id ?? "";
  const [dias, setDias] = useState(Number(v?.dias) || 1);
  const [entrega, setEntrega] = useState<"EN_PUNTO" | "A_DOMICILIO">(v?.entrega === "A_DOMICILIO" ? "A_DOMICILIO" : "EN_PUNTO");
  const [puntoId, setPuntoId] = useState(v?.puntoId || primerPunto);

  const tarifa = producto.tarifaAlquilerDia ?? 0;
  const envio = entrega === "A_DOMICILIO" ? costoDomicilio : 0;

  return (
    <form action={accion} className="space-y-6" noValidate>
      <input type="hidden" name="productoId" value={producto.id} />
      <input type="hidden" name="colorId" value={colorId ?? ""} />
      <input type="hidden" name="entrega" value={entrega} />

      <div>
        <p className="text-[14px] text-pizarra">Tarifa</p>
        <p className="mt-1 text-[clamp(32px,3vw,44px)] leading-none tracking-[-0.02em] text-carbon">
          {formatoPesos.format(tarifa)}
          <span className="text-[18px] tracking-normal text-pizarra"> / día</span>
        </p>
      </div>

      {error?.mensaje && <Aviso tipo="error">{error.mensaje}</Aviso>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fechaInicio" className="mb-2 block text-[14px] font-medium text-carbon">
            Desde
          </label>
          <input
            id="fechaInicio"
            name="fechaInicio"
            type="date"
            min={hoy}
            max={maxFecha}
            defaultValue={v?.fechaInicio ?? hoy}
            className="h-14 w-full rounded-campo border border-transparent bg-escarcha px-4 text-[16px] text-carbon outline-none focus:border-carbon focus:bg-blanco"
          />
          {error?.errores?.fechaInicio && <p className="mt-2 text-[13px] text-[#c0392b]">{error.errores.fechaInicio}</p>}
        </div>
        <div>
          <p className="mb-2 text-[14px] font-medium text-carbon">Días</p>
          <Contador nombre="dias" valor={dias} min={1} max={30} onCambio={setDias} sufijo={dias === 1 ? "día" : "días"} />
        </div>
      </div>

      {/* Cómo lo recibe */}
      <div>
        <p className="mb-2 text-[14px] font-medium text-carbon">¿Cómo lo recibes?</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            ["EN_PUNTO", "punto", "Lo recojo", "Gratis"],
            ["A_DOMICILIO", "domicilios", "A domicilio", formatoPesos.format(costoDomicilio)],
          ] as const).map(([valor, icono, titulo, precio]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setEntrega(valor)}
              aria-pressed={entrega === valor}
              className={`flex items-center gap-3 rounded-campo border px-4 py-3.5 text-left transition-colors ${
                entrega === valor ? "border-carbon bg-blanco" : "border-transparent bg-escarcha hover:border-carbon/20"
              }`}
            >
              <Icono nombre={icono} className="size-5 text-bosque" />
              <span>
                <span className="block text-[15px] text-carbon">{titulo}</span>
                <span className="block text-[13px] text-pizarra">{precio}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <SelectorPunto
        puntos={disponibilidad}
        seleccionado={puntoId}
        onElegir={setPuntoId}
        error={error?.errores?.puntoId}
        titulo={entrega === "EN_PUNTO" ? "¿Dónde lo recoges?" : "Sale desde"}
      />

      {entrega === "A_DOMICILIO" && <CamposDireccion valores={v} errores={error?.errores} />}

      <div className="space-y-2 rounded-[24px] bg-escarcha p-5">
        <Fila etiqueta={`${formatoPesos.format(tarifa)} × ${dias} ${dias === 1 ? "día" : "días"}`} valor={formatoPesos.format(tarifa * dias)} />
        {envio > 0 && <Fila etiqueta="Domicilio" valor={formatoPesos.format(envio)} />}
        <div className="border-t border-carbon/10 pt-2">
          <Fila etiqueta="Total" valor={formatoPesos.format(tarifa * dias + envio)} fuerte />
        </div>
      </div>

      {haySesion ? (
        <BotonAccion type="submit" disabled={enviando || !puntoId} className="w-full">
          {enviando ? "Reservando…" : "Reservar y pagar"}
        </BotonAccion>
      ) : (
        <Boton href={enlaceAcceso} className="w-full">
          Inicia sesión para alquilar
        </Boton>
      )}
      <p className="text-center text-[13px] text-pizarra">Casco incluido · Batería cargada · Cancela gratis antes de recogerlo</p>
    </form>
  );
}
