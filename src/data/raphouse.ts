// Jedyne miejsce do aktualizacji treści i cen RapHouse.
// Ceny pochodzą z aktualnego cennika raphouse.pl. Cennik jest edytowalny w panelu admina -
// poniższa lista to tylko zapas, gdy baza danych jest niedostępna.

export const contact = {
  name: "RapHouse",
  street: "ul. Łojewska 22",
  city: "03-392 Warszawa",
  phone: "+48 502 491 642",
  phoneHref: "tel:+48502491642",
  nip: "5273175451",
  instagram: "https://www.instagram.com/raphousewwa/",
  youtube: "https://www.youtube.com/@RapHousewwa",
  facebook: "https://www.facebook.com/RapHouseWwa",
  maps: "https://www.google.com/maps/search/?api=1&query=RapHouse%20%C5%81ojewska%2022%20Warszawa",
  mapEmbed: "https://www.google.com/maps?q=%C5%81ojewska%2022,%2003-392%20Warszawa&output=embed",
};

export type PriceItem = {
  title: string;
  note?: string | null;
  lines: { label?: string | null; price: string }[];
  // Znacznik pozycji czekającej na dane od klienta (nie jest wyświetlany).
  todo?: string;
};

export const pricing: PriceItem[] = [
  {
    title: "Sesja z realizatorem",
    note: "Wybierz tę opcję, jeśli chcesz pracować z naszym realizatorem.",
    lines: [
      { label: "1h – 2h", price: "120 PLN/h" },
      { label: "3h – 4h", price: "100 PLN/h" },
      { label: "5h i więcej", price: "80 PLN/h" },
    ],
  },
  {
    title: "Wynajem studia (samoobsługa)",
    note: "Wynajem studia bez naszego realizatora. Nagrywasz się sam lub ze znajomymi.",
    lines: [
      { label: "do 3h", price: "60 PLN/h" },
      { label: "od 4h", price: "40 PLN/h" },
    ],
  },
  {
    title: "Mix / Master Standard",
    note: "Bit (1 plik) · jeden wykonawca.",
    lines: [{ price: "250 PLN" }],
  },
  {
    title: "Mix / Master Premium",
    note: "Bit (ścieżki) lub dwóch wykonawców.",
    lines: [{ price: "350 PLN" }],
  },
  {
    title: "Mix / Master Full",
    note: "Bit (ścieżki) · maks. trzech wykonawców.",
    lines: [{ price: "450 PLN" }],
  },
  {
    title: "Bity z katalogu",
    note: "Niespełna setka bitów w naszym katalogu.",
    lines: [{ price: "300 – 700 PLN" }],
  },
  {
    title: "Bit na zamówienie",
    note: "Producent tworzy bit od podstaw, również pod konkretną acapellę.",
    lines: [{ price: "400 – 750 PLN" }],
  },
  {
    title: "Klipy",
    note: "Realizacja teledysku - koncepcja, zdjęcia, montaż.",
    lines: [{ price: "Wycena indywidualna" }],
    todo: "TODO: cena klipów od klienta",
  },
  {
    title: "Promo + opakowanie",
    note: "Rolki, sesja foto, opisy, okładka, miniaturka, strategia publikacji, dystrybucja.",
    lines: [{ price: "Wycena indywidualna" }],
    todo: "TODO: cena pakietu promo od klienta",
  },
  {
    title: "Pisanie tekstów",
    note: "Pomoc przy tekstach lub ghostwriting.",
    lines: [{ price: "Wycena indywidualna" }],
    todo: "TODO: cena pisania tekstów od klienta",
  },
];

// Dopisek pod cennikiem.
export const pricingFootnote = {
  text: "Dokładna wycena mixu/masteringu następuje po otrzymaniu plików i referencji - cena zaczyna się od",
  price: "350 PLN",
};

export const process = [
  {
    no: "01",
    title: "Rezerwujesz",
    desc: "Dzwonisz lub piszesz - ustalamy termin i zakres sesji.",
  },
  {
    no: "02",
    title: "Nagrywasz",
    desc: "Kabina, Apollo Twin, własny miks słuchawkowy z UAD Console.",
  },
  { no: "03", title: "Mixujemy", desc: "Strojenie, efekty, przestrzeń - numer zaczyna brzmieć." },
  { no: "04", title: "Masterujemy", desc: "Głośność, dynamika i spójność na każdym systemie." },
  { no: "05", title: "Publikujesz", desc: "Dostajesz pliki gotowe do wypuszczenia w serwisach." },
];

export const gear = [
  { name: "Apollo Twin", tag: "Interface" },
  { name: "Warm Audio WA-47F", tag: "Mikrofon / kabina" },
  { name: "Rode K2", tag: "Talkback" },
  { name: "KRK Rokit 5", tag: "Odsłuchy" },
  { name: "Ryzen 7 7800X3D · 32GB", tag: "Maszyna" },
  { name: "Cubase", tag: "DAW" },
  { name: "Reaper", tag: "DAW" },
  { name: "FL Studio", tag: "DAW" },
  { name: "Antares Auto-Tune", tag: "Wtyczki" },
  { name: "FabFilter", tag: "Wtyczki" },
  { name: "iZotope Ozone 9", tag: "Mastering" },
];

export const portfolio = [
  {
    artist: "Arach",
    title: "Wilk z Wall Street ft. Madafaka",
    desc: "Klasyczny oldschool. Duży, ciepły wokal: emulacje analogowych kompresorów, saturacja, krótkie pogłosy.",
  },
  {
    artist: "Pszczoła",
    title: "Tak się z tym czuję",
    desc: "Ciepłe, analogowe brzmienie. Refren strojony manualnie i autotunem, wokal wkomponowany radiowo.",
  },
  {
    artist: "Czeski",
    title: "Bez kwitu ft. Emikae, Loli",
    desc: "Oldschool z efektami specjalnymi: pitch down, rwane wokale, reverse reverb, wstawki dźwiękowe.",
  },
  {
    artist: "Brutus",
    title: "Nieśmiertelność się załancza",
    desc: "Ciemna energia trapu. Wyraźne niskie pasma, mocny limiter, saturacja i przestrzeń z reverb/delay.",
  },
  {
    artist: "Pszczoła x Jezzy",
    title: "Świetnie sobie radzę",
    desc: "Oldschoolowa nawijka w nowoczesnym brzmieniu - ozdobne efekty na podbitkach i adlibach.",
  },
  {
    artist: "Pszczoła",
    title: "NCPC?",
    desc: "Dużo przerw w nawijce, więc dużo delayów - przejrzystość i bounce bez chaosu.",
  },
  {
    artist: "BSNB",
    title: "VAMOS ft. Czeski",
    desc: "Domowe nagranie wyciągnięte w miksie. Ręczne strojenie z nowoczesnym, autotune'owym charakterem.",
  },
  {
    artist: "Lasek",
    title: "Później zadzwonię",
    desc: "Wokal zatopiony w muzyce dla mrocznego klimatu, refren z auto-tune i amerykańskim sznytem.",
  },
];

export const crew = [
  {
    name: "Adam",
    role: "Realizator",
    bio: "14 lat tworzenia numerów, osiem nielegali nagranych i zmiksowanych własnoręcznie. Po półtora roku w warszawskim studiu założył RapHouse razem z Dominikiem. Na co dzień również technik dźwięku na eventach.",
  },
  {
    name: "Dominik",
    role: "Realizator",
    bio: "Muzyka od zawsze - najpierw wokal, potem fascynacja tym, jak mix i mastering uwalniają pełnię brzmienia. Prowadzi studio razem z Adamem i nieustannie rozwija własny warsztat.",
  },
];

export const stats = [
  { value: "14+", label: "Lat doświadczenia" },
  { value: "Rap / Hip-Hop", label: "Nasza specjalizacja" },
  { value: "Nagranie / Mix / Master", label: "Pełen proces" },
  { value: "Warszawa", label: "Targówek, Łojewska 22" },
];

export type NavLink = { label: string; href: string };
export type NavItem = NavLink | { label: string; children: NavLink[] };

// Menu: grupy rozwijane + najważniejsze pozycje pojedynczo.
export const nav: NavItem[] = [
  {
    label: "Studio",
    children: [
      { label: "O studiu", href: "/#studio" },
      { label: "Galeria", href: "/galeria" },
      { label: "O nas", href: "/#o-nas" },
    ],
  },
  { label: "Cennik", href: "/#cennik" },
  { label: "Bity", href: "/bity" },
  {
    label: "Realizacje",
    children: [
      { label: "Nagrania", href: "/#realizacje" },
      { label: "Klipy", href: "/klipy" },
    ],
  },
  { label: "Aktualności", href: "/aktualnosci" },
  { label: "Kontakt", href: "/#kontakt" },
];

// Wszystkie linki menu po kolei (stopka).
export const navLinks: NavLink[] = nav.flatMap((item) =>
  "children" in item ? item.children : [item],
);
