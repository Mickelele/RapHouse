import { Phone } from "lucide-react";
import { contact } from "@/data/raphouse";

export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-xl sm:hidden">
      <div className="flex gap-2">
        <a href="#kontakt" className="btn-base btn-accent flex-1">
          Rezerwuj sesję
        </a>
        <a
          href={contact.phoneHref}
          aria-label="Zadzwoń do RapHouse"
          className="btn-base btn-ghost-line px-4"
        >
          <Phone className="size-5" />
        </a>
      </div>
    </div>
  );
}
