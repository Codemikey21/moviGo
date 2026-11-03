"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Boton } from "../ui/Boton";
import { Chevron } from "../ui/Chevron";
import { MenuLateral } from "./MenuLateral";

type Enlace = { texto: string; href: string };

type Props = {
  /** Enlaces del centro: los dos primeros van a la izquierda de la marca, el resto a la derecha */
  enlaces: Enlace[];
  menuPrincipales: Enlace[];
  menuSecundarios: Enlace[];
  rutaIniciarSesion: string;
  rutaRegistro: string;
};

// Curva y duración medidas en el sitio de referencia
const curva =
  "duration-[500ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";
const curvaCorta =
  "duration-[334ms] ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none";

/** Enlace del nav: al pasar el mouse entra una flecha por la izquierda. */
function EnlaceNav({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group/enlace relative inline-block py-2 text-[12px] font-bold uppercase leading-none text-bosque"
    >
      <Chevron
        className={`absolute -left-[15px] top-1/2 -translate-x-[5px] -translate-y-1/2 opacity-0 transition-[translate,opacity] group-hover/enlace:translate-x-0 group-hover/enlace:opacity-100 group-focus-visible/enlace:translate-x-0 group-focus-visible/enlace:opacity-100 ${curvaCorta}`}
      />
      {children}
    </a>
  );
}

/** Marca provisional apilada ("MOVI" sobre "GO") hasta tener el logo real. */
function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="MoviGo, inicio"
      className={`flex flex-col items-center text-[13px] font-bold leading-[1.05] tracking-[0.22em] text-bosque ${className}`}
    >
      {/* El margen negativo compensa el espacio que deja el tracking */}
      <span className="-mr-[0.22em]">MOVI</span>
      <span className="-mr-[0.22em]">GO</span>
    </Link>
  );
}

/** Botón de menú: cuadrado con borde fino y dos líneas cortas. */
function BotonMenu({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-controls="menu-principal"
      aria-label="Abrir menú"
      onClick={onClick}
      className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-carbon/10 text-bosque transition-colors hover:bg-blanco/60"
    >
      <span className="flex h-[10px] w-[10px] flex-col justify-between">
        <span className="block h-[2px] w-full rounded-full bg-current" />
        <span className="block h-[2px] w-full rounded-full bg-current" />
      </span>
    </button>
  );
}

/**
 * Barra superior como la de la referencia:
 * - Arriba del todo: transparente sobre el lienzo.
 * - Al bajar: se encoge hasta una pastilla blanca centrada con solo el logo.
 *   Al pasar el mouse por la pastilla (o enfocarla con teclado) se expande.
 * - Al subir: barra blanca completa y redondeada.
 * En celular no hay pastilla: al bajar se muestra la barra blanca completa.
 */
export function Encabezado({
  enlaces,
  menuPrincipales,
  menuSecundarios,
  rutaIniciarSesion,
  rutaRegistro,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [arriba, setArriba] = useState(true);
  const [bajando, setBajando] = useState(false);
  const [escritorio, setEscritorio] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const alCambiar = () => setEscritorio(mq.matches);
    alCambiar();
    mq.addEventListener("change", alCambiar);

    let ultimo = window.scrollY;
    const alScroll = () => {
      const y = window.scrollY;
      setArriba(y < 40);
      if (Math.abs(y - ultimo) > 8) {
        setBajando(y > ultimo && y > 160);
        ultimo = y;
      }
    };
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });

    return () => {
      mq.removeEventListener("change", alCambiar);
      window.removeEventListener("scroll", alScroll);
    };
  }, []);

  const cerrar = useCallback(() => setAbierto(false), []);

  // Pastilla compacta solo en escritorio, bajando y lejos del inicio
  const compacto = escritorio && bajando && !arriba;

  const izquierda = enlaces.slice(0, 2);
  const derecha = enlaces.slice(2);

  // Clases de cada pieza cuando la barra está compacta (y cómo vuelven al pasar el mouse)
  const ocultarIzq = compacto
    ? "pointer-events-none translate-x-[100px] opacity-0 group-hover/barra:pointer-events-auto group-hover/barra:translate-x-0 group-hover/barra:opacity-100 group-focus-within/barra:pointer-events-auto group-focus-within/barra:translate-x-0 group-focus-within/barra:opacity-100"
    : "";
  const ocultarCentro = compacto
    ? "pointer-events-none translate-x-[30px] opacity-0 group-hover/barra:pointer-events-auto group-hover/barra:translate-x-0 group-hover/barra:opacity-100 group-focus-within/barra:pointer-events-auto group-focus-within/barra:translate-x-0 group-focus-within/barra:opacity-100"
    : "";
  const ocultarDer = compacto
    ? "pointer-events-none -translate-x-[100px] opacity-0 group-hover/barra:pointer-events-auto group-hover/barra:translate-x-0 group-hover/barra:opacity-100 group-focus-within/barra:pointer-events-auto group-focus-within/barra:translate-x-0 group-focus-within/barra:opacity-100"
    : "";

  return (
    <>
      <header
        className={`pointer-events-none fixed inset-x-0 top-0 z-50 transition-[padding] ${curva} ${
          arriba ? "p-3 md:px-5 md:py-3" : "p-5 md:px-10 md:py-[10px]"
        }`}
      >
        <div className="group/barra relative mx-auto h-16 max-w-[1440px]">
          {/* Fondo: barra completa o pastilla de 64px centrada */}
          <div
            aria-hidden
            className={`pointer-events-auto absolute top-0 h-16 border transition-[left,width,translate,border-radius,background-color,border-color] ${curva} ${
              arriba
                ? "left-0 w-full rounded-[24px] border-transparent bg-transparent"
                : compacto
                  ? "left-1/2 w-16 -translate-x-1/2 rounded-[16px] border-carbon/10 bg-blanco group-hover/barra:left-0 group-hover/barra:w-full group-hover/barra:translate-x-0 group-hover/barra:rounded-[24px] group-focus-within/barra:left-0 group-focus-within/barra:w-full group-focus-within/barra:translate-x-0 group-focus-within/barra:rounded-[24px]"
                  : "left-0 w-full rounded-[24px] border-carbon/10 bg-blanco"
            }`}
          />

          {/* Contenido */}
          <div className="relative grid h-16 grid-cols-[auto_1fr_auto] items-center px-2 md:grid-cols-[1fr_auto_1fr]">
            {/* Izquierda: botón de menú */}
            <div
              className={`pointer-events-auto flex transition-[translate,opacity] ${curva} ${ocultarIzq}`}
            >
              <BotonMenu onClick={() => setAbierto(true)} />
            </div>

            {/* Centro: enlaces, marca, enlaces (en celular solo la marca) */}
            <nav
              aria-label="Principal"
              className="flex items-center justify-center gap-[46px]"
            >
              {izquierda.map((e) => (
                <span
                  key={e.href}
                  className={`pointer-events-auto hidden transition-[translate,opacity] md:block ${curva} ${ocultarCentro}`}
                >
                  <EnlaceNav href={e.href}>{e.texto}</EnlaceNav>
                </span>
              ))}
              <Logo
                className={`pointer-events-auto transition-[scale] ${curva} ${
                  compacto
                    ? "scale-75 group-hover/barra:scale-100 group-focus-within/barra:scale-100"
                    : "scale-100"
                }`}
              />
              {derecha.map((e) => (
                <span
                  key={e.href}
                  className={`pointer-events-auto hidden transition-[translate,opacity] md:block ${curva} ${ocultarCentro}`}
                >
                  <EnlaceNav href={e.href}>{e.texto}</EnlaceNav>
                </span>
              ))}
            </nav>

            {/* Derecha: cuenta */}
            <div
              className={`pointer-events-auto flex items-center justify-end gap-7 transition-[translate,opacity] ${curva} ${ocultarDer}`}
            >
              <span className="hidden pl-4 lg:block">
                <EnlaceNav href={rutaIniciarSesion}>Iniciar sesión</EnlaceNav>
              </span>
              <span className="md:hidden">
                <Boton href={rutaRegistro} variante="oscuro" tamano="compacto">
                  Registrarse
                </Boton>
              </span>
              <span className="hidden md:block">
                <Boton href={rutaRegistro} variante="oscuro">
                  Registrarse
                </Boton>
              </span>
            </div>
          </div>
        </div>
      </header>

      <MenuLateral
        abierto={abierto}
        onCerrar={cerrar}
        principales={menuPrincipales}
        secundarios={menuSecundarios}
      />
    </>
  );
}
