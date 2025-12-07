# from sqlalchemy import Column, Integer, String, DateTime, create_engine
# from sqlalchemy.ext.declarative import declarative_base
# from sqlalchemy.orm import sessionmaker
# from datetime import datetime

# engine = create_engine('sqlite:///database.db', echo=True)
# Base = declarative_base()


# class Challenge(Base):
#     __tablename__ = 'challenges'

#     id = Column(Integer, primary_key=True)
#     difficulty = Column(String, nullable=False)
#     date_created = Column(DateTime, default=datetime.now)
#     created_by = Column(String, nullable=False)
#     title = Column(String, nullable=False)
#     options = Column(String, nullable=False)
#     correct_answer_id = Column(Integer, nullable=False)
#     explanation = Column(String, nullable=False)


# class ChallengeQuota(Base):
#     __tablename__ = 'challenge_quotas'

#     id = Column(Integer, primary_key=True)
#     user_id = Column(String, nullable=False, unique=True)
#     quota_remaining = Column(Integer, nullable=False, default=50)
#     last_reset_date = Column(DateTime, default=datetime.now)


# Base.metadata.create_all(engine)

# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()





# from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
# from sqlalchemy import String, Integer, DateTime, create_engine
# # from sqlalchemy.orm import sessionmaker
# from datetime import datetime
# from sqlalchemy.orm import sessionmaker, declarative_base
# import os
# from dotenv import load_dotenv
# load_dotenv()

# DATABASE_URL = str(os.getenv("DATABASE_URL"))

# engine = create_engine(
#     DATABASE_URL,
#     echo=True,        # optional for debugging
# )
# # --- Base Class ---
# class Base(DeclarativeBase):
#     pass


# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = declarative_base()



# # engine = create_engine("sqlite:///database.db", echo=True)


# # --- Challenge Model ---
# class Challenge(Base):
#     __tablename__ = "challenges"

#     id: Mapped[int] = mapped_column(primary_key=True)
#     difficulty: Mapped[str] = mapped_column(String, nullable=False)
#     date_created: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
#     created_by: Mapped[str] = mapped_column(String, nullable=False)
#     title: Mapped[str] = mapped_column(String, nullable=False)
#     options: Mapped[str] = mapped_column(String, nullable=False)
#     correct_answer_id: Mapped[int] = mapped_column(Integer, nullable=False)
#     explanation: Mapped[str] = mapped_column(String, nullable=False)


# # --- ChallengeQuota Model ---
# class ChallengeQuota(Base):
#     __tablename__ = "challenge_quotas"

#     id: Mapped[int] = mapped_column(primary_key=True)
#     user_id: Mapped[str] = mapped_column(String, nullable=False, unique=True)
#     quota_remaining: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
#     last_reset_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# # --- Create tables ---
# Base.metadata.create_all(engine)

# SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()







from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from sqlalchemy import String, Integer, DateTime, create_engine
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# --- Database URL ---
DATABASE_URL = os.getenv("DATABASE_URL")

print("DATABASE_URL:", DATABASE_URL)
# --- SQLAlchemy Engine ---
engine = create_engine(
    str(DATABASE_URL),
    echo=True  # optional: prints SQL queries
)

# --- Base Class ---
class Base(DeclarativeBase):
    pass

# --- Session Maker ---
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# --- Challenge Model ---
class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(primary_key=True)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)
    date_created: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)
    created_by: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    options: Mapped[str] = mapped_column(String, nullable=False)
    correct_answer_id: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[str] = mapped_column(String, nullable=False)


# --- ChallengeQuota Model ---
class ChallengeQuota(Base):
    __tablename__ = "challenge_quotas"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    quota_remaining: Mapped[int] = mapped_column(Integer, nullable=False, default=50)
    last_reset_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)


# --- Create Tables ---
Base.metadata.create_all(bind=engine)


# --- Dependency for FastAPI ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
