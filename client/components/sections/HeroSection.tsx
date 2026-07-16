"use client";

import Image from "next/image";
import React from "react";
import SearchBar from "../shared/SearchBar";
import HeroSectionPhoto from "../../public/images/Hero section.webp";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      <Image
        src={HeroSectionPhoto}
        alt="hero"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/35 via-black/20 to-black/60"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-4xl">
          <h2 className="font-heading text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[5rem]">
            Find Your Sanctuary
          </h2>
        </div>

        <div className="mt-8 w-full max-w-5xl sm:mt-10 lg:mt-12">
          <SearchBar />
        </div>
      </motion.div>
    </section>
  );
}
