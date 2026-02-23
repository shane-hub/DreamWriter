# backend/app/services/prompts.py

def generate_outline_prompt(topic: str, genre: str, description: str) -> str:
    return f"""
你现在是一位资深的网文小说主编。请根据以下用户提供的信息，构建一个极具吸引力的小说大纲。
要求：
1. 包含故事背景（世界观基调）。
2. 包含核心看点（金手指、爽点、主线目标）。
3. 包含整体剧情走向的分卷大纲（至少3卷以上，每卷用简短文字描述核心冲突）。

[输入信息]
题材：{genre}
主题：{topic}
补充描述：{description}

请以清晰的 Markdown 结构输出，必须包含以下几个区块标题：
# 背景设定 (World-building)
# 核心看点 (Hooks)
# 剧情分卷 (Volumes)
"""

def generate_chapter_prompt(
    outline: str,
    characters: str,
    previous_summary: str,
    chapter_title: str,
    guidance: str
) -> str:
    return f"""
你现在是一位白金级的网文小说作家。请根据提供的大纲、人物设定、以及前文总结，来撰写最新章节。
你的文笔应该：代入感强、断章巧妙、情绪拉扯到位。网文忌讳大段大段的枯燥背景说明，要多用动作和对话推动剧情。

[世界观与大纲参考]
{outline}

[主要人物卡参考]
{characters}

[前情提要]
{previous_summary or '这是小说的第一章。请直接切入核心矛盾，开局要有吸引力！'}

[本章目标与走向说明]
{guidance}

请撰写章节名：【{chapter_title}】 及本章的完整正文内容（字数在1500-3000字左右）：
"""
