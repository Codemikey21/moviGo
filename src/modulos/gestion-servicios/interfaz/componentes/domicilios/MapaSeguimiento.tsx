"use client";

import "leaflet/dist/leaflet.css";
import type { LatLngTuple, Map as MapaLeaflet, Marker, Polyline } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { obtenerSeguimiento } from "../../../servidor/domicilios/acciones";
import type { Coordenada, Seguimiento } from "../../../tipos";

type Props = {
  domicilioId: string;
  origen: Coordenada & { nombre: string };
  destino: Coordenada & { direccion: string };
  /** Seguimiento inicial (lo trae la página) */
  inicial: Seguimiento | null;
  className?: string;
};

const aPunto = (c: Coordenada): LatLngTuple => [c.latitud, c.longitud];

/** Ícono redondo con el estilo de MoviGo (sin imágenes externas). */
function icono(L: typeof import("leaflet"), clase: string, contenido = "") {
  return L.divIcon({
    className: "",
    html: `<span class="${clase}">${contenido}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

const svgMoto =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="16.5" r="3"/><circle cx="18.5" cy="16.5" r="3"/><path d="M5.5 16.5h6l3-6h3l1 6M14.5 10.5 13 7h-2"/></svg>';

/**
 * Mapa de OpenStreetMap con la ruta del domicilio. Cada 4 segundos le pide
 * al servidor la posición del domiciliario y lo mueve.
 */
export function MapaSeguimiento({ domicilioId, origen, destino, inicial, className = "" }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLeaflet | null>(null);
  const marcador = useRef<Marker | null>(null);
  const linea = useRef<Polyline | null>(null);
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const [seguimiento, setSeguimiento] = useState<Seguimiento | null>(inicial);
  // Los extremos no cambian: se guardan para crear el mapa una sola vez
  const extremos = useRef({ origen, destino });

  // Crea el mapa una sola vez (Leaflet necesita el navegador)
  useEffect(() => {
    let cancelado = false;
    const { origen, destino } = extremos.current;
    import("leaflet").then((L) => {
      if (cancelado || !contenedor.current || mapa.current) return;
      leaflet.current = L;
      const m = L.map(contenedor.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false });
      L.control.zoom({ position: "bottomright" }).addTo(m);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);

      L.marker(aPunto(origen), { icon: icono(L, "mapa-punto mapa-origen", "M") })
        .addTo(m)
        .bindTooltip(origen.nombre);
      L.marker(aPunto(destino), { icon: icono(L, "mapa-punto mapa-destino") })
        .addTo(m)
        .bindTooltip(destino.direccion);

      m.fitBounds([aPunto(origen), aPunto(destino)], { padding: [60, 60] });
      mapa.current = m;
      setSeguimiento((s) => (s ? { ...s } : s)); // vuelve a pintar la ruta ya cargada
    });
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      marcador.current = null;
      linea.current = null;
    };
  }, []);

  // Pinta la ruta y la posición cada vez que llega un seguimiento nuevo
  useEffect(() => {
    const L = leaflet.current;
    const m = mapa.current;
    if (!L || !m || !seguimiento) return;

    const ruta = seguimiento.ruta.map(aPunto);
    if (!linea.current) {
      linea.current = L.polyline(ruta, { color: "#34484a", weight: 5, opacity: 0.85, lineCap: "round" }).addTo(m);
      m.fitBounds(linea.current.getBounds(), { padding: [60, 60] });
    } else {
      linea.current.setLatLngs(ruta);
    }

    if (seguimiento.posicion) {
      const punto = aPunto(seguimiento.posicion);
      if (!marcador.current) {
        marcador.current = L.marker(punto, { icon: icono(L, "mapa-punto mapa-moto", svgMoto), zIndexOffset: 1000 }).addTo(m);
      } else {
        marcador.current.setLatLng(punto);
      }
    }
  }, [seguimiento]);

  // Mientras va en camino, se pregunta la posición cada 4 segundos
  useEffect(() => {
    if (seguimiento?.estado !== "EN_CURSO") return;
    const intervalo = setInterval(async () => {
      const nuevo = await obtenerSeguimiento(domicilioId);
      if (nuevo) setSeguimiento(nuevo);
    }, 4000);
    return () => clearInterval(intervalo);
  }, [domicilioId, seguimiento?.estado]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div ref={contenedor} className="absolute inset-0 bg-escarcha" />
      {seguimiento?.estado === "EN_CURSO" && (
        <div className="pointer-events-none absolute inset-x-4 top-4 z-[500] flex items-center gap-3 rounded-full bg-blanco px-4 py-2.5 shadow-[0_2px_12px_rgba(13,18,18,0.12)]">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-turquesa opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-turquesa" />
          </span>
          <span className="text-[12px] font-bold uppercase tracking-[0.04em] text-carbon">
            En camino · llega en {seguimiento.minutosRestantes} min
          </span>
          <span className="ml-auto h-1.5 w-20 overflow-hidden rounded-full bg-escarcha">
            <span className="block h-full rounded-full bg-turquesa" style={{ width: `${Math.round(seguimiento.progreso * 100)}%` }} />
          </span>
        </div>
      )}
    </div>
  );
}
