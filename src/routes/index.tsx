import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Movement } from "@/components/site/Movement";
import { Marquee } from "@/components/site/Marquee";
import { Pricing } from "@/components/site/Pricing";
import { Process } from "@/components/site/Process";
import { Studio } from "@/components/site/Studio";
import { GalleryTeaser } from "@/components/site/GalleryTeaser";
import { Portfolio } from "@/components/site/Portfolio";
import { LatestBeats } from "@/components/site/LatestBeats";
import { LatestNews } from "@/components/site/LatestNews";
import { Community } from "@/components/site/Community";
import { LiveStreams } from "@/components/site/LiveStreams";
import { Backstage } from "@/components/site/Backstage";
import { TrackFeedback } from "@/components/site/TrackFeedback";
import { features } from "@/data/features";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { MobileCta } from "@/components/site/MobileCta";

const title = "RapHouse - studio nagrań w Warszawie | Nagrania, mix, mastering";
const description =
  "Profesjonalne studio nagrań rap i hip-hop w Warszawie (Łojewska 22). Sesje z realizatorem, samoobsługa, mix/mastering i bity.";

export const Route = createFileRoute("/")({
  // ?kategoria=video otwiera zakładkę Video w Realizacjach; każda inna wartość = Audio.
  validateSearch: (search: Record<string, unknown>): { kategoria?: "video" } =>
    search["kategoria"] === "video" ? { kategoria: "video" } : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Movement />
        <Marquee />
        <Pricing />
        <LatestBeats />
        <Process />
        <Studio />
        <GalleryTeaser />
        <Portfolio />
        <LatestNews />
        <Community />
        {features.liveStreams && <LiveStreams />}
        {features.backstage && <Backstage />}
        {features.trackFeedback && <TrackFeedback />}
        <Contact />
      </main>
      <Footer />
      <MobileCta />
    </div>
  );
}
