import { BadgeCheck, FileSignature, ConciergeBell } from "lucide-react";

const services = [
  {
    id: 1,
    icon: BadgeCheck,
    title: "Curated Portfolio",
    description:
      "Each residence is hand-selected by our global architecture experts, ensuring every square foot meets our uncompromising standards of design and comfort.",
  },
  {
    id: 2,
    icon: FileSignature,
    title: "Seamless Leasing",
    description:
      "Our digital-first process streamlines complex transactions. Experience white-glove service from the first virtual tour to the final contract signature.",
  },
  {
    id: 3,
    icon: ConciergeBell,
    title: "Concierge Service",
    description:
      "Beyond the lease, we provide a 24/7 personalized concierge team to manage everything from art curation to private air travel arrangements.",
  },
];

export default function ServiceCard() {
  return (
    <div className="grid gap-10 sm:gap-12 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon;

        return (
          <article key={service.id} className="max-w-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 sm:h-20 sm:w-20">
              <Icon className="h-7 w-7 text-stone-700 sm:h-8 sm:w-8" />
            </div>

            <h3 className="mt-6 text-xl font-heading sm:mt-8 sm:text-2xl">
              {service.title}
            </h3>

            <p className="mt-4 text-base leading-8 text-neutral-600 sm:mt-6 sm:text-lg">
              {service.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
