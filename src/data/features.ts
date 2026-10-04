// Sekcje w przygotowaniu - włączasz je jedną flagą (true = widoczna na stronie głównej).
// Domyślnie wyłączone, bo zakres jest jeszcze ustalany z klientem.
import { galleryImages, type GalleryImage } from "./gallery";

export const features = {
  liveStreams: false,
  backstage: false,
  trackFeedback: false,
};

// ============ Transmisje live ============
export type LiveStream = {
  platform: "YouTube" | "Instagram" | "Twitch";
  url: string;
  title: string;
  // ISO, np. "2026-10-20T20:00:00+02:00"; brak = "wkrótce".
  startsAt?: string;
  description?: string;
};

// TODO: treść od klienta - najbliższa transmisja. null = stan „brak transmisji”.
// Przykład: { platform: "YouTube", url: "https://youtu.be/…", title: "Feedback tracków #1", startsAt: "2026-10-20T20:00:00+02:00" }
export const liveStream = null as LiveStream | null;

// TODO: treść od klienta - kanały, na których prowadzone są live'y (Twitch, jeśli jest).
export const liveChannels: { platform: LiveStream["platform"]; url: string }[] = [
  { platform: "YouTube", url: "https://www.youtube.com/@RapHousewwa" },
  { platform: "Instagram", url: "https://www.instagram.com/raphousewwa/" },
];

// ============ Kulisy ============
export const backstage: {
  intro: string;
  photos: GalleryImage[];
  // Link do YouTube (film lub short) albo samo ID.
  videos: { title: string; video: string }[];
} = {
  intro: "Jak wyglądają sesje od środka - przygotowania, nagrania i momenty między take'ami.",
  // TODO: treść od klienta - zdjęcia zza kulis (na razie placeholdery z galerii).
  photos: galleryImages.slice(4, 8),
  // TODO: treść od klienta - rolki / krótkie filmy zza kulis.
  videos: [],
};

// ============ Feedback Waszych tracków ============
export const trackFeedback = {
  // TODO: treść od klienta - opis usługi, forma feedbacku i cena.
  intro:
    "Masz numer i nie wiesz, co poprawić? Podeślij nam track - przesłuchamy go i dostaniesz konkretną informację zwrotną: flow, tekst, brzmienie i miks.",
  steps: [
    "Wysyłasz nam link do tracka (np. SoundCloud, Dysk Google, YouTube niepubliczny).",
    "Słuchamy numeru i robimy notatki - co działa, a co warto poprawić.",
    "Dostajesz feedback: na live'ie na kanale albo prywatnie.",
  ],
  price: "Wycena indywidualna",
  cta: "Zgłoś track",
};
