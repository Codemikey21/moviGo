"use client";

import "leaflet/dist/leaflet.css";
import type { Map as MapaLeaflet, Marker } from "leaflet";
import { useEffect, useRef } from "react";
import { obtenerSeguimiento } from "../../../servidor/domicilios/acciones";
import type { Coordenada } from "../../../tipos";

type Props = {
  puntos: (Coordenada & { nombre: string })[];
  entregas: { id: string; enRuta: boolean; destino: Coordenada & { direccion: string }; titulo: string }[];
  className?: string;
};

const svgMoto =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="16.5" r="3"/><circle cx="18.5" cy="16.5" r="3"/><path d="M5.5 16.5h6l3-6h3l1 6M14.5 10.5 13 7h-2"/></svg>';

/** Mapa de toda la operación: puntos, destinos y domiciliarios en ruta. */
export function MapaFlota({ puntos, entregas, className = "" }: Props) {
  const contenedor = useRef<HTMLDivElement>(null);
  const datos = useRef({ puntos, entregas });

  useEffect(() => {
    let cancelado = false;
    let mapa: MapaLeaflet | null = null;
    let intervalo: ReturnType<typeof setInterval> | undefined;
    const motos = new Map<string, Marker>();
    const { puntos, entregas } = datos.current;

    import("leaflet").then((L) => {
      if (cancelado || !contenedor.current) return;
      const icono = (clase: string, html = "") =>
        L.divIcon({ className: "", html: `<span class="mapa-punto ${clase}">${html}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] });

      mapa = L.map(contenedor.current, { zoomControl: false, scrollWheelZoom: false });
      L.control.zoom({ position: "bottomright" }).addTo(mapa);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(mapa);

      const limites: [number, number][] = [];
      for (const p of puntos) {
        L.marker([p.latitud, p.longitud], { icon: icono("mapa-origen", "M") }).addTo(mapa).bindTooltip(p.nombre);
        limites.push([p.latitud, p.longitud]);
      }
      for (const e of entregas) {
        L.marker([e.destino.latitud, e.destino.longitud], { icon: icono("mapa-destino") })
          .addTo(mapa)
          .bindTooltip(`${e.titulo} · ${e.destino.direccion}`);
        limites.push([e.destino.latitud, e.destino.longitud]);
      }
      mapa.fitBounds(limites, { padding: [50, 50] });

      // Los que van en ruta se actualizan cada 5 segundos
      const actualizar = async () => {
        for (const e of entregas.filter((x) => x.enRuta)) {
          const s = await obtenerSeguimiento(e.id);
          if (!s?.posicion || !mapa) continue;
          const punto: [number, number] = [s.posicion.latitud, s.posicion.longitud];
          const actual = motos.get(e.id);
          if (actual) actual.setLatLng(punto);
          else motos.set(e.id, L.marker(punto, { icon: icono("mapa-moto", svgMoto), zIndexOffset: 1000 }).addTo(mapa).bindTooltip(e.titulo));
        }
      };
      void actualizar();
      intervalo = setInterval(actualizar, 5000);
    });

    return () => {
      cancelado = true;
      clearInterval(intervalo);
      mapa?.remove();
    };
  }, []);

  return <div ref={contenedor} className={`bg-escarcha ${className}`} />;
}
