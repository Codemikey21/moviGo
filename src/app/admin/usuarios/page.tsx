import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import { Icono } from "@/compartido/interfaz/ui/Icono";
import { Insignia } from "@/compartido/interfaz/ui/Insignia";
import { requerirAdministrador } from "@/compartido/servidor/autenticacion/guardas";
import { formatoDia } from "@/compartido/utilidades/formato";
import { obtenerPuntos } from "@/modulos/gestion-almacen/servidor/stock/acciones";
import { CambiarRol } from "@/modulos/gestion-usuarios/interfaz/componentes/administracion/CambiarRol";
import { listarUsuariosAdmin } from "@/modulos/gestion-usuarios/servidor/acciones";
import { EncabezadoAdmin } from "../_componentes/EncabezadoAdmin";

export const metadata: Metadata = { title: "Usuarios · Administración MoviGo" };

const nombresRol = {
  CLIENTE: "Cliente",
  EMPRESA: "Empresa",
  DOMICILIARIO: "Domiciliario",
  ADMIN_PUNTO: "Admin de punto",
  ADMIN_SISTEMA: "Admin del sistema",
} as const;

export default function PaginaUsuariosAdmin({ searchParams }: PageProps<"/admin/usuarios">) {
  return (
    <main className="mx-auto max-w-[1440px] px-3 pb-24 md:px-5">
      <Suspense fallback={<p className="pt-16 text-pizarra">Cargando usuarios…</p>}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Contenido({ searchParams }: Pick<PageProps<"/admin/usuarios">, "searchParams">) {
  await connection();
  const admin = await requerirAdministrador();
  const { q } = await searchParams;
  const busqueda = typeof q === "string" ? q : undefined;
  const [usuarios, puntos] = await Promise.all([listarUsuariosAdmin(busqueda), obtenerPuntos()]);
  const puedeCambiar = admin.rol === "ADMIN_SISTEMA";

  return (
    <>
      <EncabezadoAdmin
        etiqueta="Personas"
        titulo={
          <>
            Usuarios <span className="text-eucalipto">de MoviGo</span>
          </>
        }
        descripcion="Clientes, domiciliarios y administradores. El administrador del sistema puede cambiar los roles."
        acciones={
          <form action="/admin/usuarios" className="relative w-full sm:w-80">
            <Icono nombre="buscar" className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-bruma" />
            <input
              type="search"
              name="q"
              defaultValue={busqueda}
              placeholder="Buscar por nombre o correo"
              aria-label="Buscar usuario"
              className="h-12 w-full rounded-full border border-transparent bg-blanco pl-11 pr-4 text-[15px] outline-none focus:border-carbon"
            />
          </form>
        }
      />

      <section className="rounded-tarjeta bg-blanco p-3 sm:p-5">
        <ul className="divide-y divide-carbon/[0.07]">
          {usuarios.map((u) => (
            <li key={u.id} className="grid items-center gap-4 px-3 py-4 md:grid-cols-[auto_1.4fr_1fr_auto]">
              <span className="grid size-11 place-items-center rounded-full bg-salvia text-[14px] font-semibold text-bosque">
                {u.nombre
                  .split(" ")
                  .slice(0, 2)
                  .map((p) => p[0])
                  .join("")
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[16px] text-carbon">
                  {u.nombre} {u.id === admin.id && <span className="text-[13px] text-pizarra">(tú)</span>}
                </p>
                <p className="truncate text-[13px] text-pizarra">{u.correo}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[13px] text-pizarra">
                <Insignia tono={u.rol.startsWith("ADMIN") ? "oscuro" : u.rol === "DOMICILIARIO" ? "salvia" : "gris"}>
                  {nombresRol[u.rol]}
                  {u.puntoAsignado ? ` · ${u.puntoAsignado.replace("MoviGo ", "")}` : ""}
                  {u.rol === "DOMICILIARIO" && u.vehiculo ? ` · ${u.vehiculo}` : ""}
                </Insignia>
                <span>
                  {u.pedidos} pedido{u.pedidos === 1 ? "" : "s"} · {u.alquileres} alquiler{u.alquileres === 1 ? "" : "es"} · desde{" "}
                  {formatoDia.format(u.creadoEn)}
                </span>
              </div>
              <div>
                {puedeCambiar && u.id !== admin.id && (
                  <CambiarRol key={`${u.rol}-${u.vehiculo ?? ""}`} usuarioId={u.id} rol={u.rol} vehiculo={u.vehiculo} puntos={puntos.map((p) => ({ id: p.id, nombre: p.nombre }))} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
