# 🎨 FashionAI Studio

> An AI-powered fashion design platform with intelligent outfit matching, image similarity search, and sketch-to-design capabilities using advanced machine learning models.

[![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)](https://fastapi.tiangolo.com/)

## ✨ Features

- 🎯 **AI-Powered Design Generation** - Transform sketches into realistic fashion designs
- 🔍 **Intelligent Image Search** - CLIP + FAISS based similarity search
- 👔 **Outfit Matching** - Smart outfit recommendations and compatibility analysis
- 📊 **Trend Analysis** - Real-time fashion trend aggregation
- 👤 **User Management** - Secure authentication and personalization
- 📈 **Analytics Dashboard** - Search analytics and user insights

## 🏗️ Project Structure

```
FashionAIStudio/
├── 📁 project/               # Main application
│   ├── ai_service/          # FastAPI AI service (Python)
│   ├── backend/             # Node.js/Express REST API
│   └── frontend/            # React + TypeScript UI
│
├── 📁 docs/                  # Documentation
│   ├── api/                 # API documentation
│   ├── architecture/        # System design docs
│   ├── deployment/          # Deployment guides
│   └── development/         # Developer guides
│
├── 📁 data/                  # Data directory (gitignored)
│   ├── datasets/            # Training/test datasets
│   ├── models/              # Pre-trained AI models
│   └── samples/             # Sample data
│
├── 📁 scripts/               # Automation scripts
│   ├── setup/               # Setup scripts
│   └── dev/                 # Development utilities
│
├── 📁 config/                # Configuration
│   └── env-examples/        # Environment templates
│
├── 📁 tests/                 # Test suites
│
├── .gitignore
├── docker-compose.yml
├── CONTRIBUTING.md
├── FRIEND_SETUP.md          # ⭐ Setup guide for new users
└── README.md
```

## 🚀 Quick Start

🌟 **New to this project?** Start with **[FRIEND_SETUP.md](FRIEND_SETUP.md)** for a step-by-step setup guide!

### Prerequisites
- **Node.js** v16+ ([Download](https://nodejs.org/))
- **Python** 3.12+ ([Download](https://www.python.org/))
- **MongoDB** ([Download](https://www.mongodb.com/try/download/community))
- **Git** ([Download](https://git-scm.com/))

### 🎬 Quick Setup

```bash
# Run the setup script
.\scripts\dev\setup_and_start.bat
```

### 📦 Manual Setup

#### 1. AI Service (Python/FastAPI)
```bash
cd project/ai_service
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
python app.py
# Runs on http://localhost:8000
```

#### 2. Backend (Node.js/Express)
```bash
cd project/backend
npm install
npm run dev
# Runs on http://localhost:5000
```

#### 3. Frontend (React + Vite)
```bash
cd project/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 🐳 Docker Setup (Optional)

```bash
# Prerequisites: Docker and Docker Compose installed

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Documentation

### Quick Links

- 🆕 **[FRIEND_SETUP.md](FRIEND_SETUP.md)** - ⭐ Complete setup guide for new users
- 📖 [Quick Start Guide](docs/development/QUICKSTART.md) - Get started quickly
- 🤝 [Contributing Guide](CONTRIBUTING.md) - How to contribute
- 📋 [Documentation Index](docs/README.md) - All documentation

### Detailed Docs

- 🏗️ [Architecture](docs/architecture/) - System design
- 🔌 [API Documentation](docs/api/) - Endpoint references
- 🚀 [Deployment](docs/deployment/) - Setup & deployment
- 👨‍💻 [Development](docs/development/) - Developer guides

## 🛠️ Technology Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router v7** - Client-side routing
- **Lucide React** - Modern icon library

### Backend
- **Node.js 16+** - JavaScript runtime
- **Express.js** - Minimal web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing
- **Axios** - HTTP client
- **Express Validator** - Input validation
- **Cookie Parser** - Cookie management

### AI Service
- **Python 3.12+** - Core language
- **FastAPI** - Modern async web framework
- **PyTorch** - Deep learning framework
- **Transformers (CLIP)** - Image-text embeddings
- **FAISS** - Vector similarity search
- **Diffusers** - Stable Diffusion v1.5
- **P  /generate                - Generate fashion design from text/sketch
POST   /search/similar          - CLIP+FAISS similarity search
POST   /outfit/match            - Outfit compatibility analysis
POST   /occasions/generate      - Generate outfit by occasion
GET    /occasions                - List available occasions
POST   /upload                  - Upload and process fashion images
GET    /health                  - Health check endpoint
GET    /                        - Welcome message
```

### Backend API (Port 5000)
```
POST   /api/auth/register       - User registration
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
GET    /api/user/profile        - Get user profile
PUT    /api/user/profile        - Update user profile
POST   /api/ai/*                - Proxy to AI service
GET    /api/analytics/*         - Analytics data
GET    /api/trends/*            - Fashion trend data (Google Trends API)
GET    /api/health              - Backend health check
```

### Frontend (Port 5173)
- Vite dev server with hot module replacement
- Production build served via static hostingT /search/similar     - Find similar images
POST /outfit/match       - Get outfit recommendations
GET  /health            - Service health check
```

### Backend API (Port 5000)
```
POST /api/auth/register  - User registration
POST /api/auth/login     - User login
GET  /api/user/profile   - Get user profile
POST /api/ai/*          - AI service proxy
GET  /api/analytics/*    - Analytics endpoints
GET  /api/trends/*       - Trend data
```

## 🧪 Running Tests

```bash
# AI Service tests
cd services/ai-service
pytest tests/ -v

# Backend tests
cd services/backend
npm test

# Frontend tescripts/`](scripts/):

```bash
# Setup Scripts (scripts/setup/)
python scripts/setup/check_gpu.py           # Verify CUDA/GPU availability
python scripts/setup/verify_setup.py        # Validate complete installation

# Development Utilities (scripts/dev/)
.\scripts\dev\restart_backend.bat           # Restart backend service
.\scripts\dev\setup_and_start.bat           # Full setup and start all services
.\scripts\dev\install_pytorch_gpu.bat       # Install PyTorch with GPU support

# Docker Utilities
docker-compose up -d                        # Start all services
docker-compose down                         # Stop all services
```

## 📁 Current Project Status

### Directory Structure Transition

The project is currently transitioning from `project/` to `services/` directory:

**Active Services (Legacy - project/):**
- Running in your terminals currently
- `project/ai_service/` - Python AI serviceed guidelines.

### Contribution Workflow
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Make changes in the `services/` directory (recommended)
4. Follow the code style and conventions
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. ⚙️ Environment Variables

### AI Service (.env)
```env
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
MODEL_CACHE_DIR=./models
```

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fashionai
JWT_SECRET=your-secret-key-here
AI_SERVICE_URL=http://localhost:8000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_AI_SERVICE_URL=http://localhost:8000
```

## 📝 License

This project is proprietary and confidential.

## 👥 Team

- **Sushant Fokmare** - Lead Developer - [@sushantfokmare](https://github.com/sushantfokmare)

## 📞 Support

- 📧 Email: support@fashionai.com
- 🐛 [Report Issues](https://github.com/sushantfokmare/FashionAI/issues)
- 💬 [Discussions](https://github.com/sushantfokmare/FashionAI/discussions)
- 📖 [Documentation](docs/)

## 🙏 Acknowledgments

- **OpenAI CLIP** - Image and text embeddings
- **Meta FAISS** - Efficient similarity search
- **Stability AI** - Stable Diffusion image generation
- **Hugging Face** - Model hosting and Transformers library
- **RunwayML** - Stable Diffusion v1.5
- The amazing open-source community

## 🎯 Project Status

**Current Version**: 1.0.0 (In Development)  
**Last Updated**: January 2026  
**Status**: Active Development - Restructuring Phase

### Completed ✅
- Core AI features (CLIP, FAISS, Stable Diffusion)
- Basic frontend UI with React + TypeScript
- Backend API with authentication
- Docker containerization
- Professional project structure

### In Progress 🚧
- Migrating from `project/` to `services/` directory
- Documentation updates
- Test coverage improvement
- Performance optimization

### Planned 📋
- User dashboard enhancements
- Advanced outfit recommendations
- Mobile responsive design
- CI/CD pipeline
- Production deployment

---

**Made with ❤️ by the FashionAI Studio Team**

For more information, see:
- [Documentation Index](DOCUMENTATION_INDEX.md)
- [Project Structure](PROJECT_STRUCTURE_VISUAL.md)
- [Migration Guide](MIGRATION_GUIDE.md)
# Development utilities
.\scripts\dev\restart_backend.bat     # Restart backend service
.\scripts\dev\setup_and_start.bat     # Full setup & start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 👥 Team

- **Sushant Fokmare** - [@sushantfokmare](https://github.com/sushantfokmare)

## 📞 Support

- 📧 Email: support@fashionai.com
- 🐛 [Report Issues](https://github.com/sushantfokmare/FashionAI/issues)
- 💬 [Discussions](https://github.com/sushantfokmare/FashionAI/discussions)

## 🙏 Acknowledgments

- OpenAI CLIP for image embeddings
- Facebook FAISS for similarity search
- Stability AI for Stable Diffusion
- The open-source community

---

**Made with ❤️ by the FashionAI Studio Team**
