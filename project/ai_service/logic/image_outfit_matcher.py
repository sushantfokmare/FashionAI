"""
Outfit matching logic - finds complementary fashion items
Uses two-stage selection:
1. CLIP-FAISS results for clothing (visually similar)
2. Full dataset with intelligent filtering for footwear and accessories
"""
from collections import defaultdict
import math
import random
from logic.outfit_rules import (
    TOPWEAR, BOTTOMWEAR, FOOTWEAR, ACCESSORIES
)


def get_complementary_colors(base_color: str) -> list:
    """Get colors that create impressive combinations with the base color"""
    color_matches = {
        "black": ["white", "grey", "silver", "red", "burgundy", "navy blue", "beige"],
        "navy blue": ["white", "beige", "grey", "brown", "burgundy"],
        "charcoal": ["white", "grey", "beige", "blue"],
        "white": ["black", "navy blue", "grey", "blue", "burgundy", "brown", "beige"],
        "beige": ["white", "brown", "navy blue", "olive", "burgundy"],
        "cream": ["brown", "navy blue", "olive", "burgundy"],
        "grey": ["white", "black", "navy blue", "burgundy", "charcoal"],
        "brown": ["beige", "white", "cream", "navy blue", "olive"],
        "olive": ["beige", "brown", "white", "cream"],
        "blue": ["white", "beige", "grey", "brown", "navy blue"],
        "red": ["black", "white", "grey", "navy blue"],
        "burgundy": ["black", "white", "grey", "beige", "navy blue"],
        "maroon": ["beige", "grey", "white", "black"],
        "pink": ["white", "grey", "black", "navy blue"],
        "purple": ["white", "grey", "black", "silver"],
        "green": ["white", "beige", "brown", "black", "navy blue"],
        "yellow": ["white", "navy blue", "grey", "brown"],
        "orange": ["navy blue", "brown", "beige", "white"],
    }
    
    base_lower = base_color.lower()
    for color, matches in color_matches.items():
        if color in base_lower:
            return matches
    
    return ["white", "black", "grey", "navy blue", "beige"]


def find_matching_footwear(full_dataset: list, anchor_item: dict, limit: int = 6) -> list:
    """
    Find matching footwear from full dataset using intelligent color coordination
    
    Args:
        full_dataset: Complete dataset
        anchor_item: The anchor item to match against
        limit: Maximum number of items to return
    
    Returns:
        List of matching footwear items
    """
    anchor_color = anchor_item.get("color", "white")
    anchor_gender = anchor_item.get("gender", "")
    complementary_colors = get_complementary_colors(anchor_color)
    
    # Get all footwear for same gender
    footwear = [
        item for item in full_dataset
        if item.get("main_category") in FOOTWEAR or item.get("sub_category") in FOOTWEAR
    ]
    
    # Filter by gender if available
    if anchor_gender:
        footwear = [item for item in footwear if item.get("gender") == anchor_gender]
    
    # Prioritize complementary colors, especially neutrals
    matched_footwear = []
    neutral_colors = ["white", "black", "grey", "beige", "navy blue", "brown"]
    
    # First: neutral complementary colors
    for item in footwear:
        item_color = item.get("color", "").lower()
        if any(neutral in item_color for neutral in neutral_colors):
            if any(comp.lower() in item_color for comp in complementary_colors):
                matched_footwear.append(item)
                if len(matched_footwear) >= limit:
                    break
    
    # Second: any complementary colors
    if len(matched_footwear) < limit:
        for item in footwear:
            if item not in matched_footwear:
                item_color = item.get("color", "").lower()
                if any(comp.lower() in item_color for comp in complementary_colors):
                    matched_footwear.append(item)
                    if len(matched_footwear) >= limit:
                        break
    
    # Third: any footwear if still not enough
    if len(matched_footwear) < limit:
        for item in footwear:
            if item not in matched_footwear:
                matched_footwear.append(item)
                if len(matched_footwear) >= limit:
                    break
    
    return matched_footwear[:limit]


def find_matching_accessories(full_dataset: list, anchor_item: dict, limit: int = 6) -> list:
    """
    Find matching accessories from full dataset using intelligent color coordination
    
    Args:
        full_dataset: Complete dataset
        anchor_item: The anchor item to match against
        limit: Maximum number of items to return
    
    Returns:
        List of matching accessory items
    """
    anchor_color = anchor_item.get("color", "white")
    anchor_gender = anchor_item.get("gender", "")
    complementary_colors = get_complementary_colors(anchor_color)
    
    # Get all accessories for same gender
    accessories = [
        item for item in full_dataset
        if item.get("main_category") in ACCESSORIES or item.get("sub_category") in ACCESSORIES
    ]
    
    # Filter by gender if available
    if anchor_gender:
        accessories = [item for item in accessories if item.get("gender") == anchor_gender]
    
    # Shuffle for variety
    random.shuffle(accessories)
    
    matched_accessories = []
    
    # Prioritize complementary colors
    for item in accessories:
        item_color = item.get("color", "").lower()
        if any(comp.lower() in item_color for comp in complementary_colors):
            matched_accessories.append(item)
            if len(matched_accessories) >= limit:
                break
    
    # Fill with any accessories if needed
    if len(matched_accessories) < limit:
        for item in accessories:
            if item not in matched_accessories:
                matched_accessories.append(item)
                if len(matched_accessories) >= limit:
                    break
    
    return matched_accessories[:limit]


def clean_item(item: dict) -> dict:
    """Clean item metadata for JSON serialization"""
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


def match_outfit_from_image(anchor_item: dict, similar_items: list, full_dataset: list = None, limit: int = 6):
    """
    Match complete outfit based on an anchor item using two-stage selection.
    
    Stage 1: Use FAISS similar_items for clothing (visually similar)
    Stage 2: Use full_dataset for footwear and accessories (complementary selection)
    
    Args:
        anchor_item: The main item from uploaded image (already cleaned)
        similar_items: FAISS search results (list of similar items)
        full_dataset: Complete dataset for footwear/accessories selection (optional)
        limit: Maximum items per category (default: 6)
    
    Returns:
        Dictionary with outfit categories:
        {
            "Topwear": [...],
            "Bottomwear": [...],
            "Footwear": [...],
            "Accessories": [...]
        }
    """
    outfit = defaultdict(list)

    # Get anchor item properties (with fallbacks for missing data)
    anchor_category = anchor_item.get("sub_category", "").strip()
    anchor_gender = anchor_item.get("gender", "").strip().lower()
    anchor_season = anchor_item.get("season", "").strip().lower()

    # ===== STAGE 1: Get clothing from FAISS results =====
    for item in similar_items:
        # Skip the anchor item itself
        if item.get("id") == anchor_item.get("id"):
            continue

        # Get item properties
        item_gender = item.get("gender", "").strip().lower()
        item_season = item.get("season", "").strip().lower()
        sub_cat = item.get("sub_category", "").strip()

        # Filter by gender (if available)
        if anchor_gender and item_gender and item_gender != anchor_gender:
            continue

        # Prefer same season but don't enforce strictly
        season_match = (not anchor_season or not item_season or 
                       item_season == anchor_season or 
                       anchor_season == "all seasons" or 
                       item_season == "all seasons")

        # If uploaded image is TOPWEAR - get bottoms from FAISS
        if anchor_category in TOPWEAR:
            if sub_cat in BOTTOMWEAR and len(outfit["Bottomwear"]) < limit:
                outfit["Bottomwear"].append(item)

        # If uploaded image is BOTTOMWEAR - get tops from FAISS
        elif anchor_category in BOTTOMWEAR:
            if sub_cat in TOPWEAR and len(outfit["Topwear"]) < limit:
                outfit["Topwear"].append(item)

        # If uploaded image is FOOTWEAR - get clothing from FAISS
        elif anchor_category in FOOTWEAR:
            if sub_cat in TOPWEAR and len(outfit["Topwear"]) < limit:
                outfit["Topwear"].append(item)
            elif sub_cat in BOTTOMWEAR and len(outfit["Bottomwear"]) < limit:
                outfit["Bottomwear"].append(item)

        # If uploaded image is ACCESSORY - get clothing from FAISS
        elif anchor_category in ACCESSORIES:
            if sub_cat in TOPWEAR and len(outfit["Topwear"]) < limit:
                outfit["Topwear"].append(item)
            elif sub_cat in BOTTOMWEAR and len(outfit["Bottomwear"]) < limit:
                outfit["Bottomwear"].append(item)

    # ===== STAGE 2: Get footwear and accessories from full dataset =====
    if full_dataset:
        # Get footwear using intelligent color matching (unless anchor is footwear)
        if anchor_category not in FOOTWEAR:
            footwear_limit = limit if len(outfit["Footwear"]) == 0 else limit - len(outfit["Footwear"])
            if footwear_limit > 0:
                matched_footwear = find_matching_footwear(full_dataset, anchor_item, footwear_limit)
                outfit["Footwear"].extend(matched_footwear)
        
        # Get accessories using intelligent color matching (unless anchor is accessory)
        if anchor_category not in ACCESSORIES:
            accessories_limit = max(3, limit // 2)  # At least 3 accessories
            if len(outfit["Accessories"]) < accessories_limit:
                remaining = accessories_limit - len(outfit["Accessories"])
                matched_accessories = find_matching_accessories(full_dataset, anchor_item, remaining)
                outfit["Accessories"].extend(matched_accessories)

    return outfit
