'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Film, Wand2, Image as ImageIcon, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import StoryboardEditor from '@/components/studio/StoryboardEditor';

export default function VideoStudioPage() {
    const [activeTab, setActiveTab] = useState<'storyboard' | 'assets' | 'preview'>('storyboard');
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    const handleFinalizeVideo = async () => {
        setIsFinalizing(true);
        try {
            // Check API Key
            const token = localStorage.getItem('dreamwriter-state');
            if (token && token.includes('"apiKey":""')) {
                throw new Error("模型服务拒绝访问，请在设置中配置 API Key。");
            }

            // 1. Fetch latest drama to get episode id (Naive implementation for demo)
            const dramasRes = await fetch('/api/huobao/dramas');
            if (!dramasRes.ok) throw new Error("获取剧集列表失败");
            const dramasData = await dramasRes.json();
            const latestDrama = dramasData.data?.items?.[0] || dramasData.data?.[0];
            const episodeId = latestDrama?.episodes?.[0]?.id;

            if (!episodeId) throw new Error("请先在「剧本与分镜」中提取至少一个剧本！");

            // 2. Trigger Finalize
            const finalizeRes = await fetch(`/api/huobao/episodes/${episodeId}/finalize`, { method: 'POST' });
            if (!finalizeRes.ok) throw new Error("触发视频合成失败");
            const finalizeData = await finalizeRes.json();
            const taskId = finalizeData.data?.task_id || finalizeData.task_id;

            if (!taskId) throw new Error("未能获取合成任务ID");

            // 3. Poll
            const pollInterval = window.setInterval(async () => {
                try {
                    const taskRes = await fetch(`/api/huobao/tasks/${taskId}`);
                    const taskData = await taskRes.json();
                    const status = taskData.data?.status;

                    if (status === 'completed') {
                        window.clearInterval(pollInterval);

                        // 4. Get video URL
                        const dwRes = await fetch(`/api/huobao/episodes/${episodeId}/download`);
                        const dwData = await dwRes.json();
                        if (dwData.video_url) {
                            setVideoUrl(`http://localhost:5678${dwData.video_url}`);
                        }
                        setIsFinalizing(false);
                    } else if (status === 'failed') {
                        window.clearInterval(pollInterval);
                        alert(`❌ 合成失败: ${taskData.data?.error || '未知错误'}`);
                        setIsFinalizing(false);
                    }
                } catch (e) {
                    window.clearInterval(pollInterval);
                    console.error(e);
                    setIsFinalizing(false);
                }
            }, 3000);

        } catch (error: any) {
            alert(`❌: ${error.message}`);
            setIsFinalizing(false);
        }
    };

    return (
        <main className="min-h-screen relative flex flex-col bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 glass-panel flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors text-zinc-600 dark:text-zinc-400">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Film className="w-4 h-4 text-indigo-500" />
                        </div>
                        <h1 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">视频工作台 <span className="text-xs font-normal text-zinc-500 ml-2 border border-zinc-300 dark:border-zinc-700 px-2 rounded-full">Beta</span></h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={() => setActiveTab('storyboard')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'storyboard' ? 'bg-white dark:bg-zinc-800 shadow shadow-black/5 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        <Wand2 className="w-4 h-4" /> 剧本与分镜
                    </button>
                    <button
                        onClick={() => setActiveTab('assets')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'assets' ? 'bg-white dark:bg-zinc-800 shadow shadow-black/5 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        <ImageIcon className="w-4 h-4" /> 资产库 (图/视频)
                    </button>
                    <button
                        onClick={() => setActiveTab('preview')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-zinc-800 shadow shadow-black/5 text-zinc-900 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        <Play className="w-4 h-4" /> 视频合成
                    </button>
                </div>

                <div className="w-[100px]"></div> {/* Spacer for symmetry */}
            </header>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'storyboard' && <StoryboardEditor />}

                {activeTab === 'assets' && (
                    <div className="h-full p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                            <ImageIcon className="w-8 h-8 text-zinc-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">图片与视频资产库</h2>
                        <p className="text-zinc-500 max-w-md">当您在「剧本与分镜」页面发起生成后，所有的角色概念图、场景背景图以及微动作视频将会展示在这里。</p>
                        <button className="mt-6 px-6 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 font-medium text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                            从本地导入资产
                        </button>
                    </div>
                )}

                {activeTab === 'preview' && (
                    <div className="h-full p-8 flex flex-col items-center justify-center text-center">
                        <div className="w-full max-w-3xl aspect-video bg-black rounded-3xl overflow-hidden relative shadow-2xl flex items-center justify-center border border-zinc-800">
                            {videoUrl ? (
                                <video src={videoUrl} controls className="w-full h-full object-contain bg-black" />
                            ) : (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                    <button className="relative z-20 w-20 h-20 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:scale-110 transition-transform group">
                                        <Play className="w-8 h-8 text-white ml-2 group-hover:text-indigo-400 transition-colors" />
                                    </button>
                                    <div className="absolute bottom-6 left-8 right-8 z-20 flex justify-between items-end text-left">
                                        <div>
                                            <h3 className="text-white font-bold text-2xl mb-2">未命名赛博朋克短剧</h3>
                                            <p className="text-white/70 text-sm">等待您发起最后的一键合成...</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <button
                            disabled={isFinalizing}
                            className="mt-8 px-8 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                            onClick={handleFinalizeVideo}
                        >
                            <Wand2 className={`w-5 h-5 ${isFinalizing ? 'animate-pulse' : ''}`} />
                            {isFinalizing ? '正在全自动排期合成中...' : '开始合成最终视频'}
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
