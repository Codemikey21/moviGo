"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Boton } from "@/compartido/interfaz/ui/Boton";
import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { CampoSelect } from "@/compartido/interfaz/ui/CampoSelect";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { Icono, type NombreIcono } from "@/compartido/interfaz/ui/Icono";
import { formatoPesos } from "@/compartido/utilidades/formato";
import { pagarAccion } from "@/modulos/gestion-pagos/servidor/acciones";
import type { MetodoPago, ResultadoPago } from "@/modulos/gestion-pagos/tipos";

type Props = {
  referencia: string;
  monto: number;
  destino: string;
  bancos: string[];
};

const metodos: { valor: MetodoPago; texto: string; icono: NombreIcono }[] = [
  { valor: "TARJETA", texto: "Tarjeta", icono: "tarjeta" },
  { valor: "NEQUI", texto: "Nequi", icono: "celular" },
  { valor: "PSE", texto: "PSE", icono: "banco" },
];

function marca(numero: string) {
  if (/^4/.test(numero)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(numero)) return "MASTERCARD";
  if (/^3[47]/.test(numero)) return "AMEX";
  return "";
}

/** 4242424242424242 → "4242 4242 4242 4242" */
const enGrupos = (v: string) => v.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");

export function FormularioPago({ referencia, monto, destino, bancos }: Props) {
  const router = useRouter();
  const [metodo, setMetodo] = useState<MetodoPago>("TARJETA");
  const [resultado, setResultado] = useState<ResultadoPago | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [tarjeta, setTarjeta] = useState({ numero: "", nombre: "", vence: "" });

  const errores = resultado?.estado === "ERROR" ? (resultado.errores ?? {}) : {};

  function enviar(formData: FormData) {
    const datos = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));
    iniciar(async () => {
      const r = await pagarAccion(referencia, { ...datos, metodo });
      setResultado(r);
      if (r.estado === "APROBADO") router.refresh();
    });
  }

  if (resultado?.estado === "APROBADO") {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-turquesa text-carbon">
          <Icono nombre="check" className="size-10" />
        </span>
        <h2 className="titular mt-6 text-[40px] text-carbon">Pago aprobado</h2>
        <p className="mt-2 text-[16px] text-pizarra">
          Pagaste {formatoPesos.format(monto)}. Transacción {resultado.transaccionId}.
        </p>
        <div className="mt-8">
          <Boton href={destino}>Seguir mi pedido</Boton>
        </div>
      </div>
    );
  }

  if (resultado?.estado === "RECHAZADO") {
    return (
      <div className="py-6 text-center">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-[#fde3dc] text-[#8e2a1f]">
          <Icono nombre="cerrar" className="size-9" />
        </span>
        <h2 className="titular mt-6 text-[40px] text-carbon">Pago rechazado</h2>
        <p className="mt-2 text-[16px] text-pizarra">{resultado.motivo}. No se hizo ningún cobro.</p>
        <div className="mt-8">
          <BotonAccion onClick={() => setResultado(null)}>Intentar con otro medio</BotonAccion>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {pendiente && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-[28px] bg-blanco/90 backdrop-blur-sm" aria-live="polite">
          <div className="text-center">
            <span className="mx-auto block size-12 animate-spin rounded-full border-[3px] border-salvia border-t-bosque" />
            <p className="mt-5 text-[17px] text-carbon">Procesando con tu banco…</p>
            <p className="mt-1 text-[13px] text-pizarra">No cierres esta página</p>
          </div>
        </div>
      )}

      {/* Medio de pago */}
      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Medio de pago">
        {metodos.map((m) => (
          <button
            key={m.valor}
            type="button"
            role="tab"
            aria-selected={metodo === m.valor}
            onClick={() => {
              setMetodo(m.valor);
              setResultado(null);
            }}
            className={`flex flex-col items-center gap-2 rounded-[18px] border py-4 text-[14px] transition-colors ${
              metodo === m.valor ? "border-carbon bg-blanco text-carbon" : "border-transparent bg-escarcha text-pizarra hover:text-carbon"
            }`}
          >
            <Icono nombre={m.icono} className="size-6" />
            {m.texto}
          </button>
        ))}
      </div>

      <form action={enviar} className="mt-6 space-y-4" noValidate key={metodo}>
        {resultado?.estado === "ERROR" && !Object.keys(errores).length && (
          <p className="rounded-campo bg-[#fdf1ef] px-4 py-3 text-[14px] text-[#8e2a1f]">{resultado.mensaje}</p>
        )}

        {metodo === "TARJETA" && (
          <>
            {/* Tarjeta que se va llenando */}
            <div className="relative aspect-[1.7] w-full max-w-[340px] overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#34484a,#0d1212)] p-5 text-blanco">
              <span className="absolute -right-10 -top-16 size-48 rounded-full bg-turquesa/20" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="h-7 w-10 rounded-[6px] bg-[linear-gradient(135deg,#e8d9a8,#b9a46a)]" />
                  <span className="text-[13px] font-bold tracking-[0.1em]">{marca(tarjeta.numero.replace(/\D/g, ""))}</span>
                </div>
                <p className="font-mono text-[19px] tracking-[0.08em]">{tarjeta.numero || "•••• •••• •••• ••••"}</p>
                <div className="flex justify-between text-[11px] uppercase tracking-[0.08em] text-blanco/70">
                  <span className="truncate pr-4">{tarjeta.nombre || "Nombre del titular"}</span>
                  <span>{tarjeta.vence || "MM/AA"}</span>
                </div>
              </div>
            </div>

            <CampoTexto
              etiqueta="Número de la tarjeta"
              name="numero"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={tarjeta.numero}
              onChange={(e) => setTarjeta({ ...tarjeta, numero: enGrupos(e.target.value) })}
              error={errores.numero}
            />
            <CampoTexto
              etiqueta="Nombre del titular"
              name="nombre"
              autoComplete="cc-name"
              placeholder="Como aparece en la tarjeta"
              value={tarjeta.nombre}
              onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value.toUpperCase() })}
              error={errores.nombre}
            />
            <div className="grid grid-cols-3 gap-3">
              <CampoTexto
                etiqueta="Vence"
                name="vence"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/AA"
                value={tarjeta.vence}
                onChange={(e) => {
                  const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setTarjeta({ ...tarjeta, vence: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d });
                }}
                error={errores.vence}
              />
              <CampoTexto etiqueta="CVV" name="cvv" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} error={errores.cvv} />
              <CampoSelect
                etiqueta="Cuotas"
                name="cuotas"
                defaultValue="1"
                opciones={[1, 2, 3, 6, 12, 24, 36].map((n) => ({ valor: String(n), texto: String(n) }))}
              />
            </div>
            <p className="rounded-campo bg-escarcha px-4 py-3 text-[13px] leading-relaxed text-pizarra">
              <span className="font-medium text-carbon">Tarjetas de prueba:</span> 4242 4242 4242 4242 se aprueba ·
              4000 0000 0000 0002 se rechaza. Cualquier fecha futura y CVV.
            </p>
          </>
        )}

        {metodo === "NEQUI" && (
          <>
            <CampoTexto
              etiqueta="Celular Nequi"
              name="celular"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="300 123 4567"
              error={errores.celular}
            />
            <p className="rounded-campo bg-escarcha px-4 py-3 text-[13px] leading-relaxed text-pizarra">
              Te llega una notificación a la app de Nequi para aceptar el pago.{" "}
              <span className="font-medium text-carbon">Prueba:</span> 300 000 0002 se rechaza; cualquier otro se aprueba.
            </p>
          </>
        )}

        {metodo === "PSE" && (
          <>
            <CampoSelect
              etiqueta="Banco"
              name="banco"
              vacio="Elige tu banco"
              defaultValue=""
              opciones={bancos.map((b) => ({ valor: b, texto: b }))}
              error={errores.banco}
            />
            <div className="grid grid-cols-2 gap-3">
              <CampoSelect
                etiqueta="Tipo de persona"
                name="tipoPersona"
                defaultValue="NATURAL"
                opciones={[
                  { valor: "NATURAL", texto: "Natural" },
                  { valor: "JURIDICA", texto: "Jurídica" },
                ]}
              />
              <CampoTexto etiqueta="Documento" name="documento" inputMode="numeric" placeholder="1098765432" error={errores.documento} />
            </div>
            <p className="rounded-campo bg-escarcha px-4 py-3 text-[13px] leading-relaxed text-pizarra">
              Normalmente te llevaría a la página de tu banco. <span className="font-medium text-carbon">Prueba:</span> “Banco
              de pruebas (rechaza)” rechaza el pago.
            </p>
          </>
        )}

        <BotonAccion type="submit" disabled={pendiente} className="w-full">
          Pagar {formatoPesos.format(monto)}
        </BotonAccion>
      </form>
    </div>
  );
}
