"""
LLM Service using LangChain for provider abstraction.
Provides a unified interface for multiple LLM providers.
"""

from typing import Dict, Any, Optional, List
import logging
from langchain_core.language_models import BaseLLM
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic  
from langchain_ollama import OllamaLLM
from langchain_community.llms.fake import FakeListLLM

from backend.core.config import Settings

logger = logging.getLogger(__name__)


class LLMService:
    """Service for managing LLM providers using LangChain."""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self._providers: Dict[str, BaseLLM] = {}
        self._current_provider: Optional[str] = None
        
    def get_provider(self, provider_name: Optional[str] = None) -> BaseLLM:
        """
        Get LLM provider instance.
        
        Args:
            provider_name: Specific provider to use, or None for default
            
        Returns:
            BaseLLM: LangChain LLM instance
        """
        provider_name = provider_name or self.settings.default_llm_provider
        
        if provider_name not in self._providers:
            self._providers[provider_name] = self._create_provider(provider_name)
            
        return self._providers[provider_name]
    
    def _create_provider(self, provider_name: str) -> BaseLLM:
        """Create and configure LLM provider."""
        provider_name = provider_name.lower()
        
        if provider_name == "openai":
            if not self.settings.openai_api_key:
                logger.warning("OpenAI API key not configured, falling back to mock")
                return self._create_mock_provider()
            
            return ChatOpenAI(
                api_key=self.settings.openai_api_key,
                model=self.settings.default_llm_model,
                temperature=self.settings.default_llm_temperature,
                max_tokens=self.settings.default_llm_max_tokens,
            )
        
        elif provider_name == "anthropic":
            if not self.settings.anthropic_api_key:
                logger.warning("Anthropic API key not configured, falling back to mock")
                return self._create_mock_provider()
            
            return ChatAnthropic(
                api_key=self.settings.anthropic_api_key,
                model=self.settings.default_llm_model.replace("gpt-", "claude-"),
                temperature=self.settings.default_llm_temperature,
                max_tokens=self.settings.default_llm_max_tokens,
            )
        
        elif provider_name == "ollama":
            return OllamaLLM(
                base_url=self.settings.ollama_base_url,
                model=self.settings.ollama_model,
                temperature=self.settings.default_llm_temperature,
            )
        
        elif provider_name == "mock":
            return self._create_mock_provider()
        
        else:
            logger.error(f"Unknown provider: {provider_name}, falling back to mock")
            return self._create_mock_provider()
    
    def _create_mock_provider(self) -> BaseLLM:
        """Create a mock provider for testing."""
        return FakeListLLM(responses=[
            "This is a mock response from the AI assistant.",
            "I understand your request and am processing it.",
            "Based on the information provided, here is my analysis.",
            "I'm ready to assist you with this task.",
            "Let me help you with that request."
        ])
    
    async def generate_response(
        self, 
        prompt: str, 
        system_prompt: Optional[str] = None,
        provider_name: Optional[str] = None,
        **kwargs
    ) -> str:
        """
        Generate a response from the LLM.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            provider_name: Specific provider to use
            **kwargs: Additional parameters
            
        Returns:
            str: Generated response
        """
        try:
            llm = self.get_provider(provider_name)
            
            # Handle different LLM types
            if hasattr(llm, 'invoke') and 'chat' in str(type(llm)).lower():
                # Chat models expect messages
                messages = []
                if system_prompt:
                    messages.append(SystemMessage(content=system_prompt))
                messages.append(HumanMessage(content=prompt))
                
                response = await llm.ainvoke(messages) if hasattr(llm, 'ainvoke') else llm.invoke(messages)
                return response.content if hasattr(response, 'content') else str(response)
            else:
                # Text completion models expect strings
                full_prompt = f"{system_prompt}\n\n{prompt}" if system_prompt else prompt
                response = await llm.ainvoke(full_prompt) if hasattr(llm, 'ainvoke') else llm.invoke(full_prompt)
                return str(response)
                
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"
    
    async def is_provider_available(self, provider_name: str) -> bool:
        """Check if a provider is available and configured."""
        try:
            provider = self.get_provider(provider_name)
            # Try a simple test invocation
            test_response = await self.generate_response(
                "Hello", 
                provider_name=provider_name
            )
            return len(test_response) > 0
        except Exception as e:
            logger.debug(f"Provider {provider_name} availability check failed: {e}")
            return False
    
    def list_available_providers(self) -> List[str]:
        """List all available provider names."""
        return ["openai", "anthropic", "ollama", "mock"]
    
    def get_provider_info(self, provider_name: Optional[str] = None) -> Dict[str, Any]:
        """Get information about a provider."""
        provider_name = provider_name or self.settings.default_llm_provider
        
        provider_info = {
            "name": provider_name,
            "configured": False,
            "available": False,
        }
        
        if provider_name == "openai":
            provider_info["configured"] = bool(self.settings.openai_api_key)
            provider_info["model"] = self.settings.default_llm_model
        elif provider_name == "anthropic":
            provider_info["configured"] = bool(self.settings.anthropic_api_key)
            provider_info["model"] = self.settings.default_llm_model.replace("gpt-", "claude-")
        elif provider_name == "ollama":
            provider_info["configured"] = True  # Ollama doesn't need API keys
            provider_info["model"] = self.settings.ollama_model
            provider_info["base_url"] = self.settings.ollama_base_url
        elif provider_name == "mock":
            provider_info["configured"] = True
            provider_info["model"] = "mock-model"
        
        return provider_info