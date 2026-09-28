// Jedyne miejsce do aktualizacji treści i cen RapHouse.
// Ceny pochodzą z aktualnego cennika raphouse.pl.

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

export const services = [
  {
    no: "01",
    title: "Sesje z realizatorem",
    desc: "Profesjonalna sesja nagraniowa z realizatorem, który pomoże Ci uzyskać najlepsze możliwe brzmienie.",
    cta: "Umów sesję",
  },
  {
    no: "02",
    title: "Samoobsługa",
    desc: "Wynajmij studio bez realizatora i pracuj po swojemu — sam lub ze znajomymi.",
    cta: "Rezerwuj",
  },
  {
    no: "03",
    title: "Mix / Mastering",
    desc: "Doprowadź swój numer do profesjonalnego, publikowalnego brzmienia.",
    cta: "Zamów",
  },
  {
    no: "04",
    title: "Bity",
    desc: "Przeglądaj katalog produkcji albo zamów bit tworzony od podstaw pod Twój numer.",
    cta: "Przeglądaj",
    href: "/bity",
  },
];

export type PriceItem = {
  title: string;
  note?: string;
  lines: { label?: string; price: string }[];
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
    title: "Spotkanie z producentem",
    note: "Realny wpływ na docelowe brzmienie bitu i garść technik produkcji.",
    lines: [{ price: "250 PLN/h" }],
  },
];

export const process = [
  {
    no: "01",
    title: "Rezerwujesz",
    desc: "Dzwonisz lub piszesz — ustalamy termin i zakres sesji.",
  },
  {
    no: "02",
    title: "Nagrywasz",
    desc: "Kabina, Apollo Twin, własny miks słuchawkowy z UAD Console.",
  },
  { no: "03", title: "Mixujemy", desc: "Strojenie, efekty, przestrzeń — numer zaczyna brzmieć." },
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
    desc: "Oldschoolowa nawijka w nowoczesnym brzmieniu — ozdobne efekty na podbitkach i adlibach.",
  },
  {
    artist: "Pszczoła",
    title: "NCPC?",
    desc: "Dużo przerw w nawijce, więc dużo delayów — przejrzystość i bounce bez chaosu.",
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
    bio: "Muzyka od zawsze — najpierw wokal, potem fascynacja tym, jak mix i mastering uwalniają pełnię brzmienia. Prowadzi studio razem z Adamem i nieustannie rozwija własny warsztat.",
  },
];

export const stats = [
  { value: "14+", label: "Lat doświadczenia" },
  { value: "Rap / Hip-Hop", label: "Nasza specjalizacja" },
  { value: "Nagranie / Mix / Master", label: "Pełen proces" },
  { value: "Warszawa", label: "Targówek, Łojewska 22" },
];

export const nav = [
  { label: "Studio", href: "/#studio" },
  { label: "Oferta", href: "/#oferta" },
  { label: "Cennik", href: "/#cennik" },
  { label: "Bity", href: "/bity" },
  { label: "Realizacje", href: "/#realizacje" },
  { label: "Aktualności", href: "/aktualnosci" },
  { label: "O nas", href: "/#o-nas" },
  { label: "Kontakt", href: "/#kontakt" },
];
