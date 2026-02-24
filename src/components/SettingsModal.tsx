'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { X, Save, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORTED_MODELS = [
    { id: 'gpt-5.2', name: 'OpenAI (gpt-5.2)', url: 'https://api.openai.com/v1' },
    { id: 'gpt-4o', name: 'OpenAI (gpt-4o)', url: 'https://api.openai.com/v1' },
    { id: 'gemini-1.5-pro', name: 'Google (Gemini 1.5 Pro)', url: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
    { id: 'gemini-3.1-pro', name: 'Google (Gemini 3.1 Pro)', url: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
    { id: 'gemini-3.1-flash', name: 'Google (Gemini 3.1 Flash)', url: 'https://generativelanguage.googleapis.com/v1beta/openai/' },
    { id: 'claude-3-5-sonnet-20241022', name: 'Anthropic (Claude 3.5 Sonnet v2)', url: 'https://api.anthropic.com/v1' },
    { id: 'claude-3-5-sonnet-20240620', name: 'Anthropic (Claude 3.5 Sonnet)', url: 'https://api.anthropic.com/v1' },
    { id: 'claude-3-haiku-20240307', name: 'Anthropic (Claude 3 Haiku)', url: 'https://api.anthropic.com/v1' },
    { id: 'deepseek-chat', name: 'DeepSeek (deepseek-chat)', url: 'https://api.deepseek.com/v1' },
    { id: 'deepseek-reasoner', name: 'DeepSeek (deepseek-reasoner)', url: 'https://api.deepseek.com/v1' },
    { id: 'moonshot-v1-8k', name: 'Kimi (moonshot-v1-8k)', url: 'https://api.moonshot.cn/v1' },
    { id: 'glm-4', name: 'Zhipu (glm-4)', url: 'https://open.bigmodel.cn/api/paas/v4' }
];

export function SettingsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const store = useStore();
    const [apiKey, setApiKey] = useState('');
    const [modelUrl, setModelUrl] = useState('');
    const [modelName, setModelName] = useState('');
    const [isCustomModel, setIsCustomModel] = useState(false);

    // Hydrate local state when modal opens or store loads
    useEffect(() => {
        if (store.isHydrated && isOpen) {
            setApiKey(store.apiKey);
            setModelUrl(store.modelUrl);
            setModelName(store.modelName);
            setIsCustomModel(!SUPPORTED_MODELS.some(m => m.id === store.modelName) && !!store.modelName);
        }
    }, [store.isHydrated, isOpen, store.apiKey, store.modelUrl, store.modelName]);

    const handleSave = () => {
        store.setApiKey(apiKey);
        store.setModelUrl(modelUrl);
        store.setModelName(modelName);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-zinc-900/20 dark:bg-black/50 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md glass rounded-2xl p-6 shadow-2xl"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                模型与设置 (Settings)
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                                    API Key
                                </label>
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                                <p className="text-xs text-zinc-500 mt-1.5">
                                    你的 Key 仅存储在本地浏览器，不会上传至任何服务器。
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                                    API Base URL (兼容 OpenAI 格式)
                                </label>
                                <input
                                    type="text"
                                    value={modelUrl}
                                    onChange={(e) => setModelUrl(e.target.value)}
                                    placeholder="https://api.openai.com/v1"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5 text-zinc-700 dark:text-zinc-300">
                                    Model Name (模型名称)
                                </label>
                                <select
                                    value={isCustomModel ? 'custom' : (SUPPORTED_MODELS.some(m => m.id === modelName) ? modelName : 'gpt-4o')}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === 'custom') {
                                            setIsCustomModel(true);
                                            setModelName('');
                                        } else {
                                            setIsCustomModel(false);
                                            setModelName(val);
                                            const model = SUPPORTED_MODELS.find(m => m.id === val);
                                            if (model) {
                                                setModelUrl(model.url);
                                            }
                                        }
                                    }}
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {SUPPORTED_MODELS.map(m => (
                                        <option key={m.id} value={m.id} className="dark:bg-zinc-900 dark:text-white">{m.name}</option>
                                    ))}
                                    <option value="custom" className="dark:bg-zinc-900 dark:text-white">自定义 (Custom)</option>
                                </select>

                                {isCustomModel && (
                                    <input
                                        type="text"
                                        value={modelName}
                                        onChange={(e) => setModelName(e.target.value)}
                                        placeholder="输入自定义模型名称 (如: Qwen/Qwen1.5-7B-Chat)"
                                        className="w-full mt-3 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    />
                                )}
                            </div>

                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">外观主题</span>
                                    <button
                                        onClick={() => store.setTheme(store.theme === 'dark' ? 'light' : 'dark')}
                                        className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        {store.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                    </button>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all active:scale-95"
                                >
                                    <Save className="w-4 h-4" />
                                    保存设置
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
