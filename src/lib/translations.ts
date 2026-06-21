/**
 * KUFULULA Multilingual & Local Congo Languages Translation Dictionary
 * Precise French 🇫🇷, English 🇺🇸, and Congo National Languages (Lingala, Swahili, Tshiluba, Kikongo) 🇨🇩
 * Delegated to /src/langue/ modular files.
 */

import { fr } from "../langue/fr";
import { en } from "../langue/en";
import { sw } from "../langue/sw";
import { lu } from "../langue/lu";
import { kg } from "../langue/kg";
import { ln } from "../langue/ln";

export type AppLanguage = 'fr' | 'en' | 'ln' | 'sw' | 'lu' | 'kg';

export interface TranslationDictionary {
  appName: string;
  heroBadge: string;
  heroTitle: string;
  heroSub: string;
  searchPlaceholder: string;
  categoryAll: string;
  categoryElectronics: string;
  categoryFood: string;
  categoryFashion: string;
  categoryHome: string;
  categoryBooks: string;
  noProductFound: string;
  noProductSub: string;
  cartTitle: string;
  addToCart: string;
  buyNow: string;
  negotiate: string;
  share: string;
  like: string;
  comment: string;
  commentsTitle: string;
  writeComment: string;
  postComment: string;
  colorSelect: string;
  angleSelect: string;
  specifications: string;
  vendorLabel: string;
  stockLabel: string;
  priceLabel: string;
  escrowBadge: string;
  escrowActiveBadge: string;
  escrowStatusSecured: string;
  kycVerificationRequired: string;
  backToShop: string;
  settingsTitle: string;
  themeSelect: string;
  fontSelect: string;
  currencyToggle: string;
  adminPortal: string;
  voiceSearchListen: string;
  voiceSearchStop: string;
  lensTitle: string;
  lensScan: string;
  negotiationTitle: string;
  negotiateSubmit: string;
  negotiateCounter: string;

  // Navigation cultural keys
  navHome: string;
  navAbout: string;
  navWorks: string;
  navImpact: string;
  navAwards: string;
  navContact: string;

  // Hero Section
  heroAuthorTitle: string;
  heroAuthorSub: string;
  heroQuote: string;
  heroSlogan: string;
  btnDiscoverWorks: string;
  btnJoinFoundation: string;

  // About Section
  aboutTitle: string;
  aboutDesc1: string;
  aboutMissionTitle: string;
  aboutMissionDesc: string;
  aboutResilienceTitle: string;
  aboutResilienceDesc: string;

  // Literary Works
  worksTitle: string;
  work1Title: string;
  work1Type: string;
  work1Desc: string;
  work2Title: string;
  work2Type: string;
  work2Desc: string;

  // Impact Section
  impactTitle: string;
  impactSubtitle: string;
  impactIntro: string;
  impact1Title: string;
  impact1Desc: string;
  impact2Title: string;
  impact2Desc: string;
  impact3Title: string;
  impact3Desc: string;

  // Awards Section
  awardsTitle: string;
  award1: string;
  award2: string;
  award3: string;
  award4: string;

  // Contact
  contactTitle: string;
  fieldFullName: string;
  fieldEmail: string;
  fieldMessage: string;
  fieldSubmit: string;
  footerText: string;
  footerPower: string;
}

export const translations: Record<AppLanguage, TranslationDictionary> = {
  fr,
  en,
  sw,
  lu,
  kg,
  ln
};
