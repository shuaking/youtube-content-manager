export interface FeatureCard {
  title: string;
  description: string;
  image: string;
  link: string;
  isDoubleWidth?: boolean;
}

export interface NavigationItem {
  label: string;
  href: string;
  isExternal?: boolean;
  badge?: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageSmall: string;
  imageLarge: string;
}
