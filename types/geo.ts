export interface GeoFaq {
  question: string;
  answer: string;
}

export interface GeoSection {
  title: string;
  body?: string;
  items?: string[];
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
  schemaType: string;
  published: boolean;
}
