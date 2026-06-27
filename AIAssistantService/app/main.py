import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.v1 import chat
from app.worker.consumer import RabbitMQConsumer

# Setup logging configuration
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize background RabbitMQ worker
rabbitmq_worker = RabbitMQConsumer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- On Startup ---
    logger.info("Initializing database...")
    try:
        await init_db()
        logger.info("Database tables initialized successfully.")
    except Exception as ex:
        logger.error(f"Failed to initialize database tables: {ex}")
    
    logger.info("Starting RabbitMQ background listener...")
    await rabbitmq_worker.start()
    
    yield
    
    # --- On Shutdown ---
    logger.info("Stopping RabbitMQ background listener...")
    await rabbitmq_worker.stop()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://beaverdash.xyz",
        "https://www.beaverdash.xyz"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["AI Chat"])


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=5003, reload=True)
