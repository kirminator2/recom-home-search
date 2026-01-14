import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { QuickFilters } from "@/components/home/QuickFilters";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { DevelopersSection } from "@/components/home/DevelopersSection";
import { NewsSection } from "@/components/home/NewsSection";
import { CTASection } from "@/components/home/CTASection";
import { AISearchButton } from "@/components/ai/AISearchButton";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <QuickFilters />
        <FeaturedProperties />
        <DevelopersSection />
        <NewsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
