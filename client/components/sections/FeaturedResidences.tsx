"use client";

import Link from "next/link";
import React from "react";
import PropertyCard from "../shared/PropertyCard";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "../shared/animationVariants";

export default function FeaturedResidences() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      variants={containerVariants}
      viewport={{ once: true }}
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24 xl:px-10 2xl:px-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <motion.div variants={itemVariants} className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3rem] text-neutral-500 sm:text-sm">
            Curated Selection
          </p>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-black sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
            Featured Residences
          </h2>
        </motion.div>

        <Link
          href="/"
          className="text-sm font-medium uppercase tracking-[0.3rem] text-primary-400 underline underline-offset-4">
          View Portfolio
        </Link>
      </div>

      <div className="mt-8 sm:mt-10 lg:mt-12">
        <PropertyCard />
      </div>
    </motion.section>
  );
}
