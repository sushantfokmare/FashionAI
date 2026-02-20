# Scripts Directory

Utility scripts for development, setup, and deployment of FashionAI Studio.

## 📁 Structure

```
scripts/
├── setup/              # Installation and setup scripts
│   ├── check_gpu.py
│   ├── verify_setup.py
│   └── create_sample_images.py
│
├── dev/                # Development utilities
│   ├── setup_and_start.bat
│   ├── restart_backend.bat
│   ├── restart_backend.ps1
│   └── install_pytorch_gpu.bat
│
└── deployment/         # Deployment scripts
    └── (future deployment scripts)
```

## 🛠️ Available Scripts

### Setup Scripts

#### `check_gpu.py`
Verifies GPU availability and CUDA setup for AI operations.

```bash
python scripts/setup/check_gpu.py
```

**Output:**
- CUDA availability
- GPU device information
- PyTorch GPU support
- Recommendations

#### `verify_setup.py`
Comprehensive verification of entire setup.

```bash
python scripts/setup/verify_setup.py
```

**Checks:**
- Python dependencies
- Node.js dependencies
- Database connectivity
- Service health
- Configuration files

#### `create_sample_images.py`
Creates sample fashion images for testing.

```bash
python scripts/setup/create_sample_images.py
```

### Development Scripts

#### `setup_and_start.bat` (Windows)
One-command setup and start all services.

```bash
.\scripts\dev\setup_and_start.bat
```

**Actions:**
1. Installs Python dependencies
2. Installs Node.js dependencies
3. Sets up environment files
4. Starts all services

#### `restart_backend.bat` / `restart_backend.ps1`
Restart the backend service quickly.

```bash
# Batch script
.\scripts\dev\restart_backend.bat

# PowerShell script
.\scripts\dev\restart_backend.ps1
```

#### `install_pytorch_gpu.bat`
Install PyTorch with GPU support.

```bash
.\scripts\dev\install_pytorch_gpu.bat
```

### Deployment Scripts

*Coming soon - scripts for production deployment*

## 📝 Creating New Scripts

### Guidelines

1. **Location**: Place in appropriate subfolder (setup/dev/deployment)
2. **Naming**: Use descriptive, lowercase names with underscores
3. **Documentation**: Add header comments explaining purpose
4. **Error Handling**: Include proper error checking
5. **Cross-platform**: Consider Windows/Linux/Mac compatibility

### Script Template (Python)

```python
#!/usr/bin/env python3
"""
Script Name: example_script.py
Purpose: Brief description of what this script does
Usage: python scripts/category/example_script.py [options]
"""

import sys
import argparse
from pathlib import Path

def main():
    """Main script logic"""
    parser = argparse.ArgumentParser(description="Script description")
    parser.add_argument('--option', help='Option description')
    args = parser.parse_args()
    
    try:
        # Your logic here
        print("✓ Success!")
        return 0
    except Exception as e:
        print(f"✗ Error: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
```

### Script Template (Batch)

```batch
@echo off
REM ==============================================
REM Script Name: example_script.bat
REM Purpose: Brief description
REM Usage: .\scripts\category\example_script.bat
REM ==============================================

echo Starting script...

REM Your logic here

if %ERRORLEVEL% NEQ 0 (
    echo Error occurred!
    exit /b 1
)

echo Success!
exit /b 0
```

### Script Template (PowerShell)

```powershell
<#
.SYNOPSIS
    Brief description

.DESCRIPTION
    Detailed description

.EXAMPLE
    .\scripts\category\example_script.ps1

.NOTES
    Author: Your Name
    Date: 2026-01-18
#>

param(
    [string]$Option = "default"
)

try {
    Write-Host "Starting script..." -ForegroundColor Green
    
    # Your logic here
    
    Write-Host "Success!" -ForegroundColor Green
    exit 0
}
catch {
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
```

## 🔧 Common Script Tasks

### Checking Service Status

```python
import requests

def check_service(name, url):
    try:
        response = requests.get(f"{url}/health", timeout=5)
        if response.status_code == 200:
            print(f"✓ {name} is running")
            return True
    except:
        print(f"✗ {name} is not responding")
        return False
```

### Running Shell Commands

```python
import subprocess

def run_command(command, cwd=None):
    """Run shell command and return output"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True
        )
        return result.returncode == 0, result.stdout
    except Exception as e:
        return False, str(e)
```

### Environment Setup

```python
import os
from pathlib import Path

def setup_env_file(service_name):
    """Copy example env file if not exists"""
    env_path = Path(f"services/{service_name}/.env")
    example_path = Path(f"config/env-examples/.env.{service_name}.example")
    
    if not env_path.exists() and example_path.exists():
        import shutil
        shutil.copy(example_path, env_path)
        print(f"✓ Created .env for {service_name}")
        return True
    return False
```

## ⚡ Quick Reference

| Task | Command |
|------|---------|
| Check GPU | `python scripts/setup/check_gpu.py` |
| Verify Setup | `python scripts/setup/verify_setup.py` |
| Full Setup | `.\scripts\dev\setup_and_start.bat` |
| Restart Backend | `.\scripts\dev\restart_backend.bat` |
| Install PyTorch GPU | `.\scripts\dev\install_pytorch_gpu.bat` |
| Create Samples | `python scripts/setup/create_sample_images.py` |

## 🐛 Troubleshooting Scripts

**Script won't execute?**
- Check file permissions (Linux/Mac): `chmod +x script.sh`
- Verify Python/Node.js are in PATH
- Run with appropriate interpreter explicitly

**Import errors in Python scripts?**
- Activate virtual environment first
- Install required dependencies
- Check Python version (3.12+ required)

**Batch scripts not working?**
- Run as Administrator if needed
- Check PowerShell execution policy
- Verify file paths use backslashes on Windows

## 📚 Related Documentation

- [Development Guide](../docs/development/QUICKSTART.md)
- [Setup Guide](../docs/deployment/COMPLETE_SETUP_GUIDE.md)
- [GPU Setup](../docs/deployment/GPU_SETUP_GUIDE.md)

## 🤝 Contributing Scripts

When contributing new scripts:
1. Follow the templates above
2. Test on Windows and Linux if possible
3. Update this README
4. Add proper error handling
5. Include usage examples
