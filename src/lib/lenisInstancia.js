// Guarda la instancia del scroll suave (Lenis) para que otros módulos
// puedan pausarla, por ejemplo mientras hay un diálogo abierto.
let instancia = null

export function registrarLenis(lenis) {
  instancia = lenis
}

export function obtenerLenis() {
  return instancia
}
