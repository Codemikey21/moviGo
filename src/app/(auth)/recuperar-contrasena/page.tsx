import type { Metadata } from "next";
import { FormularioRecuperar } from "@/modulos/gestion-usuarios/interfaz/componentes/autenticacion/FormularioRecuperar";
import { MarcoAcceso, PanelFoto } from "@/modulos/gestion-usuarios/interfaz/componentes/autenticacion/MarcoAcceso";

export const metadata: Metadata = {
  title: "Recuperar contraseña · MoviGo",
};

export default function PaginaRecuperarContrasena() {
  return (
    <MarcoAcceso
      panel={
        <PanelFoto
          foto="/img/acceso/iniciar-sesion.jpg"
          textoAlt="Una mujer abrochándose el casco antes de salir en su moto"
          frase="Te ayudamos a volver."
        />
      }
    >
      <FormularioRecuperar />
    </MarcoAcceso>
  );
}
