"""
Custom exceptions and error handling for the application
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, Request, status
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class AgentopiaException(Exception):
    """Base exception for all application-specific errors"""
    
    def __init__(
        self, 
        message: str, 
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class AgentNotFoundException(AgentopiaException):
    """Raised when an agent is not found"""
    
    def __init__(self, agent_id: str):
        super().__init__(
            f"Agent '{agent_id}' not found",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"agent_id": agent_id}
        )


class ConfigurationError(AgentopiaException):
    """Raised when there's a configuration error"""
    
    def __init__(self, message: str, config_path: Optional[str] = None):
        details = {"config_path": config_path} if config_path else {}
        super().__init__(
            f"Configuration error: {message}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )


class LLMServiceError(AgentopiaException):
    """Raised when LLM service encounters an error"""
    
    def __init__(self, message: str, agent_id: Optional[str] = None):
        details = {"agent_id": agent_id} if agent_id else {}
        super().__init__(
            f"LLM service error: {message}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details=details
        )


class ValidationError(AgentopiaException):
    """Raised when input validation fails"""
    
    def __init__(self, message: str, field: Optional[str] = None):
        details = {"field": field} if field else {}
        super().__init__(
            f"Validation error: {message}",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details=details
        )


async def agentopia_exception_handler(request: Request, exc: AgentopiaException) -> JSONResponse:
    """Handle custom application exceptions"""
    logger.error(
        f"Application error: {exc.message}",
        extra={
            "status_code": exc.status_code,
            "details": exc.details,
            "path": request.url.path,
            "method": request.method
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "details": exc.details,
            "type": exc.__class__.__name__
        }
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions"""
    logger.exception(
        f"Unexpected error: {str(exc)}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "exception_type": exc.__class__.__name__
        }
    )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": True,
            "message": "An unexpected error occurred",
            "type": "InternalServerError"
        }
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions with consistent format"""
    logger.warning(
        f"HTTP error {exc.status_code}: {exc.detail}",
        extra={
            "path": request.url.path,
            "method": request.method,
            "status_code": exc.status_code
        }
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.detail,
            "type": "HTTPException"
        }
    )