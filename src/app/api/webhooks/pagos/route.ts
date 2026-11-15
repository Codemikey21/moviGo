import { recibirEvento } from "@/modulos/gestion-pagos/servidor/servicio";

// Aviso (webhook) de la pasarela de pagos. Una pasarela real (Wompi,
// Mercado Pago…) llama a esta dirección cuando cambia una transacción.
// El cuerpo viene firmado con PASARELA_SECRETO en la cabecera x-movigo-firma.
export async function POST(request: Request) {
  const cuerpo = await request.text();
  const firma = request.headers.get("x-movigo-firma") ?? "";
  try {
    const valido = await recibirEvento(cuerpo, firma);
    return valido
      ? Response.json({ recibido: true })
      : Response.json({ error: "Firma no válida" }, { status: 401 });
  } catch {
    return Response.json({ error: "Aviso no válido" }, { status: 400 });
  }
}
