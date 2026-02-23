import json
from typing import AsyncGenerator
from openai import AsyncOpenAI
from sqlalchemy.orm import Session
from ..database import Novel, Chapter
from .prompts import generate_chapter_prompt

async def stream_chapter_generation(
    api_key: str,
    base_url: str,
    model_name: str,
    novel_id: str,
    chapter_id: str,
    chapter_title: str,
    guidance: str,
    db: Session
) -> AsyncGenerator[str, None]:
    
    # 1. Fetch Context from DB
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        yield "data: [Error] Novel not found\\n\\n"
        return

    # Fetch characters from novel.description
    characters_context = novel.description if novel.description else "无特定人物卡，按大纲自由发挥"
    
    chapters = db.query(Chapter).filter(Chapter.novel_id == novel_id).order_by(Chapter.order.asc()).all()
    previous_summary = ""
    if chapters:
        last_chapter = chapters[-1]
        previous_summary = f"上一章讲到：{last_chapter.content[:500]}..." # Simple truncation for now

    prompt = generate_chapter_prompt(
        outline=novel.outline,
        characters=characters_context,
        previous_summary=previous_summary,
        chapter_title=chapter_title,
        guidance=guidance
    )
    
    # 2. Build AsyncOpenAI Client
    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    
    full_content = ""
    try:
        stream = await client.chat.completions.create(
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            stream=True
        )
        
        async for chunk in stream:
            token = chunk.choices[0].delta.content or ""
            if token:
                full_content += token
                # Yield standard SSE format
                yield f"data: {json.dumps({'text': token})}\\n\\n"
                
        # 3. Save to database after completion
        new_order = len(chapters) + 1
        new_chapter = Chapter(
            id=chapter_id,
            novel_id=novel_id,
            title=chapter_title,
            content=full_content,
            order=new_order,
            status="completed"
        )
        db.add(new_chapter)
        db.commit()
                
    except Exception as e:
        yield f"data: [Error] {str(e)}\\n\\n"
    finally:
        yield "data: [DONE]\\n\\n"
