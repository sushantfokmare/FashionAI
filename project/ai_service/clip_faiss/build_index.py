import clip
import torch
import faiss
import pandas as pd
import numpy as np
from PIL import Image
from pathlib import Path
from tqdm import tqdm

# =====================
# PATHS
# =====================
DATASET_ROOT = Path("ai_service/data/fashion_dataset")
IMAGES_DIR = DATASET_ROOT / "images"
CSV_PATH = DATASET_ROOT / "metadata.csv"

INDEX_PATH = Path("ai_service/clip_faiss/index.faiss")
META_OUT = Path("ai_service/clip_faiss/meta.npy")

# =====================
# LOAD CLIP
# =====================
device = "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# =====================
# LOAD METADATA
# =====================
df = pd.read_csv(CSV_PATH)

embeddings = []
metadata = []

# =====================
# IMAGE EMBEDDING
# =====================
for _, row in tqdm(df.iterrows(), total=len(df)):
    img_path = IMAGES_DIR / row["image"]
    if not img_path.exists():
        continue

    image = preprocess(Image.open(img_path).convert("RGB")).unsqueeze(0).to(device)

    with torch.no_grad():
        emb = model.encode_image(image)
        emb = emb / emb.norm(dim=-1, keepdim=True)

    embeddings.append(emb.cpu().numpy()[0])
    metadata.append(row.to_dict())

# =====================
# FAISS INDEX
# =====================
embeddings = np.array(embeddings).astype("float32")
dimension = embeddings.shape[1]

index = faiss.IndexFlatIP(dimension)  # cosine similarity
index.add(embeddings)

faiss.write_index(index, str(INDEX_PATH))
np.save(META_OUT, metadata)

print("✅ CLIP embeddings + FAISS index built successfully")
