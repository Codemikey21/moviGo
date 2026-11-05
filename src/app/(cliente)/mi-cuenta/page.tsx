import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { ResumenCuenta } from "@/modulos/gestion-usuarios/interfaz/componentes/cuenta/ResumenCuenta";

export const metadata: Metadata = {
  title: "Mi cuenta · MoviGo",
};

// Solo entra quien tiene sesión: el proxy manda a los demás a iniciar sesión.
export default function PaginaMiCuenta({ searchParams }: PageProps<"/mi-cuenta">) {
  return (
    <main className="contenedor min-h-svh pb-24 pt-36">
      <div className="mx-auto max-w-[760px]">
        <Suspense fallback={<p className="text-pizarra">Cargando tu cuenta…</p>}>
          <Contenido searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/mi-cuenta">, "searchParams">) {
  // Esta parte depende de quién entra: se arma en cada visita, nunca al compilar.
  await connection();
  const { aviso } = await searchParams;
  return <ResumenCuenta aviso={typeof aviso === "string" ? aviso : undefined} />;
}
