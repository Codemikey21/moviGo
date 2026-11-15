import "server-only";

// Reglas del portal del domiciliario: ver sus entregas, tomar las libres,
// aceptar o rechazar las que le asignan, salir a ruta, mandar su posición
// y entregar con el código del cliente (y una foto si quiere).
import { ErrorDominio } from "@/compartido/servidor/errores/errores";
import { supabaseConfigurado } from "@/compartido/servidor/supabase/config";
import { crearClienteServidor } from "@/compartido/servidor/supabase/servidor";
import { hoyEnColombia } from "@/compartido/utilidades/formato";
import { MAXIMO_ACTIVAS_REPARTO, type DomicilioVista, type EntregaReparto, type ResumenReparto } from "../../tipos";
import * as domicilios from "../domicilios/servicio";
import * as repoDomicilios from "../domicilios/repositorio";
import { distancia } from "../domicilios/ruta";
import * as repositorio from "./repositorio";

const MAXIMO_ACTIVAS = MAXIMO_ACTIVAS_REPARTO;

const BUCKET_EVIDENCIAS = "evidencias";

/** El domiciliario nunca recibe el código de entrega ni el valor del domicilio. */
function aEntrega(d: DomicilioVista, evidencia: EntregaReparto["evidencia"] = null): EntregaReparto {
  return {
    id: d.id,
    estado: d.estado,
    descripcion: d.descripcion,
    creadaEn: d.creadaEn,
    asignadoEn: d.asignadoEn,
    aceptadoEn: d.aceptadoEn,
    entregadoEn: d.entregadoEn,
    pedidoId: d.pedidoId,
    pedidoNumero: d.pedidoNumero,
    alquilerId: d.alquilerId,
    cliente: d.cliente,
    origen: d.origen,
    destino: d.destino,
    listoParaDespachar: d.listoParaDespachar,
    distancia: Math.round(distancia(d.origen, d.destino)),
    evidencia,
  };
}

export async function perfil(usuarioId: string) {
  const p = await repositorio.perfil(usuarioId);
  if (!p) throw new ErrorDominio("Tu cuenta todavía no está registrada como domiciliario.", "sin-perfil");
  return p;
}

export async function resumen(usuarioId: string): Promise<ResumenReparto> {
  const inicioHoy = new Date(`${hoyEnColombia()}T00:00:00-05:00`);
  const inicioSemana = new Date(`${hoyEnColombia(-6)}T00:00:00-05:00`);
  const [hoy, semana, total] = await Promise.all([
    repositorio.contarEntregadas(usuarioId, inicioHoy),
    repositorio.contarEntregadas(usuarioId, inicioSemana),
    repositorio.contarEntregadas(usuarioId),
  ]);
  return { hoy, semana, total };
}

export async function activas(usuarioId: string) {
  return (await repositorio.activas(usuarioId)).map((d) => aEntrega(d));
}

/** Libres para tomar: solo se muestran a quien está disponible. */
export async function libres(usuarioId: string) {
  const p = await perfil(usuarioId);
  if (!p.disponible) return [];
  return (await repositorio.libres()).map((d) => aEntrega(d));
}

export async function historial(usuarioId: string) {
  return (await repositorio.historial(usuarioId)).map((d) => aEntrega(d));
}

/** Enlace temporal (10 minutos) para ver la foto de una entrega. */
export async function urlEvidencia(ruta: string): Promise<string | null> {
  if (!supabaseConfigurado()) return null;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.storage.from(BUCKET_EVIDENCIAS).createSignedUrl(ruta, 600);
  return data?.signedUrl ?? null;
}

export async function entrega(id: string, usuarioId: string): Promise<EntregaReparto | null> {
  const d = await repositorio.buscarDe(id, usuarioId);
  if (!d) return null;
  let evidencia: EntregaReparto["evidencia"] = null;
  if (d.estado === "COMPLETADO") {
    const e = (await repoDomicilios.evidenciasDe([d.id])).get(d.id);
    if (e) evidencia = { url: await urlEvidencia(e.ruta), nombreReceptor: e.nombreReceptor };
  }
  return aEntrega(d, evidencia);
}

async function exigirMia(id: string, usuarioId: string) {
  const d = await repositorio.buscarDe(id, usuarioId);
  if (!d) throw new ErrorDominio("Esta entrega no está a tu nombre.", "ajena");
  return d;
}

export async function cambiarDisponible(usuarioId: string, disponible: boolean) {
  await perfil(usuarioId);
  await repositorio.cambiarDisponible(usuarioId, disponible);
}

export async function tomar(id: string, usuarioId: string) {
  const p = await perfil(usuarioId);
  if (!p.disponible) throw new ErrorDominio("Actívate como disponible para tomar entregas.", "no-disponible");
  const enMano = await repositorio.activas(usuarioId);
  if (enMano.length >= MAXIMO_ACTIVAS) {
    throw new ErrorDominio(`Ya llevas ${MAXIMO_ACTIVAS} entregas. Termina una antes de tomar otra.`, "limite");
  }
  await domicilios.tomar(id, usuarioId);
}

export const aceptar = (id: string, usuarioId: string) => domicilios.aceptar(id, usuarioId);
export const rechazar = (id: string, usuarioId: string) => domicilios.rechazar(id, usuarioId);

/** Ya recogió en el punto: sale a ruta y el cliente empieza a verlo en el mapa. */
export async function salir(id: string, usuarioId: string) {
  const d = await exigirMia(id, usuarioId);
  if (d.estado !== "ASIGNADO") throw new ErrorDominio("Esta entrega ya salió a ruta.", "estado");
  if (!d.aceptadoEn) throw new ErrorDominio("Primero acepta la entrega.", "sin-aceptar");
  await domicilios.iniciarRuta(id);
}

export async function registrarPosicion(id: string, usuarioId: string, posicion: { latitud: number; longitud: number }) {
  const d = await exigirMia(id, usuarioId);
  if (d.estado !== "EN_CURSO") return;
  await domicilios.registrarPosicion(id, posicion);
  await repositorio.actualizarPosicion(usuarioId, posicion.latitud, posicion.longitud);
}

// Intentos fallidos del código por entrega (en memoria: frena a quien prueba códigos al azar)
const intentos = new Map<string, { fallos: number; desde: number }>();
const MAXIMO_FALLOS = 5;
const VENTANA_MS = 10 * 60_000;

export async function entregar(
  id: string,
  usuarioId: string,
  datos: { codigo: string; foto: string | null; receptor: string | null },
) {
  const d = await exigirMia(id, usuarioId);
  if (d.estado !== "EN_CURSO") throw new ErrorDominio("Esta entrega no está en ruta.", "estado");

  const registro = intentos.get(id);
  if (registro && Date.now() - registro.desde < VENTANA_MS && registro.fallos >= MAXIMO_FALLOS) {
    throw new ErrorDominio("Demasiados intentos. Espera unos minutos o llama a soporte.", "bloqueado");
  }
  if (datos.codigo !== d.codigoEntrega) {
    const vigente = registro && Date.now() - registro.desde < VENTANA_MS ? registro : { fallos: 0, desde: Date.now() };
    intentos.set(id, { ...vigente, fallos: vigente.fallos + 1 });
    throw new ErrorDominio("El código no coincide. Pídeselo de nuevo al cliente.", "codigo");
  }
  intentos.delete(id);

  if (datos.foto) {
    if (!datos.foto.startsWith(`${id}/`)) throw new ErrorDominio("La foto no corresponde a esta entrega.", "foto");
    await repoDomicilios.guardarEvidencia(id, datos.foto, datos.receptor);
  }
  await domicilios.completar(id, usuarioId);
}
