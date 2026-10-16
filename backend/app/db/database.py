import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL

load_dotenv()

database_url = URL.create(
    "postgresql+psycopg",
    username=os.getenv("PGUSER"),
    password=os.getenv("PGPASSWORD"),
    host="ep-red-lake-d8n0hfj6.database.us-east-2.cloud.databricks.com",
    port=5432,
    database="databricks_postgres",
    query={"sslmode": "require"},
)

engine = create_engine(database_url, pool_pre_ping=True)