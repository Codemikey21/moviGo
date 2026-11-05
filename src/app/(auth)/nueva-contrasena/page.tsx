import type { Metadata } from "next";
import { FormularioNuevaContrasena } from "@/modulos/gestion-usuarios/interfaz/componentes/autenticacion/FormularioNuevaContrasena";
import { MarcoAcceso, PanelFoto } from "@/modulos/gestion-usuarios/interfaz/componentes/autenticacion/MarcoAcceso";

export const metadata: Metadata = {
  title: "Nueva contraseña · MoviGo",
};

// Se llega aquí desde el enlace del correo de recuperación, que ya abrió
// la sesión. Sin sesión, el proxy manda a iniciar sesión.
export default function PaginaNuevaContrasena() {
  return (
    <MarcoAcceso
      panel={
        <PanelFoto
          foto="/img/acceso/iniciar-sesion.jpg"
          textoAlt="Una mujer abrochándose el casco antes de salir en su moto"
          frase="Casi listo para salir."
        />
      }
    >
      <FormularioNuevaContrasena />
    </MarcoAcceso>
  );
}
