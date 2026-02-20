# 🚀 FashionAI Studio - Setup Guide

Welcome! This guide will help you set up and run the FashionAI Studio project on your machine.

## ⏱️ Expected Time: 20-30 minutes

## � What You'll Get from GitHub

✅ **Included** (in the repository):
- All source code (AI service, backend, frontend)
- Configuration templates (`.env.example` files)
- Documentation and setup instructions

❌ **NOT Included** (you'll need to set up):
- Your own `.env` files with your MongoDB credentials
- Fashion dataset images (~224 MB) - Contact project owner or use public dataset
- AI models (~6 GB) - Auto-downloads on first run from HuggingFace

🔒 **Security Note**: The repository does NOT contain any passwords, API keys, or sensitive data. You'll create your own credentials during setup.

---

## �📋 Prerequisites (Install These First)

### 1. Python 3.12+
- **Windows**: Download from https://www.python.org/downloads/
  - ⚠️ **IMPORTANT**: Check "Add Python to PATH" during installation
- **Mac**: `brew install python@3.12`
- **Linux**: `sudo apt install python3.12 python3-pip`

Verify: `python --version` (should show 3.12 or higher)

### 2. Node.js 16+
- **Windows/Mac**: Download from https://nodejs.org/
- **Linux**: `sudo apt install nodejs npm`

Verify: `node --version` (should show v16 or higher)

### 3. MongoDB
- **Windows**: Download from https://www.mongodb.com/try/download/community
  - Install as a service (default option)
- **Mac**: `brew install mongodb-community`
- **Linux**: `sudo apt install mongodb`

Verify: MongoDB should auto-start as a service

### 4. Git (if cloning from GitHub)
- Download from https://git-scm.com/
- Verify: `git --version`

---

## 🎬 Setup Steps

### Step 1: Get the Project

**Option A: Clone from GitHub**
```bash
git clone https://github.com/sushantfokmare/FashionAI.git
cd FashionAI
```

**Option B: Extract ZIP**
```bash
# Extract the ZIP file to a folder
cd FashionAI-Studio
```

---

### Step 2: Download Fashion Dataset (Required)

The AI service needs a fashion image dataset to work properly.

**Option A: Use Sample/Test Mode** (Quick Start)
Skip this step for now - the app will work with limited functionality.

**Option B: Get the Dataset** (Full Functionality)
1. Contact the project owner for the dataset link (Google Drive/OneDrive)
2. Or download a public fashion dataset from Kaggle:
   - [Fashion Product Images Dataset](https://www.kaggle.com/datasets/paramaggarwal/fashion-product-images-dataset)
3. Extract the dataset to: `project/ai_service/data/fashion_dataset/`
4. Structure should be:
   ```
   project/ai_service/data/fashion_dataset/
   ├── images/
   │   ├── 10000.jpg
   │   ├── 10065.jpg
   │   └── ... (more images)
   └── metadata.csv
   ```

⚠️ **Note**: Dataset is NOT included in the GitHub repository (~224 MB, 686 images).

---

### Step 3: Setup AI Service (Terminal 1)

```bash
# Navigate to AI service
cd project/ai_service

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install Python packages (this takes 5-10 minutes)
pip install -r requirements.txt

# Create environment file
# Windows:
copy ..\..\config\env-examples\.env.ai-service.example .env
# Mac/Linux:
cp ../../config/env-examples/.env.ai-service.example .env

# Start the AI service
python app.py
```

⚠️ **IMPORTANT - First Time Setup Only:**
The first time you run `python app.py`, it will automatically download AI models:
- **Stable Diffusion v1.5**: ~5 GB (image generation)
- **CLIP model**: ~1 GB (image search)
- **Total**: ~6 GB download from HuggingFace
- **Time**: 10-15 minutes (depending on your internet speed)

This happens **AUTOMATICALLY** - no manual download needed!
These models are cached, so subsequent runs start in ~30 seconds.

✅ **Success**: You should see "Application startup complete" and "Uvicorn running on http://0.0.0.0:8000"

---

### Step 4: Setup Backend (Terminal 2 - New Terminal)

```bash
# Navigate to backend
cd project/backend

# Install Node packages (takes 2-3 minutes)
npm install

# Create environment file
# Windows:
copy ..\..\config\env-examples\.env.backend.example .env
# Mac/Linux:
cp ../../config/env-examples/.env.backend.example .env

# Edit .env file - Open project/backend/.env in a text editor
# Update these lines:
# MONGO_URI=mongodb://localhost:27017/fashionai
# JWT_SECRET=change-this-to-a-random-secret-key
# AI_SERVICE_URL=http://localhost:8000

# Start the backend
npm run dev
```

✅ **Success**: You should see "Server running on port 5000" and "MongoDB connected"

---

### Step 5: Setup Frontend (Terminal 3 - New Terminal)

```bash
# Navigate to frontend
cd project/frontend

# Install Node packages (takes 2-3 minutes)
npm install

# Start the frontend
npm run dev
```

✅ **Success**: You should see "Local: http://localhost:5173/"

---

### Step 6: Open in Browser

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the FashionAI Studio homepage! 🎉

---

## ✅ Verification Checklist

Check these URLs to confirm everything is running:

- [ ] **Frontend**: http://localhost:5173 (Main app)
- [ ] **Backend**: http://localhost:5000/api/health (Should show "OK")
- [ ] **AI Service**: http://localhost:8000/docs (Swagger docs)
- [ ] **MongoDB**: Running on port 27017 (check task manager/services)

---

## 🎯 Quick Test

1. **Register**: Create a new account on http://localhost:5173
2. **Login**: Login with your credentials
3. **Generate Design**: Try the AI fashion design feature
4. **Explore**: Browse the different features

---

## ❌ Troubleshooting

### Problem: "Python is not recognized"
**Solution**: 
1. Reinstall Python and check "Add to PATH"
2. Restart your terminal/computer
3. Or find Python installation and add to PATH manually

### Problem: "MongoDB connection failed"
**Solution**:
```bash
# Windows: Check if MongoDB service is running
# Press Win+R, type "services.msc", look for "MongoDB"
# Right-click → Start

# Mac:
brew services start mongodb-community

# Linux:
sudo systemctl start mongodb
sudo systemctl status mongodb
```

### Problem: "Port already in use"
**Solution**: Something else is using the port
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# Mac/Linux:
lsof -i :8000
kill -9 <process_id>
```

### Problem: "Module not found" errors
**Solution**:
```bash
# For Python:
pip install -r requirements.txt

# For Node.js:
rm -rf node_modules
npm install
```

### Problem: AI models downloading very slowly
**Solution**: 
- This is **NORMAL** for the first run
- The AI service automatically downloads:
  - Stable Diffusion v1.5 (~5 GB)
  - CLIP model (~1 GB)
  - **Total: ~6 GB** from HuggingFace
- Be patient! This only happens once
- Models are cached in: `C:\Users\[YourName]\.cache\huggingface\`
- After first run, startup takes only ~30 seconds

### Problem: "Out of disk space" during first run
**Solution**: 
- Ensure you have at least **8-9 GB free** disk space
- Models are large but essential for AI features
- Check available space: Windows → Settings → System → Storage

### Problem: "Cannot find module 'xyz'"
**Solution**: Make sure you're in the correct directory and ran `npm install` or `pip install -r requirements.txt`

---

## 📁 Project Structure Quick Reference

```
FashionAIStudio/
├── project/
│   ├── ai_service/       ← Python AI service (Terminal 1)
│   ├── backend/          ← Node.js backend (Terminal 2)
│   └── frontend/         ← React frontend (Terminal 3)
├── config/
│   └── env-examples/     ← Environment file templates
├── docs/                 ← Additional documentation
├── scripts/              ← Utility scripts
└── README.md             ← Main documentation
```

---

## 🔒 Environment Variables Quick Reference

### AI Service (.env in project/ai_service/)
```env
HOST=0.0.0.0
PORT=8000
DEVICE=cpu  # or 'cuda' if you have NVIDIA GPU
```

### Backend (.env in project/backend/)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/fashionai
JWT_SECRET=your-secret-key-change-this
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

### Frontend (usually not needed)
```env
VITE_API_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

---

## 🎓 Next Steps

Once everything is running:

1. **Explore Features**:
   - AI Design Generation
   - Outfit Matching
   - Image Search
   - User Dashboard

2. **Read Documentation**:
   - Main README.md
   - docs/QUICKSTART.md
   - API Docs: http://localhost:8000/docs

3. **Customize**:
   - Modify the frontend (project/frontend/src/)
   - Add new API endpoints (project/backend/src/routes/)
   - Customize AI logic (project/ai_service/app.py)

---

## 📞 Need Help?

If you encounter issues:

1. **Check the logs** in each terminal for error messages
2. **Search existing issues**: https://github.com/sushantfokmare/FashionAI/issues
3. **Create a new issue** with:
   - What you were trying to do
   - Error messages (full text)
   - Your OS and versions (Python, Node.js)
4. **Contact the project owner** for direct support

---

## 💾 Disk Space Requirements

Be aware of the storage needed for a complete setup:

**Initial Clone:**
- Source code: ~50 MB

**After npm/pip install:**
- Node modules (frontend + backend): ~500 MB
- Python packages (.venv): ~2.5 GB

**Auto-downloaded AI Models** (first run only):
- Stable Diffusion v1.5: ~5 GB
- CLIP model: ~1 GB

**Dataset** (if downloaded):
- Fashion images: ~224 MB (or more for public datasets)

**Total Disk Space Needed**: ~8-9 GB

**Location of Models**: `C:\Users\[YourName]\.cache\huggingface\` (Windows)

---

## 🎉 Success!

If you can:
- ✅ Access the frontend at http://localhost:5173
- ✅ Create an account and login
- ✅ See all three services running

**Congratulations!** You've successfully set up FashionAI Studio! 🚀

---

## 📚 Additional Resources

- **Main Documentation**: README.md
- **API Reference**: http://localhost:8000/docs (when running)
- **Project Structure**: docs/architecture/PROJECT_STRUCTURE.md
- **Development Guide**: docs/development/QUICKSTART.md

---

Happy coding! 👨‍💻👩‍💻
