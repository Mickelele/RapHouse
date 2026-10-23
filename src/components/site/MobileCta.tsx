import { Phone } from "lucide-react";
import { contact } from "@/data/raphouse";

export function MobileCta() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 sm:hidden">
      <div className="flex gap-2">
        <a href="/rezerwacja" className="btn-base btn-accent flex-1">
          Rezerwuj
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
