'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store';
import { NovelService } from '@/lib/services/NovelService';
import { BookOpen, ArrowLeft, Loader2, Save, Play, Download, Sparkles, FileText, FileDown } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function HardcoreModePage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <HardcoreMode />
    </React.Suspense>
  );
}

function HardcoreMode() {
  const store = useStore();

  // Form State
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('玄幻修仙 / 赛博朋克');
  const [novelId, setNovelId] = useState<string>(''); // Added state to track novel ID

  // Data State
  const [outline, setOutline] = useState('');
  const [characters, setCharacters] = useState('');
  const [chapters, setChapters] = useState<{ title: string, content: string }[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [loadingChapter, setLoadingChapter] = useState(false);
  const [saving, setSaving] = useState(false);

  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  useEffect(() => {
    if (editId) {
      loadExistingNovel(editId);
    }
  }, [editId]);

  const loadExistingNovel = async (id: string) => {
    try {
      setLoading(true);
      const novel = await NovelService.getNovel(id);
      setNovelId(novel.id);
      setTopic(novel.title);
      setGenre(novel.genre);
      setOutline(novel.outline);
      setCharacters(novel.description || '');

      const chaptersData = await NovelService.getChapters(id);
      setChapters(chaptersData || []);
    } catch (err) {
      console.error('Failed to load novel', err);
      alert('无法加载小说数据');
    } finally {
      setLoading(false);
    }
  };

  // Hardcore Step 1: Generate Outline
  const handleGenerateOutline = async () => {
    if (!store.apiKey) return alert('API Key 未设置');
    if (!topic) return alert('请先填写故事主题');

    setLoading(true);
    try {
      const llmConfig = { apiKey: store.apiKey, modelUrl: store.modelUrl, modelName: store.modelName };
      const newId = Date.now().toString();
      const novel = await NovelService.generateAndSaveOutline(
        newId, topic, genre, '', llmConfig
      );
      setNovelId(newId);
      setOutline(novel.outline);
    } catch (err: any) {
      alert('生成失败: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNovel = async () => {
    if (!novelId) return alert('请先生成大纲');
    setSaving(true);
    try {
      await NovelService.updateNovel(novelId, {
        outline: outline,
        description: characters // saving characters text to description for now
      });
      alert('保存成功！');
    } catch (err: any) {
      alert('保存失败: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Hardcore Step 2: Generate Next Chapter
  const handleGenerateNextChapter = async () => {
    if (!store.apiKey) return alert('API Key 未设置');
    if (!novelId || !outline) return alert('尚未生成大纲');

    setLoadingChapter(true);
    try {
      const llmConfig = { apiKey: store.apiKey, modelUrl: store.modelUrl, modelName: store.modelName };
      const nextChapterNum = chapters.length + 1;
      const title = `第 ${nextChapterNum} 章`;

      setChapters(prev => [...prev, { title, content: '' }]);

      await NovelService.generateChapterStream(
        `${novelId}-ch${nextChapterNum}`,
        novelId,
        title,
        '剧情承接上文，快速推进，设置悬念。',
        llmConfig,
        (chunk) => {
          setChapters(prev => {
            const newChapters = [...prev];
            newChapters[newChapters.length - 1].content += chunk;
            return newChapters;
          });
        }
      );

    } catch (err: any) {
      alert('生成章节失败: ' + err.message);
    } finally {
      setLoadingChapter(false);
    }
  };

  const handleExport = (format: 'txt' | 'md') => {
    if (chapters.length === 0) return alert('没有可导出的章节');

    let text = '';
    if (format === 'md') {
      text = `# ${topic || '未命名小说'}\n\n## 大纲设定\n${outline}\n\n## 角色设定\n${characters}\n\n`;
      text += chapters.map(ch => `### ${ch.title}\n\n${ch.content}\n\n`).join('\n');
    } else {
      text = chapters.map(ch => `${ch.title}\n\n${ch.content}\n\n`).join('\n');
    }

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic || '未命名小说'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-6 relative">
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> 返回主页
      </Link>

      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-accent flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            硬核工坊
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">打磨你的世界观，精准干预每一章的剧情走向。</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Settings & Outline */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-xl p-5">
              <h2 className="font-semibold mb-4 flex items-center gap-2">1. 初始核心设定</h2>
              <input
                value={topic} onChange={e => setTopic(e.target.value)}
                placeholder="故事主线 (e.g. 废柴逆袭修仙)"
                className="w-full mb-3 px-3 py-2 rounded-lg border bg-white/50 dark:bg-zinc-900/50"
              />
              <input
                value={genre} onChange={e => setGenre(e.target.value)}
                placeholder="题材类别"
                className="w-full mb-4 px-3 py-2 rounded-lg border bg-white/50 dark:bg-zinc-900/50"
              />
              <button
                onClick={handleGenerateOutline} disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 py-2.5 rounded-lg active:scale-[0.98] transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                生成大纲
              </button>
            </div>

            <div className="glass rounded-xl p-5">
              <h2 className="font-semibold mb-4 flex items-center justify-between">
                <span>2. 世界观与大纲 (可自由修改)</span>
                <Save onClick={handleSaveNovel} className={`w-4 h-4 cursor-pointer hover:text-primary ${saving ? 'animate-pulse' : 'text-zinc-400'}`} />
              </h2>
              <textarea
                value={outline} onChange={e => setOutline(e.target.value)}
                rows={12} placeholder="大纲内容将在这里显示，你可以手动修改..."
                className="w-full px-3 py-2 text-sm rounded-lg border bg-white/50 dark:bg-zinc-900/50 resize-none"
              />
            </div>
          </div>

          {/* Middle Column: Character Cards & Generation Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-xl p-5 h-full flex flex-col">
              <h2 className="font-semibold mb-4 flex items-center justify-between">
                <span>3. 核心人物设定</span>
                <Save onClick={handleSaveNovel} className={`w-4 h-4 cursor-pointer hover:text-primary ${saving ? 'animate-pulse' : 'text-zinc-400'}`} />
              </h2>
              <textarea
                value={characters} onChange={e => setCharacters(e.target.value)}
                placeholder="在这里建立你的主角配角档案，以影响后续剧情生成..."
                className="flex-1 w-full px-3 py-2 text-sm rounded-lg border bg-white/50 dark:bg-zinc-900/50 resize-none"
              />
            </div>
          </div>

          {/* Right Column: Work Bench & Chapters */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass rounded-xl p-5 border-2 border-accent/20">
              <h2 className="font-semibold mb-4">4. 码字控制台</h2>
              <button
                onClick={handleGenerateNextChapter} disabled={loadingChapter || !outline}
                className="w-full py-4 rounded-xl flex items-center justify-center gap-2 bg-accent hover:opacity-90 text-white font-bold transition-all disabled:opacity-50"
              >
                {loadingChapter ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                一键生成下一章
              </button>
            </div>

            <div className="glass rounded-xl p-5 h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">本书目录 ({chapters.length} 章)</h2>
                {chapters.length > 0 && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleExport('txt')} className="text-zinc-500 hover:text-primary flex items-center gap-1 text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-md">
                      <FileText className="w-4 h-4" /> 导出TXT
                    </button>
                    <button onClick={() => handleExport('md')} className="text-zinc-500 hover:text-accent flex items-center gap-1 text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-md">
                      <FileDown className="w-4 h-4" /> 导出MD
                    </button>
                  </div>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {chapters.length === 0 && (
                  <p className="text-zinc-500 text-sm text-center mt-10">暂无章节，请点击上方生成</p>
                )}
                {chapters.map((ch, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800/60">
                    <h3 className="font-bold text-primary mb-2">{ch.title}</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-4">
                      {ch.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
