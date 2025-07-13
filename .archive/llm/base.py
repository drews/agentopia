"""
Base abstract class for LLM providers.
Defines the interface that all provider implementations must follow.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel


class LLMResponse(BaseModel):
    """Standardized response format for all LLM providers."""
    content: str
    provider: str
    model: str
    tokens_used: Optional[int] = None
    finish_reason: str = "stop"  # stop, length, error
    metadata: Dict[str, Any] = {}


class LLMRequest(BaseModel):
    """Standardized request format for all LLM providers."""
    prompt: str
    system_prompt: Optional[str] = None
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    model: Optional[str] = None


class BaseLLMProvider(ABC):
    """Abstract base class for all LLM providers."""
    
    def __init__(self, config: Dict[str, Any]):
        """Initialize the provider with configuration."""
        self.config = config
        self.provider_name = self.__class__.__name__.replace("Provider", "").lower()
    
    @abstractmethod
    async def generate_response(self, request: LLMRequest) -> LLMResponse:
        """
        Generate a response from the LLM.
        
        Args:
            request: Standardized request containing prompt and parameters
            
        Returns:
            LLMResponse: Standardized response format
            
        Raises:
            LLMProviderError: If the provider cannot generate a response
        """
        pass
    
    @abstractmethod
    async def is_available(self) -> bool:
        """
        Check if the provider is available and ready to use.
        
        Returns:
            bool: True if provider is available, False otherwise
        """
        pass
    
    @abstractmethod
    async def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current model.
        
        Returns:
            Dict containing model information (name, capabilities, limits, etc.)
        """
        pass
    
    def get_provider_name(self) -> str:
        """Get the name of this provider."""
        return self.provider_name


class LLMProviderError(Exception):
    """Base exception for LLM provider errors."""
    
    def __init__(self, message: str, provider: str, original_error: Optional[Exception] = None):
        self.message = message
        self.provider = provider
        self.original_error = original_error
        super().__init__(f"[{provider}] {message}")


class LLMProviderUnavailableError(LLMProviderError):
    """Raised when a provider is not available."""
    pass


class LLMProviderConfigError(LLMProviderError):
    """Raised when provider configuration is invalid."""
    pass


class LLMProviderAPIError(LLMProviderError):
    """Raised when provider API returns an error."""
    pass