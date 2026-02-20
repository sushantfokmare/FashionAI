# Quick Start Guide

## Step 1: Install Dependencies

```bash
cd project/ai_service
pip install -r requirements.txt
```

## Step 2: Create Sample Images (Optional)

```bash
python create_sample_images.py
```

This creates test images in the `generated_images/` folder.

## Step 3: Start the Server

```bash
python app.py
```

The server will start at `http://localhost:8000`

## Step 4: Test the API

### Option A: Test with Python Script
```bash
python test_api.py
```

### Option B: Test with HTML Interface
Open `test_image_serving.html` in your browser to see a visual interface for testing image serving.

## Step 4: View API Documentation

Open your browser and visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Example Usage

### Using cURL

```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "topwear": "shirt",
    "bottomwear": "jeans",
    "accessories": "watch"
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/generate",
    json={
        "topwear": "shirt",
        "bottomwear": "jeans",
        "accessories": "watch"
    }
)

result = response.json()
print(f"Image URL: {result['image_url']}")
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:8000/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topwear: 'shirt',
    bottomwear: 'jeans',
    accessories: 'watch'
  })
});

const result = await response.json();
console.log('Image URL:', result.image_url);
```

## What's Different from Notebook Code?

### ❌ Removed (Interactive Elements)

- `input()` - No user prompts
- `mediapy.show_images()` - No image display
- `print()` statements - Replaced with logging

### ✅ Added (API Features)

- FastAPI endpoints (`/generate`, `/health`)
- JSON request/response models
- Automatic image saving to folder
- Image URL generation
- Error handling & logging
- CORS support for frontend
- Auto-generated API documentation

## 📁 Image Serving

### How It Works

1. **Images Folder**: All generated images are saved to `generated_images/`
2. **Static Files**: FastAPI serves images via `/images/` endpoint
3. **Public Access**: Images are accessible at `http://localhost:8000/images/{filename}.jpg`

### Frontend Usage

```html
<!-- Direct HTML -->
<img src="http://localhost:8000/images/design_sample.jpg" alt="Fashion Design" />

<!-- React/JSX -->
<img src={imageUrl} alt="Generated Design" className="w-full" />
```

### List All Images

```bash
curl http://localhost:8000/images/list
```

## Next Steps

1. **Add AI Model**: Integrate Stable Diffusion or your preferred model
2. **Connect Frontend**: Update frontend to call this API
3. **Add Features**: Implement batch generation, caching, etc.
4. **Deploy**: Configure for production deployment

## Troubleshooting

**Port already in use?**
```bash
# Change port in app.py or run with custom port:
uvicorn app:app --port 8001
```

**CORS errors?**
```python
# Update CORS settings in app.py:
allow_origins=["http://localhost:3000"]  # Your frontend URL
```
