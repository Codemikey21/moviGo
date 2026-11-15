"use client";

import { useActionState, useEffect, useState } from "react";
import { crearClienteNavegador } from "@/compartido/servidor/supabase/navegador";
import { estadoInicial } from "@/compartido/tipos/formulario";
import { entregarAccion } from "../../../servidor/reparto/acciones";

// La foto va del teléfono directo al bucket privado "evidencias" con la
// sesión del domiciliario (la política solo deja subir a quien lleva ese
// domicilio). Al confirmar, la acción guarda la ruta junto con la entrega.

const LADO_MAXIMO = 1280;

async function prepararFoto(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  return new Promise((resolver, rechazar) =>
    lienzo.toBlob((b) => (b ? resolver(b) : rechazar(new Error("sin-blob"))), "image/webp", 0.8),
  );
}

type Foto = { estado: "subiendo" | "lista" | "error"; vista: string; ruta?: string };

/** Confirmar la entrega: código del cliente y, si quiere, una foto. */
export function FormularioEntrega({ domicilioId }: { domicilioId: string }) {
  const [estado, accion, enviando] = useActionState(entregarAccion, estadoInicial);
  const [foto, setFoto] = useState<Foto | null>(null);
  const error = estado.estado === "error" ? estado : null;

  // Libera la vista previa al cambiar o quitar la foto
  useEffect(() => () => (foto ? URL.revokeObjectURL(foto.vista) : undefined), [foto]);

  async function elegirFoto(archivo: File | undefined) {
    if (!archivo) return;
    const vista = URL.createObjectURL(archivo);
    setFoto({ estado: "subiendo", vista });
    try {
      const blob = await prepararFoto(archivo);
      const ruta = `${domicilioId}/${crypto.randomUUID()}.webp`;
      const { error: fallo } = await crearClienteNavegador()
        .storage.from("evidencias")
        .upload(ruta, blob, { contentType: "image/webp" });
      if (fallo) throw fallo;
      setFoto({ estado: "lista", vista, ruta });
    } catch {
      setFoto({ estado: "error", vista });
    }
  }

  if (estado.estado === "exito") {
    return (
      <div role="status" className="rounded-[26px] bg-salvia p-7 text-center">
        <span aria-hidden className="mx-auto grid size-14 place-items-center rounded-full bg-bosque text-[24px] text-blanco">
          ✓
        </span>
        <p className="titular mt-5 text-[30px] text-carbon">{estado.mensaje}</p>
      </div>
    );
  }

  return (
    <form action={accion} className="space-y-5" noValidate>
      <input type="hidden" name="domicilioId" value={domicilioId} />
      <input type="hidden" name="foto" value={foto?.estado === "lista" ? (foto.ruta ?? "") : ""} />
      {error?.mensaje && (
        <p role="alert" className="rounded-campo bg-[#fde3dc] px-4 py-3 text-[14px] text-[#8e2a1f]">
          {error.mensaje}
        </p>
      )}

      <div>
        <label htmlFor="entrega-codigo" className="mb-2 block text-[14px] font-medium text-carbon">
          Código de entrega
        </label>
        <input
          id="entrega-codigo"
          name="codigo"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]{4}"
          maxLength={4}
          placeholder="• • • •"
          defaultValue={error?.valores?.codigo}
          aria-invalid={error?.errores?.codigo ? true : undefined}
          aria-describedby="entrega-codigo-ayuda"
          className={`h-20 w-full rounded-[22px] border bg-escarcha text-center font-mono text-[40px] tracking-[0.5em] text-carbon outline-none placeholder:text-bruma focus:bg-blanco ${
            error?.errores?.codigo ? "border-[#c0392b]" : "border-transparent focus:border-carbon"
          }`}
        />
        <p id="entrega-codigo-ayuda" className={`mt-2 text-[13px] ${error?.errores?.codigo ? "text-[#c0392b]" : "text-pizarra"}`}>
          {error?.errores?.codigo ?? "Pídeselo al cliente cuando le entregues. Está en su cuenta de MoviGo."}
        </p>
      </div>

      <div className="rounded-[22px] border border-dashed border-carbon/20 p-4">
        <div className="flex items-center gap-4">
          {foto ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
            <img src={foto.vista} alt="Foto de la entrega" className="size-20 shrink-0 rounded-[16px] object-cover" />
          ) : (
            <span aria-hidden className="grid size-20 shrink-0 place-items-center rounded-[16px] bg-escarcha text-[28px] text-bruma">
              +
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[15px] text-carbon">Foto de la entrega (opcional)</p>
            <p className="text-[13px] text-pizarra">
              {foto?.estado === "subiendo"
                ? "Subiendo foto…"
                : foto?.estado === "lista"
                  ? "Foto lista ✓"
                  : foto?.estado === "error"
                    ? "No se pudo subir. Puedes entregar sin foto."
                    : "El paquete en la puerta o en manos del cliente."}
            </p>
            <label className="mt-2 inline-flex cursor-pointer text-[12px] font-bold uppercase text-bosque underline underline-offset-4">
              {foto ? "Cambiar foto" : "Tomar foto"}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(e) => elegirFoto(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
        <label htmlFor="entrega-receptor" className="mb-2 mt-4 block text-[14px] font-medium text-carbon">
          ¿Quién recibió? (opcional)
        </label>
        <input
          id="entrega-receptor"
          name="receptor"
          maxLength={80}
          placeholder="Nombre de quien recibió"
          defaultValue={error?.valores?.receptor}
          className="h-12 w-full rounded-campo border border-transparent bg-escarcha px-4 text-[15px] text-carbon outline-none focus:border-carbon focus:bg-blanco"
        />
      </div>

      <button
        type="submit"
        disabled={enviando || foto?.estado === "subiendo"}
        className="flex h-[58px] w-full items-center justify-center rounded-boton bg-turquesa text-[14px] font-bold uppercase tracking-[0.04em] text-carbon transition-[transform,opacity] active:scale-[0.98] disabled:opacity-60"
      >
        {enviando ? "Confirmando…" : "Confirmar entrega"}
      </button>
    </form>
  );
}
