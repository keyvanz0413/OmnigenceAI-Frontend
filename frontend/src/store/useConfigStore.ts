import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ConfigState {
  openaiApiKey: string;
  apiBaseUrl: string;
  preferredModel: string;
  setOpenaiApiKey: (key: string) => void;
  setApiBaseUrl: (url: string) => void;
  setPreferredModel: (model: string) => void;
  isConfigured: () => boolean;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      openaiApiKey: '',
      apiBaseUrl: 'https://api.openai.com/v1',
      preferredModel: 'gpt-4o',
      setOpenaiApiKey: (key) => set({ openaiApiKey: key }),
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      setPreferredModel: (model) => set({ preferredModel: model }),
      isConfigured: () => !!get().openaiApiKey,
    }),
    {
      name: 'omnigence-config',
    }
  )
);
