"use client";

import { useState } from "react";
import { crearClienteNavegador } from "@/compartido/servidor/supabase/navegador";
import { registrarFotoAccion } from "../../servidor/medios/acciones";

// La foto va del navegador directo a Supabase Storage con la sesión del
// administrador (las políticas del bucket solo dejan subir a administradores).
// Después, la acción registrarFotoAccion la agrega al producto.

const BUCKET = "productos";
const LADO_MAXIMO = 1600; // px: suficiente para la ficha del producto
const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Reduce la foto y la pasa a WebP para que cargue rápido en el catálogo. */
async function prepararImagen(archivo: File): Promise<Blob> {
  const imagen = await createImageBitmap(archivo);
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext("2d")?.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  return new Promise((resolver, rechazar) =>
    lienzo.toBlob(
      (blob) => (blob ? resolver(blob) : rechazar(new Error("No se pudo procesar la foto."))),
      "image/webp",
      0.85,
    ),
  );
}

export type EstadoSubida = { nombre: string; estado: "subiendo" | "lista" | "error"; mensaje?: string };

export function useSubirFotos(productoId: string) {
  const [subidas, setSubidas] = useState<EstadoSubida[]>([]);

  const actualizar = (i: number, cambio: Partial<EstadoSubida>) =>
    setSubidas((lista) => lista.map((s, j) => (j === i ? { ...s, ...cambio } : s)));

  async function subir(archivos: File[]) {
    const inicio = subidas.length;
    setSubidas((lista) => [
      ...lista,
      ...archivos.map((a) => ({ nombre: a.name, estado: "subiendo" as const })),
    ]);
    const supabase = crearClienteNavegador();

    // Una por una, para respetar el orden en que se eligieron
    for (const [k, archivo] of archivos.entries()) {
      const i = inicio + k;
      try {
        if (!TIPOS.includes(archivo.type)) throw new Error("Solo fotos JPG, PNG, WebP o AVIF.");
        if (archivo.size > 20 * 1024 * 1024) throw new Error("La foto pesa más de 20 MB.");

        const blob = await prepararImagen(archivo);
        const ruta = `${productoId}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage
          .from(BUCKET)
          .upload(ruta, blob, { contentType: "image/webp", cacheControl: "31536000" });
        if (error) {
          throw new Error(
            error.message.includes("row-level security")
              ? "Tu cuenta no tiene permiso para subir fotos."
              : "No se pudo subir. Revisa tu conexión e intenta de nuevo.",
          );
        }

        const resultado = await registrarFotoAccion({ productoId, ruta, textoAlt: "" });
        if (!resultado.ok) throw new Error(resultado.mensaje);
        actualizar(i, { estado: "lista" });
      } catch (e) {
        actualizar(i, { estado: "error", mensaje: e instanceof Error ? e.message : "Error al subir." });
      }
    }
  }

  return { subidas, subir, limpiar: () => setSubidas([]) };
}
