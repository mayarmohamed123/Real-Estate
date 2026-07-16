import { Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    quote:
      "Aura Estates understands that time is the ultimate luxury. Their team handled our transition to Dubai with absolute precision.",
    name: "MAXIMILLIAN THORNE",
    position: "CEO, Thorne Global",
  },
  {
    id: 2,
    quote:
      "The level of curation in their London portfolio is unmatched. We found our sanctuary within days of reaching out.",
    name: "ISABELLA VANE",
    position: "Creative Director",
  },
];

export default function TestimonialCard() {
  return (
    <div className="grid flex-1 gap-6 sm:gap-8 lg:grid-cols-2">
      {testimonials.map((testimonial) => (
        <article
          key={testimonial.id}
          className="bg-background p-6 shadow-sm sm:p-8 lg:p-10">
          <Quote
            className="mb-6 h-10 w-10 rotate-180 text-neutral-300 sm:mb-8 sm:h-12 sm:w-12"
            strokeWidth={1.5}
          />

          <p className="text-xl font-heading sm:text-2xl">
            {testimonial.quote}
          </p>

          <div className="mt-10 sm:mt-14">
            <h3 className="text-base font-semibold uppercase tracking-wide sm:text-lg">
              {testimonial.name}
            </h3>

            <p className="mt-2 text-sm text-neutral-600">
              {testimonial.position}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
