export type EventStatus = 'registration_open' | 'coming_soon' | 'completed' | 'sold_out';

export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'NONE';

export type PaymentMethod = 'kaspi' | 'card' | 'apple_pay' | 'promocode';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export type DocumentKey = string;

export interface LegalDocument {
  id: string;
  key?: string;
  title: string;
  subtitle?: string;
  date?: string;
  fileUrl?: string; // Direct link or Data URL for PDF/DOC
  fileName?: string; // Name of uploaded file e.g. "Polozhenie_Aqtobe_2026.pdf"
  fileSize?: string; // e.g. "2.4 MB"
  contentHtml?: string; // Optional legacy text
  updatedAt?: string;
  order?: number;
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
  bibPrefix?: string; // e.g. "27", "42", "HALF"
  bibStartNumber?: number; // Starting number e.g. 1
  bibEndNumber?: number; // Ending range e.g. 300
  bibDigitsPadding?: number; // e.g. 3 -> "001", "002"
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
  charityFundName?: string; // e.g. "фонд «Бақытты Бала»"
  charityDescription?: string; // e.g. "Средства пойдут на закупку спортивной формы..."
  enableStartClusters?: boolean; // Control start cluster & elite pace selection in registration
  resultsUrl?: string; // Optional direct results URL for this event
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
  resultsUrl?: string; // Direct link to external results / protocols (MyLaps, ChronoTrack, etc.)
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
  promocodeUsed?: string;
  discountAmount?: number;
  registrationDate: string;
  checkedInExpo?: boolean;
}

export type PromoCodeDiscountType = 'free' | 'percentage' | 'fixed';

export interface PromoCode {
  id: string;
  code: string; // e.g. "VIP2027", "FREE100" - always uppercase & trimmed
  discountType: PromoCodeDiscountType; // 'free' (100% off), 'percentage' (% off), 'fixed' (fixed amount off in ₸)
  discountValue: number; // 100 for 'free', 1-99 for 'percentage', amount in ₸ for 'fixed'
  eventId?: string; // specific event or all events if empty
  distanceId?: string; // specific distance or all if empty
  maxUses?: number; // max usage count, undefined/0 = unlimited
  usedCount: number;
  expiresAt?: string; // ISO date string or empty
  active: boolean;
  description?: string; // Note for admin (e.g. "Для почетных гостей и спонсоров")
  createdAt: string;
}

export interface RaceResult {
  id: string;
  eventId?: string;
  distanceId?: string;
  bibNumber: string;
  fullName: string;
  name?: string;
  gender: 'M' | 'F' | 'male' | 'female';
  ageGroup: string;
  distanceName: string;
  chipTime: string; // e.g. "00:34:03"
  gunTime: string;
  avgPace: string; // e.g. "3:20 мин/км"
  overallPlace: number;
  genderPlace: number;
  categoryPlace: number;
  overallRank?: number;
  genderRank?: number;
  categoryRank?: number;
  city?: string;
  country?: string;
  team?: string;
  splits?: Record<string, string> | {
    split10k?: string;
    split21k?: string;
    split30k?: string;
    split5k?: string;
    km10?: string;
    km21?: string;
    km30?: string;
    [key: string]: string | undefined;
  };
}

export interface NewsletterContact {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  name: string;
  phone?: string;
  city?: string;
  source: 'archive_import' | 'website_registration' | 'manual' | string;
  subscribedAt?: string;
  createdAt?: string;
  status?: 'active' | 'unsubscribed';
  active?: boolean;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  bannerImageUrl?: string;
  badgeText: string;
  title: string;
  greetingText?: string;
  greeting?: string;
  mainBodyText?: string;
  body?: string;
  highlightBoxTitle?: string;
  highlightBoxText?: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  footerNote?: string;
  footerText?: string;
  updatedAt?: string;
}

export interface EmailServerConfig {
  provider: 'resend' | 'smtp' | 'demo';
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpPassword?: string;
  smtpSecure?: boolean;
  fromName: string;
  fromEmail: string;
}
