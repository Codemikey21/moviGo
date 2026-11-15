import type { Metadata } from "next";
// Sustituto abierto de GT Standard (la tipografía de la referencia).
// Se sirve desde el propio proyecto (sin pedirle nada a Google al compilar).
// El eje "opsz" da un corte más fino en tamaños grandes.
import "@fontsource-variable/inter/opsz.css";
import "./globals.css";
import { DefinicionesVehiculos } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/DefinicionesVehiculos";

export const metadata: Metadata = {
  title: "MoviGo | Bicicletas, scooters, motos y más",
  description:
    "Compra, alquila y mantén bicicletas, patinetas, scooters, motos, autos eléctricos y drones. Con domicilios y portal empresarial.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>
        {/* Dibujos de los vehículos: se definen una vez y se reutilizan en todo el sitio */}
        <DefinicionesVehiculos />
        {children}
      </body>
    </html>
  );
}
