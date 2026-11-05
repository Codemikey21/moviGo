import type { Metadata } from "next";
import { Acceso } from "@/modulos/gestion-usuarios/interfaz/componentes/autenticacion/Acceso";

export const metadata: Metadata = {
  title: "Iniciar sesión · MoviGo",
};

export default function PaginaIniciarSesion() {
  return <Acceso modoInicial="iniciar-sesion" />;
}
