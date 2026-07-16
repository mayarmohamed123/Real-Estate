import Link from "next/link";
import { ArrowRight } from "lucide-react";

const offices = [
  {
    id: 1,
    name: "London",
    href: "/",
  },
  {
    id: 2,
    name: "Dubai",
    href: "/",
  },
  {
    id: 3,
    name: "New York",
    href: "/",
  },
];

const experience = [
  {
    id: 1,
    name: "About Us",
    href: "/about",
  },
  {
    id: 2,
    name: "Concierge",
    href: "/concierge",
  },
  {
    id: 3,
    name: "Privacy Policy",
    href: "/privacy-policy",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-primary-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-2 md:gap-12 lg:grid-cols-4 lg:gap-16 lg:px-8 lg:py-24 xl:px-10 2xl:px-12">
        <div>
          <Link
            href="/"
            className="font-heading text-4xl font-semibold leading-none text-primary-700 sm:text-5xl">
            AURA
            <br />
            ESTATES
          </Link>

          <p className="mt-6 max-w-xs text-sm leading-8 text-stone-600 sm:mt-8 sm:text-base">
            Defining the new standard of global luxury living through
            architecture and service.
          </p>
        </div>

        <div>
          <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-stone-600 sm:mb-8">
            Global Offices
          </h3>

          <nav className="flex flex-col gap-4 sm:gap-5">
            {offices.map((office) => (
              <Link
                key={office.id}
                href={office.href}
                className="text-sm transition hover:text-stone-900 sm:text-base">
                {office.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-stone-600 sm:mb-8">
            Experience
          </h3>

          <nav className="flex flex-col gap-4 sm:gap-5">
            {experience.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="text-sm transition hover:text-stone-900 sm:text-base">
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.25em] text-stone-600 sm:mb-8">
            Newsletter
          </h3>

          <p className="mb-4 text-sm text-stone-600 sm:text-base">
            Receive exclusive off-market listings.
          </p>

          <form className="flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Email Address"
              className="h-12 flex-1 border border-stone-300 bg-white px-4 outline-none placeholder:text-stone-400"
            />

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center bg-[#8A6A46] p-2 text-white transition hover:bg-[#75593b] sm:w-12">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-stone-200">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-stone-500 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          © 2024 Aura Estates. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
