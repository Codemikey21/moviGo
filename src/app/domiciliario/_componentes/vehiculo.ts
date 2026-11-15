/** Dibujo de MoviGo que corresponde al vehículo con que reparte. */
export function categoriaDelVehiculo(vehiculo: string) {
  const v = vehiculo.toLowerCase();
  if (v.includes("bici")) return "bicicletas";
  if (v.includes("moto")) return "motos";
  if (v.includes("auto") || v.includes("carro")) return "autos-electricos";
  return "scooters";
}
