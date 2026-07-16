import FAQAccordion from "../shared/FAQAccordion";

export default function CommonInquiries() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10 2xl:px-12">
      <h2 className="mb-10 text-center font-heading text-3xl sm:mb-14 sm:text-4xl md:text-5xl lg:text-6xl">
        Common Inquiries
      </h2>

      <FAQAccordion />
    </section>
  );
}
