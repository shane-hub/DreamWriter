'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Settings2, Sparkles, Feather } from 'lucide-react';
import { useStore } from '@/store';
import { SettingsModal } from '@/components/SettingsModal';
import Link from 'next/link';

export default function Home() {
  const store = useStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    store.initialize();
  }, [store]);

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6">

      {/* Top right buttons */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <Link href="/library">
          <button className="glass-panel p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium hidden sm:inline">我的书架</span>
          </button>
        </Link>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="glass-panel p-3 rounded-2xl hover:bg-white/60 dark:hover:bg-zinc-800/60 transition-all flex items-center gap-2 text-zinc-600 dark:text-zinc-300"
        >
          <Settings2 className="w-5 h-5" />
          <span className="font-medium hidden sm:inline">模型设置</span>
        </button>
      </div>

      <div className="w-full max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-4 glass-panel rounded-full mb-6">
            <Feather className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500 bg-clip-text text-transparent">
            DreamWriter.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-light">
            只需一个灵感，AI 替你执笔。你的私人爆款网文生成引擎。
          </p>

          {!store.apiKey && store.isHydrated && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-8 text-sm text-amber-600 dark:text-amber-400 glass-panel inline-block px-4 py-2 rounded-full border-amber-200 dark:border-amber-900/50"
            >
              ⚠️ 请先在右上角【设置】中配置你的 API Key
            </motion.div>
          )}
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/simple" passHref>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group h-full glass rounded-3xl p-8 cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <Sparkles className="w-32 h-32 text-primary" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">极简模式</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                “我有一个绝妙的点子，但我不想码字。”<br />
                一句话输入主题，AI 将包揽大纲、角色设定并自动连载正文，享受躺平式创作。
              </p>

              <div className="flex items-center text-primary font-medium group-hover:translate-x-2 transition-transform">
                开始创作 &rarr;
              </div>
            </motion.div>
          </Link>

          <Link href="/hardcore" passHref>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group h-full glass rounded-3xl p-8 cursor-pointer hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <BookOpen className="w-32 h-32 text-accent" />
              </div>

              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">硬核模式</h2>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                专业写手的工作台。<br />
                打磨世界观、细抠人物属性卡、掌控分卷大纲，分章节干预剧情走向，生产全订爆款。
              </p>

              <div className="flex items-center text-accent font-medium group-hover:translate-x-2 transition-transform">
                进入工作台 &rarr;
              </div>
            </motion.div>
          </Link>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </main>
  );
}
