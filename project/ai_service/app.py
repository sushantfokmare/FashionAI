"""
Fashion AI Design Generation Service
FastAPI-based API for generating fashion designs
using Stable Diffusion v1.5 (CPU optimized)
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path
import uuid
import logging
from datetime import datetime
from typing import Optional, List
import random
import torch
import os
from contextlib import asynccontextmanager
from diffusers import AutoPipelineForText2Image
from diffusers import StableDiffusionImg2ImgPipeline
from diffusers import EulerAncestralDiscreteScheduler
from PIL import Image
from collections import defaultdict
import shutil
from concurrent.futures import ThreadPoolExecutor
import threading

# Import CLIP-FAISS recommendation engine
from clip_faiss.engine import RecommendationEngine
import math

# -------------------------------------------------
# Background job tracking
# -------------------------------------------------
generation_jobs = {}  # {job_id: {"status": "processing/completed/failed", "result": {...}, "error": None}}
job_lock = threading.Lock()
executor = ThreadPoolExecutor(max_workers=1)  # One generation at a time, but non-blocking for API

# -------------------------------------------------
# Helper function for data cleaning
# -------------------------------------------------
def clean_item_for_json(item):
    """Clean metadata item to make it JSON-serializable (handles NaN, None, floats)."""
    cleaned = {}
    for key, value in item.items():
        if value is None:
            cleaned[key] = ""
        elif isinstance(value, float):
            if math.isnan(value) or math.isinf(value):
                cleaned[key] = ""
            else:
                cleaned[key] = value
        else:
            cleaned[key] = value
    return cleaned

# -------------------------------------------------
# Logging setup
# -------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------------------------
# Global model variables
# -------------------------------------------------
pipe = None  # Unified pipeline for both text-to-image and image-to-image
recommendation_engine = None  # CLIP-FAISS recommendation engine

# -------------------------------------------------
# Lifespan handler (replaces deprecated on_event)
# -------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load models on startup and cleanup on shutdown.
    This replaces the deprecated @app.on_event("startup") pattern.
    """
    global pipe, recommendation_engine

    try:
        logger.info("Loading Stable Diffusion v1.5 (CPU mode)...")

        # Load unified pipeline for both text-to-image and image-to-image
        pipe = AutoPipelineForText2Image.from_pretrained(
            "runwayml/stable-diffusion-v1-5",
            use_safetensors=True
        )

        pipe = pipe.to("cpu")
        pipe.set_progress_bar_config(disable=True)

        logger.info("✅ Unified pipeline loaded successfully (supports both text-to-image and image-to-image).")

        # Load CLIP-FAISS recommendation engine
        logger.info("Loading CLIP-FAISS recommendation engine...")
        recommendation_engine = RecommendationEngine()
        logger.info("✅ Recommendation engine loaded successfully.")

    except Exception as e:
        logger.error("❌ Failed to load models", exc_info=True)
        pipe = None
        recommendation_engine = None

    yield  # Server runs here

    # Cleanup on shutdown (optional)
    logger.info("Shutting down...")

# -------------------------------------------------
# FastAPI app with lifespan handler
# -------------------------------------------------
app = FastAPI(
    title="Fashion AI Design Service",
    description="AI-powered fashion design generation API",
    version="1.0.0",
    lifespan=lifespan
)

# -------------------------------------------------
# CORS
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Output directory
# -------------------------------------------------
OUTPUT_DIR = Path(__file__).parent / "generated_images"
OUTPUT_DIR.mkdir(exist_ok=True)

# Upload directory for outfit matching
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Dataset images directory
DATASET_IMAGES_DIR = Path(__file__).parent / "data" / "fashion_dataset" / "images"

app.mount("/images", StaticFiles(directory=str(OUTPUT_DIR)), name="images")
app.mount("/dataset/images", StaticFiles(directory=str(DATASET_IMAGES_DIR)), name="dataset_images")

# -------------------------------------------------
# Request / Response models
# -------------------------------------------------
class DesignRequest(BaseModel):
    topwear: str
    bottomwear: str
    accessories: Optional[str] = None
    style: Optional[str] = None
    color_palette: Optional[List[str]] = None


class DesignResponse(BaseModel):
    image_url: str
    design_id: str
    timestamp: str


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


# -------------------------------------------------
# Routes
# -------------------------------------------------
@app.get("/", response_model=HealthResponse)
async def root():
    return {
        "status": "healthy",
        "service": "Fashion AI Design Service",
        "version": "1.0.0"
    }


# -------------------------------------------------
# Background generation function
# -------------------------------------------------
def _generate_design_background(job_id: str, request_data: dict):
    """Background task for Stable Diffusion generation"""
    global pipe
    
    try:
        logger.info(f"[Job {job_id}] Starting background generation")
        
        design_id = str(uuid.uuid4())
        timestamp = datetime.now().isoformat()

        # Prompt construction
        prompt = (
            f"Fashion photography of a model wearing {request_data['topwear']} "
            f"and {request_data['bottomwear']}. "
        )

        if request_data.get('accessories'):
            prompt += f"Accessories: {request_data['accessories']}. "

        if request_data.get('style'):
            prompt += f"Style: {request_data['style']}. "

        if request_data.get('color_palette'):
            colors = ", ".join(request_data['color_palette'])
            prompt += f"Color palette: {colors}. "

        prompt += (
            "Photorealistic, professional lighting, high quality, "
            "sharp focus, fashion editorial, studio photography."
        )

        negative_prompt = (
            "blurry, low quality, bad anatomy, deformed, extra limbs, "
            "overexposed, underexposed"
        )

        seed = random.randint(0, 2**32 - 1)
        logger.info(f"[Job {job_id}] Seed: {seed}")

        # Image generation (CPU only) - this is the blocking part
        logger.info(f"[Job {job_id}] Running Stable Diffusion with 20 steps...")
        images = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            guidance_scale=7.5,
            num_inference_steps=20,
            generator=torch.Generator("cpu").manual_seed(seed)
        ).images
        logger.info(f"[Job {job_id}] Image generation completed")

        # Save image
        filename = f"design_{design_id[:8]}.jpg"
        output_path = OUTPUT_DIR / filename
        images[0].save(output_path)

        image_url = f"http://localhost:8000/images/{filename}"
        logger.info(f"[Job {job_id}] Image saved: {filename}")

        # Update job status
        with job_lock:
            generation_jobs[job_id] = {
                "status": "completed",
                "result": {
                    "image_url": image_url,
                    "design_id": design_id,
                    "timestamp": timestamp
                },
                "error": None
            }
        
    except Exception as e:
        logger.error(f"[Job {job_id}] Generation failed: {str(e)}")
        with job_lock:
            generation_jobs[job_id] = {
                "status": "failed",
                "result": None,
                "error": str(e)
            }


@app.post("/generate")
async def generate_design(request: DesignRequest):
    """Submit design generation job - returns immediately with job_id"""
    global pipe

    if pipe is None:
        raise HTTPException(
            status_code=503,
            detail="AI model not loaded"
        )

    logger.info(f"Generating design: {request.dict()}")

    # Create job ID
    job_id = str(uuid.uuid4())
    
    # Initialize job status
    with job_lock:
        generation_jobs[job_id] = {
            "status": "processing",
            "result": None,
            "error": None
        }
    
    # Submit to background thread
    request_data = request.dict()
    executor.submit(_generate_design_background, job_id, request_data)
    
    logger.info(f"[Job {job_id}] Submitted to background processing")
    
    return {
        "job_id": job_id,
        "status": "processing",
        "message": "Design generation started. Use /generate/status/{job_id} to check progress."
    }


@app.get("/generate/status/{job_id}")
async def get_generation_status(job_id: str):
    """Poll for generation job status"""
    with job_lock:
        if job_id not in generation_jobs:
            raise HTTPException(status_code=404, detail="Job not found")
        
        job = generation_jobs[job_id]
    
    response = {
        "job_id": job_id,
        "status": job["status"]
    }
    
    if job["status"] == "completed":
        response["result"] = job["result"]
    elif job["status"] == "failed":
        response["error"] = job["error"]
    
    return response


@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if pipe is not None else "degraded",
        "device": "cpu",
        "model_loaded": pipe is not None,
        "recommendation_engine_loaded": recommendation_engine is not None,
        "generated_images": len(list(OUTPUT_DIR.glob("*.jpg")))
    }


@app.get("/model/status")
async def model_status():
    return {
        "model_loaded": pipe is not None,
        "model_name": "runwayml/stable-diffusion-v1-5",
        "device": "cpu",
        "pytorch_version": torch.__version__
    }


@app.get("/images/list")
async def list_images():
    images = []
    for img in OUTPUT_DIR.glob("*.jpg"):
        images.append({
            "filename": img.name,
            "url": f"http://localhost:8000/images/{img.name}",
            "size_bytes": img.stat().st_size,
            "created_at": datetime.fromtimestamp(img.stat().st_ctime).isoformat()
        })

    return {
        "count": len(images),
        "images": images
    }


@app.post("/restyle")
async def restyle_image(
    image: UploadFile = File(...),
    prompt: str = Form(...),
    strength: float = Form(0.6)
):
    """
    AI Restyle endpoint - transform an existing image using Stable Diffusion Image-to-Image.
    
    Args:
        image: Input image file to restyle
        prompt: Text prompt describing the desired transformation
        strength: How much to transform (0.0 = keep original, 1.0 = completely new)
    """
    global pipe

    if pipe is None:
        raise HTTPException(
            status_code=503,
            detail="Image-to-Image model not loaded"
        )

    # Create job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded image temporarily
    temp_input_path = OUTPUT_DIR / f"input_{job_id[:8]}.png"
    with open(temp_input_path, "wb") as f:
        f.write(await image.read())
    
    # Initialize job status
    with job_lock:
        generation_jobs[job_id] = {
            "status": "processing",
            "result": None,
            "error": None
        }
    
    # Submit to background thread
    request_data = {
        "input_path": str(temp_input_path),
        "prompt": prompt,
        "strength": strength,
        "endpoint": "restyle"
    }
    executor.submit(_restyle_background, job_id, request_data)
    
    logger.info(f"[Job {job_id}] Restyle submitted to background processing")
    
    return {
        "job_id": job_id,
        "status": "processing",
        "message": "Restyle started. Use /generate/status/{job_id} to check progress."
    }


def _restyle_background(job_id: str, request_data: dict):
    """Background task for image restyling"""
    global pipe
    
    try:
        logger.info(f"[Job {job_id}] Starting background restyle")
        
        # Load input image
        input_path = Path(request_data["input_path"])
        init_image = Image.open(input_path).convert("RGB")
        init_image = init_image.resize((512, 512))
        
        logger.info(f"[Job {job_id}] Restyling with prompt: '{request_data['prompt']}', strength: {request_data['strength']}")

        # Convert to image-to-image mode and generate
        from diffusers import AutoPipelineForImage2Image
        img2img_pipe = AutoPipelineForImage2Image.from_pipe(pipe)
        
        result = img2img_pipe(
            prompt=request_data["prompt"],
            image=init_image,
            strength=float(request_data["strength"]),
            guidance_scale=7.5,
            num_inference_steps=20
        ).images[0]

        # Save output
        filename = f"restyle_{uuid.uuid4().hex[:8]}.jpg"
        output_path = OUTPUT_DIR / filename
        result.save(output_path)

        # Clean up temp input
        try:
            input_path.unlink()
        except:
            pass

        image_url = f"http://localhost:8000/images/{filename}"
        logger.info(f"[Job {job_id}] Restyle complete: {filename}")

        # Update job status
        with job_lock:
            generation_jobs[job_id] = {
                "status": "completed",
                "result": {
                    "image_url": image_url,
                    "filename": filename,
                    "timestamp": datetime.now().isoformat()
                },
                "error": None
            }
        
    except Exception as e:
        logger.error(f"[Job {job_id}] Restyle failed: {str(e)}")
        with job_lock:
            generation_jobs[job_id] = {
                "status": "failed",
                "result": None,
                "error": str(e)
            }


@app.post("/sketch-to-design")
async def sketch_to_design_api(
    sketch: UploadFile = File(...),
    prompt: str = Form(...),
    strength: float = Form(0.6)
):
    """
    Sketch to Design endpoint - convert sketches/drawings into realistic fashion designs.
    
    Args:
        sketch: Input sketch/drawing image file
        prompt: Text prompt describing the desired fashion design
        strength: How much to transform (0.0 = keep sketch, 1.0 = completely new)
                 Default 0.7 works well for sketches
    """
    global pipe

    if pipe is None:
        raise HTTPException(
            status_code=503,
            detail="Image-to-Image model not loaded"
        )

    # Create job ID
    job_id = str(uuid.uuid4())
    
    # Save uploaded sketch temporarily
    sketch_path = OUTPUT_DIR / f"sketch_{job_id[:8]}.png"
    with open(sketch_path, "wb") as f:
        f.write(await sketch.read())
    
    logger.info(f"[Job {job_id}] Sketch uploaded: {sketch_path.name}")
    
    # Initialize job status
    with job_lock:
        generation_jobs[job_id] = {
            "status": "processing",
            "result": None,
            "error": None
        }
    
    # Submit to background thread
    request_data = {
        "sketch_path": str(sketch_path),
        "prompt": prompt,
        "strength": strength,
        "endpoint": "sketch-to-design"
    }
    executor.submit(_sketch_to_design_background, job_id, request_data)
    
    logger.info(f"[Job {job_id}] Sketch-to-design submitted to background processing")
    
    return {
        "job_id": job_id,
        "status": "processing",
        "message": "Sketch to design started. Use /generate/status/{job_id} to check progress."
    }


def _sketch_to_design_background(job_id: str, request_data: dict):
    """Background task for sketch-to-design conversion"""
    global pipe
    
    try:
        logger.info(f"[Job {job_id}] Starting background sketch-to-design")
        
        # Load and prepare sketch image
        sketch_path = Path(request_data["sketch_path"])
        init_image = Image.open(sketch_path).convert("RGB")
        init_image = init_image.resize((512, 512))
        
        logger.info(f"[Job {job_id}] Generating design from sketch with prompt: '{request_data['prompt']}', strength: {request_data['strength']}")

        # Convert to image-to-image mode and generate
        from diffusers import AutoPipelineForImage2Image
        img2img_pipe = AutoPipelineForImage2Image.from_pipe(pipe)
        
        result = img2img_pipe(
            prompt=request_data["prompt"],
            image=init_image,
            strength=float(request_data["strength"]),
            guidance_scale=7.5,
            num_inference_steps=20
        ).images[0]

        # Save output design
        output_name = f"design_{uuid.uuid4().hex[:8]}.jpg"
        output_path = OUTPUT_DIR / output_name
        result.save(output_path)

        # Clean up temporary sketch file
        try:
            sketch_path.unlink()
        except:
            pass

        image_url = f"http://localhost:8000/images/{output_name}"
        logger.info(f"[Job {job_id}] Sketch to design complete: {output_name}")

        # Update job status
        with job_lock:
            generation_jobs[job_id] = {
                "status": "completed",
                "result": {
                    "image_url": image_url,
                    "filename": output_name,
                    "timestamp": datetime.now().isoformat()
                },
                "error": None
            }
        
    except Exception as e:
        logger.error(f"[Job {job_id}] Sketch to design failed: {str(e)}")
        with job_lock:
            generation_jobs[job_id] = {
                "status": "failed",
                "result": None,
                "error": str(e)
            }


# -------------------------------------------------
# CLIP-FAISS Recommendation Endpoints
# -------------------------------------------------
@app.post("/recommend/text")
async def recommend_by_text(payload: dict):
    """
    Text-to-Image recommendation using CLIP and FAISS.
    
    Args:
        payload: Dictionary containing "query" - text description of desired fashion items
    
    Returns:
        Grouped recommendations by sub-category (max 6 per category)
    """
    global recommendation_engine
    
    if recommendation_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation engine not loaded"
        )
    
    query = payload.get("query", "")
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    try:
        logger.info(f"Text recommendation query: '{query}'")
        results = recommendation_engine.search_text(query, top_k=40)

        # Group results: max 6 per sub-category (clean for JSON serialization)
        grouped = defaultdict(list)
        for item in results:
            cleaned_item = clean_item_for_json(item)
            sub = cleaned_item.get("sub_category", "unknown")
            if len(grouped[sub]) < 6:
                grouped[sub].append(cleaned_item)

        logger.info(f"Found {len(results)} results in {len(grouped)} categories")
        return {
            "query": query,
            "results": grouped
        }
    except Exception as e:
        logger.error(f"Text recommendation error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recommendations: {str(e)}"
        )


@app.post("/recommend/image")
async def recommend_by_image(file: UploadFile = File(...)):
    """
    Image-to-Image recommendation using CLIP and FAISS.
    
    Args:
        file: Uploaded image file for similarity search
    
    Returns:
        Grouped recommendations by sub-category (max 6 per category)
    """
    global recommendation_engine
    
    if recommendation_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation engine not loaded"
        )
    
    temp_path = OUTPUT_DIR / "temp_upload.jpg"

    try:
        # Save uploaded file temporarily
        with open(temp_path, "wb") as f:
            f.write(await file.read())
        
        logger.info(f"Image recommendation from: {file.filename}")
        results = recommendation_engine.search_image(temp_path, top_k=40)

        # Group results: max 6 per sub-category (clean for JSON serialization)
        grouped = defaultdict(list)
        for item in results:
            cleaned_item = clean_item_for_json(item)
            sub = cleaned_item.get("sub_category", "unknown")
            if len(grouped[sub]) < 6:
                grouped[sub].append(cleaned_item)

        logger.info(f"Found {len(results)} results in {len(grouped)} categories")
        
        # Clean up temporary file
        temp_path.unlink(missing_ok=True)

        return {
            "results": grouped
        }
    except Exception as e:
        logger.error(f"Image recommendation error: {str(e)}", exc_info=True)
        # Clean up on error
        temp_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get recommendations: {str(e)}"
        )


# -------------------------------------------------
# Image-based Outfit Matching Endpoint
# -------------------------------------------------
@app.post("/recommend/image-outfit")
async def image_based_outfit(file: UploadFile = File(...)):
    """
    Image-based outfit matching using CLIP embeddings.
    Upload an image and get complete outfit recommendations.
    
    Args:
        file: Uploaded image file (fashion item)
    
    Returns:
        - anchor_item: The main item detected in the uploaded image
        - recommended_outfit: Complete outfit suggestions categorized by type
    """
    global recommendation_engine
    
    if recommendation_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation engine not loaded"
        )
    
    file_path = None
    try:
        # Save uploaded image
        file_id = f"{uuid.uuid4()}.jpg"
        file_path = UPLOAD_DIR / file_id

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        logger.info(f"Processing outfit matching for: {file.filename}")

        # 1️⃣ Use recommendation engine to find similar items
        results = recommendation_engine.search_image(file_path, top_k=60)

        if not results:
            raise HTTPException(status_code=404, detail="No similar items found")

        # First result = anchor item (the uploaded item)
        anchor_item = clean_item_for_json(results[0])

        # 2️⃣ Import and use outfit matching logic
        from logic.image_outfit_matcher import match_outfit_from_image
        
        # Get full dataset for footwear and accessories (two-stage selection)
        full_dataset = recommendation_engine.metadata.tolist()
        
        # 3️⃣ Get complementary items for complete outfit using two-stage approach
        outfit = match_outfit_from_image(
            anchor_item=anchor_item,
            similar_items=results,
            full_dataset=full_dataset,  # Pass full dataset for footwear & accessories
            limit=6
        )
        
        # Clean all outfit items for JSON serialization
        cleaned_outfit = {}
        for category, items in outfit.items():
            cleaned_outfit[category] = [clean_item_for_json(item) for item in items]

        logger.info(f"Outfit matching complete: {sum(len(v) for v in cleaned_outfit.values())} items recommended")

        return {
            "anchor_item": anchor_item,
            "recommended_outfit": cleaned_outfit,
            "total_suggestions": sum(len(v) for v in cleaned_outfit.values())
        }

    except Exception as e:
        logger.error(f"Outfit matching error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to match outfit: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if file_path and file_path.exists():
            try:
                file_path.unlink()
            except:
                pass


# -------------------------------------------------
# Smart Occasion Styling Endpoint
# -------------------------------------------------
class OccasionRequest(BaseModel):
    occasion: str  # casual, party, formal, sports
    style: str  # casual, streetwear, elegant, sporty, minimal
    gender: str  # male, female
    season: str = "all"  # summer, winter, all
    color: str = "any"  # light, dark, neutral, any
    outfit_type: str = "top-bottom"  # top-bottom, dress, full-outfit


@app.post("/occasion-styling")
async def occasion_styling(request: OccasionRequest):
    """
    Generate complete outfit combinations based on occasion and preferences
    """
    global recommendation_engine

    if recommendation_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation engine not loaded"
        )

    try:
        from logic.prompt_builder import build_occasion_prompt
        from logic.occasion_outfit_builder import build_outfits

        logger.info(f"Occasion styling request: {request.dict()}")

        # Build search prompt
        search_data = {
            "occasion": request.occasion,
            "gender": request.gender,
            "style": request.style,
            "season": request.season,
            "color": request.color
        }
        
        prompt = build_occasion_prompt(search_data)
        logger.info(f"Search prompt: {prompt}")

        # Get recommendations from CLIP-FAISS
        # Increase k to get more items for better outfit building
        results = recommendation_engine.search_text(prompt, top_k=50)
        
        if not results:
            raise HTTPException(
                status_code=404,
                detail="No matching items found in dataset"
            )

        logger.info(f"Found {len(results)} items from dataset")
        
        # Log sample items for debugging
        if results:
            logger.info(f"Sample item: {results[0]}")
        
        # Get full dataset for footwear and accessories
        full_dataset = recommendation_engine.metadata.tolist()
        logger.info(f"Full dataset has {len(full_dataset)} items")

        # Build 3 outfit combinations using two-stage selection
        outfits = build_outfits(
            results=results,
            full_dataset=full_dataset,
            occasion=request.occasion,
            outfit_type=request.outfit_type,
            gender=request.gender,
            style=request.style,  # Now properly used!
            color_pref=request.color,
            season=request.season
        )
        
        logger.info(f"Built {len(outfits)} outfits")

        if not outfits:
            raise HTTPException(
                status_code=404,
                detail="Could not build outfit combinations"
            )

        # Clean and format response
        cleaned_outfits = []
        for outfit in outfits:
            cleaned_outfit = {
                "id": outfit["id"],
                "match": outfit["match"]
            }
            
            # Add clothing
            if "clothing" in outfit:
                cleaned_outfit["clothing"] = outfit["clothing"]
            
            # Add footwear
            if "footwear" in outfit:
                cleaned_outfit["footwear"] = outfit["footwear"]
            
            # Add accessories
            if "accessories" in outfit:
                cleaned_outfit["accessories"] = outfit["accessories"]
            
            cleaned_outfits.append(cleaned_outfit)

        return {
            "success": True,
            "outfits": cleaned_outfits,
            "count": len(cleaned_outfits)
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Occasion styling error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate occasion outfits: {str(e)}"
        )


@app.post("/similar-designs")
async def similar_designs(
    query: str = Form(None),
    image: UploadFile = File(None),
    topK: int = Form(20),
    textWeight: float = Form(0.5),
    includePalette: bool = Form(True),
    includeSilhouette: bool = Form(True),
    includeTexture: bool = Form(True)
):
    """
    Combined similarity search using text and/or image.
    Supports both text-only, image-only, and hybrid search.
    """
    global recommendation_engine

    if recommendation_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Recommendation engine not loaded"
        )

    if not query and not image:
        raise HTTPException(
            status_code=400,
            detail="Either query text or image must be provided"
        )

    try:
        results = []
        
        # Text-only search
        if query and not image:
            logger.info(f"Text-only similarity search: '{query}', topK={topK}")
            results = recommendation_engine.search_text(query, top_k=topK)
        
        # Image-only search
        elif image and not query:
            logger.info(f"Image-only similarity search, topK={topK}")
            image_data = await image.read()
            temp_path = None
            try:
                # Save temporary file
                temp_path = os.path.join(UPLOAD_DIR, f"temp_{image.filename}")
                with open(temp_path, "wb") as f:
                    f.write(image_data)
                
                results = recommendation_engine.search_image(temp_path, top_k=topK)
            finally:
                # Clean up temp file
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
        
        # Hybrid search (both text and image)
        else:
            logger.info(f"Hybrid similarity search: '{query}' + image, topK={topK}, textWeight={textWeight}")
            image_data = await image.read()
            temp_path = None
            try:
                # Save temporary file
                temp_path = os.path.join(UPLOAD_DIR, f"temp_{image.filename}")
                with open(temp_path, "wb") as f:
                    f.write(image_data)
                
                results = recommendation_engine.hybrid_search(
                    text=query,
                    image_path=temp_path,
                    text_weight=textWeight,
                    top_k=topK
                )
            finally:
                # Clean up temp file
                if temp_path and os.path.exists(temp_path):
                    os.remove(temp_path)
        
        # Clean results for JSON serialization
        cleaned_results = [clean_item_for_json(item) for item in results]
        
        logger.info(f"Found {len(cleaned_results)} similar designs")
        return {
            "success": True,
            "results": cleaned_results,
            "count": len(cleaned_results),
            "query": query if query else "image search"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Similarity search error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search similar designs: {str(e)}"
        )


# -------------------------------------------------
# Run server
# -------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
