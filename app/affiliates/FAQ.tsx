"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "¿Necesito conocimientos técnicos o de IA?",
    answer:
      "No. Tu función es generar oportunidades de negocio y conectar clientes con IgnitiaOS. Nosotros nos encargamos del diagnóstico, la propuesta, el desarrollo, la implementación, la capacitación y el soporte.",
  },
  {
    question: "¿Tengo que vender páginas web o servicios de IA?",
    answer:
      "No necesariamente. La forma más fácil de vender es ofrecer un Diagnóstico Empresarial con IA. Ese análisis nos permite detectar oportunidades y presentar la solución adecuada para cada cliente.",
  },
  {
    question: "¿Quién realiza las reuniones con el cliente?",
    answer:
      "Depende del nivel del Partner. Puedes simplemente presentar al cliente y nosotros continuamos el proceso comercial, o participar en las reuniones si así lo deseas.",
  },
  {
    question: "¿Cómo recibo mis comisiones?",
    answer:
      "Las comisiones se pagan una vez que el cliente realiza el pago correspondiente, según el nivel de Partner y las condiciones del programa.",
  },
  {
    question: "¿Puedo vender fuera de mi país?",
    answer:
      "Sí. IgnitiaOS ofrece servicios digitales, por lo que puedes generar clientes desde cualquier parte del mundo.",
  },
  {
    question: "¿Qué pasa si el cliente necesita soporte?",
    answer:
      "Todo el soporte técnico, mantenimiento y atención posterior a la venta es responsabilidad de IgnitiaOS. Tú no tienes que resolver problemas técnicos.",
  },
  {
    question: "¿Qué material de ventas recibiré?",
    answer:
      "Recibirás un catálogo de servicios, presentaciones comerciales, brochures, casos de éxito, guiones para reuniones y mensajes para WhatsApp y correo electrónico.",
  },
  {
    question: "¿Hay metas mínimas para permanecer en el programa?",
    answer:
      "El nivel Starter no tiene requisitos mínimos. Los niveles superiores requieren un volumen determinado de ventas para acceder a mayores beneficios y comisiones.",
  },
  {
    question: "¿Puedo representar a IgnitiaOS como una agencia?",
    answer:
      "Sí. Agencias, consultoras y profesionales independientes pueden formar parte del programa y acceder a beneficios adicionales según su volumen de ventas.",
  },
  {
    question: "¿Cómo empiezo?",
    answer:
      "Completa la solicitud de Partner. Nuestro equipo revisará tu perfil, te dará acceso al material comercial y podrás comenzar a generar oportunidades inmediatamente.",
  },
];

export default function FAQ() {
  return (
    <section className="py-28">
      <div className="mx-auto max-w-4xl px-6">

        <div className="text-center">
          <span className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300">
            Preguntas Frecuentes
          </span>

          <h2 className="mt-8 text-5xl font-bold">
            Todo lo que necesitas saber
          </h2>

          <p className="mt-6 text-lg text-zinc-400">
            Estas son las preguntas que recibimos con más frecuencia de
            nuestros nuevos Partners.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-16 w-full"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-zinc-800"
            >
              <AccordionTrigger className="text-left text-lg font-semibold hover:no-underline">
                {faq.question}
              </AccordionTrigger>

              <AccordionContent className="text-base leading-7 text-zinc-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

      </div>
    </section>
  );
}