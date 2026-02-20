"""
Verify Image Serving Setup
Run this script to check if everything is configured correctly.
"""

from pathlib import Path
import sys

def check_setup():
    """Verify all components are in place"""
    
    print("🔍 Verifying Fashion AI Image Serving Setup\n")
    print("=" * 60)
    
    checks = []
    
    # Check 1: Generated images directory
    images_dir = Path(__file__).parent / "generated_images"
    if images_dir.exists():
        print("✅ Images directory exists:", images_dir)
        image_count = len(list(images_dir.glob("*.jpg")) + list(images_dir.glob("*.png")))
        print(f"   Found {image_count} images")
        checks.append(True)
    else:
        print("❌ Images directory not found")
        print("   Run: python create_sample_images.py")
        checks.append(False)
    
    print()
    
    # Check 2: app.py exists
    app_file = Path(__file__).parent / "app.py"
    if app_file.exists():
        print("✅ app.py found")
        
        # Check for StaticFiles mount
        content = app_file.read_text()
        if 'StaticFiles' in content and 'mount("/images"' in content:
            print("   ✓ StaticFiles configured for /images")
            checks.append(True)
        else:
            print("   ⚠️  StaticFiles not properly configured")
            checks.append(False)
    else:
        print("❌ app.py not found")
        checks.append(False)
    
    print()
    
    # Check 3: Required dependencies
    try:
        import fastapi
        print("✅ FastAPI installed:", fastapi.__version__)
        checks.append(True)
    except ImportError:
        print("❌ FastAPI not installed")
        print("   Run: pip install -r requirements.txt")
        checks.append(False)
    
    print()
    
    # Check 4: Test files
    test_files = [
        'test_api.py',
        'test_image_serving.html',
        'create_sample_images.py'
    ]
    
    for test_file in test_files:
        if (Path(__file__).parent / test_file).exists():
            print(f"✅ {test_file} available")
        else:
            print(f"⚠️  {test_file} not found")
    
    print()
    print("=" * 60)
    
    # Summary
    if all(checks):
        print("✅ All critical checks passed!")
        print("\n📋 Next Steps:")
        print("1. Create sample images: python create_sample_images.py")
        print("2. Start server: python app.py")
        print("3. Open browser: http://localhost:8000/docs")
        print("4. Test interface: open test_image_serving.html")
        print("\n🖼️  Images will be served at: http://localhost:8000/images/")
        return True
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        return False


def print_image_serving_info():
    """Print information about how image serving works"""
    
    print("\n" + "=" * 60)
    print("📚 Image Serving Information")
    print("=" * 60)
    
    print("""
🔧 How It Works:

1. Images Directory: generated_images/
   - All generated images saved here
   - Auto-created by the app

2. FastAPI Static Files:
   - Configured in app.py
   - app.mount("/images", StaticFiles(...))
   
3. Access Pattern:
   - Local file: generated_images/design_123.jpg
   - URL: http://localhost:8000/images/design_123.jpg

4. Frontend Integration:
   HTML:  <img src="http://localhost:8000/images/design_123.jpg" />
   React: <img src={imageUrl} alt="Design" />

📡 Endpoints:

- POST /generate        → Generate new design, returns image_url
- GET  /images/list     → List all generated images
- GET  /images/{file}   → Serve specific image file
- GET  /health          → Check server status

🧪 Testing:

1. Python:  python test_api.py
2. Browser: open test_image_serving.html
3. cURL:    curl http://localhost:8000/images/list
""")


if __name__ == "__main__":
    success = check_setup()
    print_image_serving_info()
    
    sys.exit(0 if success else 1)
