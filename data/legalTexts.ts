import { LegalDocument, LegalDocumentKey } from "@/types/legal.types"

/*
 * ============================================================
 *  COMPLETAR ANTES DE PUBLICAR: estos datos aparecen tal cual en la app
 * ============================================================
 */
const CONTACT_EMAIL = "[completar correo de contacto]"
const PRIVACY_POLICY_LOCATION = "[completar enlace o indicar que se muestra al registrarse]"

const PRIVACY_POLICY: LegalDocument = {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: 11 de noviembre de 2026",
    intro: [
        "BooFi (en adelante, “la Aplicación” o “BooFi”) es operada por Facundo Bellochi, GianFranco Caputo, Santiago Leffler, Julian Dalmazzo y Enzo Silva con domicilio en la Provincia de Buenos Aires, República Argentina. Esta Política de Privacidad explica qué datos personales recopilamos, cómo los usamos, con quién los compartimos y qué derechos tenés sobre ellos.",
        "Al registrarte y usar BooFi, aceptás las prácticas descriptas en esta Política. Si no estás de acuerdo, no uses la Aplicación.",
    ],
    sections: [
        {
            heading: "1. Qué datos recopilamos",
            blocks: [
                "1.1. Datos que nos proporcionás al registrarte:",
                [
                    "Correo electrónico",
                    "Nombre de usuario",
                    "Contraseña (almacenada de forma encriptada)",
                    "Foto de perfil (opcional)",
                    "Biografía (opcional)",
                ],
                "1.2. Datos que se generan al usar la Aplicación:",
                [
                    "Obras que escribís y publicás (textos, archivos EPUB)",
                    "Historial de lectura y capítulos descargados",
                    "Compras realizadas dentro de la Aplicación",
                    "Datos de uso: pantallas visitadas, tiempo de sesión, interacciones con la app",
                ],
                "1.3. Datos técnicos del dispositivo:",
                [
                    "Modelo de dispositivo, sistema operativo y versión de la app",
                    "Dirección IP (utilizada por Firebase para derivar ubicación aproximada)",
                    "Identificadores de instalación de Firebase",
                ],
                "1.4. Datos de ubicación:",
                // TODO: revisar este texto. La pantalla Mapa usa la ubicación GPS del dispositivo
                // y envía las coordenadas a OpenStreetMap (Overpass) para buscar librerías cercanas.
                "Ubicación aproximada derivada de la dirección IP. No recopilamos ubicación GPS precisa.",
            ],
        },
        {
            heading: "2. Para qué usamos tus datos",
            blocks: [
                "Usamos tus datos personales para las siguientes finalidades:",
                [
                    "Prestar el servicio: crear y gestionar tu cuenta, permitir el acceso a la lectura, habilitar la escritura y publicación de tus obras.",
                    "Procesar compras: gestionar las transacciones realizadas a través de MercadoPago.",
                    "Mejorar la Aplicación: analizar datos de uso agregados para entender cómo se utiliza BooFi y mejorar la experiencia.",
                    "Seguridad y prevención de fraude: detectar usos indebidos, contenido prohibido o actividades que violen los Términos y Condiciones.",
                    "Comunicaciones: enviarte notificaciones relacionadas con el servicio (por ejemplo, confirmaciones de compra o cambios importantes en la app). No enviamos publicidad de terceros.",
                ],
            ],
        },
        {
            heading: "3. Base legal para el tratamiento (Ley 25.326)",
            blocks: [
                "De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina, el tratamiento de tus datos se basa en:",
                [
                    "Tu consentimiento, otorgado al aceptar esta Política y los Términos al registrarte.",
                    "La ejecución del contrato de servicio que aceptás al usar BooFi.",
                    "Interés legítimo en mejorar la Aplicación y prevenir fraudes, siempre respetando tus derechos.",
                ],
            ],
        },
        {
            heading: "4. Con quién compartimos tus datos",
            blocks: [
                "4.1. Firebase (Google): BooFi utiliza Firebase y Cloud Storage de Firebase para autenticación, base de datos y almacenamiento de archivos (incluyendo fotos de perfil y archivos EPUB de las obras). Firebase actúa como encargado del tratamiento y procesa los datos conforme a sus propias políticas de privacidad y seguridad. Google no utiliza tus datos para fines publicitarios en el marco de BooFi.",
                "4.2. MercadoPago: cuando realizás una compra dentro de BooFi, los datos necesarios para procesar el pago se comparten con MercadoPago, que actúa como procesador de pagos independiente y se rige por su propia política de privacidad.",
                "4.3. Autoridades: podemos divulgar datos si así lo exige una ley, una orden judicial o una autoridad administrativa competente.",
                "No vendemos tus datos personales a terceros.",
            ],
        },
        {
            heading: "5. Transferencia internacional de datos",
            blocks: [
                "Firebase (Google) almacena y procesa datos en servidores ubicados en distintas regiones del mundo, incluyendo Estados Unidos. Al usar BooFi, aceptás que tus datos puedan ser transferidos a estos servidores. Google cuenta con certificaciones de seguridad (ISO 27001, SOC 1/2/3) y se encuentra adherida a marcos de transferencia internacional reconocidos. BooFi no controla directamente la ubicación física de los servidores de Firebase.",
            ],
        },
        {
            heading: "6. Cuánto tiempo conservamos tus datos",
            blocks: [
                "6.1. Datos de la cuenta: se conservan mientras tu cuenta esté activa.",
                "6.2. Eliminación de cuenta: cuando eliminás tu cuenta desde la pestaña “Perfil”, tus datos personales (correo, nombre de usuario, foto, biografía) se eliminan de forma inmediata de nuestros sistemas activos.",
                "6.3. Datos residuales: algunos datos pueden persistir en copias de seguridad de Firebase por un período limitado, conforme a las políticas de retención de Google. Estos datos no son accesibles para BooFi y se eliminan automáticamente según los plazos de Firebase.",
                "6.4. Datos analíticos: los datos de uso agregados y anonimizados (que ya no permiten identificarte) pueden conservarse de forma indefinida para fines estadísticos y de mejora de la Aplicación.",
                "6.5. Obras publicadas: si publicaste una obra en BooFi y luego eliminás tu cuenta, la obra puede permanecer visible en la Aplicación, ya que al publicarla otorgaste la licencia descripta en los Términos y Condiciones. Si querés que tu obra también sea eliminada, debés solicitarlo por escrito antes de borrar la cuenta.",
            ],
        },
        {
            heading: "7. Tus derechos",
            blocks: [
                "De acuerdo con la Ley 25.326, tenés derecho a:",
                [
                    "Acceder a los datos personales que tenemos sobre vos.",
                    "Rectificar datos inexactos o desactualizados.",
                    "Suprimir tus datos (lo que implica la eliminación de tu cuenta).",
                    "Confidencialidad sobre tus datos.",
                    "Actualizar tu información.",
                ],
                `Para ejercer estos derechos, podés hacerlo directamente desde la configuración de tu perfil (para datos editables) o enviando una solicitud a ${CONTACT_EMAIL}. Responderemos dentro de los plazos establecidos por la ley.`,
                "Si considerás que no hemos atendido correctamente tu solicitud, podés presentar una denuncia ante la Dirección Nacional de Protección de Datos Personales de Argentina.",
            ],
        },
        {
            heading: "8. Seguridad de los datos",
            blocks: [
                "Implementamos medidas técnicas y organizativas para proteger tus datos:",
                [
                    "Las comunicaciones entre la Aplicación y Firebase se realizan mediante HTTPS (cifrado en tránsito).",
                    "Las contraseñas se almacenan de forma encriptada por Firebase Authentication.",
                    "El acceso a la base de datos y al almacenamiento está restringido mediante reglas de seguridad de Firebase.",
                ],
                "Ningún sistema es completamente seguro. No podemos garantizar la seguridad absoluta de la información, pero trabajamos para protegerla con estándares razonables.",
            ],
        },
        {
            heading: "9. Menores de edad",
            blocks: [
                "BooFi está dirigida a personas a partir de los 12 años. No recopilamos conscientemente datos de menores de 12 años. Si detectamos que un usuario menor de 12 años se ha registrado, procederemos a eliminar la cuenta y los datos asociados.",
                "Para usuarios de entre 12 y 17 años, recomendamos la supervisión de un adulto responsable en el uso de la Aplicación, especialmente en lo relativo a la publicación de contenido y compras integradas.",
            ],
        },
        {
            heading: "10. Cookies y tecnologías similares",
            blocks: [
                "La Aplicación no utiliza cookies propias en el sentido tradicional (ya que es una app móvil). Sin embargo, Firebase puede utilizar identificadores de instalación y tecnologías similares para el funcionamiento del servicio y la analítica. Podés limitar parte de esta recopilación a través de la configuración de tu dispositivo, aunque esto puede afectar el funcionamiento de la Aplicación.",
            ],
        },
        {
            heading: "11. Cambios en esta Política",
            blocks: [
                "Podemos modificar esta Política de Privacidad en cualquier momento. Los cambios entrarán en vigor desde su publicación en la Aplicación. Si los cambios son significativos, te notificaremos a través de la app o por correo electrónico. El uso continuado de BooFi después de la publicación de los cambios constituye tu aceptación.",
            ],
        },
        {
            heading: "12. Contacto",
            blocks: [
                "Para consultas, solicitudes de acceso, rectificación o supresión de datos, o cualquier duda sobre esta Política, podés contactarnos en:",
                `Correo: ${CONTACT_EMAIL}`,
                "Responsables: Facundo Bellochi, GianFranco Caputo, Santiago Leffler, Julian Dalmazzo y Enzo Silva",
                "Domicilio: Provincia de Buenos Aires, República Argentina.",
            ],
        },
    ],
}

const TERMS_AND_CONDITIONS: LegalDocument = {
    title: "Términos y Condiciones",
    lastUpdated: "Última actualización: 11 de noviembre de 2026",
    intro: [
        "Bienvenido a BooFi (en adelante, “la Aplicación” o “BooFi”). Estos Términos y Condiciones (en adelante, “los Términos”) regulan el acceso y uso de la Aplicación por parte de los usuarios (en adelante, “el Usuario”).",
        "Al registrarse, acceder o utilizar la Aplicación, el Usuario acepta quedar vinculado por estos Términos. Si no está de acuerdo, debe abstenerse de utilizar la Aplicación.",
    ],
    sections: [
        {
            heading: "1. Identidad del titular",
            blocks: [
                `BooFi es operada por Facundo Bellochi, GianFranco Caputo, Santiago Leffler, Julian Dalmazzo y Enzo Silva con domicilio en la Provincia de Buenos Aires, República Argentina. Para consultas, el canal de contacto es ${CONTACT_EMAIL}.`,
            ],
        },
        {
            heading: "2. Descripción del Servicio",
            blocks: [
                "BooFi es una plataforma que permite a los usuarios:",
                [
                    "Leer obras literarias de dominio público puestas a disposición por BooFi.",
                    "Escribir y publicar obras propias, de forma gratuita o paga, dentro de la Aplicación.",
                    "Gestionar un perfil personal con foto, biografía y nombre de usuario.",
                ],
                "El servicio está dirigido a un público lector a partir de los 12 años de edad.",
            ],
        },
        {
            heading: "3. Registro y cuenta",
            blocks: [
                "3.1. Para utilizar BooFi es obligatorio crear una cuenta mediante correo electrónico y contraseña, y elegir un nombre de usuario.",
                "3.2. El Usuario se compromete a proporcionar información veraz y a mantener la confidencialidad de sus credenciales. Es el único responsable de las actividades realizadas desde su cuenta.",
                "3.3. El Usuario puede eliminar su cuenta en cualquier momento desde la pestaña “Perfil” de la Aplicación. La eliminación implica el borrado inmediato de los datos personales asociados a la cuenta, conforme a lo establecido en la Política de Privacidad.",
                "3.4. BooFi se reserva el derecho de suspender o cancelar cuentas que incumplan estos Términos.",
            ],
        },
        {
            heading: "4. Edad mínima",
            blocks: [
                "El uso de BooFi está permitido a personas a partir de los 12 años. Al registrarse, el Usuario declara cumplir con este requisito. BooFi no realiza verificación de edad de forma automática; sin embargo, se reserva el derecho de solicitar documentación o de cancelar cuentas si detecta que un usuario no cumple con la edad mínima.",
            ],
        },
        {
            heading: "5. Contenido de lectura (obras de dominio público)",
            blocks: [
                "5.1. BooFi pone a disposición del Usuario obras literarias de dominio público, cargadas como archivos EPUB dentro de la Aplicación.",
                "5.2. La autoría y la ficha de cada obra se muestran siempre en la sinopsis, antes de que el Usuario comience a leer o realice una compra.",
                "5.3. El Usuario no adquiere ningún derecho de propiedad intelectual sobre estas obras por el hecho de leerlas o acceder a ellas.",
                "5.4. El acceso a las obras requiere conexión a internet. Actualmente, la Aplicación descarga únicamente el capítulo que el Usuario está leyendo.",
            ],
        },
        {
            heading: "6. Contenido del Usuario (obras propias)",
            blocks: [
                "6.1. BooFi permite al Usuario escribir obras propias y subir archivos EPUB para publicarlas dentro de la Aplicación, ya sea de forma gratuita o paga.",
                "6.2. El Usuario conserva la titularidad de los derechos de autor sobre sus obras originales. Sin embargo, al publicar una obra en BooFi, el Usuario otorga a BooFi una licencia mundial, no exclusiva, gratuita y transferible para almacenar, reproducir, mostrar, promocionar y distribuir dicha obra dentro de la Aplicación, así como para comercializarla conforme a las condiciones de venta vigentes.",
                "6.3. En caso de venta de una obra publicada en BooFi, BooFi retendrá el 30% del precio de venta fijado por el Usuario, en concepto de comisión por el uso de la plataforma. El 70% restante corresponderá al Usuario, conforme a los medios de pago que BooFi informe oportunamente.",
                "6.4. El Usuario declara y garantiza que sus obras son originales, que no infringen derechos de terceros y que cuenta con los derechos necesarios para publicarlas.",
                "6.5. El Usuario puede publicar su obra de forma gratuita y visible para todos los usuarios, o mantenerla como borrador.",
                "6.6. La publicación de contenido es automática. El Usuario es el único responsable del contenido que escribe y publica, y BooFi queda desligada de toda responsabilidad derivada de dicho contenido.",
            ],
        },
        {
            heading: "7. Contenido generado por inteligencia artificial",
            blocks: [
                "7.1. BooFi permite la publicación de contenido generado total o parcialmente mediante inteligencia artificial, siempre que el Usuario lo declare marcando la etiqueta “IA” antes de publicar.",
                "7.2. El Usuario es el único responsable de declarar de manera veraz y correcta si el contenido fue generado mediante inteligencia artificial. BooFi no verifica dicha declaración y no asume responsabilidad alguna por declaraciones inexactas.",
                "7.3. La falsedad en la declaración podrá dar lugar a la eliminación del contenido y/o a la suspensión de la cuenta.",
            ],
        },
        {
            heading: "8. Conducta del Usuario y contenido prohibido",
            blocks: [
                "El Usuario se compromete a utilizar BooFi de conformidad con la ley y el orden público. Queda prohibido publicar o compartir contenido que:",
                [
                    "Sea ilegal, difamatorio, obsceno, pornográfico o violento de forma explícita.",
                    "Infrinja derechos de propiedad intelectual de terceros (plagio).",
                    "Contenga virus o código malicioso.",
                    "Suplante la identidad de otra persona.",
                    "Incite al odio o a la discriminación.",
                ],
                "Dado que BooFi está dirigida a personas a partir de los 12 años, se prohíbe expresamente todo contenido sexual y toda violencia explícita.",
            ],
        },
        {
            heading: "9. Moderación y sanciones",
            blocks: [
                "9.1. La moderación de BooFi se realiza de forma comunitaria, entre los creadores y los usuarios.",
                "9.2. BooFi se reserva el derecho de aplicar, según la gravedad del incumplimiento, las siguientes sanciones: advertencia, eliminación del contenido, suspensión temporal de la cuenta o baja definitiva de la cuenta.",
                `9.3. Actualmente la Aplicación no cuenta con un botón de reporte de contenido inapropiado. BooFi implementará un formulario de contacto y reporte a la brevedad. Mientras tanto, los reportes pueden enviarse a ${CONTACT_EMAIL}.`,
            ],
        },
        {
            heading: "10. Perfil del Usuario",
            blocks: [
                "10.1. El Usuario puede gestionar su perfil, que incluye foto, biografía y nombre de usuario.",
                "10.2. Actualmente, el único perfil visible es el del propio Usuario. BooFi prevé incorporar en el futuro la función de seguir a creadores.",
            ],
        },
        {
            heading: "11. Compras integradas",
            blocks: [
                "11.1. BooFi es gratuita e incluye compras integradas procesadas a través de la API de MercadoPago.",
                "11.2. BooFi no ofrece suscripciones ni publicidad al momento de la entrada en vigencia de estos Términos.",
                "11.3. No se ofrecen reembolsos por las compras realizadas dentro de la Aplicación, salvo que la legislación aplicable disponga lo contrario.",
            ],
        },
        {
            heading: "12. Propiedad intelectual de la Aplicación",
            blocks: [
                "El nombre BooFi, su logotipo, el diseño de la Aplicación, el código fuente y los elementos gráficos son propiedad de sus titulares y están protegidos por las leyes de propiedad intelectual. El Usuario no adquiere ningún derecho sobre ellos por el uso de la Aplicación.",
            ],
        },
        {
            heading: "13. Exención de responsabilidad",
            blocks: [
                "13.1. La Aplicación se proporciona “tal cual” y “según disponibilidad”. BooFi no garantiza que el servicio sea ininterrumpido, libre de errores o que no se pierdan datos.",
                "13.2. BooFi no se hace responsable de la exactitud, legalidad o calidad de las obras de dominio público puestas a disposición, ni del contenido generado por los Usuarios.",
                "13.3. En la medida permitida por la ley, BooFi no será responsable de daños indirectos, incidentales o consecuentes derivados del uso de la Aplicación, incluyendo la pérdida de datos, la caída del servicio o la pérdida de textos del Usuario.",
            ],
        },
        {
            heading: "14. Datos personales",
            blocks: [
                `El tratamiento de los datos personales del Usuario se rige por la Política de Privacidad de BooFi, que forma parte integrante de estos Términos y se encuentra disponible en ${PRIVACY_POLICY_LOCATION}.`,
            ],
        },
        {
            heading: "15. Modificaciones",
            blocks: [
                "BooFi se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en la Aplicación. El uso continuado del servicio por parte del Usuario constituirá su aceptación de los nuevos Términos.",
            ],
        },
        {
            heading: "16. Ley aplicable y jurisdicción",
            blocks: [
                "Estos Términos se rigen por las leyes de la República Argentina. Cualquier disputa relacionada con la Aplicación se someterá a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, sin perjuicio del derecho del Usuario a contactar previamente a BooFi para intentar resolver la disputa de forma amistosa.",
            ],
        },
        {
            heading: "17. Contacto",
            blocks: [
                `Para cualquier consulta, reclamo o reporte sobre estos Términos, el Usuario puede contactarse a: ${CONTACT_EMAIL}.`,
            ],
        },
    ],
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
    terms: TERMS_AND_CONDITIONS,
    privacy: PRIVACY_POLICY,
}

export const LEGAL_LABELS = {
    ACCEPT_TERMS_PREFIX: "Acepto los ",
    ACCEPT_TERMS_LINK: "Términos y Condiciones",
    ACCEPT_PRIVACY_PREFIX: "Acepto la ",
    ACCEPT_PRIVACY_LINK: "Política de Privacidad",
    CLOSE: "Volver",
    NOT_ACCEPTED_ERROR: "Tenés que aceptar los Términos y Condiciones y la Política de Privacidad para crear tu cuenta",
}
