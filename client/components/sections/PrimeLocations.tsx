"use client";

import { motion } from "framer-motion";
import LocationCard from "../shared/LocationCard";
import { containerVariants, itemVariants } from "../shared/animationVariants";

export default function PrimeLocations() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true }}
      className="bg-primary-100">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10 2xl:px-12">
        <motion.div
          variants={itemVariants}
          className="mb-10 text-center sm:mb-14">
          <p className="text-sm uppercase tracking-[0.3em] text-primary-600 sm:text-base">
            Global Footprint
          </p>

          <h2 className="mt-2 font-heading text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Prime Locations
          </h2>
        </motion.div>

        <LocationCard />
      </div>
    </motion.section>
  );
}
