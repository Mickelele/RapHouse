import { Phone } from "lucide-react";
import { contact } from "@/data/raphouse";
import { Reveal } from "./Reveal";

// Dane studia i mapa są w stopce (zaraz pod tą sekcją).
export function Contact() {
  return (
    <section id="kontakt" className="mx-auto max-w-[1400px] px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="eyebrow mb-6">Kontakt</p>
        <h2 className="font-display max-w-4xl text-[clamp(2.5rem,7vw,6rem)]">
          Masz numer?
          <br />
          <span className="text-primary">Nagrajmy go.</span>
        </h2>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Nie odkładaj kolejnego numeru na później.
        </p>
        <a href={contact.phoneHref} className="btn-base btn-accent mt-10">
          <Phone className="size-4" /> Zadzwoń: {contact.phone}
        </a>
      </Reveal>
    </section>
  );
}
