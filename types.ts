
export interface SomalipinProfile {
  magaca: string;
  tagline: string;
  category: string;
  sooyaal: string;
  guulaha: string[];
  xigasho: string;
  socialProof: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type Language = 'so' | 'en' | 'ar' | 'zh' | 'tr';

export const SUPPORTED_LANGUAGES: { code: Language; name: string; icon: string }[] = [
  { code: 'so', name: 'Somali', icon: '🇸🇴' },
  { code: 'en', name: 'English', icon: '🇺🇸' },
  { code: 'ar', name: 'Arabic', icon: '🇸🇦' },
  { code: 'tr', name: 'Turkish', icon: '🇹🇷' },
  { code: 'zh', name: 'Chinese', icon: '🇨🇳' },
];

export const SOMALIPIN_CATEGORIES = [
  'Ganacsiga (Business)',
  'Teknoolajiyadda (Tech)',
  'Farshaxanka (Arts)',
  'Hogaaminta (Leadership)',
  'Ciyaaraha (Sports)',
  'Waxbarashada (Education)',
  'Caafimaadka (Health)',
  'Bulshada (Community)'
];
