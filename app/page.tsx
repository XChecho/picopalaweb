import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HowToPlay } from "@/components/HowToPlay";
import { Modes } from "@/components/Modes";
import { Navbar } from "@/components/Navbar";
import { Waitlist } from "@/components/Waitlist";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowToPlay />
        <Modes />
        <Features />
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
