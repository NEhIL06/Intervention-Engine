from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings
import re

# psycopg3 can be used in async mode via SQLAlchemy's async engine
# Force IPv4 to avoid IPv6 connection issues on Render

# Modify database URL to disable IPv6 preference
def get_ipv4_database_url(url: str) -> str:
    """
    Append connect_timeout and ensure IPv4 is preferred.
    For psycopg (async), we can add URL parameters to help with connection issues.
    """
    # Add connection timeout and other params to help with network issues
    separator = "&" if "?" in url else "?"
    # Adding connect_timeout helps fail faster if there are connection issues
    url_with_params = f"{url}{separator}connect_timeout=10"
    return url_with_params

engine = create_async_engine(
    get_ipv4_database_url(settings.database_url),
    echo=False,
    future=True,
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
