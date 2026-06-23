import type { FeatureVector } from "../lib/types";

export interface EditorialArtist {
  name: string;
  region: "india" | "global";
  lane: "bollywood" | "indie" | "south" | "legacy" | "global";
  pullQuote: string;
  features: FeatureVector;
}

export interface ConcertCard {
  id: string;
  city: string;
  venue: string;
  date: string;
  artist: string;
  supporting: string;
  mood: string;
  image: string;
  accent: string;
}

export interface EditorialImage {
  id: string;
  label: string;
  src: string;
  credit: string;
}

export const HERO_ARTISTS: EditorialArtist[] = [
  {
    name: "Arijit Singh",
    region: "india",
    lane: "bollywood",
    pullQuote: "Late-night heartbreak, stadium scale.",
    features: { energy: 0.42, valence: 0.45, tempo: 0.42, acoustic: 0.56 },
  },
  {
    name: "Sunidhi Chauhan",
    region: "india",
    lane: "bollywood",
    pullQuote: "Power vocals for the main character entry.",
    features: { energy: 0.82, valence: 0.72, tempo: 0.76, acoustic: 0.34 },
  },
  {
    name: "Anirudh Ravichander",
    region: "india",
    lane: "south",
    pullQuote: "Mass moments, synth hooks, arena electricity.",
    features: { energy: 0.88, valence: 0.78, tempo: 0.84, acoustic: 0.24 },
  },
  {
    name: "The Weeknd",
    region: "global",
    lane: "global",
    pullQuote: "After-hours pop with neon shadows.",
    features: { energy: 0.72, valence: 0.45, tempo: 0.7, acoustic: 0.18 },
  },
  {
    name: "Prateek Kuhad",
    region: "india",
    lane: "indie",
    pullQuote: "Soft-spoken songs that feel handwritten.",
    features: { energy: 0.3, valence: 0.5, tempo: 0.35, acoustic: 0.82 },
  },
];

export const EDITORIAL_IMAGES: EditorialImage[] = [
  {
    id: "crowd",
    label: "A live crowd under stage lights",
    src: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1400&q=85",
    credit: "Unsplash concert crowd",
  },
  {
    id: "stage",
    label: "A singer on a dark stage",
    src: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85",
    credit: "Unsplash live performance",
  },
  {
    id: "festival",
    label: "Festival lights and raised hands",
    src: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85",
    credit: "Unsplash festival",
  },
];

export const CONCERTS: ConcertCard[] = [
  {
    id: "mumbai-arijit",
    city: "Mumbai",
    venue: "Jio World Garden",
    date: "Sat, 22 Aug",
    artist: "Arijit Singh",
    supporting: "with an acoustic string section",
    mood: "For people who know every bridge by heart",
    image: EDITORIAL_IMAGES[0].src,
    accent: "#1db954",
  },
  {
    id: "bengaluru-indie",
    city: "Bengaluru",
    venue: "Jayamahal Palace Grounds",
    date: "Fri, 11 Sep",
    artist: "Prateek Kuhad + When Chai Met Toast",
    supporting: "an indie night under warm lights",
    mood: "Soft chorus, real friends, no rush",
    image: EDITORIAL_IMAGES[2].src,
    accent: "#e8ff3a",
  },
  {
    id: "hyderabad-south",
    city: "Hyderabad",
    venue: "Gachibowli Stadium",
    date: "Sun, 27 Sep",
    artist: "Anirudh Ravichander",
    supporting: "with a South cinema hit set",
    mood: "Mass energy, hands up, no sitting down",
    image: EDITORIAL_IMAGES[1].src,
    accent: "#3ad1ff",
  },
];

export const PLAYLIST_CONCEPTS = [
  {
    title: "Monsoon Main Character",
    people: 8,
    aura: "Tender / Euphoric",
    blurb: "Friends add tracks, AURA keeps the emotional arc coherent.",
  },
  {
    title: "Hostel After Hours",
    people: 14,
    aura: "Nocturnal / Feral",
    blurb: "A native collaborative playlist that can later sync to Spotify.",
  },
  {
    title: "Shaadi Sangeet Brief",
    people: 5,
    aura: "Legacy / Dance",
    blurb: "Bollywood, Punjabi pop, family classics, and zero dead air.",
  },
];

export const WRAPPED_SEEDS = [
  { label: "Your midnight loop", value: "Arijit into The Weeknd", tone: "private" },
  { label: "Crowd mode", value: "South Indian anthems", tone: "loud" },
  { label: "Skipped least", value: "Shreya Ghoshal ballads", tone: "loyal" },
];

