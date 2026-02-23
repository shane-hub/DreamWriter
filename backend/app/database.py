from sqlalchemy import create_engine, Column, Integer, String, Text, Float
from sqlalchemy.orm import declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./dreamwriter.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Novel(Base):
    __tablename__ = "novels"
    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    genre = Column(String)
    outline = Column(Text)
    created_at = Column(Float)
    updated_at = Column(Float)

class Character(Base):
    __tablename__ = "characters"
    id = Column(String, primary_key=True, index=True)
    novel_id = Column(String, index=True)
    name = Column(String)
    role = Column(String)
    description = Column(Text)
    traits = Column(String) # JSON string of traits

class Chapter(Base):
    __tablename__ = "chapters"
    id = Column(String, primary_key=True, index=True)
    novel_id = Column(String, index=True)
    title = Column(String)
    content = Column(Text)
    order = Column(Integer)
    status = Column(String)
