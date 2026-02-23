'use client';

import { useState, useEffect } from 'react';
import { BookOpen, FolderOpen, ArrowLeft, Trash2, Loader2, Sparkles, Book } from 'lucide-react';
import Link from 'next/link';
import { NovelService } from '@/lib/services/NovelService';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Novel {
    id: string;
    title: string;
    genre: string;
    description: string;
    outline: string;
    created_at: string;
    updated_at: string;
}

export default function LibraryPage() {
    const router = useRouter();
    const [novels, setNovels] = useState<Novel[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchNovels();
    }, []);

    const fetchNovels = async () => {
        try {
            setLoading(true);
            const data = await NovelService.getNovels();
            setNovels(data || []);
        } catch (err) {
            console.error('Failed to fetch novels', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('确定彻底删除该作品的所有数据吗？此操作不可逆。')) return;

        try {
            setDeletingId(id);
            await NovelService.deleteNovel(id);
            setNovels(novels.filter(n => n.id !== id));
        } catch (err) {
            console.error('Failed to delete novel', err);
            alert('删除失败，请重试');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <main className="min-h-screen relative p-6 max-w-7xl mx-auto">
            <header className="flex items-center justify-between mb-12 mt-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent flex items-center gap-3">
                            <FolderOpen className="w-8 h-8 text-primary" />
                            我的书架
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                            {novels.length} 部作品记录
                        </p>
                    </div>
                </div>
                <Link href="/">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-lg shadow-primary/25 transition-all active:scale-95">
                        <Sparkles className="w-4 h-4" />
                        新建作品
                    </button>
                </Link>
            </header>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-24 text-zinc-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4 text-primary" />
                    <p>正在努力搬运书架数据...</p>
                </div>
            ) : novels.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center p-32 glass-panel rounded-3xl text-center"
                >
                    <Book className="w-20 h-20 text-zinc-300 dark:text-zinc-700 mb-6" />
                    <h2 className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mb-4">
                        书架空空如也
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 max-w-md">
                        你的下一部爆款网文正在等待诞生。去极简模式找找灵感，或是去硬核模式精心打磨？
                    </p>
                    <Link href="/">
                        <button className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-100 hover:scale-105 text-white dark:text-black rounded-full font-medium shadow-2xl transition-all">
                            开始写下你的第一本爆款
                        </button>
                    </Link>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {novels.map((novel) => (
                            <motion.div
                                key={novel.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => router.push(`/hardcore?id=${novel.id}`)}
                                className="group relative glass-panel rounded-2xl p-6 cursor-pointer hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <BookOpen className="w-32 h-32 text-primary transform translate-x-10 -translate-y-10" />
                                </div>

                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
                                        {novel.genre || '未分类'}
                                    </span>
                                    <button
                                        onClick={(e) => handleDelete(e, novel.id)}
                                        disabled={deletingId === novel.id}
                                        className="p-2 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
                                        title="删除作品"
                                    >
                                        {deletingId === novel.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>

                                <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 line-clamp-2 leading-tight">
                                    {novel.title}
                                </h3>

                                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 min-h-[4.5rem]">
                                    {novel.description || (novel.outline.slice(0, 100) + '...')}
                                </p>

                                <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-auto">
                                    <span>最后更新: {new Date(novel.updated_at).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1 text-primary invisible group-hover:visible translate-x-2 group-hover:translate-x-0 transition-all font-medium">
                                        继续创作 &rarr;
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </main>
    );
}
