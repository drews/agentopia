"""
Ollama LLM Provider for local model serving.
Provides integration with Ollama for running local open-source models.
"""

import asyncio
import httpx
from typing import Dict, Any, Optional
import logging
from ..base import (
    BaseLLMProvider, 
    LLMRequest, 
    LLMResponse, 
    LLMProviderError, 
    LLMProviderUnavailableError,
    LLMProviderAPIError
)

logger = logging.getLogger(__name__)


class OllamaProvider(BaseLLMProvider):
    """Provider for Ollama local model serving."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.base_url = config.get("base_url", "http://localhost:11434")
        self.model = config.get("model", "llama2")
        self.timeout = config.get("timeout", 30.0)
        self.client = httpx.AsyncClient(timeout=self.timeout)
    
    async def generate_response(self, request: LLMRequest) -> LLMResponse:
        """Generate response using Ollama API."""
        try:
            # Use request model if specified, otherwise use configured default
            model = request.model or self.model
            
            # Prepare the prompt
            prompt = request.prompt
            if request.system_prompt:
                prompt = f"System: {request.system_prompt}\n\nUser: {request.prompt}"
            
            # Prepare request payload
            payload = {
                "model": model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": request.temperature,
                }
            }
            
            if request.max_tokens:
                payload["options"]["num_predict"] = request.max_tokens
            
            # Make request to Ollama
            response = await self.client.post(
                f"{self.base_url}/api/generate",
                json=payload
            )
            
            if response.status_code != 200:
                raise LLMProviderAPIError(
                    f"Ollama API returned status {response.status_code}: {response.text}",
                    "ollama"
                )
            
            result = response.json()
            
            return LLMResponse(
                content=result.get("response", ""),
                provider="ollama",
                model=model,
                tokens_used=result.get("eval_count", 0) + result.get("prompt_eval_count", 0),
                finish_reason="stop" if result.get("done", False) else "length",
                metadata={
                    "eval_count": result.get("eval_count", 0),
                    "prompt_eval_count": result.get("prompt_eval_count", 0),
                    "eval_duration": result.get("eval_duration", 0),
                    "total_duration": result.get("total_duration", 0)
                }
            )
            
        except httpx.RequestError as e:
            raise LLMProviderUnavailableError(
                f"Failed to connect to Ollama server: {e}",
                "ollama",
                e
            )
        except Exception as e:
            raise LLMProviderError(
                f"Unexpected error in Ollama provider: {e}",
                "ollama",
                e
            )
    
    async def is_available(self) -> bool:
        """Check if Ollama server is running and model is available."""
        try:
            # Check if server is running
            response = await self.client.get(f"{self.base_url}/api/tags")
            if response.status_code != 200:
                return False
            
            # Check if our model is available
            models = response.json().get("models", [])
            model_names = [model.get("name", "").split(":")[0] for model in models]
            
            return self.model in model_names
            
        except Exception as e:
            logger.debug(f"Ollama availability check failed: {e}")
            return False
    
    async def get_model_info(self) -> Dict[str, Any]:
        """Get information about the current model."""
        try:
            response = await self.client.post(
                f"{self.base_url}/api/show",
                json={"name": self.model}
            )
            
            if response.status_code == 200:
                model_info = response.json()
                return {
                    "name": self.model,
                    "provider": "ollama",
                    "capabilities": ["text-generation", "conversation"],
                    "size": model_info.get("size", 0),
                    "parameters": model_info.get("details", {}).get("parameter_size"),
                    "family": model_info.get("details", {}).get("family"),
                    "supports_system_prompt": True,
                    "supports_streaming": True,
                    "local": True
                }
            else:
                # Fallback info if model details aren't available
                return {
                    "name": self.model,
                    "provider": "ollama",
                    "capabilities": ["text-generation"],
                    "supports_system_prompt": True,
                    "supports_streaming": True,
                    "local": True
                }
                
        except Exception as e:
            logger.warning(f"Failed to get Ollama model info: {e}")
            return {
                "name": self.model,
                "provider": "ollama",
                "capabilities": ["text-generation"],
                "supports_system_prompt": True,
                "local": True,
                "error": str(e)
            }
    
    async def __aenter__(self):
        """Async context manager entry."""
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.client.aclose()