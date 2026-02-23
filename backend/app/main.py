import time
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from .database import engine, Base, SessionLocal, Novel, Character, Chapter
from .api import generation

Base.metadata.create_all(bind=engine)

app = FastAPI(title="DreamWriter API")

app.include_router(generation.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---
class NovelBase(BaseModel):
    title: str
    description: str
    genre: str
    outline: str

class NovelCreate(NovelBase):
    id: str

class NovelResponse(NovelBase):
    id: str
    created_at: float
    updated_at: float
    class Config:
        from_attributes = True

class CharacterBase(BaseModel):
    name: str
    role: str
    description: str
    traits: str

class CharacterCreate(CharacterBase):
    id: str
    novel_id: str

class CharacterResponse(CharacterBase):
    id: str
    novel_id: str
    class Config:
        from_attributes = True

class ChapterBase(BaseModel):
    title: str
    content: str
    order: int
    status: str

class ChapterCreate(ChapterBase):
    id: str
    novel_id: str

class ChapterResponse(ChapterBase):
    id: str
    novel_id: str
    class Config:
        from_attributes = True

class NovelUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    genre: Optional[str] = None
    outline: Optional[str] = None

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    description: Optional[str] = None
    traits: Optional[str] = None

class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    order: Optional[int] = None
    status: Optional[str] = None

# --- Novel CRUD ---
@app.post("/api/novels", response_model=NovelResponse)
def create_novel(novel: NovelCreate, db: Session = Depends(get_db)):
    db_novel = Novel(
        id=novel.id,
        title=novel.title,
        description=novel.description,
        genre=novel.genre,
        outline=novel.outline,
        created_at=time.time(),
        updated_at=time.time()
    )
    db.add(db_novel)
    db.commit()
    db.refresh(db_novel)
    return db_novel

@app.get("/api/novels", response_model=List[NovelResponse])
def get_novels(db: Session = Depends(get_db)):
    return db.query(Novel).all()

@app.get("/api/novels/{novel_id}", response_model=NovelResponse)
def get_novel(novel_id: str, db: Session = Depends(get_db)):
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    return novel

@app.put("/api/novels/{novel_id}", response_model=NovelResponse)
def update_novel(novel_id: str, updates: NovelUpdate, db: Session = Depends(get_db)):
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    for var, value in vars(updates).items():
        if value is not None:
            setattr(novel, var, value)
    novel.updated_at = time.time()
    db.commit()
    db.refresh(novel)
    return novel

@app.delete("/api/novels/{novel_id}")
def delete_novel(novel_id: str, db: Session = Depends(get_db)):
    novel = db.query(Novel).filter(Novel.id == novel_id).first()
    if not novel:
        raise HTTPException(status_code=404, detail="Novel not found")
    db.delete(novel)
    db.commit()
    return {"message": "Novel deleted"}

# --- Character CRUD ---
@app.post("/api/characters", response_model=CharacterResponse)
def create_character(char: CharacterCreate, db: Session = Depends(get_db)):
    db_char = Character(**char.model_dump())
    db.add(db_char)
    db.commit()
    db.refresh(db_char)
    return db_char

@app.get("/api/novels/{novel_id}/characters", response_model=List[CharacterResponse])
def get_characters(novel_id: str, db: Session = Depends(get_db)):
    return db.query(Character).filter(Character.novel_id == novel_id).all()

@app.get("/api/characters/{char_id}", response_model=CharacterResponse)
def get_character(char_id: str, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    return char

@app.put("/api/characters/{char_id}", response_model=CharacterResponse)
def update_character(char_id: str, updates: CharacterUpdate, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    for var, value in vars(updates).items():
        if value is not None:
            setattr(char, var, value)
    db.commit()
    db.refresh(char)
    return char

@app.delete("/api/characters/{char_id}")
def delete_character(char_id: str, db: Session = Depends(get_db)):
    char = db.query(Character).filter(Character.id == char_id).first()
    if not char:
        raise HTTPException(status_code=404, detail="Character not found")
    db.delete(char)
    db.commit()
    return {"message": "Character deleted"}

# --- Chapter CRUD ---
@app.post("/api/chapters", response_model=ChapterResponse)
def create_chapter(chap: ChapterCreate, db: Session = Depends(get_db)):
    db_chap = Chapter(**chap.model_dump())
    db.add(db_chap)
    db.commit()
    db.refresh(db_chap)
    return db_chap

@app.get("/api/novels/{novel_id}/chapters", response_model=List[ChapterResponse])
def get_chapters(novel_id: str, db: Session = Depends(get_db)):
    return db.query(Chapter).filter(Chapter.novel_id == novel_id).order_by(Chapter.order.asc()).all()

@app.get("/api/chapters/{chap_id}", response_model=ChapterResponse)
def get_chapter(chap_id: str, db: Session = Depends(get_db)):
    chap = db.query(Chapter).filter(Chapter.id == chap_id).first()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")
    return chap

@app.put("/api/chapters/{chap_id}", response_model=ChapterResponse)
def update_chapter(chap_id: str, updates: ChapterUpdate, db: Session = Depends(get_db)):
    chap = db.query(Chapter).filter(Chapter.id == chap_id).first()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")
    for var, value in vars(updates).items():
        if value is not None:
            setattr(chap, var, value)
    db.commit()
    db.refresh(chap)
    return chap

@app.delete("/api/chapters/{chap_id}")
def delete_chapter(chap_id: str, db: Session = Depends(get_db)):
    chap = db.query(Chapter).filter(Chapter.id == chap_id).first()
    if not chap:
        raise HTTPException(status_code=404, detail="Chapter not found")
    db.delete(chap)
    db.commit()
    return {"message": "Chapter deleted"}
