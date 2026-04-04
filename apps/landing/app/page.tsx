import { Navbar } from "../components/sections/Navbar";
import { HeroSection } from "../components/sections/HeroSection";
import { LogosBar } from "../components/sections/LogosBar";
import { FeaturesGrid } from "../components/sections/FeaturesGrid";
import { HowItWorks } from "../components/sections/HowItWorks";
import { WordPressSection } from "../components/sections/WordPressSection";
import { Pricing } from "../components/sections/Pricing";
import { FAQ } from "../components/sections/FAQ";
import { FinalCTA } from "../components/sections/FinalCTA";
import { Footer } from "../components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <LogosBar />
        <FeaturesGrid />
        <HowItWorks />
        <WordPressSection />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
