"""
GPU & Environment Check for Fashion AI Service
Verifies NVIDIA GPU, CUDA, and PyTorch GPU support

Run this before starting AI model training/inference:
    python check_gpu.py
"""

import sys
import subprocess
import platform


def print_header(title):
    """Print a formatted header"""
    print("\n" + "=" * 70)
    print(f"  {title}")
    print("=" * 70)


def check_nvidia_gpu():
    """Check if NVIDIA GPU is available using nvidia-smi"""
    print_header("1. NVIDIA GPU Check")
    
    try:
        result = subprocess.run(
            ['nvidia-smi'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print("✅ NVIDIA GPU detected!")
            print("\nGPU Information:")
            print("-" * 70)
            # Parse and display relevant info
            lines = result.stdout.split('\n')
            for line in lines[:15]:  # First 15 lines have the GPU info
                if line.strip():
                    print(line)
            print("-" * 70)
            return True
        else:
            print("❌ nvidia-smi command failed")
            print(f"Error: {result.stderr}")
            return False
            
    except FileNotFoundError:
        print("❌ nvidia-smi not found")
        print("   NVIDIA drivers may not be installed")
        print("\n📋 To install NVIDIA drivers:")
        print("   1. Visit: https://www.nvidia.com/Download/index.aspx")
        print("   2. Download and install the latest driver for your GPU")
        return False
        
    except Exception as e:
        print(f"❌ Error checking NVIDIA GPU: {e}")
        return False


def check_cuda():
    """Check CUDA installation and version"""
    print_header("2. CUDA Check")
    
    try:
        result = subprocess.run(
            ['nvcc', '--version'],
            capture_output=True,
            text=True,
            timeout=10
        )
        
        if result.returncode == 0:
            print("✅ CUDA Toolkit installed!")
            print("\nCUDA Version:")
            print("-" * 70)
            print(result.stdout)
            print("-" * 70)
            return True
        else:
            print("❌ nvcc command failed")
            return False
            
    except FileNotFoundError:
        print("❌ CUDA Toolkit (nvcc) not found")
        print("\n📋 To install CUDA Toolkit:")
        print("   1. Visit: https://developer.nvidia.com/cuda-downloads")
        print("   2. Download CUDA Toolkit for your system")
        print("   3. Recommended: CUDA 11.8 or 12.x")
        print("\n⚠️  Note: CUDA Toolkit is required for PyTorch GPU support")
        return False
        
    except Exception as e:
        print(f"❌ Error checking CUDA: {e}")
        return False


def check_pytorch_gpu():
    """Check if PyTorch can see the GPU"""
    print_header("3. PyTorch GPU Support Check")
    
    try:
        import torch
        print(f"✅ PyTorch installed: {torch.__version__}")
        
        # Check CUDA availability
        cuda_available = torch.cuda.is_available()
        
        if cuda_available:
            print("✅ PyTorch can see CUDA!")
            print(f"\n   torch.cuda.is_available() = {cuda_available}")
            
            # Get CUDA version
            cuda_version = torch.version.cuda
            print(f"   CUDA version (PyTorch): {cuda_version}")
            
            # Get number of GPUs
            gpu_count = torch.cuda.device_count()
            print(f"   Number of GPUs: {gpu_count}")
            
            # Get GPU details
            print("\n📊 GPU Details:")
            print("-" * 70)
            for i in range(gpu_count):
                print(f"   GPU {i}: {torch.cuda.get_device_name(i)}")
                print(f"   Memory: {torch.cuda.get_device_properties(i).total_memory / 1024**3:.2f} GB")
                print(f"   Compute Capability: {torch.cuda.get_device_properties(i).major}.{torch.cuda.get_device_properties(i).minor}")
                print()
            print("-" * 70)
            
            # Test GPU tensor
            try:
                test_tensor = torch.randn(1000, 1000).cuda()
                print("\n✅ Successfully created tensor on GPU!")
                print(f"   Tensor device: {test_tensor.device}")
                del test_tensor  # Free memory
                torch.cuda.empty_cache()
                return True
            except Exception as e:
                print(f"\n❌ Failed to create tensor on GPU: {e}")
                return False
                
        else:
            print("❌ PyTorch cannot see CUDA!")
            print(f"\n   torch.cuda.is_available() = {cuda_available}")
            print("\n📋 Possible solutions:")
            print("   1. Install PyTorch with CUDA support:")
            print("      pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
            print("   2. Verify CUDA Toolkit is installed")
            print("   3. Check that NVIDIA drivers are up to date")
            return False
            
    except ImportError:
        print("❌ PyTorch not installed")
        print("\n📋 To install PyTorch with CUDA support:")
        print("   pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
        print("\n   Visit https://pytorch.org/get-started/locally/ for other CUDA versions")
        return False
        
    except Exception as e:
        print(f"❌ Error checking PyTorch: {e}")
        return False


def check_system_info():
    """Display system information"""
    print_header("System Information")
    
    print(f"OS: {platform.system()} {platform.release()}")
    print(f"Architecture: {platform.machine()}")
    print(f"Python: {sys.version.split()[0]}")
    print(f"Python Path: {sys.executable}")


def check_ai_dependencies():
    """Check if AI/ML libraries are installed"""
    print_header("4. AI/ML Dependencies Check")
    
    dependencies = {
        'torch': 'PyTorch',
        'torchvision': 'TorchVision',
        'PIL': 'Pillow (Image Processing)',
        'numpy': 'NumPy',
    }
    
    optional_dependencies = {
        'diffusers': 'Diffusers (Stable Diffusion)',
        'transformers': 'Transformers (HuggingFace)',
        'accelerate': 'Accelerate (Training Optimization)',
    }
    
    installed = []
    missing = []
    
    # Check required dependencies
    print("Required Dependencies:")
    for module, name in dependencies.items():
        try:
            __import__(module)
            version = __import__(module).__version__
            print(f"  ✅ {name}: {version}")
            installed.append(name)
        except ImportError:
            print(f"  ❌ {name}: Not installed")
            missing.append(module)
    
    # Check optional dependencies
    print("\nOptional Dependencies (for AI models):")
    for module, name in optional_dependencies.items():
        try:
            __import__(module)
            version = __import__(module).__version__
            print(f"  ✅ {name}: {version}")
        except ImportError:
            print(f"  ⚠️  {name}: Not installed (optional)")
    
    if missing:
        print(f"\n❌ Missing required dependencies: {', '.join(missing)}")
        print("\n📋 Install with:")
        print(f"   pip install {' '.join(missing)}")
        return False
    
    return True


def recommend_next_steps(gpu_ok, cuda_ok, pytorch_ok):
    """Provide recommendations based on check results"""
    print_header("📋 Recommendations & Next Steps")
    
    if gpu_ok and cuda_ok and pytorch_ok:
        print("✅ All checks passed! Your system is ready for GPU-accelerated AI.")
        print("\n🚀 You can now:")
        print("   1. Install AI model libraries:")
        print("      pip install diffusers transformers accelerate")
        print("   2. Run AI inference on GPU")
        print("   3. Train/fine-tune models")
        print("\n💡 Example PyTorch GPU code:")
        print("   import torch")
        print("   device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')")
        print("   model = model.to(device)")
        
    elif gpu_ok and not cuda_ok:
        print("⚠️  GPU detected but CUDA Toolkit not installed")
        print("\n📋 Next steps:")
        print("   1. Install CUDA Toolkit: https://developer.nvidia.com/cuda-downloads")
        print("   2. Install PyTorch with CUDA: pip install torch --index-url https://download.pytorch.org/whl/cu118")
        print("   3. Rerun this script to verify")
        
    elif not gpu_ok:
        print("❌ No NVIDIA GPU detected")
        print("\n📋 Options:")
        print("   1. If you have an NVIDIA GPU:")
        print("      - Install/update NVIDIA drivers")
        print("      - Restart your computer")
        print("   2. If you don't have an NVIDIA GPU:")
        print("      - Use CPU for inference (slower)")
        print("      - Consider cloud GPU services (Google Colab, AWS, etc.)")
        
    elif not pytorch_ok:
        print("⚠️  GPU and CUDA detected but PyTorch cannot use GPU")
        print("\n📋 Next steps:")
        print("   1. Reinstall PyTorch with CUDA support:")
        print("      pip uninstall torch torchvision")
        print("      pip install torch torchvision --index-url https://download.pytorch.org/whl/cu118")
        print("   2. Verify CUDA version matches PyTorch build")
        print("   3. Rerun this script to verify")


def main():
    """Run all GPU and environment checks"""
    print("\n" + "🔍" * 35)
    print(" " * 10 + "GPU & Environment Check for Fashion AI")
    print("🔍" * 35)
    
    # System info
    check_system_info()
    
    # Run checks
    gpu_ok = check_nvidia_gpu()
    cuda_ok = check_cuda()
    pytorch_ok = check_pytorch_gpu()
    deps_ok = check_ai_dependencies()
    
    # Summary
    print_header("✨ Summary")
    
    checks = [
        ("NVIDIA GPU", gpu_ok),
        ("CUDA Toolkit", cuda_ok),
        ("PyTorch GPU", pytorch_ok),
        ("Dependencies", deps_ok),
    ]
    
    for name, status in checks:
        icon = "✅" if status else "❌"
        print(f"  {icon} {name}")
    
    # Recommendations
    recommend_next_steps(gpu_ok, cuda_ok, pytorch_ok)
    
    # Exit code
    all_ok = all(status for _, status in checks)
    
    print("\n" + "=" * 70)
    if all_ok:
        print("✅ All checks passed! System is ready for AI workloads.")
    else:
        print("⚠️  Some checks failed. Please follow the recommendations above.")
    print("=" * 70 + "\n")
    
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
