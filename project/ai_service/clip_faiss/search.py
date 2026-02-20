import clip
import torch
import faiss
import numpy as np
from PIL import Image
from pathlib import Path

# =====================
# LOAD
# =====================
device = "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Use paths relative to this file's location
BASE_DIR = Path(__file__).parent
INDEX_PATH = BASE_DIR / "index.faiss"
META_PATH = BASE_DIR / "meta.npy"

index = faiss.read_index(str(INDEX_PATH))
metadata = np.load(str(META_PATH), allow_pickle=True)

# =====================
# TEXT SEARCH
# =====================
def search_by_text(query, top_k=30):
    text = clip.tokenize([query]).to(device)

    with torch.no_grad():
        text_emb = model.encode_text(text)
        text_emb = text_emb / text_emb.norm(dim=-1, keepdim=True)

    scores, indices = index.search(text_emb.cpu().numpy().astype("float32"), top_k)

    results = [metadata[i] for i in indices[0]]
    return results

# =====================
# IMAGE SEARCH
# =====================
def search_by_image(image_path, top_k=30):
    image = preprocess(Image.open(image_path).convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        img_emb = model.encode_image(image)
        img_emb = img_emb / img_emb.norm(dim=-1, keepdim=True)

    scores, indices = index.search(img_emb.cpu().numpy().astype("float32"), top_k)

    results = [metadata[i] for i in indices[0]]
    return results
