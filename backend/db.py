from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings
import ssl

# For asyncpg + pgbouncer, we need to disable prepared statements COMPLETELY
# This is done via URL parameter, not connect_args
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

# Clean the URL and add the critical parameter for pgbouncer
base_url = settings.database_url.replace("?sslmode=require&connect_timeout=10", "").replace("&sslmode=require", "")

# Add prepared_statement_cache_size=0 as URL parameter (this is the ONLY way that works)
if "?" in base_url:
    db_url = f"{base_url}&prepared_statement_cache_size=0"
else:
    db_url = f"{base_url}?prepared_statement_cache_size=0"

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    connect_args={
        "ssl": ssl_context,
        "timeout": 10,
        "server_settings": {"jit": "off"},
    },
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
