import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoviGo",
  description:
    "Venta y alquiler de bicicletas, patinetas, motos y vehículos eléctricos, con domicilios y mantenimiento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
