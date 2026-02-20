"""
Image embedding extraction using CLIP model
NOTE: This module is no longer used directly.
The recommendation_engine from clip_faiss.engine handles all CLIP embeddings.
Kept for reference only.
"""
import torch
from PIL import Image
import numpy as np


def get_image_embedding(image_path: str, recommendation_engine):
    """
    Extract CLIP embedding from an image using the recommendation engine's CLIP model.
    
    Args:
        image_path: Path to the image file
        recommendation_engine: RecommendationEngine instance with loaded CLIP model
        
    Returns:
        numpy array: Image embedding vector
    """
    try:
        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")
        
        # Use the recommendation engine's CLIP model (already loaded)
        image_input = recommendation_engine.preprocess(image).unsqueeze(0).to(recommendation_engine.device)
        
        # Get embedding
        with torch.no_grad():
            image_features = recommendation_engine.model.encode_image(image_input)
            image_features /= image_features.norm(dim=-1, keepdim=True)
        
        return image_features.cpu().numpy().flatten()
        
    except Exception as e:
        raise Exception(f"Failed to extract image embedding: {str(e)}")
