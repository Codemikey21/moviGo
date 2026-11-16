import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { requerirRol } from "@/compartido/servidor/autenticacion/guardas";
import { FormularioProducto } from "@/modulos/gestion-catalogo/interfaz/componentes/productos/FormularioProducto";
import { obtenerCategorias } from "@/modulos/gestion-catalogo/servidor/categorias/acciones";
import { EsqueletoLista } from "@/compartido/interfaz/ui/Esqueleto";

export const metadata: Metadata = { title: "Nuevo producto · Administración MoviGo" };

export default function PaginaNuevoProducto() {
  return (
    <main className="mx-auto max-w-[960px] px-3 pb-24 pt-10 md:px-5 md:pt-14">
      <Link href="/admin/inventario" className="text-[14px] text-pizarra hover:text-carbon">
        ← Inventario
      </Link>
      <h1 className="titular mt-4 text-[clamp(40px,5vw,76px)] text-carbon">
        Nuevo producto
      </h1>
      <div className="mt-8 rounded-tarjeta bg-blanco p-6 sm:p-8">
        <Suspense fallback={<EsqueletoLista filas={4} className="" conTitulo={false} />}>
          <Formulario />
        </Suspense>
      </div>
    </main>
  );
}

async function Formulario() {
  await connection();
  await requerirRol("ADMIN_SISTEMA");
  const categorias = await obtenerCategorias();
  return <FormularioProducto categorias={categorias} />;
}
