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
          <About index={0} total={TOTAL} id="about" bg="#b07d5b" textColor="#1a1a1a" />
          <Experience index={1} total={TOTAL} id="experience" bg="#006064" textColor="#fff8e1" />
          <Portfolio index={2} total={TOTAL} id="portfolio" bg="#004d40" textColor="#fff8e1" />
          <Skills index={3} total={TOTAL} id="skills" bg="#00838f" textColor="#fff8e1" />
          <Testimonials index={4} total={TOTAL} id="testimonials" bg="#b71c1c" textColor="#fff8e1" />
          <Education index={5} total={TOTAL} id="education" bg="#3e2723" textColor="#fff8e1" />
          <Contact index={6} total={TOTAL} id="contact" bg="#fff8e1" textColor="#3e2723" />
          <Platforms index={7} total={TOTAL} id="platforms" bg="#d84315" textColor="#fff8e1" />
        </BookSection>
      </main>
    </HomeShell>
  );
}
