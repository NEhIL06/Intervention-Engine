from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# settings.database_url must be formatted like:
# postgresql+asyncpg://USER:PASSWORD@HOST:5432/postgres?sslmode=require&connect_timeout=10

engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    pool_pre_ping=True,      # Verify connections before using them
    pool_size=5,             # Number of connections to maintain
    max_overflow=10,         # Max connections beyond pool_size
)

AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

Base = declarative_base()


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
