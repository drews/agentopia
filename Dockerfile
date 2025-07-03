# Agentopia Virtual Environment Container
FROM python:3.11-slim

LABEL maintainer="Agentopia Team"
LABEL description="Virtual Environment for LLM-Powered Agents"

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash agentopia && \
    chown -R agentopia:agentopia /app
USER agentopia

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/status || exit 1

# Default command
CMD ["python", "server.py"]