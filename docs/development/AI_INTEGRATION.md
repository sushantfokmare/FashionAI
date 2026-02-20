# Node.js Backend - AI Service Integration

## ✅ Changes Made (MINIMAL)

### What Stayed the SAME ✓
- ✅ Authentication (unchanged)
- ✅ User management (unchanged)
- ✅ Database connection (unchanged)
- ✅ Existing routes (auth, user)
- ✅ All controllers (unchanged)
- ✅ Middleware (unchanged)
- ✅ Models (unchanged)

### What was ADDED ➕

#### 1. New Route File
**File:** `src/routes/ai.js`

Three endpoints added:
- `POST /api/ai/generate` - Forward design generation to Python service
- `GET /api/ai/health` - Check Python service status
- `GET /api/ai/images/list` - List generated images

#### 2. Dependencies
**File:** `package.json`
- Added `axios` for HTTP requests to Python service

#### 3. Environment Variable
**File:** `.env.example` (and add to your `.env`)
- `AI_SERVICE_URL=http://localhost:8000`

#### 4. Server Configuration
**File:** `server.js`
- One line added: `app.use('/api/ai', require('./src/routes/ai'));`

## 🔄 How It Works

```
Frontend Request
    ↓
Node.js (/api/ai/generate)
    ↓
Forwards to Python (http://localhost:8000/generate)
    ↓
Python generates image & returns URL
    ↓
Node.js returns response
    ↓
Frontend receives image_url
```

## 📡 API Endpoints

### POST /api/ai/generate
Generate a fashion design (proxies to Python service).

**Request:**
```json
{
  "topwear": "silk blouse",
  "bottomwear": "pencil skirt",
  "accessories": "pearl necklace",
  "style": "formal",
  "color_palette": ["#000000", "#FFFFFF"]
}
```

**Response:**
```json
{
  "image_url": "http://localhost:8000/images/design_abc123.jpg",
  "design_id": "abc123-def456-...",
  "timestamp": "2026-01-12T10:30:00"
}
```

### GET /api/ai/health
Check if Python AI service is available.

**Response:**
```json
{
  "status": "connected",
  "ai_service": {
    "status": "healthy",
    "output_directory": "/path/to/generated_images",
    "generated_images_count": 5
  }
}
```

### GET /api/ai/images/list
List all generated images.

**Response:**
```json
{
  "count": 3,
  "images": [
    {
      "filename": "design_abc123.jpg",
      "url": "http://localhost:8000/images/design_abc123.jpg",
      "size_bytes": 245760,
      "created_at": "2026-01-12T10:30:00"
    }
  ]
}
```

## 🚀 Setup

### 1. Install Dependencies
```bash
cd project/backend
npm install
```

### 2. Update .env File
Add this line to your `.env`:
```
AI_SERVICE_URL=http://localhost:8000
```

### 3. Start Services

**Terminal 1 - Python AI Service:**
```bash
cd project/ai_service
python app.py
```

**Terminal 2 - Node.js Backend:**
```bash
cd project/backend
npm run dev
```

**Terminal 3 - Frontend:**
```bash
cd project/frontend
npm run dev
```

## 🧪 Testing

### Test with cURL
```bash
# Check AI service health
curl http://localhost:5000/api/ai/health

# Generate design
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "topwear": "shirt",
    "bottomwear": "jeans",
    "accessories": "watch"
  }'

# List images
curl http://localhost:5000/api/ai/images/list
```

### Test with JavaScript
```javascript
// Generate design
const response = await fetch('http://localhost:5000/api/ai/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    topwear: 'elegant blouse',
    bottomwear: 'tailored pants',
    accessories: 'pearl earrings'
  })
});

const data = await response.json();
console.log('Image URL:', data.image_url);
```

## ✨ Benefits

1. **Separation of Concerns**
   - Node.js: Authentication, DB, business logic
   - Python: AI/ML processing

2. **No AI Dependencies in Node.js**
   - Node.js doesn't install TensorFlow, PyTorch, etc.
   - Keeps Node.js lightweight

3. **Easy to Scale**
   - Can run Python service on separate server
   - Can add multiple Python workers

4. **Simple Integration**
   - Just one proxy route
   - Minimal code changes
   - Easy to maintain

## 🔍 Error Handling

The AI route handles:
- ✅ Missing required fields (400)
- ✅ Python service unavailable (503)
- ✅ Python service errors (forwards status)
- ✅ Timeout errors (60s timeout)
- ✅ Network errors

## 📋 Checklist

- [x] Added axios dependency
- [x] Created ai.js route
- [x] Added route to server.js
- [x] Updated .env.example
- [x] Error handling implemented
- [x] Health check endpoint
- [x] Image list endpoint
- [x] Documentation created

## ⚠️ Important Notes

- Node.js does NOT touch Stable Diffusion
- Node.js does NOT process images
- Node.js only forwards requests
- Python service must be running for AI features to work
- All existing functionality remains unchanged
