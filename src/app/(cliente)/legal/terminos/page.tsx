import type { Metadata } from "next";
import { DocumentoLegal, EnlaceLegal, type SeccionLegal } from "../_componentes/DocumentoLegal";

export const metadata: Metadata = { title: "Términos de uso · MoviGo" };

const secciones: SeccionLegal[] = [
  {
    titulo: "Quiénes somos",
    parrafos: [
      "MoviGo vende, alquila, entrega y repara vehículos de movilidad personal (bicicletas, scooters, motos, autos eléctricos, drones, patinetas y accesorios) en el área metropolitana de Bucaramanga.",
      "Estos términos aplican a todo el que visita el sitio, crea una cuenta, compra, alquila o pide un servicio de taller. Al registrarte o hacer un pedido, los aceptas.",
    ],
  },
  {
    titulo: "Tu cuenta",
    lista: [
      "Para comprar o alquilar debes ser mayor de edad y crear una cuenta con datos reales: nombre, correo y teléfono.",
      "Puedes entrar con tu correo y contraseña o con tu cuenta de Google. Cuida tu contraseña: lo que se haga con tu cuenta se entiende hecho por ti.",
      "Si notas un acceso que no reconoces, cambia tu contraseña y escríbenos.",
      "Podemos suspender cuentas que se usen para fraudes, pagos no autorizados o para dañar la plataforma.",
    ],
  },
  {
    titulo: "Precios y pagos",
    lista: [
      "Los precios están en pesos colombianos y ya incluyen IVA. El valor que ves en la pantalla de pago es el que se cobra.",
      "Puedes pagar con tarjeta débito o crédito, Nequi o PSE. Tu pedido queda confirmado cuando el pago es aprobado.",
      "MoviGo no guarda el número completo de tu tarjeta: solo los últimos cuatro dígitos, para que reconozcas el pago.",
      "Si un pago se rechaza, no se te cobra nada y puedes intentarlo de nuevo con otro método.",
    ],
  },
  {
    titulo: "Entregas y domicilios",
    parrafos: [
      <>
        Puedes recoger tu pedido en uno de nuestros puntos o pedirlo a domicilio dentro de las{" "}
        <EnlaceLegal href="/cobertura">zonas de cobertura</EnlaceLegal>. El domicilio tiene un valor fijo que se muestra antes de pagar.
      </>,
      "Puedes seguir la entrega en el mapa desde tu cuenta. Al recibir, revisa el vehículo frente al domiciliario; si algo no está bien, déjalo anotado y escríbenos ese mismo día.",
    ],
  },
  {
    titulo: "Alquileres",
    lista: [
      "Los alquileres son por días. El vehículo se entrega revisado, cargado y con casco.",
      "Debes devolverlo en la fecha acordada y en el mismo estado en que lo recibiste. Cada día de retraso se cobra a la tarifa diaria vigente.",
      "Los daños causados por mal uso, choques o pérdida de piezas se cobran según la valoración de nuestro taller, que te mostramos antes de cobrar.",
      "Debes manejar con el equipo de seguridad y respetar las normas de tránsito. Las multas que se generen durante el alquiler son responsabilidad de quien alquila.",
    ],
  },
  {
    titulo: "Retracto, cambios y garantía",
    parrafos: [
      "Si compraste en línea, tienes cinco (5) días hábiles desde que recibes el producto para retractarte, como lo establece el Estatuto del Consumidor (Ley 1480 de 2011). El producto debe estar sin uso, completo y en su empaque. Te devolvemos el dinero en un plazo máximo de treinta (30) días calendario.",
      "El retracto no aplica a alquileres que ya empezaron ni a servicios de taller ya realizados con tu aprobación.",
      "Todos los productos nuevos tienen la garantía legal. Si algo falla, escríbenos o lleva el vehículo a un punto MoviGo: nuestro taller lo revisa y, si aplica, lo repara o lo cambia sin costo.",
    ],
  },
  {
    titulo: "Mantenimiento y taller",
    parrafos: [
      "Cuando pides un mantenimiento, primero hacemos el diagnóstico y te enviamos la cotización. No hacemos ningún trabajo hasta que la apruebes desde tu cuenta.",
      "Te avisamos cuando el vehículo esté listo para recoger o cuando salga hacia tu dirección.",
    ],
  },
  {
    titulo: "Uso del sitio",
    lista: [
      "No uses MoviGo para actividades ilegales, para suplantar a otra persona ni para intentar entrar a partes del sistema que no te corresponden.",
      "Los textos, fotos, dibujos y la marca MoviGo son de MoviGo o de sus dueños, y no se pueden copiar sin permiso.",
      "Hacemos lo posible para que el sitio funcione siempre, pero puede haber pausas por mantenimiento o fallas de terceros.",
    ],
  },
  {
    titulo: "Cambios a estos términos",
    parrafos: [
      "Podemos actualizar estos términos cuando cambien nuestros servicios o la ley. La fecha de arriba indica la última versión. Los pedidos ya hechos se rigen por los términos vigentes en el momento de la compra.",
      "Estos términos se rigen por las leyes de la República de Colombia.",
    ],
  },
];

export default function PaginaTerminos() {
  return (
    <DocumentoLegal
      actual="terminos"
      titulo={
        <>
          Términos <span className="text-eucalipto">de uso</span>
        </>
      }
      intro="Las reglas para comprar, alquilar y usar MoviGo, dichas sin letra pequeña."
      secciones={secciones}
    />
  );
}
