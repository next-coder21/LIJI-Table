import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import FrameworkSupport from "@/components/FrameworkSupport";
import Features from "@/components/Features";
import Comparison from "@/components/Comparison";
import Cta from "@/components/Cta";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Reveal>
          <FrameworkSupport />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <Comparison />
        </Reveal>
        <Reveal>
          <Cta />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
