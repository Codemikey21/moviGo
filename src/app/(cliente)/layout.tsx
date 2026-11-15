import type { ReactNode } from "react";
import { ScrollSuave } from "@/compartido/interfaz/animaciones/ScrollSuave";
import { Encabezado } from "@/compartido/interfaz/layout/Encabezado";
import { PieDePagina } from "@/compartido/interfaz/layout/PieDePagina";
import { contarMiCarrito } from "@/modulos/gestion-pedidos/servidor/carrito/acciones";
import {
  menu,
  pie,
  RUTA_INICIAR_SESION,
  RUTA_REGISTRO,
} from "./_landing/contenido";

// Todo lo que ve el cliente comparte encabezado, pie y scroll suave.
export default function LayoutCliente({ children }: { children: ReactNode }) {
  return (
    <>
      <ScrollSuave />
      <Encabezado
        enlaces={menu.principales}
        menuPrincipales={menu.principales}
        menuSecundarios={menu.secundarios}
        rutaIniciarSesion={RUTA_INICIAR_SESION}
        rutaRegistro={RUTA_REGISTRO}
        contarCarrito={contarMiCarrito}
      />
      {children}
      <PieDePagina
        mapa={pie.mapa}
        cuenta={pie.cuenta}
        boletin={pie.boletin}
        legales={pie.legales}
        foto={pie.foto}
        legal={pie.legal}
        anio={pie.anio}
      />
    </>
  );
}
