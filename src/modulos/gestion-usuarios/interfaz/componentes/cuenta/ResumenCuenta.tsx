import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { cerrarSesionAccion } from "../../../servidor/acciones";
import type { PerfilUsuario } from "../../../tipos";

const nombresRol: Record<PerfilUsuario["rol"], string> = {
  CLIENTE: "Cliente",
  EMPRESA: "Empresa",
  DOMICILIARIO: "Domiciliario",
  ADMIN_PUNTO: "Administrador de punto",
  ADMIN_SISTEMA: "Administrador del sistema",
};

const fecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" });

/** Datos de la cuenta y el botón para salir. */
export function ResumenCuenta({ perfil }: { perfil: PerfilUsuario }) {
  const datos = [
    ["Nombre", perfil.nombre],
    ["Correo", perfil.correo],
    ["Celular", perfil.telefono ?? "Sin registrar"],
    ["Tipo de cuenta", nombresRol[perfil.rol]],
    ["Miembro desde", fecha.format(perfil.creadoEn)],
  ];
  return (
    <div>
      <dl className="grid gap-px overflow-hidden rounded-[28px] bg-carbon/10 sm:grid-cols-2">
        {datos.map(([etiqueta, valor], i) => (
          <div
            key={etiqueta}
            // Si el último queda solo en su fila, ocupa las dos columnas
            className={`bg-escarcha px-6 py-5 ${i === datos.length - 1 && datos.length % 2 === 1 ? "sm:col-span-2" : ""}`}
          >
            <dt className="etiqueta text-bruma">{etiqueta}</dt>
            <dd className="mt-2 truncate text-[17px] text-carbon">{valor}</dd>
          </div>
        ))}
      </dl>
      <form action={cerrarSesionAccion} className="mt-5">
        <BotonAccion type="submit" variante="secundario">
          Cerrar sesión
        </BotonAccion>
      </form>
    </div>
  );
}
