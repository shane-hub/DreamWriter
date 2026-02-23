from fastapi import APIRouter, Depends, Header, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import SessionLocal
from ..services.llm_service import stream_chapter_generation

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ChapterGenerateRequest(BaseModel):
    novel_id: str
    chapter_id: str
    chapter_title: str
    guidance: str
    model_name: str
    base_url: str

@router.post("/api/generate/chapter")
async def generate_chapter_endpoint(
    req: ChapterGenerateRequest,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid API Key")
    
    api_key = authorization.split("Bearer ")[1]
    
    return StreamingResponse(
        stream_chapter_generation(
            api_key=api_key,
            base_url=req.base_url,
            model_name=req.model_name,
            novel_id=req.novel_id,
            chapter_id=req.chapter_id,
            chapter_title=req.chapter_title,
            guidance=req.guidance,
            db=db
        ),
        media_type="text/event-stream"
    )
