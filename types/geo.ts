export interface GeoFaq {
  question: string;
  answer: string;
}

export interface GeoSection {
  title: string;
  body?: string;
  items?: string[];
}

export type GeoDestinationQuickFactIcon = "plane" | "calendar" | "thermometer" | "wallet" | "map-pin";

export interface GeoDestinationHero {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  image: string;
  imageAlt: string;
  primaryCtaLabel: string;
  allToursCtaLabel: string;
  secondaryCtaLabel: string;
}

export interface GeoDestinationQuickFact {
  icon: GeoDestinationQuickFactIcon;
  label: string;
  value: string;
}

export interface GeoDestinationIntro {
  eyebrow: string;
  title: string;
  paragraphs: string[];
}

export interface GeoDestinationGuideCard {
  title: string;
  content: string;
}

export interface GeoDestinationGuide {
  eyebrow: string;
  title: string;
  cards: GeoDestinationGuideCard[];
}

export interface GeoDestinationActivity {
  title: string;
  desc: string;
  img: string;
  video?: string;
  credit?: string;
}

export interface GeoDestinationActivities {
  eyebrow: string;
  title: string;
  items: GeoDestinationActivity[];
}

export interface GeoDestinationTravelStep {
  step: string;
  title: string;
  desc: string;
}

export interface GeoDestinationTravel {
  eyebrow: string;
  title: string;
  steps: GeoDestinationTravelStep[];
}

export interface GeoDestinationBudgetItem {
  item: string;
  range: string;
}

export interface GeoDestinationBudget {
  eyebrow: string;
  title: string;
  items: GeoDestinationBudgetItem[];
  totalLabel: string;
  totalValue: string;
  note: string;
}

export interface GeoDestinationEmptyTours {
  icon: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface GeoDestinationFinalCta {
  title: string;
  description: string;
  buttonLabel: string;
}

export interface GeoDestinationContent {
  hero: GeoDestinationHero;
  quickFacts: GeoDestinationQuickFact[];
  intro: GeoDestinationIntro;
  guide: GeoDestinationGuide;
  activities: GeoDestinationActivities;
  travel: GeoDestinationTravel;
  budget: GeoDestinationBudget;
  emptyTours: GeoDestinationEmptyTours;
  finalCta: GeoDestinationFinalCta;
}

export interface GeoPageContent {
  routePath: string;
  title: string;
  eyebrow: string;
  metaTitle?: string;
  metaDescription: string;
  answer: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  sections: GeoSection[];
  faqs: GeoFaq[];
  destination?: GeoDestinationContent;
  schemaType: string;
  published: boolean;
}
