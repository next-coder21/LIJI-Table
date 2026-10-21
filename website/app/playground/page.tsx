import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PlaygroundHero from "@/components/PlaygroundHero";
import Playground from "@/components/Playground";
import AmbientStars from "@/components/AmbientStars";

export const metadata: Metadata = {
  title: "Playground — Liji Table",
  description: "Try the real @liji-table/ui component live: sort, filter, resize, pin, and align columns hands-on.",
};

export default function PlaygroundPage() {
  return (
    <>
      <Nav />
      <main className="relative flex-1">
        <PlaygroundHero />
        <div className="relative mx-auto max-w-[clamp(64rem,94vw,100rem)] px-[clamp(1.25rem,3vw,3.5rem)] py-10">
          <AmbientStars />
          <div className="relative">
            <Playground />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
