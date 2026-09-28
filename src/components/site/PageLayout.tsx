import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileCta } from "./MobileCta";

export function PageLayout({
  eyebrow,
  title,
  accent,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <section className="mx-auto max-w-[1400px] px-5 pb-12 pt-36 md:px-10 md:pt-44">
          <p className="eyebrow mb-6">{eyebrow}</p>
          <h1 className="font-display text-[clamp(3rem,9vw,7.5rem)]">
            {title} {accent && <span className="text-primary">{accent}</span>}
          </h1>
          {intro && (
            <div className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {intro}
            </div>
          )}
        </section>
        {children}
      </main>
      <Footer />
      <MobileCta />
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="card-surface p-10 text-center text-muted-foreground">{children}</div>;
}
