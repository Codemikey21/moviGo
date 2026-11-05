import type { Metadata } from "next";
import { Acceso } from "@/modulos/gestion-usuarios/interfaz/componentes/autenticacion/Acceso";

export const metadata: Metadata = {
  title: "Crear cuenta · MoviGo",
};

export default function PaginaRegistro() {
  return <Acceso modoInicial="registro" />;
}
