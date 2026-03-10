# ================================
# AI SERVICE DOCKERFILE
# Purpose: Run Python FastAPI with ML models
# ================================

# Use Python 3.11 (3.12 might have compatibility issues with some ML libs)
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for PyTorch and image processing
RUN apt-get update && apt-get install -y \
    git \
    wget \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first (for better caching)
COPY requirements.txt .

# Install Python dependencies
# Note: PyTorch CPU version is ~2GB, this will take time
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p generated_images uploads data/fashion_dataset/images

# Expose AI service port
EXPOSE 8000

# Health check - verify FastAPI is responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Run FastAPI with uvicorn
# --host 0.0.0.0 allows external connections
# --port 8000 is our API port
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
