import { ArrowLeft, ArrowRight } from "lucide-react";
import TestimonialCard from "../shared/TestimonialCard";

export default function Testimonials() {
  return (
    <section className="bg-primary-100 py-16 sm:py-20 lg:py-24 xl:py-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-md">
          <p className="mb-6 text-sm uppercase tracking-[0.3em] text-primary-700 sm:text-base">
            Testimonials
          </p>

          <h2 className="font-heading text-3xl font-semibold leading-tight text-black sm:text-4xl md:text-5xl lg:text-6xl">
            Trusted by the
            <br />
            Discerning
          </h2>

          <div className="mt-8 flex gap-4 sm:mt-10 sm:gap-5 lg:mt-12">
            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-black transition hover:bg-black hover:text-white sm:h-14 sm:w-14 lg:h-16 lg:w-16">
              <ArrowLeft />
            </button>

            <button className="flex h-12 w-12 items-center justify-center rounded-full border border-black transition hover:bg-black hover:text-white sm:h-14 sm:w-14 lg:h-16 lg:w-16">
              <ArrowRight />
            </button>
          </div>
        </div>

        <TestimonialCard />
      </div>
    </section>
  );
}
