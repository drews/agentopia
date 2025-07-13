# Ollama Setup Guide for Agentopia

This guide helps you set up Ollama with a small, fast local model for Agentopia development.

## Quick Start

### 1. Install Ollama

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com](https://ollama.com/download)

### 2. Start Ollama Service

```bash
ollama serve
```

### 3. Pull a Small, Fast Model

For development and testing, we recommend **TinyLlama** (1.1B parameters):

```bash
ollama pull tinyllama
```

**Alternative small models:**
```bash
# Phi-2 (2.7B) - Good reasoning capabilities
ollama pull phi

# Qwen2 (0.5B) - Ultra lightweight
ollama pull qwen2:0.5b

# StableLM-Zephyr (3B) - Good balance of speed and capability
ollama pull stable-code:3b
```

### 4. Test Your Setup

```bash
# Test that Ollama is running
curl http://localhost:11434/api/tags

# Test the model
ollama run tinyllama "Hello, how are you?"
```

### 5. Configure Agentopia

Update your `.env` file:
```bash
# Set Ollama as the default provider
DEFAULT_LLM_PROVIDER=ollama

# Configure Ollama settings
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=tinyllama
OLLAMA_TIMEOUT=30.0
```

## Model Comparison

| Model | Size | Speed | Use Case |
|-------|------|-------|----------|
| tinyllama | 1.1B | ⚡⚡⚡ | Development, testing |
| phi | 2.7B | ⚡⚡ | Reasoning tasks |
| qwen2:0.5b | 0.5B | ⚡⚡⚡ | Ultra-lightweight |
| stable-code:3b | 3B | ⚡ | Code generation |

## Docker Integration

To run Ollama alongside Agentopia in Docker:

### Option 1: External Ollama (Recommended)
Run Ollama on your host machine and connect from Docker:

```bash
# Start Ollama on host
ollama serve

# Update docker-compose configuration
OLLAMA_BASE_URL=http://host.docker.internal:11434
```

### Option 2: Ollama in Docker
Add to `docker-compose.yml`:

```yaml
services:
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_KEEP_ALIVE=24h
    
  backend:
    environment:
      - OLLAMA_BASE_URL=http://ollama:11434
    depends_on:
      - ollama

volumes:
  ollama_data:
```

## Performance Tips

### 1. Model Quantization
Ollama automatically uses quantized models for better performance:
- `tinyllama` → Automatically quantized
- `phi:q4_0` → 4-bit quantization for even faster inference

### 2. Memory Management
```bash
# Set model keep-alive time (default 5 minutes)
export OLLAMA_KEEP_ALIVE=24h

# Control concurrent requests
export OLLAMA_MAX_LOADED_MODELS=1
```

### 3. Hardware Acceleration
Ollama automatically detects and uses:
- **NVIDIA GPUs** (CUDA)
- **AMD GPUs** (ROCm)
- **Apple Silicon** (Metal)
- **CPU** (fallback)

## Troubleshooting

### Model Loading Issues
```bash
# Check available models
ollama list

# Re-pull model if corrupted
ollama rm tinyllama
ollama pull tinyllama
```

### Connection Issues
```bash
# Check if Ollama is running
curl -f http://localhost:11434/api/tags

# Check logs
ollama logs
```

### Performance Issues
```bash
# Monitor resource usage
ollama ps

# Check model info
ollama show tinyllama
```

## Integration Testing

Test the Agentopia integration:

```bash
# Run the system with Ollama
npm run docker:services:up
npm run docker:smoke

# Check agent responses in the web interface
open http://localhost:3000
```

## Model Recommendations by Use Case

### Development/Testing
- **tinyllama** - Fast startup, good for basic conversations
- **qwen2:0.5b** - Minimal resource usage

### Production/Demos
- **phi** - Better reasoning, still lightweight
- **stable-code:3b** - Code-aware responses

### Resource-Constrained
- **qwen2:0.5b** - Ultra-minimal (500MB)
- **tinyllama** - Good compromise (1.1GB)

## Next Steps

Once Ollama is working:
1. Test agent conversations with local models
2. Implement agent memory and context management
3. Add conversation history persistence
4. Create agent personality profiles

For advanced usage, see the [Agent Memory Guide](AGENT_MEMORY.md) and [Performance Optimization](PERFORMANCE.md).