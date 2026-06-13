import { About } from "./components/About";
import { BookSection } from "./components/BookSection";
import { Contact } from "./components/Contact";
import { Education } from "./components/Education";
import { Experience } from "./components/Experience";
import { Hero } from "./components/Hero";
import { HomeShell } from "./components/HomeShell";
import { Nav } from "./components/Nav";
import { Platforms } from "./components/Platforms";
import { Portfolio } from "./components/Portfolio";
import { Skills } from "./components/Skills";
import { Testimonials } from "./components/Testimonials";

const TOTAL = 8;

export default function Home() {
  return (
    <HomeShell>
      <main className="flex flex-1 flex-col">
        <Nav />
        <Hero />
        <BookSection>
          <About index={0} total={TOTAL} />
          <Experience index={1} total={TOTAL} />
          <Portfolio index={2} total={TOTAL} />
          <Skills index={3} total={TOTAL} />
          <Testimonials index={4} total={TOTAL} />
          <Education index={5} total={TOTAL} />
          <Contact index={6} total={TOTAL} />
          <Platforms index={7} total={TOTAL} />
        </BookSection>
      </main>
    </HomeShell>
  );
}
