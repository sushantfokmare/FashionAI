# GPU Setup Guide for Fashion AI Service

## 🎯 Goal

Ensure your system has:
- ✅ NVIDIA GPU available
- ✅ CUDA working
- ✅ PyTorch sees GPU (`torch.cuda.is_available() == True`)

## 🔍 Quick Check

Run the GPU verification script:

```bash
cd project/ai_service
python check_gpu.py
```

This will check:
1. NVIDIA GPU detection
2. CUDA Toolkit installation
3. PyTorch GPU support
4. Required dependencies

## 📋 Prerequisites

### 1. NVIDIA GPU

**Check if you have an NVIDIA GPU:**

```bash
# Windows
nvidia-smi

# Should show GPU information
```

**If nvidia-smi fails:**
- Install NVIDIA drivers: https://www.nvidia.com/Download/index.aspx
- Restart your computer
- Run `nvidia-smi` again

### 2. CUDA Toolkit

**Check CUDA installation:**

```bash
nvcc --version
```

**If not installed:**

1. Download CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
2. Recommended versions:
   - **CUDA 11.8** (most compatible)
   - **CUDA 12.x** (latest)
3. Install and restart

### 3. PyTorch with CUDA

**Install PyTorch with GPU support:**

```bash
# Option 1: CUDA 11.8 (recommended)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Option 2: CUDA 12.1
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Option 3: Use the batch script (Windows)
install_pytorch_gpu.bat
```

**Verify PyTorch sees GPU:**

```python
import torch
print(torch.cuda.is_available())  # Should be True
print(torch.cuda.get_device_name(0))  # Should show your GPU name
```

## 🚀 Step-by-Step Setup

### Windows

1. **Check GPU**
   ```bash
   nvidia-smi
   ```

2. **Install CUDA Toolkit**
   - Download from: https://developer.nvidia.com/cuda-downloads
   - Select: Windows > x86_64 > your Windows version > exe (network)
   - Install with default settings

3. **Install PyTorch**
   ```bash
   # Run the batch script
   install_pytorch_gpu.bat
   
   # OR manually:
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

4. **Verify**
   ```bash
   python check_gpu.py
   ```

### Linux

1. **Check GPU**
   ```bash
   nvidia-smi
   ```

2. **Install CUDA Toolkit**
   ```bash
   # Ubuntu/Debian
   wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-keyring_1.0-1_all.deb
   sudo dpkg -i cuda-keyring_1.0-1_all.deb
   sudo apt-get update
   sudo apt-get -y install cuda
   ```

3. **Install PyTorch**
   ```bash
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

4. **Verify**
   ```bash
   python check_gpu.py
   ```

## 🧪 Manual Verification

### Test 1: NVIDIA Driver

```bash
nvidia-smi
```

Expected output:
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.xx.xx    Driver Version: 535.xx.xx    CUDA Version: 12.x   |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
...
```

### Test 2: CUDA Toolkit

```bash
nvcc --version
```

Expected output:
```
nvcc: NVIDIA (R) Cuda compiler driver
Copyright (c) 2005-2023 NVIDIA Corporation
Built on ...
Cuda compilation tools, release 11.8, V11.8.xxx
```

### Test 3: PyTorch GPU

```bash
python -c "import torch; print(f'CUDA Available: {torch.cuda.is_available()}'); print(f'GPU: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else None}')"
```

Expected output:
```
CUDA Available: True
GPU: NVIDIA GeForce RTX 3060
```

### Test 4: Create Tensor on GPU

```python
import torch

# Check availability
assert torch.cuda.is_available(), "CUDA not available!"

# Create tensor on GPU
x = torch.randn(1000, 1000).cuda()
print(f"Tensor device: {x.device}")  # Should show: cuda:0

# Perform operation
y = x @ x.T
print(f"Operation successful on {y.device}")

# Cleanup
del x, y
torch.cuda.empty_cache()
```

## 🔧 Troubleshooting

### Issue: "nvidia-smi not found"

**Solution:**
1. Install NVIDIA drivers: https://www.nvidia.com/Download/index.aspx
2. Restart computer
3. Run `nvidia-smi` again

### Issue: "nvcc not found"

**Solution:**
1. Install CUDA Toolkit: https://developer.nvidia.com/cuda-downloads
2. Add to PATH (usually done automatically):
   - Windows: `C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin`
   - Linux: `/usr/local/cuda-11.8/bin`

### Issue: "torch.cuda.is_available() returns False"

**Solution:**
1. Verify CUDA is installed: `nvcc --version`
2. Reinstall PyTorch with CUDA:
   ```bash
   pip uninstall torch torchvision torchaudio
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```
3. Match CUDA version with PyTorch build
4. Restart Python/terminal

### Issue: "CUDA out of memory"

**Solution:**
```python
# Clear cache
torch.cuda.empty_cache()

# Reduce batch size
batch_size = 1  # Start small

# Use gradient checkpointing
model.gradient_checkpointing_enable()
```

### Issue: Wrong CUDA version

**Check installed versions:**
```bash
# NVIDIA Driver CUDA version
nvidia-smi

# CUDA Toolkit version
nvcc --version

# PyTorch CUDA version
python -c "import torch; print(torch.version.cuda)"
```

**Note:** PyTorch CUDA version should match or be lower than Toolkit version.

## 📊 GPU Memory Management

```python
import torch

# Check memory
print(f"Total: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
print(f"Allocated: {torch.cuda.memory_allocated(0) / 1024**3:.2f} GB")
print(f"Cached: {torch.cuda.memory_reserved(0) / 1024**3:.2f} GB")

# Clear cache
torch.cuda.empty_cache()
```

## 🎯 Minimum Requirements for AI Models

| Model Type | VRAM | Recommended GPU |
|------------|------|-----------------|
| Stable Diffusion 1.5 | 4-6 GB | RTX 2060+ |
| Stable Diffusion XL | 8-10 GB | RTX 3070+ |
| Fine-tuning | 12-16 GB | RTX 3090+ |
| Training from scratch | 24+ GB | RTX 4090 / A100 |

## 📚 Resources

- **PyTorch Installation:** https://pytorch.org/get-started/locally/
- **CUDA Toolkit:** https://developer.nvidia.com/cuda-downloads
- **NVIDIA Drivers:** https://www.nvidia.com/Download/index.aspx
- **PyTorch CUDA Docs:** https://pytorch.org/docs/stable/cuda.html

## ✅ Success Checklist

- [ ] `nvidia-smi` shows GPU
- [ ] `nvcc --version` shows CUDA version
- [ ] `torch.cuda.is_available()` returns `True`
- [ ] Can create tensors on GPU
- [ ] GPU memory is detected
- [ ] No CUDA errors when running code

## 🚀 Next Steps

Once all checks pass:

1. **Install AI model libraries:**
   ```bash
   pip install diffusers transformers accelerate
   ```

2. **Test with a simple model:**
   ```python
   from diffusers import StableDiffusionPipeline
   import torch
   
   pipe = StableDiffusionPipeline.from_pretrained(
       "runwayml/stable-diffusion-v1-5",
       torch_dtype=torch.float16
   )
   pipe = pipe.to("cuda")
   
   image = pipe("a fashion design").images[0]
   ```

3. **Update your AI service** to use GPU in generation.

---

**Run `python check_gpu.py` to verify your setup!** 🎉
