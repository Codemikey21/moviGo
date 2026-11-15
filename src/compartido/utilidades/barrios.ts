// Barrios del área metropolitana de Bucaramanga con un punto aproximado.
// Se usan para ubicar las direcciones de entrega en el mapa sin pedirle
// al cliente las coordenadas (el proyecto no usa un servicio de geocodificación).

export type Barrio = { nombre: string; ciudad: string; latitud: number; longitud: number };

export const barrios: Barrio[] = [
  { nombre: "Cabecera del Llano", ciudad: "Bucaramanga", latitud: 7.1193, longitud: -73.109 },
  { nombre: "Sotomayor", ciudad: "Bucaramanga", latitud: 7.1225, longitud: -73.1145 },
  { nombre: "San Alonso", ciudad: "Bucaramanga", latitud: 7.1189, longitud: -73.1182 },
  { nombre: "Centro", ciudad: "Bucaramanga", latitud: 7.1254, longitud: -73.1198 },
  { nombre: "García Rovira", ciudad: "Bucaramanga", latitud: 7.1262, longitud: -73.125 },
  { nombre: "La Concordia", ciudad: "Bucaramanga", latitud: 7.1105, longitud: -73.116 },
  { nombre: "Terrazas", ciudad: "Bucaramanga", latitud: 7.111, longitud: -73.098 },
  { nombre: "Lagos del Cacique", ciudad: "Bucaramanga", latitud: 7.105, longitud: -73.1 },
  { nombre: "Provenza", ciudad: "Bucaramanga", latitud: 7.096, longitud: -73.1088 },
  { nombre: "Diamante II", ciudad: "Bucaramanga", latitud: 7.099, longitud: -73.118 },
  { nombre: "Real de Minas", ciudad: "Bucaramanga", latitud: 7.106, longitud: -73.123 },
  { nombre: "Cañaveral", ciudad: "Floridablanca", latitud: 7.0647, longitud: -73.0982 },
  { nombre: "Lagos I", ciudad: "Floridablanca", latitud: 7.073, longitud: -73.092 },
  { nombre: "Floridablanca Centro", ciudad: "Floridablanca", latitud: 7.0628, longitud: -73.087 },
  { nombre: "Girón Centro", ciudad: "Girón", latitud: 7.071, longitud: -73.169 },
  { nombre: "Piedecuesta Centro", ciudad: "Piedecuesta", latitud: 6.987, longitud: -73.05 },
];

export function buscarBarrio(nombre: string) {
  return barrios.find((b) => b.nombre === nombre) ?? null;
}
