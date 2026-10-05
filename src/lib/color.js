// Luminancia percibida de un color hexadecimal (0 = negro, 1 = blanco).
export function luminancia(hex) {
  const limpio = hex.replace('#', '')
  const rojo = parseInt(limpio.slice(0, 2), 16)
  const verde = parseInt(limpio.slice(2, 4), 16)
  const azul = parseInt(limpio.slice(4, 6), 16)

  return (0.2126 * rojo + 0.7152 * verde + 0.0722 * azul) / 255
}

// Indica si un color es lo bastante claro como para necesitar texto oscuro encima.
export function esColorClaro(hex) {
  return luminancia(hex) > 0.6
}
