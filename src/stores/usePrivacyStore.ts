import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PrivacySettings = {
  profileVisibility: boolean;
  dataTelemetry: boolean;
  activityLog: boolean;
};

interface PrivacyState extends PrivacySettings {
  set: (partial: Partial<PrivacySettings>) => void;
  toggle: (key: keyof PrivacySettings) => void;
}

export const usePrivacyStore = create<PrivacyState>()(
  persist(
    (set, get) => ({
      profileVisibility: true,
      dataTelemetry: false,
      activityLog: true,
      set: (partial) => set(partial),
      toggle: (key) => set({ [key]: !get()[key] }),
    }),
    {
      name: 'life-privacy-v1',
      partialize: (state) => ({
        profileVisibility: state.profileVisibility,
        dataTelemetry: state.dataTelemetry,
        activityLog: state.activityLog,
      }),
    }
  )
);
