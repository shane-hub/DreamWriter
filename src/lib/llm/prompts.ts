export const PROMPTS = {
    generateOutline: (topic: string, genre: string, description: string) => `
你现在是一位资深的网文小说主编。请根据以下用户提供的信息，构建一个极具吸引力的小说大纲。
要求：
1. 包含故事背景（世界观基调）。
2. 包含核心看点（金手指、爽点、主线目标）。
3. 包含整体剧情走向的分卷大纲（至少3卷以上，每卷用简短文字描述核心冲突）。

[输入信息]
题材：${genre}
主题：${topic}
补充描述：${description}

请以清晰的 Markdown 结构输出，必须包含以下几个区块标题：
# 背景设定 (World-building)
# 核心看点 (Hooks)
# 剧情分卷 (Volumes)
`,

    generateCharacters: (outline: string, numCharacters: number = 3) => `
你现在是一位资深的网文小说主编。基于以下已有的小说大纲，请创建 ${numCharacters} 个核心角色的详细设定卡片。
必须包含主角（男主/女主）和重要的配角或反派。

[小说大纲参考]
${outline}

每个角色请采用以下格式输出：
### [角色名] (Role: 主角/配角/反派等)
**性格特征**：...
**背景故事**：...
**核心动机**：...
**特殊能力/金手指**：...
`,

    generateChapter: (
        outline: string,
        characters: string,
        previousChaptersSummary: string,
        chapterTitle: string,
        chapterGuidance: string
    ) => `
你现在是一位白金级的网文小说作家。请根据提供的大纲、人物设定、以及前文总结，来撰写最新章节。
你的文笔应该：代入感强、断章巧妙、情绪拉扯到位。网文忌讳大段大段的枯燥背景说明，要多用动作和对话推动剧情。

[世界观与大纲参考]
${outline}

[主要人物卡参考]
${characters}

[前情提要]
${previousChaptersSummary || '这是小说的第一章。请直接切入核心矛盾，开局要有吸引力！'}

[本章目标与走向说明]
${chapterGuidance}

请撰写章节名：【${chapterTitle}】 及本章的完整正文内容（字数在1500-3000字左右）：
`,

    summarizeChapters: (chaptersContent: string) => `
请简要总结以下章节的核心情节，用于作为后续章节生成时的【前情提要】，字数限制在300字以内，提取关键的剧情推进、人物关系变化和留下的悬念。

[待总结章节内容]
${chaptersContent}
`
};
