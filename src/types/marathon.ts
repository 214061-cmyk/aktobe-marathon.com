export type EventStatus = 'registration_open' | 'coming_soon' | 'completed' | 'sold_out';

export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'NONE';

export type PaymentMethod = 'kaspi' | 'card' | 'apple_pay';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export type DocumentKey = 'regulation' | 'offer' | 'privacy' | 'medical' | 'transfer';

export interface LegalDocument {
  key: DocumentKey;
  title: string;
  subtitle?: string;
  date?: string;
  fileUrl?: string; // Direct link or Data URL for PDF/DOC
  fileName?: string; // Name of uploaded file e.g. "Polozhenie_Aqtobe_2026.pdf"
  fileSize?: string; // e.g. "2.4 MB"
  contentHtml?: string; // Editable custom text
}

export interface AgeCategory {
  id: string;
  name: string; // e.g. "18-25 лет"
  minAge: number; // 18
  maxAge: number; // 25
}

export interface RoutePoint {
  id: string;
  type: 'start' | 'finish' | 'water' | 'medical' | 'toilet' | 'cheer' | 'timing';
  coords: [number, number];
  title: string;
  description: string;
}

export interface Distance {
  id: string;
  name: string;
  tag: string;
  distanceKm: number;
  price: number;
  slots: number;
  registeredCount: number;
  minAge: number;
  timeLimit: string;
  elevationGain: string;
  startTime: string;
  badgeColor: string; // e.g. 'lime', 'orange', 'cyan', 'purple'
  hexColor: string;
  features: string[];
  ageCategories: AgeCategory[];
  routeWaypoints: [number, number][];
  points: RoutePoint[];
  mapImageUrl?: string; // Uploaded custom scheme/map image for this distance
}

export interface ScheduleItem {
  time: string;
  title: string;
  location: string;
  category: 'expo' | 'start' | 'award' | 'social';
}

export interface ScheduleDay {
  date: string;
  dayName: string;
  items: ScheduleItem[];
}

export interface Sponsor {
  id?: string;
  name: string;
  tier: 'title' | 'general' | 'technical' | 'official' | 'media';
  logoText: string;
  logoUrl?: string; // Optional image url
  accent: string;
  websiteUrl?: string;
}

export interface EventOptionsConfig {
  enableTShirt: boolean;
  tShirtPrice: number; // 0 if included in slot, or price if optional extra
  enableMedalEngraving: boolean;
  medalEngravingPrice: number;
  enablePastaParty: boolean;
  pastaPartyPrice: number;
  enableCharity: boolean;
}

export interface MarathonEvent {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  date: string; // e.g. "2026-05-17T07:00:00"
  displayDate: string;
  city: string;
  location: string;
  status: EventStatus;
  description: string;
  bannerImage: string;
  prizePool: string;
  totalSlots: number;
  centerCoords: [number, number];
  distances: Distance[];
  schedule: ScheduleDay[];
  sponsors: Sponsor[];
  optionsConfig?: EventOptionsConfig;
}

export interface Participant {
  id: string;
  eventId: string;
  distanceId: string;
  distanceName: string;
  bibNumber: string;
  firstName: string;
  lastName: string;
  gender: 'male' | 'female';
  birthDate: string;
  age: number;
  ageCategory: string; // e.g. "18-25 лет"
  email: string;
  phone: string;
  city: string;
  country: string;
  club?: string;
  wantsTShirt: boolean;
  tShirtSize?: TShirtSize;
  emergencyContact: string;
  medalEngraving: boolean;
  pastaParty: boolean;
  charityContribution: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  registrationDate: string;
  checkedInExpo?: boolean;
}

export interface RaceResult {
  id: string;
  bibNumber: string;
  fullName: string;
  name?: string;
  gender: 'M' | 'F' | 'male' | 'female';
  ageGroup: string;
  distanceName: string;
  chipTime: string; // 02:45:12
  gunTime: string;
  avgPace: string; // 3:55 min/km
  overallPlace: number;
  genderPlace: number;
  categoryPlace: number;
  overallRank?: number;
  genderRank?: number;
  categoryRank?: number;
  splits: {
    split10k?: string;
    split21k?: string;
    split30k?: string;
    split5k?: string;
    km10?: string;
    km21?: string;
    km30?: string;
  };
}
