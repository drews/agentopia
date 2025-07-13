FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY main.py .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash gateway
RUN chown -R gateway:gateway /app
USER gateway

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${GATEWAY_PORT:-8001}/health || exit 1

# Environment variables
ENV GATEWAY_HOST=0.0.0.0
ENV GATEWAY_PORT=8001

# Expose port
EXPOSE 8001

# Run the gateway
CMD ["python", "main.py"]