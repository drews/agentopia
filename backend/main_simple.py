from fastapi import FastAPI
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AI Spaceship Bridge", version="1.0.0")

@app.get("/")
async def get():
    return {"message": "AI Spaceship Bridge API", "status": "operational"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "bridge_status": "operational"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)