"""
LLM Provider Factory - creates and manages provider instances.
Implements singleton pattern for provider instances.
"""

from typing import Dict, Any, Optional, Type
import logging
from .base import BaseLLMProvider, LLMProviderError, LLMProviderConfigError

logger = logging.getLogger(__name__)


class LLMProviderFactory:
    """Factory class for creating and managing LLM provider instances."""
    
    _instances: Dict[str, BaseLLMProvider] = {}
    _providers: Dict[str, Type[BaseLLMProvider]] = {}
    
    @classmethod
    def register_provider(cls, name: str, provider_class: Type[BaseLLMProvider]):
        """Register a provider class with the factory."""
        cls._providers[name.lower()] = provider_class
        logger.info(f"Registered LLM provider: {name}")
    
    @classmethod
    async def get_provider(cls, provider_name: str, config: Dict[str, Any]) -> BaseLLMProvider:
        """
        Get a provider instance, creating it if necessary.
        
        Args:
            provider_name: Name of the provider (openai, anthropic, ollama)
            config: Configuration dictionary for the provider
            
        Returns:
            BaseLLMProvider: Provider instance
            
        Raises:
            LLMProviderConfigError: If provider_name is not supported
        """
        provider_key = f"{provider_name.lower()}_{hash(str(sorted(config.items())))}"
        
        if provider_key not in cls._instances:
            provider_class = cls._providers.get(provider_name.lower())
            if not provider_class:
                available_providers = list(cls._providers.keys())
                raise LLMProviderConfigError(
                    f"Unknown provider '{provider_name}'. Available: {available_providers}",
                    provider_name
                )
            
            cls._instances[provider_key] = provider_class(config)
            logger.info(f"Created new {provider_name} provider instance")
        
        return cls._instances[provider_key]
    
    @classmethod
    async def create_provider_from_config(cls, config: Dict[str, Any]) -> BaseLLMProvider:
        """
        Create a provider from a complete configuration dictionary.
        
        Expected config format:
        {
            "provider": "openai",
            "api_key": "...",
            "model": "gpt-4",
            "temperature": 0.7
        }
        """
        if "provider" not in config:
            raise LLMProviderConfigError("Configuration must include 'provider' field", "unknown")
        
        provider_name = config["provider"]
        provider_config = {k: v for k, v in config.items() if k != "provider"}
        
        return await cls.get_provider(provider_name, provider_config)
    
    @classmethod
    def list_available_providers(cls) -> list[str]:
        """List all registered provider names."""
        return list(cls._providers.keys())
    
    @classmethod
    async def test_provider_availability(cls, provider_name: str, config: Dict[str, Any]) -> bool:
        """Test if a provider is available with the given configuration."""
        try:
            provider = await cls.get_provider(provider_name, config)
            return await provider.is_available()
        except Exception as e:
            logger.warning(f"Provider {provider_name} availability test failed: {e}")
            return False
    
    @classmethod
    def clear_instances(cls):
        """Clear all cached provider instances. Useful for testing."""
        cls._instances.clear()


# Import and register providers when this module is loaded
def _register_default_providers():
    """Register default provider implementations."""
    try:
        from .providers.mock_provider import MockProvider
        LLMProviderFactory.register_provider("mock", MockProvider)
    except ImportError:
        logger.warning("Mock provider not available")
    
    try:
        from .providers.openai_provider import OpenAIProvider
        LLMProviderFactory.register_provider("openai", OpenAIProvider)
    except ImportError:
        logger.warning("OpenAI provider not available - install openai package")
    
    try:
        from .providers.anthropic_provider import AnthropicProvider
        LLMProviderFactory.register_provider("anthropic", AnthropicProvider)
    except ImportError:
        logger.warning("Anthropic provider not available - install anthropic package")
    
    try:
        from .providers.ollama_provider import OllamaProvider
        LLMProviderFactory.register_provider("ollama", OllamaProvider)
    except ImportError:
        logger.warning("Ollama provider not available - install ollama package")


# Register providers on module import
_register_default_providers()