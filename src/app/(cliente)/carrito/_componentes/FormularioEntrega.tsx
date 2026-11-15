"use client";

import { useActionState, useState } from "react";
import { Aviso } from "@/compartido/interfaz/ui/Aviso";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { formatoPesos } from "@/compartido/utilidades/formato";
import type { DisponibilidadPunto } from "@/modulos/gestion-almacen/tipos";
import { confirmarCompraAccion } from "@/modulos/gestion-pedidos/servidor/compras/acciones";
import { CamposDireccion } from "@/modulos/gestion-servicios/interfaz/componentes/domicilios/CamposDireccion";

type Props = {
  subtotal: number;
  costoDomicilio: number;
  /** Disponibilidad por punto de cada producto del carrito, con lo que se pide */
  items: { cantidad: number; disponibilidad: DisponibilidadPunto[] }[];
};

/** Resumen del carrito, cómo se entrega y el botón para ir a pagar. */
export function FormularioEntrega({ subtotal, costoDomicilio, items }: Props) {
  const [estado, accion, enviando] = useActionState(confirmarCompraAccion, estadoInicial);
  const error = estado.estado === "error" ? estado : null;
  const v = error?.valores;

  // Un punto sirve si tiene todo el carrito
  const puntos = (items[0]?.disponibilidad ?? []).map(({ punto }) => ({
    punto,
    alcanza: items.every(
      (item) => (item.disponibilidad.find((d) => d.punto.id === punto.id)?.disponibles ?? 0) >= item.cantidad,
    ),
  }));
  const [tipo, setTipo] = useState<"EN_PUNTO" | "A_DOMICILIO">(v?.tipo === "A_DOMICILIO" ? "A_DOMICILIO" : "EN_PUNTO");
  const [puntoId, setPuntoId] = useState(v?.puntoId || puntos.find((p) => p.alcanza)?.punto.id || "");
  const envio = tipo === "A_DOMICILIO" ? costoDomicilio : 0;

  return (
    <form action={accion} className="space-y-6" noValidate>
      <input type="hidden" name="tipo" value={tipo} />

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
              onClick={() => setTipo(valor)}
              aria-pressed={tipo === valor}
              className={`flex items-center gap-3 rounded-campo border px-4 py-3.5 text-left transition-colors ${
                tipo === valor ? "border-carbon bg-blanco" : "border-transparent bg-escarcha hover:border-carbon/20"
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

      {tipo === "EN_PUNTO" ? (
        <fieldset>
          <legend className="mb-2 text-[14px] font-medium text-carbon">¿Dónde lo recoges?</legend>
          <div className="grid gap-2">
            {puntos.map(({ punto, alcanza }) => {
              const activo = puntoId === punto.id;
              return (
                <label
                  key={punto.id}
                  className={`flex items-center gap-3 rounded-campo border px-4 py-3.5 transition-colors ${
                    !alcanza
                      ? "cursor-not-allowed border-transparent bg-escarcha/60 opacity-55"
                      : activo
                        ? "cursor-pointer border-carbon bg-blanco"
                        : "cursor-pointer border-transparent bg-escarcha hover:border-carbon/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="puntoId"
                    value={punto.id}
                    checked={activo}
                    disabled={!alcanza}
                    onChange={() => setPuntoId(punto.id)}
                    className="sr-only"
                  />
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full ${activo ? "bg-turquesa" : "bg-blanco text-bosque"}`}>
                    <Icono nombre="punto" className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] text-carbon">{punto.nombre}</span>
                    <span className="block truncate text-[13px] text-pizarra">{punto.direccion}</span>
                  </span>
                  <span className={`text-[13px] ${alcanza ? "text-bosque" : "text-pizarra"}`}>
                    {alcanza ? "Tiene todo" : "No tiene todo"}
                  </span>
                </label>
              );
            })}
          </div>
          {error?.errores?.puntoId && <p className="mt-2 text-[13px] text-[#c0392b]">{error.errores.puntoId}</p>}
        </fieldset>
      ) : (
        <CamposDireccion valores={v} errores={error?.errores} />
      )}

      <div className="space-y-2 border-t border-carbon/10 pt-5 text-[15px]">
        <div className="flex justify-between text-pizarra">
          <span>Subtotal</span>
          <span className="tabular-nums">{formatoPesos.format(subtotal)}</span>
        </div>
        <div className="flex justify-between text-pizarra">
          <span>Entrega</span>
          <span className="tabular-nums">{envio ? formatoPesos.format(envio) : "Gratis"}</span>
        </div>
        <div className="flex items-baseline justify-between pt-2 text-[24px] text-carbon">
          <span>Total</span>
          <span className="tabular-nums">{formatoPesos.format(subtotal + envio)}</span>
        </div>
      </div>

      {error?.mensaje && <Aviso tipo="error">{error.mensaje}</Aviso>}

      <BotonAccion type="submit" disabled={enviando || (tipo === "EN_PUNTO" && !puntoId)} className="w-full">
        {enviando ? "Apartando tus productos…" : "Ir a pagar"}
      </BotonAccion>
      <p className="flex items-center justify-center gap-2 text-[13px] text-pizarra">
        <Icono nombre="candado" className="size-4" /> Pago seguro con tarjeta, Nequi o PSE
      </p>
    </form>
  );
}
