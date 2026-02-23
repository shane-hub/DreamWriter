import { create } from 'zustand';
import { getSetting, setSetting } from '@/lib/db';

interface GlobalState {
    apiKey: string;
    modelUrl: string; // Base URL, optional for default OpenAI
    modelName: string; // The specific model name (e.g. gpt-4o, deepseek-chat)
    theme: 'dark' | 'light';
    isHydrated: boolean;

    // Actions
    setApiKey: (key: string) => void;
    setModelUrl: (url: string) => void;
    setModelName: (name: string) => void;
    setTheme: (theme: 'dark' | 'light') => void;
    initialize: () => Promise<void>;
}

export const useStore = create<GlobalState>((set) => ({
    apiKey: '',
    modelUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o',
    theme: 'dark',
    isHydrated: false,

    setApiKey: (key) => {
        set({ apiKey: key });
        setSetting('apiKey', key);
    },
    setModelUrl: (url) => {
        set({ modelUrl: url });
        setSetting('modelUrl', url);
    },
    setModelName: (name) => {
        set({ modelName: name });
        setSetting('modelName', name);
    },
    setTheme: (theme) => {
        set({ theme });
        setSetting('theme', theme);
        if (typeof document !== 'undefined') {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    },
    initialize: async () => {
        const apiKey = await getSetting<string>('apiKey') || '';
        const modelUrl = await getSetting<string>('modelUrl') || 'https://api.openai.com/v1';
        const modelName = await getSetting<string>('modelName') || 'gpt-4o';
        const theme = await getSetting<'dark' | 'light'>('theme') || 'dark';

        if (typeof document !== 'undefined') {
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }

        set({ apiKey, modelUrl, modelName, theme, isHydrated: true });
    }
}));
