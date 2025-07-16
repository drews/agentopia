"""
Simple LLM client for agent interactions
"""

import logging
import asyncio
from typing import Dict, List, Any, Optional
import os
from datetime import datetime

logger = logging.getLogger(__name__)

class SimpleLLMClient:
    """Simple LLM client that can work with OpenAI API or local models"""
    
    def __init__(self, model_name: str = "gpt-3.5-turbo", api_key: Optional[str] = None):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.client = None
        self.initialized = False
    
    async def initialize(self):
        """Initialize the LLM client"""
        try:
            # Try to import and initialize OpenAI client
            import openai
            
            if self.api_key:
                self.client = openai.AsyncOpenAI(api_key=self.api_key)
                self.initialized = True
                logger.info(f"Initialized OpenAI client with model: {self.model_name}")
            else:
                logger.warning("No OpenAI API key found, using mock responses")
                self.client = None
                self.initialized = True
                
        except ImportError:
            logger.warning("OpenAI library not installed, using mock responses")
            self.client = None
            self.initialized = True
    
    async def chat_completion(self, messages: List[Dict[str, str]], agent_id: str = "unknown") -> str:
        """Get a chat completion from the LLM"""
        try:
            if not self.initialized:
                await self.initialize()
            
            if self.client:
                # Real OpenAI API call
                response = await self.client.chat.completions.create(
                    model=self.model_name,
                    messages=messages,
                    max_tokens=150,
                    temperature=0.7
                )
                return response.choices[0].message.content.strip()
            else:
                # Mock response for testing
                return await self._mock_response(messages, agent_id)
                
        except Exception as e:
            logger.error(f"Error in chat completion: {e}")
            return await self._mock_response(messages, agent_id)
    
    async def _mock_response(self, messages: List[Dict[str, str]], agent_id: str) -> str:
        """Generate a mock response for testing"""
        # Simulate processing time
        await asyncio.sleep(0.5)
        
        # Get the last user message
        user_message = ""
        for msg in reversed(messages):
            if msg["role"] == "user":
                user_message = msg["content"].lower()
                break
        
        # Try to get agent role from config, fall back to agent_id
        agent_role = agent_id
        if hasattr(self, 'config_service') and self.config_service:
            config = self.config_service.get_agent_config(agent_id)
            if config:
                agent_role = config.get("role", agent_id)
        
        # Generate appropriate mock responses based on agent role and message
        if agent_role == "commander":
            if "plan" in user_message or "schedule" in user_message:
                return "📅 Daily schedule optimized for your energy patterns. 3 priority tasks identified for peak focus windows. Time blocking activated."
            elif "status" in user_message:
                return "📊 Executive function status: Focus capacity 85%, task momentum building. Energy management protocol active."
            elif "priority" in user_message:
                return "⚡ Priority matrix updated. Urgent vs important analysis complete. Dopamine reward system aligned with critical tasks."
            else:
                return "🎯 Strategic planning engaged. Breaking complex goals into manageable steps. Executive function support deployed."
        
        elif agent_role == "science_officer":
            if "research" in user_message or "analyze" in user_message:
                return "🧠 Pattern analysis complete. Your peak focus windows: 9-11am, 2-4pm. Cognitive load optimized for task batching."
            elif "data" in user_message:
                return "📈 Productivity data analyzed. 23% improvement in task completion when using pomodoro technique. Recommending 25-min blocks."
            elif "investigate" in user_message:
                return "🔍 ADHD productivity research active. Studies show visual organization increases completion rates by 40%. Implementing spatial cues."
            else:
                return "🤔 Fascinating behavioral patterns detected. Your motivation spikes correlate with novel challenges. Gamification protocols recommended."
        
        elif agent_role == "operations_officer":
            if "execute" in user_message or "do" in user_message:
                return "⚙️ Workflow automation deployed! Body doubling mode active. 47% reduction in task-switching overhead. Deep work session ready."
            elif "task" in user_message:
                return "📋 Task breakdown complete. Large project divided into 12 micro-tasks. Dopamine hits scheduled every 15 minutes."
            elif "complete" in user_message:
                return "✅ Completion protocols engaged! Progress tracking shows 3 major wins today. Celebrating achievements to maintain momentum."
            else:
                return "🔧 Executive function support online. Environment optimized, distractions filtered. Time to make things happen."
        
        else:
            # Generic response for unknown roles
            agent_name = agent_id
            if hasattr(self, 'config_service') and self.config_service:
                config = self.config_service.get_agent_config(agent_id)
                if config:
                    agent_name = config.get("name", agent_id)
            return f"{agent_name} acknowledging: {user_message[:50]}..."


class AgentPersonality:
    """Defines agent personality and system prompts from configuration"""
    
    def __init__(self, agent_id: str, config: Dict[str, Any]):
        self.agent_id = agent_id
        self.config = config
        self.name = config.get("name", f"Agent {agent_id}")
        self.role = config.get("role", agent_id)
        self.system_prompt = config.get("system_prompt", "You are a helpful AI assistant.")
        self.personality_traits = config.get("personality", {})
    
    def format_messages(self, user_message: str) -> List[Dict[str, str]]:
        """Format messages for the LLM including system prompt"""
        return [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_message}
        ]
    
    def get_communication_style(self) -> str:
        """Get the agent's communication style"""
        return self.personality_traits.get("communication_style", "neutral")
    
    def get_specialization_focus(self) -> List[str]:
        """Get the agent's areas of specialization"""
        return self.personality_traits.get("specialization_focus", [])


class AgentLLMService:
    """Service that connects agents to LLM responses"""
    
    def __init__(self):
        self.llm_client = SimpleLLMClient()
        self.agent_personalities = {}
        self.config_service = None
    
    async def initialize(self):
        """Initialize the LLM service"""
        # Import here to avoid circular imports
        from services.config_service import config_service
        self.config_service = config_service
        
        await self.llm_client.initialize()
        self._load_agent_personalities()
        logger.info("Agent LLM Service initialized")
    
    def _load_agent_personalities(self):
        """Load agent personalities from configuration"""
        if not self.config_service:
            logger.error("Config service not initialized")
            return
        
        agent_configs = self.config_service.get_all_agent_configs()
        self.agent_personalities = {}
        
        for agent_id, config in agent_configs.items():
            try:
                personality = AgentPersonality(agent_id, config)
                self.agent_personalities[agent_id] = personality
                logger.info(f"Loaded personality for agent: {agent_id} ({personality.name})")
            except Exception as e:
                logger.error(f"Error loading personality for agent {agent_id}: {e}")
        
        logger.info(f"Loaded {len(self.agent_personalities)} agent personalities")
    
    async def get_agent_response(self, agent_id: str, message: str) -> Dict[str, Any]:
        """Get a response from an agent"""
        try:
            # Get agent personality
            personality = self.agent_personalities.get(agent_id)
            if not personality:
                # Try to load agent from config if not in personalities cache
                if self.config_service:
                    config = self.config_service.get_agent_config(agent_id)
                    if config:
                        personality = AgentPersonality(agent_id, config)
                        self.agent_personalities[agent_id] = personality
                        logger.info(f"Dynamically loaded personality for agent: {agent_id}")
                    else:
                        logger.error(f"No configuration found for agent: {agent_id}")
                        return {
                            "status": "error",
                            "message": f"No configuration found for agent: {agent_id}"
                        }
                else:
                    logger.error(f"Unknown agent: {agent_id}")
                    return {
                        "status": "error",
                        "message": f"Unknown agent: {agent_id}"
                    }
            
            # Format the message with system prompt
            messages = personality.format_messages(message)
            
            # Get LLM response
            response = await self.llm_client.chat_completion(messages, agent_id)
            
            return {
                "status": "success",
                "agent_id": agent_id,
                "agent_name": personality.name,
                "agent_role": personality.role,
                "response": response,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting agent response: {e}")
            return {
                "status": "error",
                "message": str(e)
            }
    
    async def broadcast_agent_thinking(self, agent_id: str, websocket_manager) -> None:
        """Broadcast that an agent is thinking"""
        await websocket_manager.broadcast({
            "type": "agent_thinking",
            "data": {
                "agent_id": agent_id,
                "status": "thinking",
                "timestamp": datetime.now().isoformat()
            }
        })
    
    async def broadcast_agent_response(self, agent_id: str, response: str, websocket_manager) -> None:
        """Broadcast an agent's response"""
        await websocket_manager.broadcast({
            "type": "agent_response", 
            "data": {
                "agent_id": agent_id,
                "response": response,
                "timestamp": datetime.now().isoformat()
            }
        })