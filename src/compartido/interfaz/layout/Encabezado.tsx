"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Boton } from "../ui/Boton";
import { Chevron } from "../ui/Chevron";
import { Icono } from "../ui/Icono";
import { useHaySesion } from "../hooks/useHaySesion";
import { Logo } from "./Logo";
import { MenuLateral } from "./MenuLateral";
import { EVENTO_CARRITO } from "./eventos";

type Enlace = { texto: string; href: string };

type Props = {
  /** Enlaces del centro: los dos primeros van a la izquierda de la marca, el resto a la derecha */
  enlaces: Enlace[];
  menuPrincipales: Enlace[];
  menuSecundarios: Enlace[];
  rutaIniciarSesion: string;
  rutaRegistro: string;
  /** A dónde lleva el botón cuando ya hay sesión */
  rutaCuenta?: string;
  /** Server Action que cuenta lo que hay en el carrito (con sesión) */
  contarCarrito?: () => Promise<number>;
};

/** Carrito con el numerito de unidades. */
function BotonCarrito({ cantidad, salta = false }: { cantidad: number; salta?: boolean }) {
  return (
    <Link
      href="/carrito"
      aria-label={cantidad ? `Carrito, ${cantidad} producto${cantidad === 1 ? "" : "s"}` : "Carrito"}
      className="relative grid size-12 place-items-center rounded-[16px] border border-carbon/10 text-bosque transition-colors hover:bg-blanco"
    >
      <Icono nombre="carrito" className="size-[22px]" />
      {cantidad > 0 && (
        <span
          key={cantidad}
          className={`absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-turquesa px-1 text-[11px] font-bold leading-5 text-carbon ${
            salta ? "insignia-salta" : ""
          }`}
        >
          {cantidad}
        </span>
      )}
    </Link>
  );
}

/**
 * Carrito que se actualiza al cambiar de página. Usa la ruta actual, por eso
 * va dentro de un Suspense (la barra se sigue generando estática).
 */
function CarritoConRuta({ contarCarrito }: { contarCarrito: () => Promise<number> }) {
  const ruta = usePathname();
  const [cantidad, setCantidad] = useState(0);
  const [salta, setSalta] = useState(false);
  const anterior = useRef(0);
  useEffect(() => {
    let vigente = true;
    const contar = (animar: boolean) =>
      contarCarrito()
        .then((n) => {
          if (!vigente) return;
          // La insignia da un saltico solo cuando el carrito crece
          setSalta(animar && n > anterior.current);
          anterior.current = n;
          setCantidad(n);
        })
        .catch(() => {});
    contar(false);
    const alCambiar = () => contar(true);
    window.addEventListener(EVENTO_CARRITO, alCambiar);
    return () => {
      vigente = false;
      window.removeEventListener(EVENTO_CARRITO, alCambiar);
    };
  }, [contarCarrito, ruta]);
  return <BotonCarrito cantidad={cantidad} salta={salta} />;
}

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
      className="group/enlace relative isolate inline-block py-2 text-[12px] font-bold uppercase leading-none text-bosque"
    >
      {/* Pastilla de fondo que aparece al pasar el mouse */}
      <span
        aria-hidden
        className={`absolute -inset-x-[26px] -inset-y-[6px] -z-10 scale-90 rounded-[12px] bg-carbon/[0.06] opacity-0 transition-[scale,opacity] group-hover/enlace:scale-100 group-hover/enlace:opacity-100 group-focus-visible/enlace:scale-100 group-focus-visible/enlace:opacity-100 ${curvaCorta}`}
      />
      <Chevron
        className={`absolute -left-[15px] top-1/2 -translate-x-[5px] -translate-y-1/2 opacity-0 transition-[translate,opacity] group-hover/enlace:translate-x-0 group-hover/enlace:opacity-100 group-focus-visible/enlace:translate-x-0 group-focus-visible/enlace:opacity-100 ${curvaCorta}`}
      />
      {children}
    </a>
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
      className="group/menu flex h-12 w-12 items-center justify-center rounded-[16px] border border-carbon/10 text-bosque transition-[background-color,scale] duration-300 hover:bg-blanco active:scale-95"
    >
      {/* Al pasar el mouse las dos líneas se separan y la de abajo se acorta */}
      <span className="flex h-[10px] w-[12px] flex-col justify-between transition-[height] duration-300 group-hover/menu:h-[12px]">
        <span className="block h-[2px] w-full rounded-full bg-current" />
        <span className="block h-[2px] w-full rounded-full bg-current transition-[width] duration-300 group-hover/menu:w-[60%]" />
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
  rutaCuenta = "/mi-cuenta",
  contarCarrito,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const haySesion = useHaySesion();

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
            data-barra-fondo
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
              className={`pointer-events-auto flex items-center justify-end gap-3 md:gap-5 transition-[translate,opacity] ${curva} ${ocultarDer}`}
            >
              {haySesion ? (
                <>
                  {/* Con sesión: carrito y botón a la cuenta */}
                  {contarCarrito && (
                    <Suspense fallback={<BotonCarrito cantidad={0} />}>
                      <CarritoConRuta contarCarrito={contarCarrito} />
                    </Suspense>
                  )}
                  <span className="md:hidden">
                    <Boton href={rutaCuenta} variante="oscuro" tamano="compacto">
                      Mi cuenta
                    </Boton>
                  </span>
                  <span className="hidden md:block">
                    <Boton href={rutaCuenta} variante="oscuro">
                      Mi cuenta
                    </Boton>
                  </span>
                </>
              ) : (
                <>
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
                </>
              )}
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
