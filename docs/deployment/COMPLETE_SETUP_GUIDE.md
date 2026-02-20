# 🎉 COMPLETE SETUP GUIDE - Fashion AI Studio

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Form: topwear, bottomwear, accessories, style           │  │
│  │  Button: Generate Design                                  │  │
│  │  Loading: Spinner while waiting                           │  │
│  │  Display: <img src={image_url} />                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            ↓ POST /api/ai/generate              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    NODE.JS BACKEND (Express)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ✓ Authentication (unchanged)                             │  │
│  │  ✓ User Management (unchanged)                            │  │
│  │  ✓ Database (unchanged)                                   │  │
│  │  ➕ NEW: /api/ai/generate (proxy route)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                     ↓ axios.post to Python                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   PYTHON AI SERVICE (FastAPI)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Receive design parameters                             │  │
│  │  2. Generate image with AI model                          │  │
│  │  3. Save to generated_images/design_xxx.jpg               │  │
│  │  4. Return image URL                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  📁 /images → serves static files                               │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Complete Startup Guide

### Prerequisites
- Node.js 18+ installed
- Python 3.8+ installed
- MongoDB Atlas account (or local MongoDB)

### Step-by-Step Setup

#### 1️⃣ **Python AI Service**

```bash
# Navigate to AI service
cd project/ai_service

# Install dependencies
pip install -r requirements.txt

# Create sample images (optional)
python create_sample_images.py

# Verify setup
python verify_setup.py

# Start the service
python app.py
```

✅ **Running at:** `http://localhost:8000`  
✅ **API Docs:** `http://localhost:8000/docs`  
✅ **Test Page:** Open `test_image_serving.html` in browser

---

#### 2️⃣ **Node.js Backend**

```bash
# Navigate to backend
cd project/backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env and add:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_secret_key
# CLIENT_ORIGIN=http://localhost:5173
# AI_SERVICE_URL=http://localhost:8000

# Test AI integration
node test_ai_integration.js

# Start the server
npm run dev
```

✅ **Running at:** `http://localhost:5000`  
✅ **Test:** `curl http://localhost:5000/api/ai/health`

---

#### 3️⃣ **Frontend**

```bash
# Navigate to frontend
cd project/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ **Running at:** `http://localhost:5173`  
✅ **Open in browser and test!**

---

## 🧪 Testing the Complete Flow

### Method 1: Manual Testing (Browser)

1. Open `http://localhost:5173`
2. Sign up / Log in
3. Navigate to "AI Design Studio"
4. Fill the form:
   - **Topwear:** "silk blouse"
   - **Bottomwear:** "pencil skirt"  
   - **Accessories:** "pearl necklace"
   - **Style:** "formal"
5. Click "Generate Design"
6. Wait for loading spinner
7. See generated image!

### Method 2: Backend Testing

```bash
# Test from backend
cd project/backend
node test_ai_integration.js
```

### Method 3: Direct API Testing

```bash
# Test Python service directly
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"topwear":"shirt","bottomwear":"jeans"}'

# Test through Node.js proxy
curl -X POST http://localhost:5000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"topwear":"shirt","bottomwear":"jeans"}'
```

---

## 📡 API Endpoints Reference

### Python AI Service (Port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate` | POST | Generate fashion design |
| `/images/{file}` | GET | Serve image file |
| `/images/list` | GET | List all images |
| `/health` | GET | Health check |
| `/docs` | GET | Swagger documentation |

### Node.js Backend (Port 5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | User signup |
| `/api/auth/login` | POST | User login |
| `/api/auth/logout` | POST | User logout |
| `/api/user/profile` | GET | Get user profile |
| `/api/ai/generate` | POST | Generate design (proxy) |
| `/api/ai/health` | GET | Check AI service |
| `/api/ai/images/list` | GET | List images (proxy) |

### Frontend (Port 5173)

- Main app with AI Design Studio interface
- Form for design generation
- Image gallery display

---

## 📂 Project Structure

```
FashionAIStudio/
├── project/
│   ├── ai_service/              # Python FastAPI Service
│   │   ├── app.py               # Main FastAPI app
│   │   ├── requirements.txt     # Python dependencies
│   │   ├── generated_images/    # Output folder for images
│   │   ├── models/              # AI model utilities
│   │   ├── create_sample_images.py
│   │   ├── verify_setup.py
│   │   ├── test_api.py
│   │   └── test_image_serving.html
│   │
│   ├── backend/                 # Node.js Express Backend
│   │   ├── server.js            # Main server
│   │   ├── package.json         # Node dependencies
│   │   ├── .env.example         # Environment template
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.js      # Auth routes (unchanged)
│   │   │   │   ├── user.js      # User routes (unchanged)
│   │   │   │   └── ai.js        # NEW: AI proxy routes
│   │   │   ├── controllers/     # Unchanged
│   │   │   ├── middleware/      # Unchanged
│   │   │   └── models/          # Unchanged
│   │   └── test_ai_integration.js
│   │
│   └── frontend/                # React + Vite Frontend
│       ├── src/
│       │   ├── components/
│       │   │   └── AIDesignStudio.tsx  # Updated with form
│       │   └── ...
│       └── package.json
│
└── .venv/                       # Python virtual environment
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/fashionai
JWT_SECRET=your_secret_key_here
CLIENT_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
AI_SERVICE_URL=http://localhost:8000
```

### Python (.env - optional)
```env
# Currently no env vars needed
# Model paths can be added here later
```

---

## 🐛 Troubleshooting

### Python Service Won't Start

```bash
# Check Python version
python --version  # Should be 3.8+

# Reinstall dependencies
pip install -r requirements.txt

# Check port availability
netstat -ano | findstr :8000
```

### Node.js Backend Errors

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check MongoDB connection
# Make sure MONGO_URI in .env is correct

# Test AI service connectivity
curl http://localhost:8000/health
```

### Frontend Issues

```bash
# Clear cache and reinstall
rm -rf node_modules .vite package-lock.json
npm install

# Check backend is running
curl http://localhost:5000/health
```

### CORS Errors

Make sure all services are running on correct ports:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Python: `http://localhost:8000`

---

## 📝 What Changed in Each Component

### ✅ Python AI Service (NEW)
- **Created entire service from scratch**
- FastAPI application
- Image generation endpoint
- Static file serving
- ~200 lines of code

### ✅ Node.js Backend (MINIMAL)
- **Added 1 route file:** `src/routes/ai.js` (~100 lines)
- **Modified server.js:** 1 line added
- **Updated package.json:** Added `axios`
- **Updated .env.example:** Added `AI_SERVICE_URL`
- **Total changes:** ~100 lines

### ✅ Frontend (VERY SMALL)
- **Modified AIDesignStudio.tsx**
- Added 5 state variables
- Updated `handleGenerate` function
- Changed textarea to structured inputs
- Added error display
- **Total changes:** ~100 lines

---

## 🎯 Key Benefits

### Separation of Concerns
- ✅ **Frontend:** Pure UI, no AI logic
- ✅ **Node.js:** Authentication, DB, proxying
- ✅ **Python:** AI/ML processing only

### Easy to Scale
- ✅ Run Python service on separate server
- ✅ Add multiple Python workers
- ✅ Backend doesn't need AI dependencies

### Maintainable
- ✅ Each service has clear responsibility
- ✅ Can update AI model without touching Node/Frontend
- ✅ Minimal coupling between services

---

## 🎉 You're Done!

All three services should now be running:

1. ✅ Python AI Service generating images
2. ✅ Node.js Backend handling auth + proxying
3. ✅ Frontend displaying beautiful UI

**Test it end-to-end:**
1. Open browser → `http://localhost:5173`
2. Sign in
3. Generate a design
4. See your AI-generated fashion!

---

## 📚 Additional Resources

- **Python Service:** See `project/ai_service/README.md`
- **Backend Integration:** See `project/backend/AI_INTEGRATION.md`
- **Frontend Changes:** See `project/frontend/FRONTEND_CHANGES.md`

---

**Happy Designing! 🎨✨**
