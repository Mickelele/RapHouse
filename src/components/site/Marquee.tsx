import logo from "@/assets/raphouse-logo.png";

const WORDS = ["Rap", "Hip-Hop", "Muzyka", "Kultura", "Społeczność", "RapHouse"];

export function Marquee() {
  const run = [...WORDS, ...WORDS, ...WORDS, ...WORDS];
  return (
    <div className="surface-deep overflow-hidden border-y border-border py-6">
      <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {[0, 1].map((dup) => (
          <div key={dup} className="flex items-center gap-8">
            {run.map((word, i) => (
              <span key={`${dup}-${i}`} className="flex items-center gap-8">
                {word === "RapHouse" ? (
                  <img src={logo} alt="RapHouse" className="h-10 w-auto opacity-60 md:h-14" />
                ) : (
                  <span className="font-display text-3xl text-muted-foreground md:text-5xl">
                    {word}
                  </span>
                )}
                <span className="size-2 rounded-full bg-primary" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
