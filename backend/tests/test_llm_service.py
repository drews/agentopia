"""
Test suite for LangChain-based LLM service.
Using BDD-style tests to define expected behavior.
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, Mock, patch

from backend.services.llm_service import LLMService
from backend.core.config import Settings


class TestLLMService:
    """Test the LangChain-based LLM service."""
    
    def test_llm_service_initializes_with_settings(self):
        """
        GIVEN application settings
        WHEN I create an LLMService
        THEN it should initialize successfully
        """
        settings = Settings()
        service = LLMService(settings)
        assert service is not None
        assert service.settings == settings
    
    def test_llm_service_provides_mock_provider_by_default(self):
        """
        GIVEN default settings with mock provider
        WHEN I get a provider
        THEN it should return a mock LLM instance
        """
        settings = Settings(default_llm_provider="mock")
        service = LLMService(settings)
        
        provider = service.get_provider()
        assert provider is not None
        assert "fake" in str(type(provider)).lower()  # FakeListLLM
    
    @pytest.mark.asyncio
    async def test_llm_service_generates_response(self):
        """
        GIVEN an LLM service
        WHEN I request a response
        THEN it should return a text response
        """
        settings = Settings(default_llm_provider="mock")
        service = LLMService(settings)
        
        response = await service.generate_response("Hello, how are you?")
        assert isinstance(response, str)
        assert len(response) > 0
    
    @pytest.mark.asyncio
    async def test_llm_service_handles_system_prompt(self):
        """
        GIVEN an LLM service
        WHEN I provide a system prompt and user prompt
        THEN it should handle both appropriately
        """
        settings = Settings(default_llm_provider="mock")
        service = LLMService(settings)
        
        response = await service.generate_response(
            prompt="What is your role?",
            system_prompt="You are a helpful assistant."
        )
        assert isinstance(response, str)
        assert len(response) > 0
    
    def test_llm_service_lists_available_providers(self):
        """
        GIVEN an LLM service
        WHEN I request available providers
        THEN it should return a list including expected providers
        """
        settings = Settings()
        service = LLMService(settings)
        
        providers = service.list_available_providers()
        assert isinstance(providers, list)
        assert "mock" in providers
        assert "openai" in providers
        assert "anthropic" in providers
        assert "ollama" in providers
    
    def test_llm_service_provides_provider_info(self):
        """
        GIVEN an LLM service
        WHEN I request provider information
        THEN it should return configuration details
        """
        settings = Settings(default_llm_provider="mock")
        service = LLMService(settings)
        
        info = service.get_provider_info("mock")
        assert isinstance(info, dict)
        assert info["name"] == "mock"
        assert "configured" in info
        assert "model" in info
    
    def test_llm_service_handles_unknown_provider(self):
        """
        GIVEN an LLM service
        WHEN I request an unknown provider
        THEN it should fall back to mock provider
        """
        settings = Settings()
        service = LLMService(settings)
        
        # Request unknown provider - should fallback to mock
        provider = service.get_provider("unknown_provider")
        assert provider is not None
        assert "fake" in str(type(provider)).lower()


class TestProviderIntegration:
    """Test integration scenarios."""
    
    @pytest.mark.asyncio
    async def test_service_with_different_providers(self):
        """
        GIVEN an LLM service configured for different providers
        WHEN I generate responses using each provider
        THEN each should work independently
        """
        settings = Settings()
        service = LLMService(settings)
        
        # Test mock provider
        mock_response = await service.generate_response(
            "Test prompt", 
            provider_name="mock"
        )
        assert isinstance(mock_response, str)
        
        # Test that provider instances are cached
        provider1 = service.get_provider("mock")
        provider2 = service.get_provider("mock")
        assert provider1 is provider2  # Should be same instance
    
    def test_provider_caching(self):
        """
        GIVEN repeated requests for the same provider
        WHEN I call get_provider multiple times
        THEN it should return cached instances
        """
        settings = Settings()
        service = LLMService(settings)
        
        provider1 = service.get_provider("mock")
        provider2 = service.get_provider("mock")
        
        assert provider1 is provider2  # Same instance (cached)