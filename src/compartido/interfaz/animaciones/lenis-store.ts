"use client";

import type Lenis from "lenis";

// Guarda la instancia de Lenis para que otros componentes (por ejemplo el
// menú lateral) puedan detener y reanudar el scroll.
let instancia: Lenis | null = null;

export function guardarLenis(lenis: Lenis | null) {
  instancia = lenis;
}

export function obtenerLenis() {
  return instancia;
}
