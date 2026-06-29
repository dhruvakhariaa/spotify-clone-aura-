/**
 * Concert dataset — fake, but built to FEEL real: full venue/date/lineup,
 * a stadium seat map, fan testimonials, and AURA's signature anti-scalper
 * "Fan Seats" (prime seats AURA blocks from resellers and holds at face value
 * for verified fans — which seats depends on the listener's Aura).
 *
 * Images are placeholders: drop real files at the documented /public paths and
 * they appear automatically (see public/PLACEHOLDERS.md). Until then a labelled
 * placeholder renders via <PlaceholderImage>.
 */

export type SectionRing = "floor" | "lower" | "upper";
export type SectionStatus = "available" | "sold" | "scalper";

export interface StadiumSection {
  id: string;
  label: string;
  ring: SectionRing;
  /** Face value in INR. */
  price: number;
  status: SectionStatus;
  /** Resale markup scalpers are charging (only meaningful for status "scalper"). */
  resaleMultiplier?: number;
}

export interface Testimonial {
  name: string;
  handle: string;
  quote: string;
  /** Placeholder avatar path under /public. */
  avatar: string;
}

export interface Concert {
  id: string;
  artist: string;
  tagline: string;
  supporting: string[];
  city: string;
  venue: string;
  venueType: "Stadium" | "Arena" | "Grounds";
  date: string;
  doors: string;
  capacity: number;
  accent: string;
  /** Placeholder image paths under /public. */
  heroImage: string;
  gallery: string[];
  about: string;
  setlistTease: string[];
  sections: StadiumSection[];
  testimonials: Testimonial[];
}

/** A standard bowl, priced off a base face value, with a couple of prime
 *  sections already gobbled up by scalpers (this is the problem AURA fixes). */
function makeStadium(base: number): StadiumSection[] {
  const r = (n: number) => Math.round((base * n) / 100) * 100;
  return [
    { id: "PIT", label: "Front Pit", ring: "floor", price: r(2.4), status: "scalper", resaleMultiplier: 3.2 },
    { id: "FLA", label: "Floor A", ring: "floor", price: r(2.0), status: "available" },
    { id: "FLB", label: "Floor B", ring: "floor", price: r(1.7), status: "available" },
    { id: "L101", label: "Lower 101", ring: "lower", price: r(1.35), status: "sold" },
    { id: "L102", label: "Lower 102", ring: "lower", price: r(1.35), status: "available" },
    { id: "L103", label: "Lower 103", ring: "lower", price: r(1.3), status: "scalper", resaleMultiplier: 2.6 },
    { id: "L104", label: "Lower 104", ring: "lower", price: r(1.3), status: "available" },
    { id: "U201", label: "Upper 201", ring: "upper", price: r(0.8), status: "available" },
    { id: "U202", label: "Upper 202", ring: "upper", price: r(0.7), status: "available" },
    { id: "U203", label: "Upper 203", ring: "upper", price: r(0.7), status: "sold" },
    { id: "U204", label: "Upper 204", ring: "upper", price: r(0.65), status: "available" },
  ];
}

export const CONCERTS: Concert[] = [
  {
    id: "mumbai-arijit",
    artist: "Arijit Singh",
    tagline: "Live with a 40-piece string section",
    supporting: ["Jonita Gandhi", "Lothika"],
    city: "Mumbai",
    venue: "Jio World Garden",
    venueType: "Grounds",
    date: "Sat, 22 Aug 2026",
    doors: "6:00 PM",
    capacity: 18000,
    accent: "#7c5cff",
    heroImage: "/concerts/mumbai-arijit/hero.jpg",
    gallery: ["/concerts/mumbai-arijit/1.jpg", "/concerts/mumbai-arijit/2.jpg", "/concerts/mumbai-arijit/3.jpg"],
    about:
      "An all-night journey through every heartbreak you've memorised — reorchestrated live with a string section under open Mumbai sky. Arijit takes requests mid-set; the bridge of 'Kabhi Jo Baadal Barse' has reduced entire grounds to silence.",
    setlistTease: ["Tum Hi Ho", "Kabhi Jo Baadal Barse", "Channa Mereya", "Ae Dil Hai Mushkil", "Phir Le Aaya Dil"],
    sections: makeStadium(5000),
    testimonials: [
      { name: "Ananya Rao", handle: "@ananyalistens", quote: "I cried during Channa Mereya and so did the 40-year-old uncle next to me. Worth every rupee.", avatar: "/concerts/testimonials/1.jpg" },
      { name: "Dev Mehta", handle: "@devmehta", quote: "Scalpers wanted 18k for floor. AURA held my seat at face value because I'd been looping him all year. Unreal.", avatar: "/concerts/testimonials/2.jpg" },
      { name: "Sara Q.", handle: "@saraq", quote: "The string section reorchestration of Phir Le Aaya Dil is something I'll hear for the rest of my life.", avatar: "/concerts/testimonials/3.jpg" },
    ],
  },
  {
    id: "bengaluru-indie",
    artist: "Prateek Kuhad",
    tagline: "+ When Chai Met Toast — an indie night under warm lights",
    supporting: ["When Chai Met Toast", "Taba Chake"],
    city: "Bengaluru",
    venue: "Jayamahal Palace Grounds",
    venueType: "Grounds",
    date: "Fri, 11 Sep 2026",
    doors: "5:30 PM",
    capacity: 8000,
    accent: "#e8b54a",
    heroImage: "/concerts/bengaluru-indie/hero.jpg",
    gallery: ["/concerts/bengaluru-indie/1.jpg", "/concerts/bengaluru-indie/2.jpg", "/concerts/bengaluru-indie/3.jpg"],
    about:
      "Fairy lights, a lawn, and the softest crowd in the country singing 'cold/mess' back at full volume. When Chai Met Toast open with the kind of sunshine set that makes strangers into friends by the encore.",
    setlistTease: ["cold/mess", "Tum Jab Paas", "Kasoor", "Khareedo Na", "Fighter"],
    sections: makeStadium(3000),
    testimonials: [
      { name: "Meghna S.", handle: "@meghnasings", quote: "Lay on the grass, held hands with people I'd just met, and screamed every word of cold/mess. Perfect night.", avatar: "/concerts/testimonials/4.jpg" },
      { name: "Rohan I.", handle: "@rohanindie", quote: "I'm a broke student — fan seats meant I actually got in instead of watching reseller prices triple.", avatar: "/concerts/testimonials/5.jpg" },
      { name: "Tara", handle: "@tarastar", quote: "WCMT's set is pure serotonin. Best ₹3k I've ever spent.", avatar: "/concerts/testimonials/6.jpg" },
    ],
  },
  {
    id: "hyderabad-south",
    artist: "Anirudh Ravichander",
    tagline: "The Hukum Tour — mass energy, hands up, no sitting down",
    supporting: ["Sid Sriram", "Dhee"],
    city: "Hyderabad",
    venue: "GMC Balayogi Stadium",
    venueType: "Stadium",
    date: "Sun, 27 Sep 2026",
    doors: "5:00 PM",
    capacity: 30000,
    accent: "#3ad1ff",
    heroImage: "/concerts/hyderabad-south/hero.jpg",
    gallery: ["/concerts/hyderabad-south/1.jpg", "/concerts/hyderabad-south/2.jpg", "/concerts/hyderabad-south/3.jpg"],
    about:
      "Pyro, a live band, and 30,000 people who know every BGM by heart. When the 'Vaathi Coming' drop hits, the whole stadium becomes one moving thing. Sid Sriram's interlude is the only time anyone sits down.",
    setlistTease: ["Vaathi Coming", "Arabic Kuthu", "Why This Kolaveri Di", "Hukum", "Rowdy Baby"],
    sections: makeStadium(4000),
    testimonials: [
      { name: "Karthik V.", handle: "@karthikv", quote: "Arabic Kuthu live with pyro is a religious experience. My ears rang for two days. Zero regrets.", avatar: "/concerts/testimonials/7.jpg" },
      { name: "Nila", handle: "@nilamusic", quote: "Got AURA fan seats in the lower bowl at face value — resellers were asking 4×. Felt like the system finally worked for actual fans.", avatar: "/concerts/testimonials/8.jpg" },
      { name: "Aravind", handle: "@aravindbeats", quote: "Sid Sriram's interlude → straight into Hukum. 30,000 people lost it. Best live drop I've witnessed.", avatar: "/concerts/testimonials/9.jpg" },
    ],
  },
];

export function getConcert(id: string | undefined): Concert | undefined {
  return CONCERTS.find((c) => c.id === id);
}

export function inr(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

/**
 * Which prime sections AURA has reserved for THIS listener at face value.
 * Deterministic from the Aura seed so it's stable per user, and only ever
 * targets prime (floor/lower) sections — the ones scalpers hunt.
 */
export function auraReservedSectionIds(sections: StadiumSection[], seed: number): string[] {
  const prime = sections.filter((s) => s.ring !== "upper");
  if (!prime.length) return [];
  const first = prime[seed % prime.length];
  const second = prime[(seed * 7 + 3) % prime.length];
  return Array.from(new Set([first.id, second.id]));
}
