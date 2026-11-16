import type { ModuleDefinition } from './types';
import type { LocalePreference } from '@/types/user';
import { localizeText } from '@/lib/i18n/runtime';
import { LANGUAGE_MAP } from '@/lib/i18n/languages';

export const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    id: 'ai',
    name: 'Life Asistanı',
    nameEn: 'Life Assistant',
    icon: '🤖',
    color: '#5B7C6E',
    gradient: 'from-emerald-600 to-teal-700',
    category: 'productivity',
    status: 'ACTIVE',
    description: 'Yerel görev planı; AI varsa sohbet',
    descriptionEn: 'Local task plans; chat when AI is available',
    version: '1.0.0',
    sortOrder: 1,
  },
  {
    id: 'chat',
    name: 'Lifechat',
    nameEn: 'Lifechat',
    icon: '💬',
    color: '#22c55e',
    gradient: 'from-green-400 to-emerald-600',
    category: 'communication',
    status: 'ACTIVE',
    description: 'UI açık · API bulut ister (kapalı)',
    descriptionEn: 'UI open · API needs cloud (off)',
    version: '1.0.0',
    sortOrder: 2,
  },
  {
    id: 'family',
    name: 'Aile',
    nameEn: 'Family',
    icon: '👨‍👩‍👧',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    category: 'communication',
    status: 'ACTIVE',
    description: 'Yerel aile: not, takvim, anı, duyuru',
    descriptionEn: 'Local family: notes, calendar, memories, posts',
    version: '1.0.0',
    sortOrder: 3,
  },
  {
    id: 'finance',
    name: 'Finans',
    nameEn: 'Finance',
    icon: '💰',
    color: '#10b981',
    gradient: 'from-emerald-400 to-teal-600',
    category: 'finance',
    status: 'ACTIVE',
    description: 'Yerel harcama/bütçe · LifeMoney (ödeme kapalı)',
    descriptionEn: 'Local spend/budget · LifeMoney (payments off)',
    version: '1.0.0',
    sortOrder: 4,
  },
  {
    id: 'medai',
    name: 'MedAI',
    nameEn: 'MedAI',
    icon: '🩺',
    color: '#ef4444',
    gradient: 'from-red-400 to-rose-600',
    category: 'health',
    status: 'COMING_SOON',
    description: 'Yol haritası · sağlık AI ekranı yok',
    descriptionEn: 'Roadmap · no health AI screen yet',
    version: '1.0.0',
    sortOrder: 5,
  },
  {
    id: 'smart-home',
    name: 'Akıllı Ev',
    nameEn: 'Smart Home',
    icon: '🏠',
    color: '#0ea5e9',
    gradient: 'from-sky-500 to-indigo-600',
    category: 'home',
    status: 'ACTIVE',
    description: 'HA gerçek olabilir · Matter simülasyon',
    descriptionEn: 'HA may be real · Matter is simulated',
    version: '1.0.0',
    sortOrder: 7,
  },
  {
    id: 'arcade',
    name: 'Oyun Merkezi',
    nameEn: 'Arcade',
    icon: '🎮',
    color: '#f43f5e',
    gradient: 'from-rose-400 to-pink-600',
    category: 'entertainment',
    status: 'ACTIVE',
    description: '20 yerel açık kaynak oyun · skor cihazında',
    descriptionEn: '20 local open-source games · scores on device',
    version: '1.0.0',
    sortOrder: 9,
  },
  {
    id: 'courses',
    name: 'Dersler',
    nameEn: 'Courses',
    icon: '🎓',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    category: 'productivity',
    status: 'ACTIVE',
    description: 'UI açık · Akademi API bulut ister (kapalı)',
    descriptionEn: 'UI open · Academy API needs cloud (off)',
    version: '1.0.0',
    sortOrder: 10,
  },
  {
    id: 'kids',
    name: 'Çocuk Dünyası',
    nameEn: 'Kids',
    icon: '🧒',
    color: '#84cc16',
    gradient: 'from-lime-400 to-green-500',
    category: 'entertainment',
    status: 'ACTIVE',
    description: 'Yerel oyun/hikâye/çizim · film sınırlı',
    descriptionEn: 'Local games/stories/draw · limited videos',
    version: '1.0.0',
    sortOrder: 10,
  },
  {
    id: 'explore',
    name: 'Nodes',
    nameEn: 'Nodes',
    icon: '🧭',
    color: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-500',
    category: 'communication',
    status: 'ACTIVE',
    description: 'UI açık · Nodes API bulut ister (kapalı)',
    descriptionEn: 'UI open · Nodes API needs cloud (off)',
    version: '1.0.0',
    sortOrder: 11,
  },
  {
    id: 'store',
    name: 'Mağaza',
    nameEn: 'Store',
    icon: '🛒',
    color: '#f97316',
    gradient: 'from-orange-400 to-red-500',
    category: 'utility',
    status: 'COMING_SOON',
    description: 'Yol haritası · mağaza / satın alma ekranı yok',
    descriptionEn: 'Roadmap · no store / purchase screen',
    version: '1.0.0',
    sortOrder: 12,
  },
  {
    id: 'files',
    name: 'Dosyalar',
    nameEn: 'Files',
    icon: '📁',
    color: '#0ea5e9',
    gradient: 'from-sky-400 to-blue-500',
    category: 'productivity',
    status: 'COMING_SOON',
    description: 'Dosya yükleme yok · metin için Belgeler',
    descriptionEn: 'No file upload · use Documents for text',
    version: '1.0.0',
    sortOrder: 14,
  },
  {
    id: 'services',
    name: 'Hizmetler',
    nameEn: 'Services',
    icon: '🛎️',
    color: '#10b981',
    gradient: 'from-amber-500 to-emerald-600',
    category: 'utility',
    status: 'ACTIVE',
    description: 'Yerel demo: taksi, otobüs, nakliye, usta',
    descriptionEn: 'Local demo: taxi, bus, moving, handyman',
    version: '1.0.0',
    sortOrder: 15,
  },
  {
    id: 'documents',
    name: 'Belgeler',
    nameEn: 'Documents',
    icon: '📄',
    color: '#475569',
    gradient: 'from-slate-400 to-slate-600',
    category: 'productivity',
    status: 'ACTIVE',
    description: 'Yerel metin belgeleri',
    descriptionEn: 'Local text documents',
    version: '1.0.0',
    sortOrder: 17,
  },
  {
    id: 'media',
    name: 'Medya',
    nameEn: 'Media',
    icon: '🎬',
    color: '#7c3aed',
    gradient: 'from-violet-500 to-purple-700',
    category: 'entertainment',
    status: 'COMING_SOON',
    description: 'Yol haritası · film/TV ekranı yok',
    descriptionEn: 'Roadmap · no media screen yet',
    version: '1.0.0',
    sortOrder: 18,
  },
  {
    id: 'translate',
    name: 'Çeviri',
    nameEn: 'Translate',
    icon: '🌍',
    color: '#0d9488',
    gradient: 'from-teal-400 to-cyan-600',
    category: 'productivity',
    status: 'COMING_SOON',
    description: 'Yol haritası · çeviri motoru yok',
    descriptionEn: 'Roadmap · no translation engine yet',
    version: '1.0.0',
    sortOrder: 19,
  },
  {
    id: 'rewards',
    name: 'Ödüller',
    nameEn: 'Rewards',
    icon: '🏆',
    color: '#ca8a04',
    gradient: 'from-yellow-500 to-amber-600',
    category: 'utility',
    status: 'COMING_SOON',
    description: 'Yol haritası · puan/ödül ekranı yok',
    descriptionEn: 'Roadmap · no rewards screen yet',
    version: '1.0.0',
    sortOrder: 20,
  },
  {
    id: 'automation',
    name: 'Otomasyon',
    nameEn: 'Automation',
    icon: '⚙️',
    color: '#6b7280',
    gradient: 'from-gray-400 to-gray-600',
    category: 'productivity',
    status: 'COMING_SOON',
    description: 'Yol haritası · senaryo motoru yok',
    descriptionEn: 'Roadmap · no automation engine yet',
    version: '1.0.0',
    sortOrder: 21,
  },
  {
    id: 'app-builder',
    name: 'Uygulama Oluşturucu',
    nameEn: 'App Builder',
    icon: '🧩',
    color: '#ec4899',
    gradient: 'from-pink-400 to-rose-600',
    category: 'productivity',
    status: 'COMING_SOON',
    description: 'Yol haritası · no-code oluşturucu yok',
    descriptionEn: 'Roadmap · no app builder yet',
    version: '1.0.0',
    sortOrder: 22,
  },
  {
    id: 'taxi',
    name: 'Taksi',
    nameEn: 'Taxi',
    icon: '🚕',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    category: 'utility',
    status: 'ACTIVE',
    description: 'Yerel demo · gerçek sürücü/ödeme yok',
    descriptionEn: 'Local demo · no real driver/payment',
    version: '1.0.0',
    sortOrder: 23,
  },
  {
    id: 'travel',
    name: 'Seyahat',
    nameEn: 'Travel',
    icon: '🚌',
    color: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-500',
    category: 'utility',
    status: 'ACTIVE',
    description: 'Yerel demo · gerçek bilet satışı yok',
    descriptionEn: 'Local demo · no real ticket sales',
    version: '1.0.0',
    sortOrder: 24,
  },
  {
    id: 'moving',
    name: 'Nakliye',
    nameEn: 'Moving',
    icon: '🚚',
    color: '#10b981',
    gradient: 'from-emerald-400 to-teal-500',
    category: 'utility',
    status: 'ACTIVE',
    description: 'Yerel demo · gerçek nakliyeci eşleşmesi yok',
    descriptionEn: 'Local demo · no real mover matching',
    version: '1.0.0',
    sortOrder: 25,
  },
  {
    id: 'craftsman',
    name: 'Usta',
    nameEn: 'Craftsman',
    icon: '🛠️',
    color: '#8b5cf6',
    gradient: 'from-purple-400 to-violet-500',
    category: 'utility',
    status: 'ACTIVE',
    description: 'Yerel demo · gerçek usta eşleşmesi yok',
    descriptionEn: 'Local demo · no real pro matching',
    version: '1.0.0',
    sortOrder: 26,
  },
];

/** Library honesty chips (not product status — UI hint only). */
export type LibraryHonestyKind = 'cloud_off' | 'local_demo';

export function getLibraryHonesty(moduleId: string): LibraryHonestyKind | null {
  if (moduleId === 'chat' || moduleId === 'courses' || moduleId === 'explore') return 'cloud_off';
  if (
    moduleId === 'services' ||
    moduleId === 'taxi' ||
    moduleId === 'travel' ||
    moduleId === 'moving' ||
    moduleId === 'craftsman'
  ) {
    return 'local_demo';
  }
  return null;
}

/** Modules permanently removed from the product surface. */
export const REMOVED_MODULE_IDS = new Set(['camera', 'cloud', 'emergency', 'energy']);

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find((m) => m.id === id);
}

export function getActiveModules(): ModuleDefinition[] {
  return MODULE_REGISTRY.filter((m) => m.status === 'ACTIVE');
}

export function getComingSoonModules(): ModuleDefinition[] {
  return MODULE_REGISTRY.filter((m) => m.status === 'COMING_SOON');
}

export function getModulesByCategory(category: string): ModuleDefinition[] {
  return MODULE_REGISTRY.filter((m) => m.category === category && m.status === 'ACTIVE');
}

export function isHomescreenEligible(id: string): boolean {
  if (REMOVED_MODULE_IDS.has(id)) return false;
  const mod = getModuleById(id);
  return Boolean(mod && mod.status === 'ACTIVE');
}

export function getLocalizedModuleName(m: ModuleDefinition, locale: string = 'tr'): string {
  const language = LANGUAGE_MAP.has(locale as LocalePreference) ? locale as LocalePreference : 'en';
  return localizeText(m.name, language);
}

export function getLocalizedModuleDescription(m: ModuleDefinition, locale: string = 'tr'): string {
  const language = LANGUAGE_MAP.has(locale as LocalePreference) ? locale as LocalePreference : 'en';
  return localizeText(m.description, language);
}

export function searchModules(query: string, locale: string = 'tr'): ModuleDefinition[] {
  const q = query.toLowerCase();
  return MODULE_REGISTRY.filter((m) => {
    const name = getLocalizedModuleName(m, locale).toLowerCase();
    const desc = getLocalizedModuleDescription(m, locale).toLowerCase();
    return name.includes(q) || desc.includes(q) || m.id.includes(q);
  });
}

/** Only ACTIVE modules on the default homescreen — no stub icons. */
export const DEFAULT_HOMESCREEN_MODULES = [
  'documents',
  'services',
  'family',
  'finance',
  'arcade',
  'kids',
  'smart-home',
  'ai',
].filter((id) => isHomescreenEligible(id));

export const DEFAULT_DOCK_MODULES = [
  'services',
  'ai',
  'family',
  'finance',
].filter((id) => isHomescreenEligible(id));

export function isRemovedModule(id: string): boolean {
  return REMOVED_MODULE_IDS.has(id);
}

export function filterRemovedModules<T extends { moduleId?: string; id?: string }>(items: T[]): T[] {
  return items.filter((item) => {
    const id = item.moduleId ?? item.id;
    return !id || !REMOVED_MODULE_IDS.has(id);
  });
}

/** Drop removed + COMING_SOON entries from homescreen/dock layouts. */
export function filterHomescreenEligible<T extends { moduleId?: string; id?: string }>(items: T[]): T[] {
  return items.filter((item) => {
    const id = item.moduleId ?? item.id;
    return !id || isHomescreenEligible(id);
  });
}

