import type { Metadata } from "next";
import { DocumentoLegal, EnlaceLegal, type SeccionLegal } from "../_componentes/DocumentoLegal";

export const metadata: Metadata = { title: "Política de privacidad · MoviGo" };

const secciones: SeccionLegal[] = [
  {
    titulo: "Responsable de tus datos",
    parrafos: [
      "MoviGo, con domicilio en Bucaramanga, Santander (Colombia), es responsable del tratamiento de los datos personales que recoge en este sitio.",
      <>
        Tratamos tus datos según la Ley 1581 de 2012 y sus decretos reglamentarios. Para cualquier solicitud sobre tus datos, escríbenos desde la{" "}
        <EnlaceLegal href="/contacto">página de contacto</EnlaceLegal>.
      </>,
    ],
  },
  {
    titulo: "Qué datos recogemos",
    lista: [
      "Datos de tu cuenta: nombre, correo, teléfono y, si entras con Google, tu nombre y correo de esa cuenta.",
      "Direcciones de entrega y el barrio, para ubicar el domicilio en el mapa.",
      "Lo que haces en MoviGo: compras, alquileres, solicitudes de taller y cotizaciones para empresas.",
      "Datos del pago: método, banco, estado y los últimos cuatro dígitos de la tarjeta. Nunca el número completo ni el código de seguridad.",
      "Los mensajes que nos envías y, si te suscribes, el correo del boletín.",
      "La ubicación del domiciliario mientras hace una entrega. No pedimos ni guardamos la ubicación GPS de los clientes.",
    ],
  },
  {
    titulo: "Para qué los usamos",
    lista: [
      "Crear y proteger tu cuenta.",
      "Procesar tus compras, alquileres y pagos, y llevarte los pedidos.",
      "Avisarte cómo va cada pedido, alquiler o mantenimiento.",
      "Responder tus mensajes y solicitudes.",
      "Enviarte el boletín, solo si te suscribiste.",
      "Conocer cómo se usa la plataforma (por ejemplo, qué categorías se alquilan más) con datos agregados, sin identificarte.",
    ],
  },
  {
    titulo: "Con quién los compartimos",
    parrafos: [
      "No vendemos ni alquilamos tus datos. Solo los compartimos con quien los necesita para prestarte el servicio:",
    ],
    lista: [
      "El domiciliario que lleva tu pedido ve tu nombre, la dirección y el barrio de la entrega.",
      "Los proveedores que hacen funcionar la plataforma: alojamiento del sitio, base de datos e inicio de sesión, y la pasarela que procesa los pagos.",
      "Las autoridades, cuando una ley o una orden judicial lo exija.",
    ],
  },
  {
    titulo: "Tus derechos",
    parrafos: ["Como titular de los datos, puedes:"],
    lista: [
      "Conocer, actualizar y corregir tus datos. Buena parte lo puedes hacer tú mismo desde Mi cuenta.",
      "Pedir prueba de la autorización que nos diste.",
      "Saber cómo hemos usado tus datos.",
      "Revocar la autorización o pedir que borremos tus datos, cuando no haya un deber legal de conservarlos.",
      "Presentar quejas ante la Superintendencia de Industria y Comercio.",
      "Consultar tus datos gratis.",
    ],
  },
  {
    titulo: "Cómo hacer una consulta o un reclamo",
    parrafos: [
      <>
        Escríbenos desde la <EnlaceLegal href="/contacto">página de contacto</EnlaceLegal> con el tema «Otro tema», usando el correo de tu cuenta. Respondemos las consultas en máximo diez (10) días hábiles y los reclamos en máximo quince (15) días hábiles, como indica la ley.
      </>,
    ],
  },
  {
    titulo: "Cómo los protegemos",
    lista: [
      "Toda la información viaja cifrada (HTTPS).",
      "Cada persona del equipo solo ve lo que necesita según su rol; por ejemplo, un domiciliario no ve tus pagos.",
      "La base de datos no se puede consultar desde afuera de la plataforma.",
    ],
  },
  {
    titulo: "Cuánto tiempo los guardamos",
    parrafos: [
      "Mientras tengas tu cuenta activa. Si nos pides cerrarla, borramos tus datos, salvo los que la ley nos obliga a conservar, como los soportes de las compras.",
      "Si nos pides salir del boletín, borramos tu correo de esa lista.",
    ],
  },
  {
    titulo: "Menores de edad",
    parrafos: ["MoviGo no está dirigido a menores de 18 años y no recogemos sus datos a sabiendas."],
  },
  {
    titulo: "Cambios a esta política",
    parrafos: ["Si cambiamos esta política te lo contaremos en el sitio y la fecha de arriba indicará la última versión."],
  },
];

export default function PaginaPrivacidad() {
  return (
    <DocumentoLegal
      actual="privacidad"
      titulo={
        <>
          Política de <span className="text-eucalipto">privacidad</span>
        </>
      }
      intro="Qué datos tuyos guardamos, para qué los usamos y cómo puedes consultarlos, corregirlos o borrarlos."
      secciones={secciones}
    />
  );
}
