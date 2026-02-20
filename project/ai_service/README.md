# Fashion AI Design Service

FastAPI-based microservice for AI-powered fashion design generation.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Service

```bash
# Option 1: Using Python
python app.py

# Option 2: Using Uvicorn directly
uvicorn app:app --reload --port 8000
```

The service will start at `http://localhost:8000`

### 3. API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 📡 API Endpoints

### POST `/generate`

Generate a fashion design from text description.

**Request Body:**
```json
{
  "topwear": "shirt",
  "bottomwear": "jeans",
  "accessories": "watch",
  "style": "casual",
  "color_palette": ["#FF5733", "#33FF57"]
}
```

**Response:**
```json
{
  "image_url": "http://localhost:8000/images/design_a1b2c3d4.jpg",
  "design_id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
  "timestamp": "2026-01-12T10:30:00.000000"
}
```

### GET `/health`

Check service health and statistics.

**Response:**
```json
{
  "status": "healthy",
  "output_directory": "/path/to/generated_images",
  "output_directory_exists": true,
  "generated_images_count": 42
}
```

## 🔧 Integration with Frontend

Update your frontend to call this service:

```typescript
const generateDesign = async (data: DesignRequest) => {
  const response = await fetch('http://localhost:8000/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  const result = await response.json();
  return result.image_url;
};
```

## 📁 Directory Structure

```
ai_service/
├── app.py                  # Main FastAPI application
├── requirements.txt        # Python dependencies
├── models/                 # AI models (to be added)
│   └── __init__.py
├── generated_images/       # Output directory (auto-created)
└── README.md              # This file
```

## 🧠 Adding AI Model Integration

Currently, the `/generate` endpoint creates placeholder images. To integrate an actual AI model:

1. **Install AI dependencies** (uncomment in requirements.txt):
   ```bash
   pip install torch diffusers transformers
   ```

2. **Add model loading in app.py**:
   ```python
   from diffusers import StableDiffusionPipeline
   
   # Load model at startup
   pipe = StableDiffusionPipeline.from_pretrained("stable-diffusion-v1-5")
   ```

3. **Update generate_design function**:
   ```python
   # Generate image
   image = pipe(full_prompt).images[0]
   
   # Save image
   image.save(output_path)
   ```

## 🛠️ TODO

- [ ] Integrate Stable Diffusion or similar model
- [ ] Add image enhancement features
- [ ] Implement caching for similar requests
- [ ] Add rate limiting
- [ ] Set up authentication
- [ ] Add batch generation support
- [ ] Implement design history tracking

## 📝 Notes

- Images are served from `/images/` static route
- Output directory is created automatically
- All requests/errors are logged for debugging
- CORS is enabled for all origins (configure for production)
