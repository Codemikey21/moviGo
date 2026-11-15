"use client";

import { useEffect, useRef, useState } from "react";
import { reportarPosicionAccion } from "../../../servidor/reparto/acciones";

type Estado = "buscando" | "compartiendo" | "fuera" | "denegado" | "sin-soporte";

const textos: Record<Estado, string> = {
  buscando: "Buscando tu ubicación…",
  compartiendo: "Compartiendo tu ubicación en vivo",
  fuera: "Estás fuera de la zona: el cliente ve la ruta estimada",
  denegado: "Activa la ubicación para que el cliente te vea en el mapa",
  "sin-soporte": "Este navegador no comparte ubicación: el cliente ve la ruta estimada",
};

/**
 * Mientras va en ruta, manda la posición del GPS del teléfono cada 8
 * segundos. Si el domiciliario no da permiso, el cliente ve la ruta
 * estimada.
 */
export function CompartirUbicacion({ domicilioId }: { domicilioId: string }) {
  const [estado, setEstado] = useState<Estado>("buscando");
  const [intento, setIntento] = useState(0);
  const ultimoEnvio = useRef(0);
  const ultimaPosicion = useRef<GeolocationCoordinates | null>(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      queueMicrotask(() => setEstado("sin-soporte"));
      return;
    }
    const enviar = async () => {
      const p = ultimaPosicion.current;
      if (!p || Date.now() - ultimoEnvio.current < 8_000) return;
      ultimoEnvio.current = Date.now();
      const ok = await reportarPosicionAccion(domicilioId, p.latitude, p.longitude);
      setEstado(ok ? "compartiendo" : "fuera");
    };
    const id = navigator.geolocation.watchPosition(
      (p) => {
        ultimaPosicion.current = p.coords;
        enviar();
      },
      () => setEstado("denegado"),
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 },
    );
    // Si el teléfono está quieto, el GPS no avisa: se reenvía la última posición
    const latido = setInterval(enviar, 10_000);
    return () => {
      navigator.geolocation.clearWatch(id);
      clearInterval(latido);
    };
  }, [domicilioId, intento]);

  const activo = estado === "compartiendo";
  return (
    <div className={`flex items-center gap-3 rounded-[18px] px-4 py-3 text-[14px] ${activo ? "bg-salvia text-bosque" : "bg-escarcha text-pizarra"}`}>
      <span className="relative flex size-2.5 shrink-0">
        {activo && <span className="absolute inline-flex size-full animate-ping rounded-full bg-eucalipto opacity-75" />}
        <span className={`relative inline-flex size-2.5 rounded-full ${activo ? "bg-eucalipto" : "bg-bruma"}`} />
      </span>
      <span className="flex-1">{textos[estado]}</span>
      {estado === "denegado" && (
        <button type="button" onClick={() => setIntento((n) => n + 1)} className="text-[12px] font-bold uppercase text-carbon underline underline-offset-4">
          Reintentar
        </button>
      )}
    </div>
  );
}
