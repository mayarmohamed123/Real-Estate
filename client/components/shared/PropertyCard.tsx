"use client";

import Image from "next/image";
import { MapPin, BedDouble, Ruler } from "lucide-react";
import photo1 from "../../public/images/photo1.webp";
import photo2 from "../../public/images/photo2.webp";
import photo3 from "../../public/images/photo3.webp";
import { motion } from "framer-motion";
import { itemVariants } from "./animationVariants";

const properties = [
  {
    id: 1,
    image: photo1,
    badge: "LEASING NOW",
    title: "The Obsidian Penthouse",
    location: "South Kensington, London",
    features: [
      {
        icon: <BedDouble size={14} />,
        text: "4 Beds",
      },
      {
        icon: <Ruler size={14} />,
        text: "4,200 sqft",
      },
    ],
  },
  {
    id: 2,
    image: photo2,
    badge: "OFF-MARKET",
    title: "Sandstone Sanctuary",
    location: "Emirates Hills, Dubai",
    features: [
      {
        icon: <BedDouble size={14} />,
        text: "6 Beds",
      },
      {
        icon: "🏊",
        text: "Private Pool",
      },
    ],
  },
  {
    id: 3,
    image: photo3,
    title: "The Sky Garden Loft",
    location: "Tribeca, New York",
    features: [
      {
        icon: <BedDouble size={14} />,
        text: "3 Beds",
      },
      {
        icon: "🏡",
        text: "Terrace",
      },
    ],
  },
];

export default function PropertyCard() {
  return (
    <motion.div
      variants={itemVariants}
      className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
      {properties.map((property) => (
        <motion.article
          key={property.id}
          variants={itemVariants}
          className="flex flex-col">
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={property.image}
              alt={property.title}
              width={500}
              height={650}
              className="h-72 w-full object-cover sm:h-80 md:h-96 lg:h-112"
            />

            {property.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-medium">
                {property.badge}
              </span>
            )}
          </div>

          <div className="mt-5 flex-1">
            <h3 className="text-2xl font-heading">{property.title}</h3>

            <div className="mt-2 flex items-center gap-2 text-gray-500">
              <MapPin size={16} />
              {property.location}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {property.features.map((feature) => (
                <span
                  key={feature.text}
                  className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm">
                  {feature.icon}
                  {feature.text}
                </span>
              ))}
            </div>
          </div>
        </motion.article>
      ))}
    </motion.div>
  );
}
