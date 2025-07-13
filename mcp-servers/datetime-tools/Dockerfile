FROM python:3.11-slim

# Install system dependencies for health checks
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY pyproject.toml .
RUN pip install --no-cache-dir -e .

# Copy application code
COPY datetime_tools/ ./datetime_tools/
COPY README.md .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash mcp
RUN chown -R mcp:mcp /app
USER mcp

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${MCP_PORT:-3000}/health || exit 1

# Environment variables
ENV MCP_HOST=0.0.0.0
ENV MCP_PORT=3000
ENV PYTHONPATH=/app

# Expose port
EXPOSE 3000

# Run the MCP server
CMD ["python", "-m", "datetime_tools.server"]