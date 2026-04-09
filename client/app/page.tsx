import BrandLogo from "@/components/About/BrandLogo";
import ClientTestimonials from "@/components/About/ClientTestimonials";
import WhyApto from "@/components/About/WhyApto";
import WhyChooseUs from "@/components/About/WhyChooseUs";
import ContactSection from "@/components/contact/ContactSection";
import Hero from "@/components/Hero/hero";
import CareerWithUs from "@/components/Jobs/Jobs";
import Services from "@/components/services/service";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense>
      <div className="bg-white dark:bg-slate-900">
        <Hero />
        <CareerWithUs singlePage={false} />
        <WhyApto />
        <Services />
        <BrandLogo />
        <WhyChooseUs />

        <ClientTestimonials />
        <ContactSection />
      </div>
    </Suspense>
  );
}
