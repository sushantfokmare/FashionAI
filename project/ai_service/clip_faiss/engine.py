import clip
import torch
import faiss
import numpy as np
from PIL import Image
from pathlib import Path

DEVICE = "cpu"

class RecommendationEngine:
    def __init__(self):
        """Initialize CLIP model and load FAISS index with metadata."""
        # Use paths relative to this file's location
        base_dir = Path(__file__).parent
        index_path = base_dir / "index.faiss"
        meta_path = base_dir / "meta.npy"
        
        print(f"Loading CLIP model (ViT-B/32)...")
        self.model, self.preprocess = clip.load("ViT-B/32", device=DEVICE)
        
        print(f"Loading FAISS index from: {index_path}")
        self.index = faiss.read_index(str(index_path))
        
        print(f"Loading metadata from: {meta_path}")
        self.metadata = np.load(str(meta_path), allow_pickle=True)
        
        print(f"✅ Recommendation engine loaded: {len(self.metadata)} items indexed")

    def search_text(self, query, top_k=40):
        text = clip.tokenize([query]).to(DEVICE)
        with torch.no_grad():
            emb = self.model.encode_text(text)
            emb = emb / emb.norm(dim=-1, keepdim=True)

        _, idx = self.index.search(emb.cpu().numpy().astype("float32"), top_k)
        return [self.metadata[i] for i in idx[0]]

    def search_image(self, image_path, top_k=40):
        image = self.preprocess(
            Image.open(image_path).convert("RGB")
        ).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            emb = self.model.encode_image(image)
            emb = emb / emb.norm(dim=-1, keepdim=True)

        _, idx = self.index.search(emb.cpu().numpy().astype("float32"), top_k)
        return [self.metadata[i] for i in idx[0]]
    def hybrid_search(self, text, image_path, text_weight=0.5, top_k=40):
        """
        Hybrid search combining text and image embeddings.
        
        Args:
            text: Text query
            image_path: Path to image file
            text_weight: Weight for text embedding (0-1), image weight is (1 - text_weight)
            top_k: Number of results to return
        
        Returns:
            List of metadata dictionaries for top_k similar items
        """
        # Get text embedding
        text_tokens = clip.tokenize([text]).to(DEVICE)
        with torch.no_grad():
            text_emb = self.model.encode_text(text_tokens)
            text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)
        
        # Get image embedding
        image = self.preprocess(
            Image.open(image_path).convert("RGB")
        ).unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            image_emb = self.model.encode_image(image)
            image_emb = image_emb / image_emb.norm(dim=-1, keepdim=True)
        
        # Combine embeddings with weighted average
        combined_emb = (text_weight * text_emb + (1 - text_weight) * image_emb)
        combined_emb = combined_emb / combined_emb.norm(dim=-1, keepdim=True)
        
        # Search with combined embedding
        _, idx = self.index.search(combined_emb.cpu().numpy().astype("float32"), top_k)
        return [self.metadata[i] for i in idx[0]]