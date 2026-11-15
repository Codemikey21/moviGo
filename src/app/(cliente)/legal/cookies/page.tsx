import type { Metadata } from "next";
import { GOOGLE_ACTIVO } from "@/compartido/configuracion/acceso";
import { DocumentoLegal, EnlaceLegal, type SeccionLegal } from "../_componentes/DocumentoLegal";

export const metadata: Metadata = { title: "Cookies · MoviGo" };

const secciones: SeccionLegal[] = [
  {
    titulo: "Qué son las cookies",
    parrafos: [
      "Son archivos pequeños que un sitio guarda en tu navegador para recordar algo entre una página y otra; por ejemplo, que ya iniciaste sesión.",
    ],
  },
  {
    titulo: "Las que usamos",
    parrafos: [
      "MoviGo solo usa cookies necesarias para que el sitio funcione. Sin ellas no podrías iniciar sesión ni pagar.",
    ],
    tabla: [
      ["Cookie", "Para qué sirve", "Duración"],
      ["sb-…-auth-token", "Mantiene tu sesión iniciada de forma segura.", "Hasta que cierres sesión"],
      ["sb-…-auth-token-code-verifier", GOOGLE_ACTIVO ? "Completa el inicio de sesión con Google o con un enlace del correo." : "Completa el inicio de sesión con un enlace del correo.", "Unos minutos"],
    ],
  },
  {
    titulo: "Las que no usamos",
    parrafos: [
      "No usamos cookies de publicidad ni herramientas de analítica de terceros que te sigan entre sitios, y no compartimos tu información de navegación.",
      "Por eso no te mostramos un aviso para aceptar cookies: no hay nada opcional que aceptar.",
    ],
  },
  {
    titulo: "Mapas",
    parrafos: [
      "Los mapas de seguimiento y de cobertura usan OpenStreetMap. Al abrir un mapa, tu navegador descarga las imágenes desde los servidores de OpenStreetMap, que reciben tu dirección IP como cualquier sitio web. MoviGo no les envía tus datos de cuenta.",
    ],
  },
  {
    titulo: "Cómo controlarlas",
    parrafos: [
      "Puedes ver y borrar las cookies desde la configuración de tu navegador. Si bloqueas las de MoviGo, el catálogo seguirá funcionando, pero no podrás iniciar sesión, comprar ni alquilar.",
      <>
        Si tienes preguntas, revisa la <EnlaceLegal href="/legal/privacidad">política de privacidad</EnlaceLegal> o escríbenos.
      </>,
    ],
  },
];

export default function PaginaCookies() {
  return (
    <DocumentoLegal
      actual="cookies"
      titulo={
        <>
          Uso de <span className="text-eucalipto">cookies</span>
        </>
      }
      intro="Usamos las mínimas: solo las que mantienen tu sesión segura. Nada de publicidad ni rastreo."
      secciones={secciones}
    />
  );
}
