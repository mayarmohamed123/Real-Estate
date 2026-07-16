import Image from "next/image";
import Link from "next/link";
import photo4 from "../../public/images/photo4.webp";
import photo5 from "../../public/images/photo5.webp";
import photo6 from "../../public/images/photo6.webp";

const locations = [
  {
    id: 1,
    image: photo4,
    city: "London",
    description: "Timeless elegance in the world's cultural heart.",
    properties: 42,
  },
  {
    id: 2,
    image: photo5,
    city: "Dubai",
    description: "Futuristic architectural marvels by the Arabian Gulf.",
    properties: 28,
  },
  {
    id: 3,
    image: photo6,
    city: "New York",
    description: "Vertical masterpieces in the center of the world.",
    properties: 15,
  },
];

export default function LocationCard() {
  return (
    <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3">
      {locations.map((location) => (
        <article
          key={location.id}
          className="group relative min-h-80 overflow-hidden rounded-3xl sm:min-h-90 lg:min-h-105 xl:min-h-115">
          <Image
            src={location.image}
            alt={location.city}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6 lg:p-8">
            <h3 className="mb-3 text-3xl font-semibold sm:text-4xl">
              {location.city}
            </h3>

            <p className="mb-6 max-w-xs text-sm text-white/80 sm:text-base">
              {location.description}
            </p>

            <Link
              href="/"
              className="inline-block border border-white/40 bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.25em] backdrop-blur-sm transition hover:bg-white hover:text-black">
              Explore {location.properties} Properties
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
