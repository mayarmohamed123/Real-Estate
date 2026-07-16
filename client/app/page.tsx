// import Image from "next/image";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CommonInquiries from "@/components/sections/CommonInquiries";
import FeaturedResidences from "@/components/sections/FeaturedResidences";
import HeroSection from "@/components/sections/HeroSection";
import PrimeLocations from "@/components/sections/PrimeLocations";
import Services from "@/components/sections/Services";
import Testimonials from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturedResidences />
      <PrimeLocations />
      <Services />
      <Testimonials />
      <CommonInquiries />
      <Footer />
    </div>
  );
}
