"""
MCP Docker Manager for orchestrating MCP servers as containers.
"""

import asyncio
import logging
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import subprocess
import yaml

logger = logging.getLogger(__name__)


class MCPDockerManager:
    """
    Manages MCP servers as Docker containers.
    
    Provides container lifecycle management, health checking,
    and dynamic scaling of MCP services.
    """
    
    def __init__(self, compose_file: str = "docker-compose.mcp.yml"):
        self.compose_file = compose_file
        self.running_containers: Dict[str, Dict[str, Any]] = {}
        self.health_check_interval = 30  # seconds
        self.auto_scale = True
        self.last_health_check = {}
        
    async def initialize(self):
        """Initialize the Docker manager."""
        try:
            # Check if Docker is available
            result = await self._run_command(["docker", "--version"])
            if result.returncode != 0:
                raise Exception("Docker is not available")
            
            # Check if Docker Compose is available
            result = await self._run_command(["docker", "compose", "version"])
            if result.returncode != 0:
                raise Exception("Docker Compose is not available")
            
            # Load container definitions
            await self._load_container_definitions()
            
            logger.info("MCP Docker Manager initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MCP Docker Manager: {e}")
            raise
    
    async def _run_command(self, cmd: List[str]) -> subprocess.CompletedProcess:
        """Run a shell command asynchronously."""
        try:
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            return subprocess.CompletedProcess(
                args=cmd,
                returncode=process.returncode,
                stdout=stdout.decode() if stdout else "",
                stderr=stderr.decode() if stderr else ""
            )
        except Exception as e:
            logger.error(f"Command failed {' '.join(cmd)}: {e}")
            raise
    
    async def _load_container_definitions(self):
        """Load container definitions from docker-compose file."""
        try:
            with open(self.compose_file, 'r') as f:
                compose_config = yaml.safe_load(f)
            
            self.container_definitions = {}
            services = compose_config.get("services", {})
            
            for service_name, config in services.items():
                # Extract MCP server info from labels
                labels = config.get("labels", [])
                mcp_info = {}
                
                for label in labels:
                    if isinstance(label, str) and label.startswith("mcp."):
                        key, value = label.split("=", 1)
                        mcp_info[key.replace("mcp.", "")] = value
                
                if "server" in mcp_info:
                    self.container_definitions[mcp_info["server"]] = {
                        "service_name": service_name,
                        "container_name": config.get("container_name", service_name),
                        "port": self._extract_port(config.get("ports", [])),
                        "capabilities": mcp_info.get("capabilities", "").split(","),
                        "offline": mcp_info.get("offline", "false").lower() == "true",
                        "profiles": config.get("profiles", [])
                    }
            
            logger.info(f"Loaded {len(self.container_definitions)} MCP container definitions")
            
        except Exception as e:
            logger.error(f"Failed to load container definitions: {e}")
            self.container_definitions = {}
    
    def _extract_port(self, ports: List[str]) -> Optional[int]:
        """Extract the external port from Docker port mapping."""
        if not ports:
            return None
        
        try:
            # Handle format like "3000:3000" or just "3000"
            port_mapping = ports[0]
            if ":" in port_mapping:
                external_port = port_mapping.split(":")[0]
            else:
                external_port = port_mapping
            return int(external_port)
        except (ValueError, IndexError):
            return None
    
    async def start_mcp_server(self, server_name: str) -> bool:
        """Start an MCP server container."""
        try:
            if server_name not in self.container_definitions:
                logger.error(f"Unknown MCP server: {server_name}")
                return False
            
            definition = self.container_definitions[server_name]
            service_name = definition["service_name"]
            
            # Build the docker-compose command
            cmd = ["docker", "compose", "-f", self.compose_file]
            
            # Add profiles if needed
            profiles = definition.get("profiles", [])
            for profile in profiles:
                cmd.extend(["--profile", profile])
            
            cmd.extend(["up", "-d", service_name])
            
            result = await self._run_command(cmd)
            
            if result.returncode == 0:
                self.running_containers[server_name] = {
                    "started_at": datetime.now(),
                    "definition": definition,
                    "status": "starting"
                }
                logger.info(f"Started MCP server container: {server_name}")
                
                # Wait for container to be healthy
                await asyncio.sleep(2)
                await self._check_container_health(server_name)
                
                return True
            else:
                logger.error(f"Failed to start {server_name}: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error starting MCP server {server_name}: {e}")
            return False
    
    async def stop_mcp_server(self, server_name: str) -> bool:
        """Stop an MCP server container."""
        try:
            if server_name not in self.container_definitions:
                logger.error(f"Unknown MCP server: {server_name}")
                return False
            
            definition = self.container_definitions[server_name]
            service_name = definition["service_name"]
            
            cmd = ["docker", "compose", "-f", self.compose_file, "stop", service_name]
            result = await self._run_command(cmd)
            
            if result.returncode == 0:
                if server_name in self.running_containers:
                    del self.running_containers[server_name]
                logger.info(f"Stopped MCP server container: {server_name}")
                return True
            else:
                logger.error(f"Failed to stop {server_name}: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error stopping MCP server {server_name}: {e}")
            return False
    
    async def get_server_status(self, server_name: str) -> Dict[str, Any]:
        """Get status of an MCP server container."""
        try:
            if server_name not in self.container_definitions:
                return {"status": "unknown", "error": "Server not defined"}
            
            definition = self.container_definitions[server_name]
            container_name = definition["container_name"]
            
            # Check if container is running
            cmd = ["docker", "ps", "--filter", f"name={container_name}", "--format", "json"]
            result = await self._run_command(cmd)
            
            if result.returncode == 0 and result.stdout.strip():
                # Container is running, check health
                health_status = await self._check_container_health(server_name)
                
                running_info = self.running_containers.get(server_name, {})
                return {
                    "status": "running",
                    "health": health_status,
                    "started_at": running_info.get("started_at"),
                    "port": definition["port"],
                    "capabilities": definition["capabilities"],
                    "offline": definition["offline"]
                }
            else:
                return {
                    "status": "stopped",
                    "health": "not_running",
                    "port": definition["port"],
                    "capabilities": definition["capabilities"],
                    "offline": definition["offline"]
                }
                
        except Exception as e:
            logger.error(f"Error getting server status for {server_name}: {e}")
            return {"status": "error", "error": str(e)}
    
    async def _check_container_health(self, server_name: str) -> str:
        """Check health of a specific container."""
        try:
            definition = self.container_definitions[server_name]
            container_name = definition["container_name"]
            
            # Get container health status
            cmd = ["docker", "inspect", container_name, "--format", "{{.State.Health.Status}}"]
            result = await self._run_command(cmd)
            
            if result.returncode == 0:
                health_status = result.stdout.strip()
                self.last_health_check[server_name] = datetime.now()
                
                if health_status in ["healthy", ""]:  # Empty means no health check defined
                    if server_name in self.running_containers:
                        self.running_containers[server_name]["status"] = "healthy"
                    return "healthy"
                elif health_status == "unhealthy":
                    if server_name in self.running_containers:
                        self.running_containers[server_name]["status"] = "unhealthy"
                    return "unhealthy"
                else:
                    return "starting"
            else:
                return "unknown"
                
        except Exception as e:
            logger.error(f"Error checking health for {server_name}: {e}")
            return "error"
    
    async def get_all_server_status(self) -> Dict[str, Dict[str, Any]]:
        """Get status of all defined MCP servers."""
        status = {}
        
        for server_name in self.container_definitions.keys():
            status[server_name] = await self.get_server_status(server_name)
        
        return status
    
    async def start_all_servers(self) -> Dict[str, bool]:
        """Start all MCP server containers."""
        results = {}
        
        for server_name in self.container_definitions.keys():
            results[server_name] = await self.start_mcp_server(server_name)
        
        return results
    
    async def stop_all_servers(self) -> Dict[str, bool]:
        """Stop all MCP server containers."""
        results = {}
        
        for server_name in list(self.running_containers.keys()):
            results[server_name] = await self.stop_mcp_server(server_name)
        
        return results
    
    async def auto_scale_servers(self, demand_metrics: Dict[str, int]) -> None:
        """Auto-scale servers based on demand metrics."""
        if not self.auto_scale:
            return
        
        try:
            for server_name, request_count in demand_metrics.items():
                if server_name not in self.container_definitions:
                    continue
                
                is_running = server_name in self.running_containers
                
                # Start server if there's demand and it's not running
                if request_count > 0 and not is_running:
                    logger.info(f"Auto-starting {server_name} due to demand ({request_count} requests)")
                    await self.start_mcp_server(server_name)
                
                # Stop server if no demand for a while (and it's not an always-on server)
                elif request_count == 0 and is_running:
                    definition = self.container_definitions[server_name]
                    if definition.get("offline", False):  # Only stop offline-capable servers
                        last_check = self.last_health_check.get(server_name)
                        if last_check and (datetime.now() - last_check) > timedelta(minutes=10):
                            logger.info(f"Auto-stopping {server_name} due to no demand")
                            await self.stop_mcp_server(server_name)
        
        except Exception as e:
            logger.error(f"Error in auto-scaling: {e}")
    
    async def build_images(self) -> bool:
        """Build all custom MCP server images."""
        try:
            cmd = ["docker", "compose", "-f", self.compose_file, "build"]
            result = await self._run_command(cmd)
            
            if result.returncode == 0:
                logger.info("Successfully built MCP server images")
                return True
            else:
                logger.error(f"Failed to build images: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error building images: {e}")
            return False
    
    def get_available_servers(self) -> List[str]:
        """Get list of available MCP servers."""
        return list(self.container_definitions.keys())
    
    def get_server_capabilities(self, server_name: str) -> List[str]:
        """Get capabilities of a specific server."""
        if server_name in self.container_definitions:
            return self.container_definitions[server_name]["capabilities"]
        return []