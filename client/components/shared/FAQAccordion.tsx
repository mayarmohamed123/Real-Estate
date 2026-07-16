import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    id: "item-1",
    question: "What are the minimum lease terms for featured properties?",
    answer:
      "Most of our residences are available with a minimum lease term of six months. Certain properties also offer flexible short-term leasing depending on availability.",
  },
  {
    id: "item-2",
    question: "Do you offer off-market exclusive properties?",
    answer:
      "Yes. Our private portfolio includes exclusive off-market residences available only through our advisors.",
  },
  {
    id: "item-3",
    question: "Are the concierge services included in the lease?",
    answer:
      "A dedicated concierge is included for selected residences. Additional premium services can also be customized according to your needs.",
  },
];

export default function FAQAccordion() {
  return (
    <Accordion className="w-full">
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="py-6 text-left text-xl font-heading hover:no-underline sm:py-8 sm:text-2xl">
            {faq.question}
          </AccordionTrigger>

          <AccordionContent className="pb-6 text-base leading-8 text-muted-foreground sm:pb-8 sm:text-lg">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
