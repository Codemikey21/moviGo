import { CampoSelect } from "@/compartido/interfaz/ui/CampoSelect";
import { CampoTexto } from "@/compartido/interfaz/ui/CampoTexto";
import { barrios } from "@/compartido/utilidades/barrios";

type Props = {
  valores?: Record<string, string>;
  errores?: Partial<Record<string, string>>;
};

/** Dirección de entrega: calle, barrio (de la lista) e indicaciones. */
export function CamposDireccion({ valores, errores }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <CampoTexto
        className="sm:col-span-2"
        etiqueta="Dirección"
        name="direccion"
        placeholder="Calle 48 # 27-15, apto 302"
        autoComplete="street-address"
        defaultValue={valores?.direccion}
        error={errores?.direccion}
      />
      <CampoSelect
        etiqueta="Barrio"
        name="barrio"
        vacio="Elige tu barrio"
        defaultValue={valores?.barrio ?? ""}
        opciones={barrios.map((b) => ({ valor: b.nombre, texto: `${b.nombre} · ${b.ciudad}` }))}
        error={errores?.barrio}
      />
      <CampoTexto
        etiqueta="Indicaciones (opcional)"
        name="indicaciones"
        placeholder="Portería, torre 2"
        defaultValue={valores?.indicaciones}
        error={errores?.indicaciones}
      />
    </div>
  );
}
