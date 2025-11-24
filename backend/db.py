from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# settings.database_url must be formatted like:
# postgresql+asyncpg://USER:PASSWORD@HOST:5432/postgres?sslmode=require&connect_timeout=10

import ssl
import socket

# For asyncpg, we need to configure SSL differently than psycopg
# Remove sslmode from URL and configure via connect_args
# Force IPv4 to avoid "Network is unreachable" error on Render
# Disable SSL verification for Supabase pooler compatibility
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE

engine = create_async_engine(
    settings.database_url.replace("?sslmode=require&connect_timeout=10", "").replace("&sslmode=require", ""),
    echo=False,
    future=True,
    pool_pre_ping=True,      # Verify connections before using them
    pool_size=5,             # Number of connections to maintain
    max_overflow=10,         # Max connections beyond pool_size
    # Disable prepared statements at SQLAlchemy level for pgbouncer
    execution_options={
        "prepared_statement_cache_size": 0,
    },
    connect_args={
        "ssl": ssl_context,  # SSL without certificate verification
        "timeout": 10,  # Connection timeout
        "statement_cache_size": 0,  # Disable prepared statements at asyncpg level
        "server_settings": {
            "jit": "off"  # Disable JIT for compatibility
        },
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
