import { I18nManager } from 'react-native';
import { create } from 'zustand';

import { getLanguage, saveLanguage } from '@/lib/storage';
import i18n from '@/i18n';

export type AppLanguage = 'en' | 'ur';

interface SettingsState {
  language: AppLanguage;
  isRTL: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  setLanguage: (language: AppLanguage) => Promise<void>;
  toggleLanguage: () => Promise<void>;
}

async function applyLanguage(language: AppLanguage): Promise<void> {
  const isRTL = language === 'ur';
  await i18n.changeLanguage(language);
  await saveLanguage(language);
  I18nManager.allowRTL(isRTL);
  I18nManager.forceRTL(isRTL);
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  language: 'en',
  isRTL: false,
  isInitialized: false,

  initialize: async () => {
    const language = await getLanguage();
    await applyLanguage(language);
    set({ language, isRTL: language === 'ur', isInitialized: true });
  },

  setLanguage: async (language) => {
    await applyLanguage(language);
    set({ language, isRTL: language === 'ur' });
  },

  toggleLanguage: async () => {
    const next: AppLanguage = get().language === 'en' ? 'ur' : 'en';
    await get().setLanguage(next);
  },
}));
