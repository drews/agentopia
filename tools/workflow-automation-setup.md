# Workflow Automation Setup Guide

## Overview

This guide outlines the setup and configuration of workflow automation tools for the Agentopia UX design process, focusing on n8n and Windmill as open-source alternatives for design workflow automation.

## Tool Selection: n8n

We've selected **n8n** as our primary workflow automation platform due to its:
- Open-source nature with extensive customization options
- 500+ pre-built integrations including design tools
- Visual workflow builder with code flexibility
- Strong API integration capabilities
- Active community and regular updates

## Installation Options

### Option 1: Docker Installation (Recommended)

```bash
# Create directory for n8n data
mkdir -p ~/.n8n

# Run n8n in Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

### Option 2: Local Installation

```bash
# Install n8n globally
npm install -g n8n

# Start n8n
n8n start
```

### Option 3: Self-Hosted (Production)

```bash
# Using Docker Compose
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=changeme
    volumes:
      - ~/.n8n:/home/node/.n8n
```

## Initial Configuration

### Environment Variables

```bash
# Basic configuration
export N8N_BASIC_AUTH_ACTIVE=true
export N8N_BASIC_AUTH_USER=admin
export N8N_BASIC_AUTH_PASSWORD=your-secure-password

# Webhook configuration
export WEBHOOK_URL=https://your-domain.com/webhook
export N8N_HOST=your-domain.com
export N8N_PORT=5678
export N8N_PROTOCOL=https

# Database configuration (optional)
export DB_TYPE=sqlite
export DB_SQLITE_DATABASE=/home/node/.n8n/database.sqlite
```

### Security Setup

```bash
# Generate encryption key
export N8N_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Configure HTTPS
export N8N_PROTOCOL=https
export N8N_SSL_KEY=/path/to/private.key
export N8N_SSL_CERT=/path/to/certificate.crt
```

## Design Workflow Automations

### 1. Design Asset Export Automation

**Trigger**: Penpot file update webhook
**Actions**:
- Export SVG assets from Penpot
- Optimize assets for web
- Update component library
- Generate asset documentation
- Commit changes to git

```json
{
  "name": "Design Asset Export",
  "nodes": [
    {
      "name": "Penpot Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "penpot-update",
        "httpMethod": "POST"
      }
    },
    {
      "name": "Extract Assets",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://design.penpot.app/api/export/{{$json.fileId}}",
        "method": "GET",
        "headers": {
          "Authorization": "Bearer {{$credentials.penpotToken}}"
        }
      }
    },
    {
      "name": "Optimize Assets",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": "// SVG optimization logic"
      }
    },
    {
      "name": "Update Repository",
      "type": "n8n-nodes-base.git",
      "parameters": {
        "operation": "commit",
        "message": "Automated asset update from Penpot"
      }
    }
  ]
}
```

### 2. Design Review Automation

**Trigger**: Pull request creation
**Actions**:
- Run automated accessibility checks
- Generate design diff reports
- Notify design team
- Update design system documentation

```json
{
  "name": "Design Review Automation",
  "nodes": [
    {
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "events": ["pull_request"]
      }
    },
    {
      "name": "Accessibility Check",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.accessibility-checker.com/analyze",
        "method": "POST",
        "body": {
          "url": "{{$json.pr.diff_url}}"
        }
      }
    },
    {
      "name": "Notify Design Team",
      "type": "n8n-nodes-base.slack",
      "parameters": {
        "channel": "#design-review",
        "text": "New design changes ready for review: {{$json.pr.html_url}}"
      }
    }
  ]
}
```

### 3. User Feedback Processing

**Trigger**: User feedback form submission
**Actions**:
- Process feedback with AI
- Categorize feedback type
- Create GitHub issues for bugs
- Update UX research database

```json
{
  "name": "User Feedback Processing",
  "nodes": [
    {
      "name": "Feedback Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "path": "user-feedback"
      }
    },
    {
      "name": "AI Analysis",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "message",
        "text": "Analyze this user feedback and categorize it: {{$json.feedback}}"
      }
    },
    {
      "name": "Create Issue",
      "type": "n8n-nodes-base.github",
      "parameters": {
        "operation": "create",
        "resource": "issue",
        "title": "User Feedback: {{$json.category}}",
        "body": "{{$json.feedback}}"
      }
    }
  ]
}
```

## Integration Configurations

### Penpot Integration

```javascript
// Custom Penpot node configuration
{
  "name": "Penpot",
  "credentials": {
    "penpotApi": {
      "name": "Penpot API",
      "properties": [
        {
          "name": "baseUrl",
          "displayName": "Base URL",
          "type": "string",
          "default": "https://design.penpot.app"
        },
        {
          "name": "accessToken",
          "displayName": "Access Token",
          "type": "string",
          "typeOptions": {
            "password": true
          }
        }
      ]
    }
  }
}
```

### GitHub Integration

```javascript
// GitHub webhook configuration
{
  "name": "GitHub Webhook",
  "type": "n8n-nodes-base.githubTrigger",
  "parameters": {
    "authentication": "accessToken",
    "repository": "drews/agentopia",
    "events": [
      "pull_request",
      "push",
      "release"
    ]
  }
}
```

### Slack Integration

```javascript
// Slack notification configuration
{
  "name": "Slack Notification",
  "type": "n8n-nodes-base.slack",
  "parameters": {
    "authentication": "oAuth2",
    "channel": "#design-team",
    "otherOptions": {
      "username": "Agentopia Design Bot",
      "icon_emoji": ":robot_face:"
    }
  }
}
```

## Advanced Workflows

### Design System Maintenance

```javascript
// Weekly design system audit
{
  "name": "Design System Audit",
  "schedule": "0 9 * * 1", // Every Monday at 9 AM
  "nodes": [
    {
      "name": "Audit Components",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": `
          // Check component usage across codebase
          const fs = require('fs');
          const path = require('path');
          
          // Scan for unused components
          // Generate usage report
          // Flag inconsistencies
        `
      }
    },
    {
      "name": "Generate Report",
      "type": "n8n-nodes-base.markdown",
      "parameters": {
        "operation": "create",
        "template": "design-system-audit-report.md"
      }
    }
  ]
}
```

### Performance Monitoring

```javascript
// Design performance monitoring
{
  "name": "Performance Monitor",
  "schedule": "0 */6 * * *", // Every 6 hours
  "nodes": [
    {
      "name": "Lighthouse Audit",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
        "method": "GET",
        "qs": {
          "url": "https://your-app-url.com",
          "category": "ACCESSIBILITY,BEST_PRACTICES,PERFORMANCE"
        }
      }
    },
    {
      "name": "Process Results",
      "type": "n8n-nodes-base.function",
      "parameters": {
        "functionCode": `
          // Process Lighthouse results
          // Check for regressions
          // Generate alerts if needed
        `
      }
    }
  ]
}
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check n8n status
curl -f http://localhost:5678/healthz

# Check workflow execution
curl -H "Authorization: Bearer your-token" \
  http://localhost:5678/api/v1/workflows

# Monitor logs
docker logs n8n --tail 100 -f
```

### Backup Strategy

```bash
# Backup n8n data
tar -czf n8n-backup-$(date +%Y%m%d).tar.gz ~/.n8n/

# Backup to cloud storage
aws s3 cp n8n-backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### Update Procedures

```bash
# Update n8n Docker image
docker pull n8nio/n8n:latest
docker stop n8n
docker rm n8n
# Run with new image

# Update npm installation
npm update -g n8n
```

## Best Practices

### Security
- Use environment variables for sensitive data
- Implement proper authentication
- Regular security audits
- Network isolation for production

### Performance
- Monitor workflow execution times
- Optimize heavy operations
- Use caching where appropriate
- Implement rate limiting

### Maintenance
- Regular backups
- Monitor system resources
- Update dependencies
- Document custom workflows

## Troubleshooting

### Common Issues

**Connection Errors**
```bash
# Check network connectivity
curl -I http://localhost:5678

# Verify environment variables
echo $N8N_HOST
echo $N8N_PORT
```

**Workflow Failures**
```bash
# Check workflow logs
curl -H "Authorization: Bearer token" \
  http://localhost:5678/api/v1/executions

# Debug mode
N8N_LOG_LEVEL=debug n8n start
```

**Resource Issues**
```bash
# Monitor resource usage
docker stats n8n

# Check disk space
df -h ~/.n8n/
```

## Next Steps

1. **Set up basic n8n instance** with Docker
2. **Configure integrations** with Penpot and GitHub
3. **Create initial workflows** for asset export automation
4. **Test workflows** with sample design files
5. **Implement monitoring** and alerting
6. **Document custom workflows** for team use

## Resources

- [n8n Documentation](https://docs.n8n.io/)
- [n8n Community](https://community.n8n.io/)
- [Workflow Templates](https://n8n.io/workflows/)
- [API Documentation](https://docs.n8n.io/api/)

---

*This setup guide provides the foundation for design workflow automation. Customize workflows based on specific project needs and team requirements.*