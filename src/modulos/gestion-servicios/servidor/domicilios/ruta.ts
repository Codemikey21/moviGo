import "server-only";

// Ruta por las calles entre dos puntos. Se pide a OSRM (el enrutador libre
// de OpenStreetMap); si no responde, se usa una ruta en "L" que sigue la
// cuadrícula de la ciudad. Las rutas se guardan en memoria.
import type { Coordenada } from "../../tipos";

const cache = new Map<string, Coordenada[]>();

export async function rutaEntre(origen: Coordenada, destino: Coordenada): Promise<Coordenada[]> {
  const clave = [origen.latitud, origen.longitud, destino.latitud, destino.longitud].map((n) => n.toFixed(5)).join(",");
  const guardada = cache.get(clave);
  if (guardada) return guardada;

  let ruta: Coordenada[] | null = null;
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${origen.longitud},${origen.latitud};${destino.longitud},${destino.latitud}?overview=simplified&geometries=geojson`;
    const respuesta = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (respuesta.ok) {
      const datos = (await respuesta.json()) as { routes?: { geometry: { coordinates: [number, number][] } }[] };
      const puntos = datos.routes?.[0]?.geometry.coordinates;
      if (puntos && puntos.length > 1) ruta = puntos.map(([longitud, latitud]) => ({ latitud, longitud }));
    }
  } catch {
    // Sin conexión con OSRM: se usa la ruta en L
  }

  ruta ??= [origen, { latitud: origen.latitud, longitud: destino.longitud }, destino];
  cache.set(clave, ruta);
  return ruta;
}

/** Distancia aproximada en metros (fórmula del haversine). */
export function distancia(a: Coordenada, b: Coordenada) {
  const r = 6_371_000;
  const rad = (g: number) => (g * Math.PI) / 180;
  const dLat = rad(b.latitud - a.latitud);
  const dLon = rad(b.longitud - a.longitud);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitud)) * Math.cos(rad(b.latitud)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(h));
}

/** El punto que está a cierta fracción (0 a 1) del recorrido. */
export function puntoEnRuta(ruta: Coordenada[], fraccion: number): Coordenada {
  const tramos = ruta.slice(1).map((p, i) => distancia(ruta[i], p));
  const total = tramos.reduce((s, d) => s + d, 0);
  let falta = Math.min(Math.max(fraccion, 0), 1) * total;
  for (const [i, largo] of tramos.entries()) {
    if (falta <= largo) {
      const t = largo === 0 ? 0 : falta / largo;
      return {
        latitud: ruta[i].latitud + (ruta[i + 1].latitud - ruta[i].latitud) * t,
        longitud: ruta[i].longitud + (ruta[i + 1].longitud - ruta[i].longitud) * t,
      };
    }
    falta -= largo;
  }
  return ruta[ruta.length - 1];
}
