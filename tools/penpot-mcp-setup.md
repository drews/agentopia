# Penpot MCP Integration Setup

## Overview

This document outlines the setup and configuration of Penpot with Model Context Protocol (MCP) for AI-assisted design workflows in the Agentopia project.

## Installation Steps

### 1. Install Penpot MCP Server

```bash
# Install the Penpot MCP server
pip install penpot-mcp

# Or install from source
git clone https://github.com/montevive/penpot-mcp.git
cd penpot-mcp
pip install -e .
```

### 2. Configure MCP Server

Create a configuration file for the MCP server:

```json
{
  "name": "penpot-mcp",
  "description": "Penpot MCP server for AI-assisted design workflows",
  "version": "0.1.1",
  "servers": {
    "penpot": {
      "command": "penpot-mcp",
      "args": [],
      "env": {
        "PENPOT_BASE_URL": "https://design.penpot.app",
        "PENPOT_ACCESS_TOKEN": "your-access-token-here"
      }
    }
  }
}
```

### 3. Claude Desktop Integration

Add to Claude Desktop configuration (`~/.claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "penpot": {
      "command": "penpot-mcp",
      "args": [],
      "env": {
        "PENPOT_BASE_URL": "https://design.penpot.app",
        "PENPOT_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

### 4. Cursor IDE Integration

For Cursor IDE, add to settings:

```json
{
  "mcp.servers": {
    "penpot": {
      "command": "penpot-mcp",
      "args": [],
      "env": {
        "PENPOT_BASE_URL": "https://design.penpot.app",
        "PENPOT_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

## Features Available

### Design Analysis
- **Component Analysis**: AI-powered analysis of design components and layouts
- **Design Validation**: Automated design system compliance checking
- **Accessibility Audit**: Automated accessibility assessment

### Asset Management
- **Export Automation**: Programmatic export of design assets in multiple formats
- **Version Control**: Design file versioning and change tracking
- **Asset Optimization**: Automated asset optimization for web deployment

### Workflow Integration
- **Real-time Design Access**: Direct integration with Penpot's API for live design data
- **Design Feedback**: AI-generated design critique and improvement suggestions
- **Documentation Generation**: Automated component documentation

## API Endpoints

### Design File Operations
```python
# Get design file information
GET /api/v1/files/{file_id}

# Export design assets
POST /api/v1/files/{file_id}/export

# Get design components
GET /api/v1/files/{file_id}/components
```

### Team and Project Management
```python
# List team projects
GET /api/v1/teams/{team_id}/projects

# Create new project
POST /api/v1/teams/{team_id}/projects

# Update project settings
PUT /api/v1/projects/{project_id}
```

## Usage Examples

### Basic Design Analysis
```python
import penpot_mcp

# Initialize MCP client
client = penpot_mcp.Client(
    base_url="https://design.penpot.app",
    access_token="your-token"
)

# Analyze design file
analysis = client.analyze_design_file(file_id="your-file-id")
print(analysis.accessibility_score)
print(analysis.design_system_compliance)
```

### Automated Asset Export
```python
# Export all assets from a design file
assets = client.export_assets(
    file_id="your-file-id",
    format="svg",
    scale=2
)

# Save assets to local directory
for asset in assets:
    with open(f"assets/{asset.name}.svg", "w") as f:
        f.write(asset.content)
```

## Best Practices

### Security
- Store access tokens in environment variables
- Use HTTPS for all API communications
- Implement token rotation for long-running processes
- Restrict MCP server access to authorized users only

### Performance
- Cache design file data to reduce API calls
- Use webhooks for real-time updates when available
- Implement request rate limiting to avoid API throttling
- Optimize asset exports for target use cases

### Workflow Integration
- Set up automated design linting on file changes
- Configure CI/CD integration for design asset deployment
- Implement design review workflows with AI assistance
- Create automated documentation generation pipelines

## Troubleshooting

### Common Issues

**Connection Error**: Check base URL and network connectivity
```bash
curl -I https://design.penpot.app/api/v1/profile
```

**Authentication Error**: Verify access token validity
```bash
curl -H "Authorization: Bearer your-token" https://design.penpot.app/api/v1/profile
```

**MCP Server Not Found**: Ensure penpot-mcp is installed and in PATH
```bash
which penpot-mcp
penpot-mcp --version
```

### Debug Mode
Enable debug logging for troubleshooting:
```bash
export PENPOT_MCP_DEBUG=1
penpot-mcp --debug
```

## Next Steps

1. **Set up Penpot account** and create initial design files
2. **Generate API access token** from Penpot profile settings
3. **Configure MCP server** with proper environment variables
4. **Test integration** with simple design analysis workflow
5. **Integrate with existing** spaceship bridge design files

## Resources

- [Penpot MCP GitHub Repository](https://github.com/montevive/penpot-mcp)
- [Penpot API Documentation](https://design.penpot.app/api-docs)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Claude Desktop MCP Integration Guide](https://docs.anthropic.com/claude/docs/mcp)

---

*This setup guide will be updated as the integration evolves and new features become available.*