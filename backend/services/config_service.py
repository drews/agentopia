"""
Configuration service for loading agent configurations
"""

import json
import os
import logging
from typing import Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

class ConfigService:
    """Service for loading and managing configuration files"""
    
    def __init__(self, config_dir: str = None):
        if config_dir is None:
            # Default to config directory at project root
            self.config_dir = Path(__file__).parent.parent.parent / "config"
        else:
            self.config_dir = Path(config_dir)
        
        self.consolidated_config = None
        self.active_persona = None
        
    def load_consolidated_config(self) -> Dict[str, Any]:
        """Load consolidated configuration from agentopia.json file"""
        if self.consolidated_config is None:
            config_file = self.config_dir / "agentopia.json"
            try:
                with open(config_file, 'r') as f:
                    self.consolidated_config = json.load(f)
                
                # Validate configuration structure
                if self.validate_consolidated_config(self.consolidated_config):
                    logger.info(f"Loaded consolidated configuration from {config_file}")
                else:
                    logger.warning(f"Configuration validation failed for {config_file}")
                    
            except FileNotFoundError:
                logger.error(f"Consolidated config file not found: {config_file}")
                self.consolidated_config = {"agents": {}, "personas": {}, "mcp_servers": {}, "defaults": {}}
            except json.JSONDecodeError as e:
                logger.error(f"Error parsing consolidated config: {e}")
                self.consolidated_config = {"agents": {}, "personas": {}, "mcp_servers": {}, "defaults": {}}
        
        return self.consolidated_config
    
    def validate_consolidated_config(self, config: Dict[str, Any]) -> bool:
        """Validate consolidated configuration structure"""
        try:
            # Check required top-level keys
            required_keys = ['agents', 'personas', 'mcp_servers', 'defaults']
            for key in required_keys:
                if key not in config:
                    logger.error(f"Missing required key in consolidated config: {key}")
                    return False
            
            # Validate agents section
            agents = config.get('agents', {})
            if not isinstance(agents, dict):
                logger.error("'agents' section must be a dictionary")
                return False
            
            # Validate each agent configuration
            for agent_id, agent_config in agents.items():
                if not self._validate_agent_structure(agent_id, agent_config):
                    return False
            
            # Validate personas section
            personas = config.get('personas', {})
            if not isinstance(personas, dict):
                logger.error("'personas' section must be a dictionary")
                return False
            
            # Validate MCP servers section
            mcp_servers = config.get('mcp_servers', {})
            if not isinstance(mcp_servers, dict):
                logger.error("'mcp_servers' section must be a dictionary")
                return False
            
            # Validate each MCP server configuration
            for server_id, server_config in mcp_servers.items():
                if not self._validate_mcp_server_structure(server_id, server_config):
                    return False
            
            # Validate defaults section
            defaults = config.get('defaults', {})
            if not isinstance(defaults, dict):
                logger.error("'defaults' section must be a dictionary")
                return False
            
            logger.info("Consolidated configuration validation passed")
            return True
            
        except Exception as e:
            logger.error(f"Error validating consolidated configuration: {e}")
            return False
    
    def _validate_agent_structure(self, agent_id: str, agent_config: Dict[str, Any]) -> bool:
        """Validate individual agent configuration structure"""
        required_fields = ['id', 'name', 'role', 'avatar']
        for field in required_fields:
            if field not in agent_config:
                logger.error(f"Agent {agent_id} missing required field: {field}")
                return False
        
        # Optional validations
        if 'personality' in agent_config and not isinstance(agent_config['personality'], dict):
            logger.error(f"Agent {agent_id} personality must be a dictionary")
            return False
        
        if 'capabilities' in agent_config and not isinstance(agent_config['capabilities'], dict):
            logger.error(f"Agent {agent_id} capabilities must be a dictionary")
            return False
        
        return True
    
    def _validate_mcp_server_structure(self, server_id: str, server_config: Dict[str, Any]) -> bool:
        """Validate individual MCP server configuration structure"""
        required_fields = ['url']
        for field in required_fields:
            if field not in server_config:
                logger.error(f"MCP server {server_id} missing required field: {field}")
                return False
        
        # Optional validations
        if 'capabilities' in server_config and not isinstance(server_config['capabilities'], list):
            logger.error(f"MCP server {server_id} capabilities must be a list")
            return False
        
        if 'timeout' in server_config and not isinstance(server_config['timeout'], (int, float)):
            logger.error(f"MCP server {server_id} timeout must be a number")
            return False
        
        return True
        
    def load_agent_config(self) -> Dict[str, Any]:
        """Load agent configuration from consolidated config"""
        config = self.load_consolidated_config()
        return {"agents": config.get("agents", {}), "defaults": config.get("defaults", {}).get("agents", {})}
    
    def get_agent_config(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific agent"""
        config = self.load_agent_config()
        return config.get("agents", {}).get(agent_id)
    
    def get_all_agent_configs(self) -> Dict[str, Dict[str, Any]]:
        """Get all agent configurations"""
        config = self.load_agent_config()
        return config.get("agents", {})
    
    def get_agent_defaults(self) -> Dict[str, Any]:
        """Get default agent settings"""
        config = self.load_agent_config()
        return config.get("defaults", {})
    
    def get_agent_personality(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get personality configuration for an agent"""
        agent_config = self.get_agent_config(agent_id)
        if agent_config:
            return agent_config.get("personality", {})
        return None
    
    def get_agent_system_prompt(self, agent_id: str) -> Optional[str]:
        """Get system prompt for an agent"""
        agent_config = self.get_agent_config(agent_id)
        if agent_config:
            return agent_config.get("system_prompt", "You are a helpful AI assistant.")
        return None
    
    def get_agent_capabilities(self, agent_id: str) -> Dict[str, Dict[str, float]]:
        """Get capabilities configuration for an agent"""
        agent_config = self.get_agent_config(agent_id)
        if agent_config:
            return agent_config.get("capabilities", {})
        return {}
    
    def get_agent_role_mapping(self) -> Dict[str, str]:
        """Get mapping of agent IDs to roles"""
        configs = self.get_all_agent_configs()
        return {
            agent_id: config.get("role", agent_id)
            for agent_id, config in configs.items()
        }
    
    def get_agents_by_role(self, role: str) -> list[str]:
        """Get list of agent IDs that have a specific role"""
        configs = self.get_all_agent_configs()
        return [
            agent_id for agent_id, config in configs.items()
            if config.get("role") == role
        ]
    
    def validate_agent_config(self, agent_id: str) -> bool:
        """Validate that an agent configuration is complete"""
        config = self.get_agent_config(agent_id)
        if not config:
            return False
        
        required_fields = ["id", "name", "role", "avatar"]
        for field in required_fields:
            if field not in config:
                logger.warning(f"Agent {agent_id} missing required field: {field}")
                return False
        
        return True
    
    def reload_config(self):
        """Reload configuration from files"""
        self.consolidated_config = None
        logger.info("Configuration reloaded")
    
    def load_persona_config(self) -> Dict[str, Any]:
        """Load persona configuration from consolidated config"""
        config = self.load_consolidated_config()
        return config.get("personas", {})
    
    def get_persona_config(self, persona_id: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a specific persona"""
        config = self.load_persona_config()
        return config.get(persona_id)
    
    def get_claude_code_persona_config(self, persona_id: str) -> Optional[Dict[str, Any]]:
        """Get Claude Code specific persona configuration - deprecated, use get_persona_config instead"""
        # This method is deprecated since claude_code_personas section was merged into main personas
        return self.get_persona_config(persona_id)
    
    def set_active_persona(self, persona_id: str) -> bool:
        """Set the active persona for the session"""
        persona_config = self.get_persona_config(persona_id)
        if persona_config:
            self.active_persona = persona_id
            logger.info(f"Active persona set to: {persona_id}")
            return True
        else:
            logger.warning(f"Persona not found: {persona_id}")
            return False
    
    def get_active_persona(self) -> Optional[str]:
        """Get the currently active persona"""
        return self.active_persona
    
    def apply_persona_to_agent(self, agent_id: str, persona_id: str = None) -> Dict[str, Any]:
        """Apply persona modifications to an agent configuration"""
        base_config = self.get_agent_config(agent_id)
        if not base_config:
            return {}
        
        # Use active persona if none specified
        if persona_id is None:
            persona_id = self.active_persona
        
        if not persona_id:
            return base_config
        
        persona_config = self.get_persona_config(persona_id)
        if not persona_config:
            return base_config
        
        # Create a copy of the base config
        modified_config = base_config.copy()
        
        # Apply persona overrides
        overrides = persona_config.get("overrides", {})
        
        # Apply personality overrides
        if "personality" in overrides:
            current_personality = modified_config.get("personality", {})
            current_personality.update(overrides["personality"])
            modified_config["personality"] = current_personality
        
        # Apply system prompt modifier
        if "system_prompt_modifier" in overrides:
            base_prompt = modified_config.get("system_prompt", "")
            modified_config["system_prompt"] = base_prompt + overrides["system_prompt_modifier"]
        
        # Apply capability modifiers
        if "capabilities_modifier" in overrides:
            current_capabilities = modified_config.get("capabilities", {})
            current_capabilities.update(overrides["capabilities_modifier"])
            modified_config["capabilities"] = current_capabilities
        
        return modified_config
    
    def get_available_personas(self) -> Dict[str, str]:
        """Get list of available personas with descriptions"""
        personas = self.load_persona_config()
        return {
            persona_id: persona_config.get("description", "No description")
            for persona_id, persona_config in personas.items()
        }
    
    def get_context_suggested_persona(self, context: str) -> Optional[str]:
        """Get suggested persona based on context triggers"""
        config = self.load_consolidated_config()
        triggers = config.get("defaults", {}).get("personas", {}).get("context_triggers", {})
        return triggers.get(context)


# Global config service instance
config_service = ConfigService()