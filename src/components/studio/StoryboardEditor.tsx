'use client';

import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Image as ImageIcon, Plus, Trash2, Film } from 'lucide-react';
import { useState } from 'react';

// Example Mock Data
const MOCK_STORYBOARD = [
    { id: '1', prompt: "A cyberpunk city street at night, neon lights reflecting in puddles. A lone figure in a trench coat standing at the corner.", dialog: "This city never sleeps, and neither do I." },
    { id: '2', prompt: "Close up of the figure's face, rain dripping from the brim of his hat. His eyes are glowing synthetic blue.", dialog: "They took everything from me." },
];

export default function StoryboardEditor() {
    const [shots, setShots] = useState(MOCK_STORYBOARD);
    const [inputText, setInputText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);

    const handleExtract = async () => {
        if (!inputText.trim()) return;
        setIsExtracting(true);
        setShots([]); // Clear existing

        try {
            // Check API Key Config
            const token = localStorage.getItem('dreamwriter-state');
            if (token && token.includes('"apiKey":""')) {
                throw new Error("模型服务拒绝访问，请在右上角设置中配置 API Key。");
            }

            // 1. Create Drama
            const dramaRes = await fetch('/api/huobao/dramas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `极速短剧 - ${new Date().toLocaleTimeString()}`,
                    description: inputText.substring(0, 50),
                    genre: "novel",
                    style: "realistic"
                })
            });
            if (!dramaRes.ok) throw new Error("创建短剧项目失败");
            const dramaData = await dramaRes.json();
            const dramaId = dramaData.data?.id;
            if (!dramaId) throw new Error("未能获取短剧ID");

            // 2. Add Episode
            const epRes = await fetch(`/api/huobao/dramas/${dramaId}/episodes`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    episodes: [{
                        episode_number: 1,
                        title: "第一集",
                        script_content: inputText,
                        description: "AI 自动解析章节"
                    }]
                })
            });
            if (!epRes.ok) throw new Error("保存小说正文失败");

            // 3. Get Episode ID by fetching Drama Details
            const dramaGetRes = await fetch(`/api/huobao/dramas/${dramaId}`);
            if (!dramaGetRes.ok) throw new Error("获取短剧详情失败");
            const dramaGet = await dramaGetRes.json();
            const episodeId = dramaGet.data?.episodes?.[0]?.id;
            if (!episodeId) throw new Error("未能获取章节ID");

            // 4. Trigger Extract Storyboard
            const extractRes = await fetch(`/api/huobao/episodes/${episodeId}/storyboards`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: "gemini-1.5-pro" })
            });
            if (!extractRes.ok) throw new Error("触发提取分镜失败");
            const extractData = await extractRes.json();
            const taskId = extractData.data?.task_id || extractData.task_id; // Check both in case response format varies
            if (!taskId) throw new Error("未能获取任务ID");

            // 5. Poll Task Status
            const pollInterval = window.setInterval(async () => {
                try {
                    const taskRes = await fetch(`/api/huobao/tasks/${taskId}`);
                    const taskData = await taskRes.json();
                    const status = taskData.data?.status;

                    if (status === 'completed') {
                        window.clearInterval(pollInterval);
                        // Fetch the generated storyboards
                        const sbRes = await fetch(`/api/huobao/episodes/${episodeId}/storyboards`);
                        const sbData = await sbRes.json();

                        if (sbData.data && Array.isArray(sbData.data)) {
                            const mappedShots = sbData.data.map((sb: any) => ({
                                id: sb.id.toString(),
                                prompt: sb.image_prompt || sb.description || "暂无提示词",
                                dialog: sb.dialogue || "暂无台词"
                            }));
                            setShots(mappedShots);
                        } else {
                            throw new Error("返回的分镜数据格式错误");
                        }
                        setIsExtracting(false);
                    } else if (status === 'failed') {
                        window.clearInterval(pollInterval);
                        alert(`❌ 解析失败: ${taskData.data?.error || '未知错误'}`);
                        setIsExtracting(false);
                    }
                } catch (pollErr) {
                    window.clearInterval(pollInterval);
                    console.error(pollErr);
                }
            }, 3000);

        } catch (error: any) {
            alert(`❌ 提取流程出错: ${error.message}`);
            setIsExtracting(false);
        }
    };

    return (
        <div className="h-full flex px-6 py-6 gap-6 overflow-hidden">
            {/* Left Panel: Input */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="glass-panel p-4 rounded-2xl flex flex-col h-full bg-white/50 dark:bg-zinc-900/50">
                    <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        输入源文
                    </h2>
                    <p className="text-xs text-zinc-500 mb-4">粘贴你的小说正文或大纲，AI 将自动拆解为包含画面提示词与台词的分镜脚本。</p>
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="在此输入小说内容..."
                        className="flex-1 resize-none w-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black/20 focus:ring-2 focus:ring-primary/50 outline-none text-sm text-zinc-700 dark:text-zinc-300"
                    />
                    <button
                        onClick={handleExtract}
                        disabled={isExtracting || !inputText.trim()}
                        className="mt-4 w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                    >
                        <Sparkles className={`w-5 h-5 ${isExtracting ? 'animate-pulse' : ''}`} />
                        {isExtracting ? '正在解析剧本...' : 'AI 提取分镜结构'}
                    </button>
                </div>
            </div>

            {/* Right Panel: Storyboard Cards */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">分镜脚本 ({shots.length})</h2>
                    <button className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                        <Plus className="w-4 h-4" /> 新增空白分镜
                    </button>
                </div>

                <div className="grid gap-4">
                    {shots.map((shot, index) => (
                        <motion.div
                            key={shot.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative"
                        >
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 text-red-500/70 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold text-sm shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                                            <ImageIcon className="w-3 h-3" /> 画面描述 (Prompt)
                                        </label>
                                        <textarea
                                            defaultValue={shot.prompt}
                                            className="w-full text-sm p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-950/50 focus:bg-white dark:focus:bg-zinc-900 outline-none resize-none h-20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
                                            <MessageSquare className="w-3 h-3" /> 台词配音 (Dialogue)
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={shot.dialog}
                                            className="w-full text-sm p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-950/50 focus:bg-white dark:focus:bg-zinc-900 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {shots.length === 0 && (
                        <div className="py-20 text-center text-zinc-400 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center">
                            <Film className="w-10 h-10 mb-2 opacity-50" />
                            <p>左侧输入并提取，这里将展示自动生成的分镜卡片</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
