'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useStore } from '@/store';
import { NovelService } from '@/lib/services/NovelService';
import Link from 'next/link';

export default function SimpleMode() {
  const store = useStore();
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Input, 1: Generating Outline, 2: Generating Chapters
  const [liveLog, setLiveLog] = useState<string>('');

  const startGeneration = async () => {
    if (!store.apiKey) {
      alert('请先在首页设置 API Key');
      return;
    }
    if (!topic || !genre) {
      alert('请填写主题和题材');
      return;
    }

    setLoading(true);
    setStep(1);
    setLiveLog('编织世界观中...\\n');

    try {
      const novelId = Date.now().toString();
      const llmConfig = { apiKey: store.apiKey, modelUrl: store.modelUrl, modelName: store.modelName };

      const novel = await NovelService.generateAndSaveOutline(
        novelId,
        topic,
        genre,
        '极简直连创作，放飞想象力。',
        llmConfig
      );

      setLiveLog(prev => prev + '\\n✅ 世界观搭建完毕，开始分配角色...\\n');

      setStep(2);

      // Simple loop to generate 3 chapters for demo in simple mode
      for (let i = 1; i <= 3; i++) {
        setLiveLog(prev => prev + `\n✍️ 执笔第 ${i} 章...\n`);

        let currentChapterText = '';
        await NovelService.generateChapterStream(
          `${novelId}-ch${i}`,
          novelId,
          `第 ${i} 章`,
          '剧情承接上文，快速推进，设置悬念。',
          llmConfig,
          (chunk) => {
            currentChapterText += chunk;
            // Throttle UI updates slightly or just direct append 
            setLiveLog(prev => prev + chunk);
          }
        );

        setLiveLog(prev => prev + `\n\n✅ 第 ${i} 章完成。\n`);
      }

      setLiveLog(prev => prev + '\n🎉 极简模式短篇完结！由于是极简模式演示，生成了3章。进入硬核模式可无限连载。');
    } catch (err: any) {
      setLiveLog(prev => prev + `\n❌ 发生错误: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 relative">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> 返回主页
      </Link>

      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            极简模式
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">一句话指令，AI 接管你的键盘。</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="space-y-6">
            <div className="glass rounded-3xl p-6">
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                你想写一个什么故事？(主题)
              </label>
              <textarea
                rows={3}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：一个原本患有绝症的凡人，意外进入灵气复苏的修仙世界，靠面板系统苟成大帝。"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-primary outline-none transition-all resize-none"
                disabled={loading}
              />

              <label className="block text-sm font-medium mt-6 mb-2 text-zinc-700 dark:text-zinc-300">
                题材 / 流派
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="修仙 / 赛博朋克 / 诡秘"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                disabled={loading}
              />

              <button
                onClick={startGeneration}
                disabled={loading || !topic || !genre}
                className="w-full mt-8 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? 'AI 正疯狂码字中...' : '一键生成小说'}
              </button>
            </div>
          </div>

          {/* Output Log */}
          <div className="glass rounded-3xl p-6 h-[500px] flex flex-col">
            <h3 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              实时生成日志
            </h3>
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-zinc-600 dark:text-zinc-400 p-2 break-words">
              {liveLog || '等待指令输入...'}
              {loading && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
