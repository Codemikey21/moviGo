// Colores de cada producto del catálogo (los del fabricante, aproximados).
// El primero es el color con el que se muestra el producto al abrirlo.
// Las unidades de la semilla se reparten entre estos colores.
//
// Formato: slug del producto -> [nombre, color en hexadecimal][]

export const coloresPorProducto: Record<string, [string, string][]> = {
  // Scooters
  "xiaomi-electric-scooter-4-pro": [["Negro", "#24272a"], ["Gris grafito", "#6f7679"], ["Blanco", "#e7ebea"]],
  "xiaomi-electric-scooter-4-lite": [["Negro", "#24272a"], ["Blanco", "#e7ebea"]],
  "segway-ninebot-max-g2": [["Gris oscuro", "#3a3f42"], ["Negro", "#1d2022"]],
  "segway-ninebot-e2-plus": [["Gris", "#7b8287"], ["Negro", "#24272a"], ["Turquesa MoviGo", "#64d5b3"]],

  // Bicicletas
  "gw-zebra-r29": [["Negro mate", "#24272a"], ["Rojo", "#c0392b"], ["Azul", "#2f5d8a"]],
  "trek-marlin-5": [["Rojo carmesí", "#9d161f"], ["Azul medianoche", "#1f2f5e"], ["Menta degradado", "#b2ecdf"]],
  "specialized-sirrus-2": [["Verde bosque", "#0a2125"], ["Azul hielo", "#a9c7d6"], ["Verde lima", "#bac27a"]],
  "trek-verve-plus-1": [["Gris litio", "#7b8287"], ["Azul marino", "#2b3a55"]],

  // Motos
  "yamaha-nmax-155": [["Gris mate", "#5c6266"], ["Azul Yamaha", "#1f4e9c"], ["Blanco", "#e7ebea"]],
  "honda-cb-190r": [["Negro", "#24272a"], ["Rojo Honda", "#b8392f"], ["Blanco perla", "#e7ebea"]],
  "akt-nkd-125": [["Negro", "#24272a"], ["Azul", "#2f5d8a"], ["Rojo", "#c0392b"]],
  "super-soco-cpx": [["Blanco", "#e7ebea"], ["Negro", "#24272a"], ["Gris", "#7b8287"]],

  // Autos eléctricos
  "byd-dolphin-mini": [["Blanco ski", "#e7ebea"], ["Azul surf", "#5f8fa6"], ["Rosa coral", "#d98b7c"], ["Gris urbano", "#6f7679"]],
  "renault-kwid-e-tech": [["Blanco glaciar", "#e7ebea"], ["Gris", "#7b8287"], ["Naranja", "#e07a3f"]],
  "byd-dolphin": [["Azul surf", "#5f8fa6"], ["Blanco ski", "#e7ebea"], ["Gris urbano", "#6f7679"]],
  "jac-e10x": [["Blanco", "#e7ebea"], ["Rojo", "#c0392b"], ["Turquesa", "#64d5b3"]],

  // Drones
  "dji-mini-4k": [["Gris", "#7b8287"]],
  "dji-mini-4-pro": [["Gris", "#7b8287"]],
  "dji-air-3s": [["Gris", "#7b8287"]],
  "dji-avata-2": [["Negro", "#24272a"]],

  // Patinetas
  "element-section-8": [["Natural", "#c9a46c"], ["Negro", "#24272a"]],
  "santa-cruz-classic-dot": [["Rojo", "#c4553f"], ["Azul", "#2f5d8a"]],
  "exway-flex": [["Negro", "#24272a"]],

  // Accesorios
  "specialized-align-ii": [["Negro", "#24272a"], ["Blanco", "#e7ebea"], ["Turquesa", "#64d5b3"]],
  "shaft-pro-560": [["Negro mate", "#24272a"], ["Blanco", "#e7ebea"]],
  "kryptonite-evolution-mini-7": [["Negro", "#24272a"]],
  "cateye-kit-luces": [["Negro", "#24272a"]],
};
