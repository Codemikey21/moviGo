import "server-only";

// Adaptador de la pasarela de pagos.
//
// MoviGo habla con la pasarela solo a través de esta interfaz. Hoy es una
// pasarela simulada (proyecto académico); para usar una real como Wompi o
// Mercado Pago se escribe otra clase con la misma forma y se cambia en
// pasarelaActual. El resto del sistema no se entera.
//
// Tarjetas de prueba (cualquier nombre, fecha futura y CVV de 3 dígitos):
//   4242 4242 4242 4242 → aprobada
//   4000 0000 0000 0002 → rechazada (fondos insuficientes)
//   cualquier otra válida → aprobada
// Nequi: 300 000 0002 → rechazado; cualquier otro celular → aprobado.
// PSE: el banco "Banco de pruebas (rechaza)" rechaza; los demás aprueban.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { MetodoPago } from "../tipos";

export type SolicitudCobro =
  | { metodo: "TARJETA"; numero: string; nombre: string; vence: string; cvv: string; cuotas: number }
  | { metodo: "NEQUI"; celular: string }
  | { metodo: "PSE"; banco: string; tipoPersona: "NATURAL" | "JURIDICA"; documento: string };

export type RespuestaPasarela = {
  estado: "APROBADO" | "RECHAZADO";
  transaccionId: string;
  metodo: MetodoPago;
  /** "Visa •••• 4242", "Nequi 300 •••• 4567", "PSE · Bancolombia" */
  detalle: string;
  motivo: string | null;
};

export interface Pasarela {
  cobrar(referencia: string, monto: number, solicitud: SolicitudCobro): Promise<RespuestaPasarela>;
}

export const BANCOS_PSE = [
  "Bancolombia",
  "Banco de Bogotá",
  "Davivienda",
  "BBVA Colombia",
  "Banco de Occidente",
  "Banco Caja Social",
  "Nu Colombia",
  "Banco de pruebas (rechaza)",
];

function marcaTarjeta(numero: string) {
  if (/^4/.test(numero)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(numero)) return "Mastercard";
  if (/^3[47]/.test(numero)) return "American Express";
  return "Tarjeta";
}

const espera = (ms: number) => new Promise((r) => setTimeout(r, ms));

class PasarelaSimulada implements Pasarela {
  async cobrar(_referencia: string, _monto: number, s: SolicitudCobro): Promise<RespuestaPasarela> {
    // Una pasarela real se demora un poco en responder
    await espera(1200);
    const transaccionId = `TX-${randomBytes(6).toString("hex").toUpperCase()}`;

    if (s.metodo === "TARJETA") {
      const rechazada = s.numero.endsWith("0002");
      return {
        estado: rechazada ? "RECHAZADO" : "APROBADO",
        transaccionId,
        metodo: "TARJETA",
        detalle: `${marcaTarjeta(s.numero)} •••• ${s.numero.slice(-4)}`,
        motivo: rechazada ? "Fondos insuficientes" : null,
      };
    }
    if (s.metodo === "NEQUI") {
      const rechazada = s.celular === "3000000002";
      return {
        estado: rechazada ? "RECHAZADO" : "APROBADO",
        transaccionId,
        metodo: "NEQUI",
        detalle: `Nequi ${s.celular.slice(0, 3)} •••• ${s.celular.slice(-4)}`,
        motivo: rechazada ? "El pago no fue aceptado en la app de Nequi" : null,
      };
    }
    const rechazada = s.banco === "Banco de pruebas (rechaza)";
    return {
      estado: rechazada ? "RECHAZADO" : "APROBADO",
      transaccionId,
      metodo: "PSE",
      detalle: `PSE · ${s.banco}`,
      motivo: rechazada ? "El banco no autorizó la transacción" : null,
    };
  }
}

export const pasarelaActual: Pasarela = new PasarelaSimulada();

// ---------------------------------------------------------------------------
// Firma de los avisos (webhooks). La pasarela firma cada aviso con un
// secreto compartido; MoviGo solo acepta avisos con la firma correcta.
// ---------------------------------------------------------------------------
const secreto = () => process.env.PASARELA_SECRETO || "movigo-pasarela-de-prueba";

export function firmar(cuerpo: string) {
  return createHmac("sha256", secreto()).update(cuerpo).digest("hex");
}

export function firmaValida(cuerpo: string, firma: string) {
  const esperada = Buffer.from(firmar(cuerpo), "hex");
  const recibida = Buffer.from(firma, "hex");
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
