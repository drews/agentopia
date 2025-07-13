"""
Mock LLM Provider for testing and development.
Provides deterministic responses for testing purposes.
"""

import asyncio
from typing import Dict, Any
from ..base import BaseLLMProvider, LLMRequest, LLMResponse


class MockProvider(BaseLLMProvider):
    """Mock provider that returns predefined responses for testing."""
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.responses = config.get("responses", {})
        self.default_response = config.get(
            "default_response", 
            "This is a mock response from the test LLM provider."
        )
        self.simulate_delay = config.get("simulate_delay", 0.1)
        self.model_name = config.get("model", "mock-model-v1")
    
    async def generate_response(self, request: LLMRequest) -> LLMResponse:
        """Generate a mock response based on the prompt."""
        # Simulate API delay
        await asyncio.sleep(self.simulate_delay)
        
        # Check for predefined responses based on prompt keywords
        response_text = self.default_response
        for keyword, predefined_response in self.responses.items():
            if keyword.lower() in request.prompt.lower():
                response_text = predefined_response
                break
        
        # Simulate token counting (rough estimate)
        tokens_used = len(request.prompt.split()) + len(response_text.split())
        
        return LLMResponse(
            content=response_text,
            provider="mock",
            model=self.model_name,
            tokens_used=tokens_used,
            finish_reason="stop",
            metadata={
                "temperature": request.temperature,
                "max_tokens": request.max_tokens,
                "system_prompt": request.system_prompt
            }
        )
    
    async def is_available(self) -> bool:
        """Mock provider is always available."""
        return True
    
    async def get_model_info(self) -> Dict[str, Any]:
        """Return mock model information."""
        return {
            "name": self.model_name,
            "provider": "mock",
            "capabilities": ["text-generation", "conversation"],
            "max_tokens": 4096,
            "supports_system_prompt": True,
            "supports_streaming": False
        }