import { BotonAccion } from "@/compartido/interfaz/ui/BotonAccion";
import { cerrarSesionAccion, obtenerMiPerfil } from "../../../servidor/acciones";
import type { PerfilUsuario } from "../../../tipos";
import { Aviso } from "../autenticacion/Aviso";

const nombresRol: Record<PerfilUsuario["rol"], string> = {
  CLIENTE: "Cliente",
  EMPRESA: "Empresa",
  DOMICILIARIO: "Domiciliario",
  ADMIN_PUNTO: "Administrador de punto",
  ADMIN_SISTEMA: "Administrador del sistema",
};

const avisos: Record<string, string> = {
  "contrasena-actualizada": "Listo, tu contraseña quedó actualizada.",
  "sin-permiso": "No tienes permiso para entrar a esa sección.",
};

const fecha = new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: "America/Bogota" });

/** Datos de la cuenta de quien inició sesión y el botón para salir. */
export async function ResumenCuenta({ aviso }: { aviso?: string }) {
  const perfil = await obtenerMiPerfil();

  return (
    <div className="space-y-6">
      {aviso && avisos[aviso] && (
        <Aviso tipo={aviso === "sin-permiso" ? "error" : "exito"}>{avisos[aviso]}</Aviso>
      )}

      {!perfil ? (
        <Aviso tipo="error">
          Tu sesión está abierta, pero no encontramos tu perfil de MoviGo. Revisa que la base de
          datos tenga aplicada la migración gestion_usuarios_autenticacion.sql.
        </Aviso>
      ) : (
        <>
          <div>
            <p className="etiqueta text-eucalipto">Mi cuenta</p>
            <h1 className="mt-3 text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-carbon md:text-[56px]">
              Hola, {perfil.nombre.split(" ")[0]}
            </h1>
          </div>

          <dl className="grid gap-px overflow-hidden rounded-tarjeta bg-carbon/10 sm:grid-cols-2">
            {[
              ["Nombre", perfil.nombre],
              ["Correo", perfil.correo],
              ["Celular", perfil.telefono ?? "Sin registrar"],
              ["Tipo de cuenta", nombresRol[perfil.rol]],
              ["Miembro desde", fecha.format(perfil.creadoEn)],
            ].map(([etiqueta, valor]) => (
              <div key={etiqueta} className="bg-escarcha px-6 py-5">
                <dt className="etiqueta text-bruma">{etiqueta}</dt>
                <dd className="mt-2 text-[17px] text-carbon">{valor}</dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <form action={cerrarSesionAccion}>
        <BotonAccion type="submit" variante="secundario">
          Cerrar sesión
        </BotonAccion>
      </form>
    </div>
  );
}
