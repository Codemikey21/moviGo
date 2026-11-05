"use client";

import { useEffect, useState } from "react";
import { FormularioIniciarSesion } from "./FormularioIniciarSesion";
import { FormularioRegistro } from "./FormularioRegistro";
import { MarcoAcceso } from "./MarcoAcceso";

export type Modo = "iniciar-sesion" | "registro";

// Lo que cambia entre las dos pestañas: textos, ruta y foto del panel.
const pestanas: Record<
  Modo,
  {
    pestana: string;
    ruta: string;
    titulo: string;
    texto: string;
    foto: string;
    textoAlt: string;
    frase: string;
    tituloPagina: string;
  }
> = {
  "iniciar-sesion": {
    pestana: "Iniciar sesión",
    ruta: "/iniciar-sesion",
    titulo: "Bienvenido de nuevo",
    texto: "Entra para ver tus compras, alquileres y domicilios.",
    foto: "/img/acceso/iniciar-sesion.jpg",
    textoAlt: "Una mujer abrochándose el casco antes de salir en su moto",
    frase: "Listo para salir.",
    tituloPagina: "Iniciar sesión · MoviGo",
  },
  registro: {
    pestana: "Crear cuenta",
    ruta: "/registro",
    titulo: "Empieza a moverte",
    texto: "Compra, alquila y pide domicilios desde una sola cuenta.",
    foto: "/img/acceso/registro.jpg",
    textoAlt: "Una pareja feliz paseando en scooter eléctrico por un parque",
    frase: "Tu primera ruta empieza aquí.",
    tituloPagina: "Crear cuenta · MoviGo",
  },
};

const orden: Modo[] = ["iniciar-sesion", "registro"];

// Curva y duración medidas en el sitio de referencia
const curva = "duration-[334ms] ease-[cubic-bezier(0.2,0,0,1)]";

/**
 * Pantalla de acceso: formulario a la izquierda con dos pestañas que se
 * deslizan (iniciar sesión / crear cuenta) y foto a la derecha que se funde
 * a la otra al cambiar. Cambia la URL sin recargar la página.
 */
export function Acceso({ modoInicial }: { modoInicial: Modo }) {
  const [modo, setModo] = useState<Modo>(modoInicial);
  // Hacia qué lado entra el formulario nuevo
  const [direccion, setDireccion] = useState<"derecha" | "izquierda">("derecha");

  function cambiar(nuevo: Modo) {
    if (nuevo === modo) return;
    setDireccion(orden.indexOf(nuevo) > orden.indexOf(modo) ? "derecha" : "izquierda");
    setModo(nuevo);
    // La URL sigue a la pestaña, sin recargar ni mover el scroll
    window.history.replaceState(null, "", pestanas[nuevo].ruta);
  }

  // El título de la pestaña del navegador también sigue a la pestaña elegida
  useEffect(() => {
    document.title = pestanas[modo].tituloPagina;
  }, [modo]);

  const actual = pestanas[modo];

  return (
    <MarcoAcceso
      panel={
        <>
          {orden.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element -- las fotos ya están optimizadas
            <img
              key={m}
              src={pestanas[m].foto}
              alt={modo === m ? pestanas[m].textoAlt : ""}
              aria-hidden={modo !== m}
              className={`absolute inset-0 h-full w-full object-cover transition-[opacity,scale] duration-[900ms] ease-[cubic-bezier(0.2,0,0,1)] ${
                modo === m ? "scale-100 opacity-100" : "scale-[1.04] opacity-0"
              }`}
            />
          ))}
          {/* Degradado para que el texto se lea sobre cualquier foto */}
          <div className="absolute inset-0 bg-gradient-to-t from-carbon/60 via-carbon/0 to-carbon/0" />
          <p
            key={modo}
            className={`absolute bottom-10 left-10 right-10 max-w-[460px] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-blanco ${
              direccion === "derecha" ? "entrar-desde-derecha" : "entrar-desde-izquierda"
            }`}
          >
            {actual.frase}
          </p>
        </>
      }
    >
      {/* Selector de pestañas: la pastilla blanca se desliza */}
      <div
        role="tablist"
        aria-label="Acceso a MoviGo"
        className="relative grid grid-cols-2 rounded-[18px] bg-escarcha p-1"
      >
        <span
          aria-hidden
          className={`absolute bottom-1 left-1 top-1 w-[calc(50%-4px)] rounded-[14px] bg-blanco shadow-[0_1px_2px_rgba(13,18,18,0.08)] transition-[translate] ${curva} ${
            modo === "registro" ? "translate-x-full" : "translate-x-0"
          }`}
        />
        {orden.map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            id={`pestana-${m}`}
            aria-selected={modo === m}
            aria-controls="panel-acceso"
            onClick={() => cambiar(m)}
            className={`relative z-10 h-11 rounded-[14px] text-[13px] font-bold uppercase tracking-[0.02em] transition-colors ${curva} ${
              modo === m ? "text-carbon" : "text-bruma hover:text-carbon"
            }`}
          >
            {pestanas[m].pestana}
          </button>
        ))}
      </div>

      {/* Contenido: entra deslizándose desde el lado de la pestaña */}
      <div
        key={modo}
        id="panel-acceso"
        role="tabpanel"
        aria-labelledby={`pestana-${modo}`}
        className={`mt-10 ${
          direccion === "derecha" ? "entrar-desde-derecha" : "entrar-desde-izquierda"
        }`}
      >
        <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-carbon">
          {actual.titulo}
        </h1>
        <p className="mt-3 text-[16px] text-pizarra">{actual.texto}</p>

        <div className="mt-8">
          {modo === "iniciar-sesion" ? (
            <FormularioIniciarSesion alCambiar={() => cambiar("registro")} />
          ) : (
            <FormularioRegistro alCambiar={() => cambiar("iniciar-sesion")} />
          )}
        </div>
      </div>
    </MarcoAcceso>
  );
}
