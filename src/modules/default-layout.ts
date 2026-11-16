import { DEFAULT_DOCK_MODULES, DEFAULT_HOMESCREEN_MODULES } from './registry';

/** Shared seed layout for new users (no removed modules). */
export const DEFAULT_HOMESCREEN_SEED = {
  pages: [
    {
      page: 0,
      items: DEFAULT_HOMESCREEN_MODULES.slice(0, 8).map((moduleId, position) => ({
        moduleId,
        position,
        size: 'small' as const,
      })),
    },
  ],
  dockItems: DEFAULT_DOCK_MODULES.map((moduleId, position) => ({
    moduleId,
    position,
  })),
};
