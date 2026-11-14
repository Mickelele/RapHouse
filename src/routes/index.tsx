import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { Marquee } from "@/components/site/Marquee";
import { Pricing } from "@/components/site/Pricing";
import { Studio } from "@/components/site/Studio";
import { LatestBeats } from "@/components/site/LatestBeats";
import { LatestNews } from "@/components/site/LatestNews";
import { LiveStreams } from "@/components/site/LiveStreams";
import { Backstage } from "@/components/site/Backstage";
import { TrackFeedback } from "@/components/site/TrackFeedback";
import { features } from "@/data/features";
import { contact } from "@/data/raphouse";
import { frameSrc } from "@/lib/mic-frames";
import { About } from "@/components/site/About";
import { Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

const title = "RapHouse - studio nagrań w Warszawie | Nagrania, mix, mastering";
const description =
  "Profesjonalne studio nagrań rap i hip-hop w Warszawie (Łojewska 22). Sesje z realizatorem, samoobsługa, mix/mastering i bity.";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// Oficjalne informacje o studiu dla Google / Gemini (schema.org). Godziny z contact.hours -
// dzięki temu wyszukiwarki nie zgadują ich ze starych wersji strony.
const businessLd = {
  "@context": "https://schema.org",
  "@type": "RecordingStudio",
  name: contact.name,
  url: "https://www.raphouse.pl/",
  telephone: contact.phone.replace(/\s+/g, ""),
  description,
  address: {
    "@type": "PostalAddress",
    streetAddress: contact.street.replace(/^ul\.\s*/, ""),
    postalCode: contact.city.split(" ")[0],
    addressLocality: "Warszawa",
    addressCountry: "PL",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAYS,
      opens: contact.hours.opens,
      closes: contact.hours.closes,
    },
  ],
  sameAs: [contact.instagram, contact.youtube, contact.facebook],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(businessLd) }],
    // Pierwsza klatka mikrofonu pobiera się razem z HTML, zanim ruszą skrypty.
    links: [
      {
        rel: "preload",
        as: "image",
        href: frameSrc(0, "/mikrofon"),
        type: "image/webp",
        media: "(min-width: 1024px)",
      },
      {
        rel: "preload",
        as: "image",
        href: frameSrc(0, "/mikrofon/m"),
        type: "image/webp",
        media: "(max-width: 1023px)",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LoadingScreen />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Pricing />
        <LatestBeats />
        <Studio />
        <LatestNews />
        {features.liveStreams && <LiveStreams />}
        {features.backstage && <Backstage />}
        {features.trackFeedback && <TrackFeedback />}
        <About />
      </main>
      <Footer />
      <MobileCta />
    </div>
  );
}
