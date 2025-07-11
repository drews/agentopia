"""
Application configuration management using Pydantic settings
"""

from functools import lru_cache
from pathlib import Path
from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Application settings with environment variable support"""
    
    # Application
    app_name: str = "AI Spaceship Bridge"
    app_version: str = "1.0.0"
    debug: bool = Field(False, env="DEBUG")
    
    # Server
    host: str = Field("0.0.0.0", env="HOST")
    port: int = Field(8000, env="PORT")
    
    # CORS
    cors_origins: List[str] = Field(
        ["http://localhost:3000", "http://localhost:5173"],
        env="CORS_ORIGINS"
    )
    
    # Database
    database_url: str = Field("sqlite:///./spaceship_bridge.db", env="DATABASE_URL")
    
    # LLM Configuration
    openai_api_key: Optional[str] = Field(None, env="OPENAI_API_KEY")
    llm_model: str = Field("gpt-3.5-turbo", env="LLM_MODEL")
    llm_max_tokens: int = Field(150, env="LLM_MAX_TOKENS")
    llm_temperature: float = Field(0.7, env="LLM_TEMPERATURE")
    
    # Agent Configuration
    agent_config_path: Path = Field(
        Path(__file__).parent.parent.parent / "config" / "agents.json",
        env="AGENT_CONFIG_PATH"
    )
    
    # Monitoring
    agent_update_interval: float = Field(2.0, env="AGENT_UPDATE_INTERVAL")
    websocket_ping_interval: int = Field(20, env="WEBSOCKET_PING_INTERVAL")
    websocket_ping_timeout: int = Field(20, env="WEBSOCKET_PING_TIMEOUT")
    
    # Logging
    log_level: str = Field("INFO", env="LOG_LEVEL")
    log_format: str = Field(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        env="LOG_FORMAT"
    )
    
    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v
    
    @field_validator("log_level")
    @classmethod
    def validate_log_level(cls, v):
        """Validate log level"""
        valid_levels = ["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]
        if v.upper() not in valid_levels:
            raise ValueError(f"Log level must be one of: {valid_levels}")
        return v.upper()
    
    @field_validator("agent_config_path")
    @classmethod
    def validate_agent_config_path(cls, v):
        """Ensure agent config path exists"""
        path = Path(v)
        if not path.exists():
            logger.warning(f"Agent config file not found: {path}")
        return path
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings"""
    return Settings()


def configure_logging(settings: Settings) -> None:
    """Configure application logging"""
    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format=settings.log_format,
        force=True  # Override any existing configuration
    )
    
    # Set third-party loggers to WARNING to reduce noise
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("websockets").setLevel(logging.WARNING)