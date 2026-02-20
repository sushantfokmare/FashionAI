"""
Build complete outfit combinations from dataset items using two-stage selection:
1. CLIP-FAISS results for clothing (visually similar items)
2. Full dataset with rule-based filtering for footwear and accessories
"""

import random
from typing import List, Dict, Any
from .occasion_rules import (
    TOPWEAR, BOTTOMWEAR, DRESSES, FOOTWEAR, ACCESSORIES,
    SEASON_COLORS, COLOR_MAP
)
from .style_rules import get_footwear, get_accessories


def get_complementary_colors(base_color: str) -> List[str]:
    """
    Get colors that create stunning, professional combinations with the base color
    Curated for impressive, fashion-forward looks
    """
    color_matches = {
        # Dark, sophisticated bases
        "black": ["white", "grey", "silver", "red", "burgundy", "navy blue", "beige"],
        "navy blue": ["white", "beige", "grey", "brown", "burgundy"],
        "charcoal": ["white", "grey", "beige", "blue"],
        
        # Light, fresh bases
        "white": ["black", "navy blue", "grey", "blue", "burgundy", "brown", "beige"],
        "beige": ["white", "brown", "navy blue", "olive", "burgundy"],
        "cream": ["brown", "navy blue", "olive", "burgundy"],
        
        # Classic neutrals
        "grey": ["white", "black", "navy blue", "burgundy", "charcoal"],
        "brown": ["beige", "white", "cream", "navy blue", "olive"],
        "olive": ["beige", "brown", "white", "cream"],
        
        # Bold statement colors
        "blue": ["white", "beige", "grey", "brown", "navy blue"],
        "red": ["black", "white", "grey", "navy blue"],
        "burgundy": ["black", "white", "grey", "beige", "navy blue"],
        "maroon": ["beige", "grey", "white", "black"],
        
        # Soft, versatile colors
        "pink": ["white", "grey", "black", "navy blue"],
        "purple": ["white", "grey", "black", "silver"],
        "green": ["white", "beige", "brown", "black", "navy blue"],
        "yellow": ["white", "navy blue", "grey", "brown"],
        "orange": ["navy blue", "brown", "beige", "white"],
    }
    
    base_lower = base_color.lower()
    
    # Find the best match for the base color
    for color, matches in color_matches.items():
        if color in base_lower:
            return matches
    
    # Default: versatile neutrals that work with anything
    return ["white", "black", "grey", "navy blue", "beige"]


def find_matching_item(items: List[Dict], base_color: str, used_items: set, prefer_neutral: bool = False) -> Dict:
    """
    Find an item that creates an impressive color combination with the base color
    
    Args:
        items: List of items to search through
        base_color: The base color to match against
        used_items: Set of already used item IDs to avoid duplicates
        prefer_neutral: If True, prioritize neutral colors for a sophisticated look
        
    Returns:
        Best matching item or None
    """
    if not items:
        return None
    
    complementary = get_complementary_colors(base_color)
    neutral_colors = ["white", "black", "grey", "beige", "navy blue", "brown"]
    
    # Priority 1: Neutral complementary colors (most versatile and impressive)
    if prefer_neutral:
        for item in items:
            item_id = item.get("id") or item.get("image")
            if item_id in used_items:
                continue
            item_color = item.get("color", "").lower()
            # Check if item has a neutral color that complements the base
            if any(neutral.lower() in item_color for neutral in neutral_colors):
                if any(comp.lower() in item_color for comp in complementary):
                    used_items.add(item_id)
                    return item
    
    # Priority 2: Exact complementary color match
    for item in items:
        item_id = item.get("id") or item.get("image")
        if item_id in used_items:
            continue
        item_color = item.get("color", "").lower()
        if any(comp.lower() in item_color for comp in complementary):
            used_items.add(item_id)
            return item
    
    # Priority 3: Same color family for monochromatic look
    for item in items:
        item_id = item.get("id") or item.get("image")
        if item_id in used_items:
            continue
        item_color = item.get("color", "").lower()
        if base_color.lower() in item_color:
            used_items.add(item_id)
            return item
    
    # Priority 4: Any unused item
    for item in items:
        item_id = item.get("id") or item.get("image")
        if item_id not in used_items:
            used_items.add(item_id)
            return item
    
    return None


def filter_by_color(items: List[Dict], color_pref: str, season: str) -> List[Dict]:
    """Filter items by color preference and season"""
    if color_pref == "any" and season == "all":
        return items
    
    filtered = items.copy()
    
    # Apply color preference filter
    if color_pref != "any" and color_pref in COLOR_MAP:
        preferred_colors = COLOR_MAP[color_pref]
        if preferred_colors:
            filtered = [
                item for item in filtered
                if any(color.lower() in item.get("color", "").lower() 
                      for color in preferred_colors)
            ]
    
    # Apply season filter
    if season != "all" and season in SEASON_COLORS:
        season_colors = SEASON_COLORS[season]
        if season_colors and filtered:
            filtered = [
                item for item in filtered
                if any(color.lower() in item.get("color", "").lower() 
                      for color in season_colors)
            ]
    
    return filtered if filtered else items  # Fallback to original if no matches


def build_outfits(
    results: List[Dict], 
    full_dataset: List[Dict],
    occasion: str,
    outfit_type: str, 
    gender: str,
    color_pref: str = "any",
    season: str = "all"
) -> List[Dict]:
    """
    Build 3 complete outfit combinations using two-stage selection:
    - Stage 1: Use FAISS results for clothing (top/bottom/dress)
    - Stage 2: Use full dataset with rules for footwear and accessories
    
    Args:
        results: List of fashion items from CLIP-FAISS (for clothing)
        full_dataset: Complete dataset (for footwear and accessories)
        occasion: Occasion type (casual, party, formal, sports)
        outfit_type: 'dress', 'top-bottom', or 'full-outfit'
        gender: 'male' or 'female'
        color_pref: Color preference filter
        season: Season filter
        
    Returns:
        List of 3 outfit dictionaries with clothing, footwear, and accessories
    """
    import logging
    logger = logging.getLogger(__name__)
    
    outfits = []
    
    # Normalize gender for dataset compatibility (case insensitive)
    gender_key = "Men" if gender.lower() == "male" else "Women"
    
    logger.info(f"Building outfits - Occasion: {occasion}, Gender: {gender_key}, Type: {outfit_type}")
    
    logger.info(f"Building outfits - Occasion: {occasion}, Gender: {gender_key}, Type: {outfit_type}")
    
    # ===== STAGE 1: Get clothing from FAISS results =====
    # Filter FAISS results by gender for clothing items
    gender_items = [
        item for item in results 
        if gender_key.lower() in item.get("gender", "").lower()
    ]
    
    logger.info(f"Filtered {len(gender_items)} clothing items for gender '{gender_key}' from {len(results)} FAISS results")
    
    # If no gender-specific items, use all
    if not gender_items:
        logger.warning(f"No gender-specific items found, using all {len(results)} items")
        gender_items = results
    
    # Apply color and season filters to clothing
    gender_items = filter_by_color(gender_items, color_pref, season)
    
    logger.info(f"After color/season filter: {len(gender_items)} clothing items")
    
    # Categorize CLOTHING items only (from FAISS results)
    tops = [i for i in gender_items if i.get("main_category") in TOPWEAR or i.get("sub_category") in TOPWEAR]
    bottoms = [i for i in gender_items if i.get("main_category") in BOTTOMWEAR or i.get("sub_category") in BOTTOMWEAR]
    dresses = [i for i in gender_items if i.get("main_category") in DRESSES or i.get("sub_category") in DRESSES]
    
    logger.info(f"Clothing categories - Tops: {len(tops)}, Bottoms: {len(bottoms)}, Dresses: {len(dresses)}")
    
    # ===== STAGE 2: Get footwear and accessories from full dataset =====
    # Use rule-based filtering on full dataset for complementary items
    shoes = get_footwear(full_dataset, occasion, gender_key)
    accessories = get_accessories(full_dataset, occasion, gender_key)
    
    logger.info(f"Rule-based selection - Footwear: {len(shoes)}, Accessories: {len(accessories)}")
    
    # If rule-based selection returns nothing, fall back to any items from dataset
    if not shoes:
        logger.warning("No footwear from rules, using all footwear from dataset")
        shoes = [i for i in full_dataset if i.get("main_category") in FOOTWEAR and i.get("gender") == gender_key]
    if not accessories:
        logger.warning("No accessories from rules, using all accessories from dataset")
        accessories = [i for i in full_dataset if i.get("main_category") in ACCESSORIES and i.get("gender") == gender_key]
    
    # Final check - if still no items in critical categories, we can't build outfits
    if not tops and outfit_type != "dress":
        logger.error("No topwear items found - cannot build top-bottom outfits")
        return []
    if outfit_type == "dress" and not dresses:
        logger.error("No dresses found - cannot build dress outfits")
        # Fall back to top-bottom if no dresses
        outfit_type = "top-bottom"
    if not shoes:
        logger.warning("No footwear found - outfits will be incomplete")
        # Create empty shoes list to avoid errors, outfits will just not have footwear initially
        shoes = []
    
    # Shuffle to get variety
    random.shuffle(tops)
    random.shuffle(bottoms)
    random.shuffle(dresses)
    random.shuffle(shoes)
    random.shuffle(accessories)
    
    # Build 3 outfit combinations with intelligent color coordination
    for i in range(3):
        outfit = {}
        used_items = set()  # Track used items to avoid duplicates
        
        if outfit_type == "dress" and dresses:
            # Dress outfit - elegant and complete
            dress = dresses[i] if i < len(dresses) else random.choice(dresses)
            used_items.add(dress.get("id") or dress.get("image"))
            
            base_color = dress.get("color", "white")
            
            outfit["clothing"] = {
                "type": "dress",
                "dress": {
                    "name": dress.get("description", "Dress"),
                    "color": base_color,
                    "category": dress.get("sub_category", "Dress"),
                    "image": dress.get("image", "")
                }
            }
            
            # Match footwear to dress color - prefer neutral for sophisticated look
            shoe = find_matching_item(shoes, base_color, used_items, prefer_neutral=True)
            if shoe:
                outfit["footwear"] = {
                    "name": shoe.get("description", "Shoes"),
                    "color": shoe.get("color", ""),
                    "category": shoe.get("sub_category", "Footwear"),
                    "image": shoe.get("image", "")
                }
            
            # Add 2-3 well-coordinated accessories
            outfit["accessories"] = []
            max_accessories = min(3, len(accessories))
            for _ in range(max_accessories):
                acc = find_matching_item(accessories, base_color, used_items, prefer_neutral=False)
                if acc:
                    outfit["accessories"].append({
                        "name": acc.get("description", "Accessory"),
                        "color": acc.get("color", ""),
                        "category": acc.get("sub_category", "Accessory"),
                        "image": acc.get("image", "")
                    })
        
        else:
            # Top + Bottom outfit with professional color coordination
            top = tops[i] if i < len(tops) else (random.choice(tops) if tops else None)
            
            if top:
                used_items.add(top.get("id") or top.get("image"))
                base_color = top.get("color", "white")
                
                # Find matching bottom - prefer neutrals for versatile, impressive looks
                bottom = find_matching_item(bottoms, base_color, used_items, prefer_neutral=True)
                
                if bottom:
                    outfit["clothing"] = {
                        "type": "top-bottom",
                        "top": {
                            "name": top.get("description", "Top"),
                            "color": base_color,
                            "category": top.get("sub_category", "Top"),
                            "image": top.get("image", "")
                        },
                        "bottom": {
                            "name": bottom.get("description", "Bottom"),
                            "color": bottom.get("color", ""),
                            "category": bottom.get("sub_category", "Bottom"),
                            "image": bottom.get("image", "")
                        }
                    }
                    
                    # Match footwear to outfit - prefer neutral
                    shoe = find_matching_item(shoes, base_color, used_items, prefer_neutral=True)
                    if shoe:
                        outfit["footwear"] = {
                            "name": shoe.get("description", "Shoes"),
                            "color": shoe.get("color", ""),
                            "category": shoe.get("sub_category", "Footwear"),
                            "image": shoe.get("image", "")
                        }
                    
                    # Add 2-3 curated accessories that complete the look
                    outfit["accessories"] = []
                    max_accessories = min(3, len(accessories))
                    for acc_idx in range(max_accessories):
                        # For first accessory, prefer neutral for cohesion
                        # For others, allow more variety
                        prefer_neutral_acc = (acc_idx == 0)
                        acc = find_matching_item(accessories, base_color, used_items, prefer_neutral=prefer_neutral_acc)
                        if acc:
                            outfit["accessories"].append({
                                "name": acc.get("description", "Accessory"),
                                "color": acc.get("color", ""),
                                "category": acc.get("sub_category", "Accessory"),
                                "image": acc.get("image", "")
                            })
        
        # Calculate intelligent match score based on outfit completeness and quality
        match_score = 75  # Base score
        
        if "clothing" in outfit:
            match_score += 10  # Has main clothing items
            
            # Bonus for complete clothing (top+bottom or dress)
            clothing = outfit["clothing"]
            if clothing.get("type") == "top-bottom" and "top" in clothing and "bottom" in clothing:
                match_score += 5  # Complete top-bottom combo
            elif clothing.get("type") == "dress":
                match_score += 5  # Dress is inherently complete
        
        if "footwear" in outfit:
            match_score += 5  # Essential for complete look
        
        # Accessories quality scoring
        num_accessories = len(outfit.get("accessories", []))
        if num_accessories >= 3:
            match_score += 8  # Perfect accessory count
        elif num_accessories == 2:
            match_score += 6  # Good accessory count
        elif num_accessories == 1:
            match_score += 3  # Minimal accessories
        
        # Ensure score is in reasonable range (85-98 for impressive looks)
        outfit["match"] = min(98, max(85, match_score))
        outfit["id"] = i + 1
        
        # Only add outfit if it has clothing (footwear and accessories enhance the look)
        if "clothing" in outfit:
            outfits.append(outfit)
            logger.info(f"Built outfit {i+1}: Match={outfit['match']}%, Footwear={('footwear' in outfit)}, Accessories={len(outfit.get('accessories', []))}")
    
    logger.info(f"Total outfits created: {len(outfits)}")
    return outfits

