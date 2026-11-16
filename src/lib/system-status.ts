import { getActiveModules, getComingSoonModules } from '@/modules/registry';

export type FeatureHealth = 'ready' | 'partial' | 'stub' | 'off';

export type SystemStatusItem = {
  id: string;
  title: string;
  detail: string;
  health: FeatureHealth;
  group: 'core' | 'module' | 'infra';
};

/**
 * Honest readiness map for the current build (Supabase/payment intentionally off).
 */
export function getSystemStatus(): SystemStatusItem[] {
  const cloudBoundIds = new Set(['courses', 'explore', 'chat']);
  const localDemoIds = new Set(['services', 'taxi', 'travel', 'moving', 'craftsman']);
  const active = getActiveModules().map((m) => {
    if (cloudBoundIds.has(m.id)) {
      return {
        id: `mod-${m.id}`,
        title: m.name,
        detail:
          m.id === 'courses'
            ? 'UI açık · Akademi Supabase/BBB ister (kapalı)'
            : m.id === 'explore'
              ? 'UI açık · Nodes Supabase ister (kapalı)'
              : 'UI açık · Lifechat API bulut ister (kapalı)',
        health: 'off' as const,
        group: 'module' as const,
      };
    }
    if (localDemoIds.has(m.id)) {
      return {
        id: `mod-${m.id}`,
        title: m.name,
        detail: m.description || 'Yerel demo · gerçek ödeme/eşleşme yok',
        health: 'partial' as const,
        group: 'module' as const,
      };
    }
    return {
      id: `mod-${m.id}`,
      title: m.name,
      detail: m.description || 'Ana ekrana eklenebilir',
      health: 'ready' as const,
      group: 'module' as const,
    };
  });

  const soon = getComingSoonModules().map((m) => ({
    id: `soon-${m.id}`,
    title: m.name,
    detail: m.description || 'Yol haritası — ana ekrana eklenmez',
    health: 'stub' as const,
    group: 'module' as const,
  }));

  const core: SystemStatusItem[] = [
    {
      id: 'auth-local',
      title: 'Yerel giriş / kayıt',
      detail: 'İmzalı httpOnly oturum + scrypt şifre',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'homescreen',
      title: 'Ana ekran & dock',
      detail: 'Yalnızca aktif modüller',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'supabase',
      title: 'Supabase Auth / bulut DB',
      detail: 'Bilinçli olarak bağlı değil',
      health: 'off',
      group: 'infra',
    },
    {
      id: 'payment',
      title: 'Ödeme / kredi yükleme',
      detail: 'Bilinçli olarak kapalı',
      health: 'off',
      group: 'infra',
    },
    {
      id: 'lifechat-api',
      title: 'Lifechat / Connect API',
      detail: 'Connect REST emekli (410); bulut oturumu olmadan kapalı',
      health: 'off',
      group: 'infra',
    },
    {
      id: 'privacy-prefs',
      title: 'Gizlilik tercihleri',
      detail: 'Profil / telemetri / aktivite — cihazda kalıcı',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'assistant',
      title: 'Life Asistanı',
      detail: 'Görev planı offline hazır; sohbet AI için Ollama/OpenAI',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'smarthome',
      title: 'Akıllı Ev',
      detail: 'HA gerçek olabilir; Matter yerel simülasyon',
      health: 'partial',
      group: 'core',
    },
    {
      id: 'local-backup',
      title: 'Yerel JSON yedek',
      detail: 'Finans / Aile / Belgeler dışa-içe aktarım',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'lifemoney',
      title: 'LifeMoney para birimi',
      detail: '1 LM = 2,38 ₺ — uygulama geneli birim',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'finance-suite',
      title: 'Finans paketi (offline)',
      detail: 'Harcama, bütçe, hedef, abonelik — LifeMoney',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'family-depth',
      title: 'Aile paketi (offline)',
      detail: 'Üye, not, takvim, anı, duyuru — cihaz lokal; bulut daveti yok',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'documents-local',
      title: 'Belgeler (offline)',
      detail: 'Metin belge CRUD — cihaz lokal; dosya yükleme yok',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'services-local',
      title: 'Hizmetler (yerel demo)',
      detail: 'Usta/Seyahat/Nakliye/Taksi — ödeme ve gerçek eşleşme yok',
      health: 'partial',
      group: 'core',
    },
    {
      id: 'arcade-kids',
      title: 'Arcade & Çocuk',
      detail: '20 yerel oyun + kids içerik; ebeveyn PIN ilk kullanımda zorunlu değişir',
      health: 'ready',
      group: 'core',
    },
    {
      id: 'coming-soon-stubs',
      title: 'COMING_SOON modüller',
      detail: '8 stub: MedAI, Mağaza, Dosyalar, Medya, Çeviri, Ödüller, Otomasyon, App Builder — ekran yok, ana ekrana eklenemez',
      health: 'stub',
      group: 'module',
    },
  ];

  return [...core, ...active, ...soon];
}

export function healthLabel(health: FeatureHealth): string {
  switch (health) {
    case 'ready':
      return 'Hazır';
    case 'partial':
      return 'Kısmi';
    case 'stub':
      return 'Yakında';
    case 'off':
      return 'Kapalı';
  }
}
