# FashionAI Studio - Project Structure

## 📁 Directory Organization

```
FashionAIStudio/
├── docs/                          # Documentation
│   ├── AI_INTEGRATION.md         # AI service integration guide
│   ├── COMPLETE_SETUP_GUIDE.md   # Complete setup instructions
│   ├── GPU_SETUP_GUIDE.md        # GPU configuration guide
│   └── QUICKSTART.md             # Quick start guide
│
├── project/                       # Main application code
│   ├── ai_service/               # AI/ML Service (FastAPI)
│   │   ├── app.py               # Main FastAPI application
│   │   ├── requirements.txt     # Python dependencies
│   │   ├── README.md            # AI service documentation
│   │   ├── .gitignore          # Git ignore rules
│   │   ├── clip_faiss/         # CLIP-FAISS recommendation engine
│   │   │   ├── engine.py       # Recommendation engine
│   │   │   ├── search.py       # Search functionality
│   │   │   ├── build_index.py  # Index builder
│   │   │   ├── index.faiss     # FAISS index file
│   │   │   └── meta.npy        # Metadata file
│   │   ├── data/               # Dataset storage
│   │   │   └── fashion_dataset/
│   │   │       └── images/     # Fashion product images
│   │   ├── generated_images/   # AI-generated designs
│   │   ├── logic/              # Business logic
│   │   │   ├── outfit_matcher.py
│   │   │   └── matching_rules.py
│   │   └── models/             # Model utilities
│   │       └── __init__.py
│   │
│   ├── backend/                  # Node.js Backend (Express)
│   │   ├── server.js            # Main Express server
│   │   ├── package.json         # Node dependencies
│   │   ├── README.md            # Backend documentation
│   │   └── src/                # Source code
│   │       ├── controllers/    # Route controllers
│   │       ├── middleware/     # Express middleware
│   │       ├── models/         # Database models
│   │       ├── routes/         # API routes
│   │       └── services/       # Business services
│   │
│   ├── frontend/                 # React Frontend (Vite)
│   │   ├── index.html          # Entry HTML
│   │   ├── package.json        # Frontend dependencies
│   │   ├── vite.config.ts      # Vite configuration
│   │   ├── tailwind.config.js  # Tailwind CSS config
│   │   ├── tsconfig.json       # TypeScript config
│   │   ├── README.md           # Frontend documentation
│   │   ├── public/             # Static assets
│   │   └── src/                # React source code
│   │
│   ├── dataset_builder/          # Dataset preparation tools
│   │   └── build_dataset.py    # Dataset builder script
│   │
│   └── fashion-product-images-dataset/  # Original dataset
│       ├── images.csv          # Image metadata
│       ├── styles.csv          # Style information
│       ├── images/             # Product images
│       └── styles/             # Style JSON files
│
├── scripts/                       # Utility scripts
│   ├── check_gpu.py             # GPU verification
│   ├── verify_setup.py          # Setup verification
│   ├── create_sample_images.py  # Sample image generator
│   ├── setup_and_start.bat      # Windows setup script
│   ├── restart_backend.bat      # Backend restart script
│   ├── restart_backend.ps1      # PowerShell restart script
│   └── install_pytorch_gpu.bat  # PyTorch GPU installer
│
├── .venv/                         # Python virtual environment
├── .git/                          # Git repository
├── .gitignore                     # Global git ignore
└── README.md                      # Main project README
```

## 🗂️ File Organization Rules

### AI Service (`project/ai_service/`)
- **Keep**: Core application files (`app.py`, `requirements.txt`, `README.md`)
- **Keep**: CLIP-FAISS engine and data directories
- **Keep**: Logic and models directories
- **Removed**: Test files, debug scripts, temporary analysis files

### Documentation (`docs/`)
- **Keep**: Essential setup and integration guides
- **Removed**: Redundant progress reports and migration notes

### Scripts (`scripts/`)
- **Keep**: All utility scripts for setup and maintenance

### Cache Files
- **Removed**: All `__pycache__/` directories (auto-regenerated)

## 📝 Naming Conventions

### Python Files
- Main application: `app.py`
- Utilities: descriptive names (e.g., `build_index.py`, `engine.py`)
- No test files in production

### Documentation
- All caps for major guides (e.g., `QUICKSTART.md`)
- Descriptive names with underscores (e.g., `GPU_SETUP_GUIDE.md`)

### Directories
- Lowercase with underscores (e.g., `ai_service`, `clip_faiss`)
- Clear purpose in name

## 🧹 Maintenance

### Files Cleaned
- ✅ Removed debug scripts (`debug_meta.py`, `debug_outfit.py`)
- ✅ Removed test files (`quick_test.py`, `analyze_search.py`)
- ✅ Removed redundant documentation
- ✅ Cleaned all `__pycache__/` directories
- ✅ Removed temporary analysis files

### Regular Cleanup
Run periodically to maintain clean structure:
```bash
# Remove Python cache
Get-ChildItem -Recurse -Directory -Filter __pycache__ | Remove-Item -Recurse -Force

# Remove temporary files
Remove-Item -Recurse -Force *.pyc, *.pyo, .pytest_cache, .coverage
```

## 🎯 Best Practices

1. **No test files in production** - Use separate test directory if needed
2. **Documentation in `docs/`** - Keep root clean
3. **Scripts in `scripts/`** - Centralized utility location
4. **Clear naming** - Self-documenting file and directory names
5. **Regular cleanup** - Remove cache and temporary files periodically
