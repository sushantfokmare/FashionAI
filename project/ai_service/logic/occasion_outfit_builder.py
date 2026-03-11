"""
Enhanced outfit builder for smart occasion styling
Improvements:
1. Safe type handling for CSV data (float/NaN values)
2. Better use of style parameter for consistent outfit aesthetics
3. Enhanced color coordination across all outfit pieces
4. Style-consistent accessory selection
5. Intelligent match scoring based on color harmony and completeness
6. Occasion-style alignment verification
"""

import math
import random
from typing import List, Dict, Any, Optional
from .occasion_rules import (
    TOPWEAR, BOTTOMWEAR, DRESSES, FOOTWEAR, ACCESSORIES,
    SEASON_COLORS, COLOR_MAP, OCCASION_STYLE_MAP
)
from .style_rules import get_footwear, get_accessories


def safe_str(value: Any, default: str = "") -> str:
    """Safely convert any value to string, handling None, NaN, and floats"""
    if value is None:
        return default
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return default
        return str(value)
    return str(value)


def get_complementary_colors(base_color: str) -> List[str]:
    """
    Enhanced color matching with comprehensive color palette
    Returns colors in priority order (most complementary first)
    """
    color_matches = {
        # Dark, sophisticated bases
        "black": ["white", "grey", "silver", "red", "burgundy", "navy blue", "beige", "cream", "olive"],
        "navy blue": ["white", "beige", "grey", "brown", "burgundy", "cream", "tan", "olive"],
        "charcoal": ["white", "grey", "beige", "blue", "light grey", "cream", "burgundy"],
        
        # Light, fresh bases
        "white": ["black", "navy blue", "grey", "blue", "burgundy", "brown", "beige", "red", "olive"],
        "beige": ["white", "brown", "navy blue", "olive", "burgundy", "cream", "tan", "charcoal"],
        "cream": ["brown", "navy blue", "olive", "burgundy", "beige", "tan", "charcoal", "grey"],
        
        # Classic neutrals
        "grey": ["white", "black", "navy blue", "burgundy", "charcoal", "beige", "pink", "light grey"],
        "brown": ["beige", "white", "cream", "navy blue", "olive", "tan", "burgundy", "khaki"],
        "olive": ["beige", "brown", "white", "cream", "tan", "navy blue", "burgundy", "khaki"],
        "tan": ["navy blue", "brown", "white", "olive", "beige", "burgundy", "cream"],
        
        # Bold statement colors
        "blue": ["white", "beige", "grey", "brown", "navy blue", "cream", "tan", "khaki"],
        "red": ["black", "white", "grey", "navy blue", "beige", "charcoal", "cream"],
        "burgundy": ["black", "white", "grey", "beige", "navy blue", "cream", "tan", "olive"],
        "maroon": ["beige", "grey", "white", "black", "cream", "tan", "navy blue"],
        
        # Soft, versatile colors
        "pink": ["white", "grey", "black", "navy blue", "beige", "burgundy"],
        "purple": ["white", "grey", "black", "silver", "beige", "navy blue"],
        "lavender": ["white", "grey", "beige", "navy blue", "burgundy", "silver"],
        "green": ["white", "beige", "brown", "black", "navy blue", "khaki", "cream"],
        "yellow": ["white", "navy blue", "grey", "brown", "beige", "olive"],
        "orange": ["navy blue", "brown", "beige", "white", "grey", "olive", "cream"],
        "mustard": ["navy blue", "grey", "white", "beige", "brown", "burgundy"],
        "teal": ["white", "beige", "grey", "navy blue", "brown", "cream"],
        "peach": ["grey", "white", "beige", "navy blue", "brown", "burgundy"],
        "khaki": ["white", "navy blue", "brown", "beige", "olive", "burgundy"],
    }
    
    base_lower = safe_str(base_color, "").lower()
    
    if not base_lower:
        return ["white", "black", "grey", "navy blue", "beige"]
    
    # Try exact match first
    if base_lower in color_matches:
        return color_matches[base_lower]
    
    # Try partial matches for complex colors (e.g., "light blue", "dark grey")
    for color, matches in color_matches.items():
        if color in base_lower or base_lower in color:
            return matches
    
    # Default: versatile neutrals
    return ["white", "black", "grey", "navy blue", "beige"]


def get_neutral_colors() -> List[str]:
    """Return list of neutral colors that work with most outfits"""
    return ["white", "black", "grey", "navy blue", "beige", "cream", "charcoal", "tan", "brown"]


def are_styles_compatible(style1: str, style2: str, occasion: str) -> bool:
    """
    Check if two style values are compatible for the given occasion
    
    Args:
        style1: First style
        style2: Second style
        occasion: Occasion type
        
    Returns:
        True if styles are compatible
    """
    s1 = safe_str(style1, "").lower()
    s2 = safe_str(style2, "").lower()
    
    if not s1 or not s2:
        return True  # Unknown styles are considered compatible
    
    # Exact match is always compatible
    if s1 == s2:
        return True
    
    # Define style compatibility groups
    style_groups = {
        "formal": ["formal", "business", "elegant", "professional", "classic"],
        "casual": ["casual", "streetwear", "relaxed", "everyday"],
        "sporty": ["sporty", "athletic", "active", "sports"],
        "elegant": ["elegant", "formal", "sophisticated", "fashion"],
        "minimal": ["minimal", "modern", "simple", "clean"],
    }
    
    # Check if both styles are in the same group
    for group in style_groups.values():
        if s1 in group and s2 in group:
            return True
    
    # Check occasion-specific compatibility
    expected_styles = OCCASION_STYLE_MAP.get(occasion, [])
    if expected_styles:
        # Both should match occasion styles
        s1_matches = any(exp in s1 for exp in expected_styles)
        s2_matches = any(exp in s2 for exp in expected_styles)
        return s1_matches and s2_matches
    
    return True


def calculate_color_harmony_score(color1: str, color2: str) -> int:
    """
    Calculate how well two colors work together (0-10 score)
    
    Args:
        color1: First color
        color2: Second color
        
    Returns:
        Score from 0-10
    """
    c1 = safe_str(color1, "").lower()
    c2 = safe_str(color2, "").lower()
    
    if not c1 or not c2:
        return 5  # Neutral score for missing colors
    
    # Same color = monochromatic (modern and stylish)
    if c1 == c2:
        return 8
    
    # Check if complementary
    c1_complements = get_complementary_colors(c1)
    if any(comp in c2 for comp in c1_complements):
        # Neutral complementary = highest score
        if c2 in get_neutral_colors():
            return 10
        return 9
    
    # Both neutral = classic and safe
    if c1 in get_neutral_colors() and c2 in get_neutral_colors():
        return 9
    
    # Default = acceptable but not optimal
    return 6


def find_matching_item(
    items: List[Dict], 
    base_color: str, 
    base_style: str,
    occasion: str,
    used_items: set, 
    prefer_neutral: bool = False
) -> Optional[Dict]:
    """
    Find an item that creates an impressive combination with base item
    Enhanced with style consistency checking
    
    Args:
        items: List of items to search through
        base_color: The base color to match against
        base_style: The base style to match against
        occasion: Occasion type for style compatibility
        used_items: Set of already used item IDs to avoid duplicates
        prefer_neutral: If True, prioritize neutral colors
        
    Returns:
        Best matching item or None
    """
    if not items:
        return None
    
    complementary = get_complementary_colors(base_color)
    neutral_colors = get_neutral_colors()
    
    # Score each item and pick the best
    scored_items = []
    
    for item in items:
        item_id = item.get("id") or item.get("image")
        if item_id in used_items:
            continue
        
        item_color = safe_str(item.get("color"), "")
        item_style = safe_str(item.get("style"), "")
        item_occasion = safe_str(item.get("occasion"), "")
        
        score = 0
        
        # Color scoring (0-50 points)
        color_harmony = calculate_color_harmony_score(base_color, item_color)
        score += color_harmony * 5
        
        # Neutral preference bonus (0-10 points)
        if prefer_neutral:
            if item_color.lower() in neutral_colors:
                score += 10
        
        # Style compatibility (0-30 points)
        if are_styles_compatible(base_style, item_style, occasion):
            score += 30
        
        # Occasion match bonus (0-10 points)
        if item_occasion.lower() == occasion.lower():
            score += 10
        elif occasion.lower() in item_occasion.lower():
            score += 5
        
        scored_items.append((score, item))
    
    if not scored_items:
        return None
    
    # Sort by score (highest first) and return best match
    scored_items.sort(key=lambda x: x[0], reverse=True)
    best_item = scored_items[0][1]
    item_id = best_item.get("id") or best_item.get("image")
    used_items.add(item_id)
    
    return best_item


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
                if any(color.lower() in safe_str(item.get("color"), "").lower() 
                      for color in preferred_colors)
            ]
    
    # Apply season filter
    if season != "all" and season in SEASON_COLORS:
        season_colors = SEASON_COLORS[season]
        if season_colors and filtered:
            filtered = [
                item for item in filtered
                if any(color.lower() in safe_str(item.get("color"), "").lower() 
                      for color in season_colors)
            ]
    
    return filtered if filtered else items  # Fallback to original if no matches


def filter_by_style(items: List[Dict], style_pref: str, occasion: str) -> List[Dict]:
    """
    Filter items by style preference and occasion alignment
    
    Args:
        items: Items to filter
        style_pref: User's style preference
        occasion: Occasion type
        
    Returns:
        Filtered items matching style/occasion
    """
    if not style_pref or style_pref == "any":
        return items
    
    # Get expected styles for this occasion
    expected_styles = OCCASION_STYLE_MAP.get(occasion, [])
    
    filtered = []
    for item in items:
        item_style = safe_str(item.get("style"), "").lower()
        
        # Match user's style preference
        if style_pref.lower() in item_style or item_style in style_pref.lower():
            filtered.append(item)
            continue
        
        # Match occasion-appropriate styles
        if any(exp_style in item_style for exp_style in expected_styles):
            filtered.append(item)
    
    return filtered if filtered else items  # Fallback if too restrictive


def build_outfits(
    results: List[Dict], 
    full_dataset: List[Dict],
    occasion: str,
    outfit_type: str, 
    gender: str,
    style: str = "any",
    color_pref: str = "any",
    season: str = "all"
) -> List[Dict]:
    """
    Build 3 complete outfit combinations with enhanced intelligence
    
    Improvements:
    - Safe type handling for all string fields
    - Better use of style parameter
    - Color harmony scoring
    - Style consistency across outfit pieces
    - Smarter accessory selection
    
    Args:
        results: List of fashion items from CLIP-FAISS (for clothing)
        full_dataset: Complete dataset (for footwear and accessories)
        occasion: Occasion type (casual, party, formal, sports)
        outfit_type: 'dress', 'top-bottom', or 'full-outfit'
        gender: 'male' or 'female'
        style: Style preference (casual, elegant, minimal, etc.)
        color_pref: Color preference filter
        season: Season filter
        
    Returns:
        List of 3 outfit dictionaries with enhanced matching
    """
    import logging
    logger = logging.getLogger(__name__)
    
    outfits = []
    
    # Normalize gender for dataset compatibility
    gender_key = "Men" if gender.lower() == "male" else "Women"
    
    logger.info(f"Building outfits - Occasion: {occasion}, Gender: {gender_key}, Style: {style}, Type: {outfit_type}")
    
    # ===== STAGE 1: Get clothing from FAISS results =====
    # Filter by gender
    gender_items = [
        item for item in results 
        if gender_key.lower() in safe_str(item.get("gender"), "").lower()
    ]
    
    logger.info(f"Filtered {len(gender_items)} items by gender from {len(results)} FAISS results")
    
    if not gender_items:
        logger.warning("No gender-specific items found, using all results")
        gender_items = results
    
    # Apply color and season filters
    gender_items = filter_by_color(gender_items, color_pref, season)
    
    # Apply style filter (NEW - better use of style parameter)
    gender_items = filter_by_style(gender_items, style, occasion)
    
    logger.info(f"After all filters: {len(gender_items)} clothing items")
    
    # Categorize clothing items
    tops = [i for i in gender_items if i.get("main_category") in TOPWEAR or i.get("sub_category") in TOPWEAR]
    bottoms = [i for i in gender_items if i.get("main_category") in BOTTOMWEAR or i.get("sub_category") in BOTTOMWEAR]
    dresses = [i for i in gender_items if i.get("main_category") in DRESSES or i.get("sub_category") in DRESSES]
    
    logger.info(f"Categories - Tops: {len(tops)}, Bottoms: {len(bottoms)}, Dresses: {len(dresses)}")
    
    # ===== STAGE 2: Get footwear and accessories from full dataset =====
    shoes = get_footwear(full_dataset, occasion, gender_key)
    accessories = get_accessories(full_dataset, occasion, gender_key)
    
    # Apply style filter to footwear and accessories (NEW)
    shoes = filter_by_style(shoes, style, occasion)
    accessories = filter_by_style(accessories, style, occasion)
    
    logger.info(f"Footwear: {len(shoes)}, Accessories: {len(accessories)}")
    
    # Fallback if needed
    if not shoes:
        logger.warning("No footwear found, using all footwear from dataset")
        shoes = [i for i in full_dataset if i.get("main_category") in FOOTWEAR and safe_str(i.get("gender")) == gender_key]
    if not accessories:
        logger.warning("No accessories found, using all accessories from dataset")
        accessories = [i for i in full_dataset if i.get("main_category") in ACCESSORIES and safe_str(i.get("gender")) == gender_key]
    
    # Handle edge cases
    if not tops and outfit_type != "dress":
        logger.error("No topwear items found")
        return []
    if outfit_type == "dress" and not dresses:
        logger.warning("No dresses found, switching to top-bottom")
        outfit_type = "top-bottom"
    
    # Shuffle for variety
    random.shuffle(tops)
    random.shuffle(bottoms)
    random.shuffle(dresses)
    random.shuffle(shoes)
    random.shuffle(accessories)
    
    # Build 3 outfits with enhanced matching
    for i in range(3):
        outfit = {}
        used_items = set()
        
        if outfit_type == "dress" and dresses:
            # Dress outfit
            dress = dresses[i] if i < len(dresses) else random.choice(dresses)
            used_items.add(dress.get("id") or dress.get("image"))
            
            base_color = safe_str(dress.get("color"), "white")
            base_style = safe_str(dress.get("style"), "")
            
            outfit["clothing"] = {
                "type": "dress",
                "dress": {
                    "name": safe_str(dress.get("description"), "Dress"),
                    "color": base_color,
                    "category": safe_str(dress.get("sub_category"), "Dress"),
                    "image": safe_str(dress.get("image"), "")
                }
            }
            
            # Match footwear with style consistency
            shoe = find_matching_item(shoes, base_color, base_style, occasion, used_items, prefer_neutral=True)
            if shoe:
                outfit["footwear"] = {
                    "name": safe_str(shoe.get("description"), "Shoes"),
                    "color": safe_str(shoe.get("color"), ""),
                    "category": safe_str(shoe.get("sub_category"), "Footwear"),
                    "image": safe_str(shoe.get("image"), "")
                }
            
            # Add 2-3 stylistically consistent accessories
            outfit["accessories"] = []
            max_accessories = min(3, len(accessories))
            for acc_idx in range(max_accessories):
                acc = find_matching_item(accessories, base_color, base_style, occasion, used_items, prefer_neutral=(acc_idx == 0))
                if acc:
                    outfit["accessories"].append({
                        "name": safe_str(acc.get("description"), "Accessory"),
                        "color": safe_str(acc.get("color"), ""),
                        "category": safe_str(acc.get("sub_category"), "Accessory"),
                        "image": safe_str(acc.get("image"), "")
                    })
        
        else:
            # Top + Bottom outfit with color harmony and style consistency
            top = tops[i] if i < len(tops) else (random.choice(tops) if tops else None)
            
            if top:
                used_items.add(top.get("id") or top.get("image"))
                base_color = safe_str(top.get("color"), "white")
                base_style = safe_str(top.get("style"), "")
                
                # Find matching bottom with style consistency
                bottom = find_matching_item(bottoms, base_color, base_style, occasion, used_items, prefer_neutral=True)
                
                if bottom:
                    outfit["clothing"] = {
                        "type": "top-bottom",
                        "top": {
                            "name": safe_str(top.get("description"), "Top"),
                            "color": base_color,
                            "category": safe_str(top.get("sub_category"), "Top"),
                            "image": safe_str(top.get("image"), "")
                        },
                        "bottom": {
                            "name": safe_str(bottom.get("description"), "Bottom"),
                            "color": safe_str(bottom.get("color"), ""),
                            "category": safe_str(bottom.get("sub_category"), "Bottom"),
                            "image": safe_str(bottom.get("image"), "")
                        }
                    }
                    
                    # Match footwear
                    shoe = find_matching_item(shoes, base_color, base_style, occasion, used_items, prefer_neutral=True)
                    if shoe:
                        outfit["footwear"] = {
                            "name": safe_str(shoe.get("description"), "Shoes"),
                            "color": safe_str(shoe.get("color"), ""),
                            "category": safe_str(shoe.get("sub_category"), "Footwear"),
                            "image": safe_str(shoe.get("image"), "")
                        }
                    
                    # Add accessories
                    outfit["accessories"] = []
                    max_accessories = min(3, len(accessories))
                    for acc_idx in range(max_accessories):
                        acc = find_matching_item(accessories, base_color, base_style, occasion, used_items, prefer_neutral=(acc_idx == 0))
                        if acc:
                            outfit["accessories"].append({
                                "name": safe_str(acc.get("description"), "Accessory"),
                                "color": safe_str(acc.get("color"), ""),
                                "category": safe_str(acc.get("sub_category"), "Accessory"),
                                "image": safe_str(acc.get("image"), "")
                            })
        
        # Enhanced match scoring based on color harmony and completeness
        match_score = 70  # Base score
        
        if "clothing" in outfit:
            match_score += 10  # Has clothing
            
            clothing = outfit["clothing"]
            if clothing.get("type") == "top-bottom" and "top" in clothing and "bottom" in clothing:
                # Calculate color harmony between top and bottom
                top_color = clothing["top"].get("color", "")
                bottom_color = clothing["bottom"].get("color", "")
                harmony_score = calculate_color_harmony_score(top_color, bottom_color)
                match_score += harmony_score  # 0-10 points for color harmony
            elif clothing.get("type") == "dress":
                match_score += 10  # Dress is complete
        
        if "footwear" in outfit:
            match_score += 5  # Essential piece
            # Bonus for color harmony with clothing
            if "clothing" in outfit:
                base_color = ""
                if outfit["clothing"].get("type") == "dress":
                    base_color = outfit["clothing"]["dress"].get("color", "")
                elif "top" in outfit["clothing"]:
                    base_color = outfit["clothing"]["top"].get("color", "")
                
                if base_color:
                    shoe_color = outfit["footwear"].get("color", "")
                    harmony = calculate_color_harmony_score(base_color, shoe_color)
                    match_score += harmony // 2  # 0-5 points
        
        # Accessories scoring
        num_accessories = len(outfit.get("accessories", []))
        if num_accessories >= 3:
            match_score += 10  # Perfect count
        elif num_accessories == 2:
            match_score += 7
        elif num_accessories == 1:
            match_score += 4
        
        # Ensure score is in reasonable range
        outfit["match"] = min(98, max(80, match_score))
        outfit["id"] = i + 1
        
        if "clothing" in outfit:
            outfits.append(outfit)
            logger.info(f"Outfit {i+1}: Match={outfit['match']}%, Footwear={('footwear' in outfit)}, Accessories={len(outfit.get('accessories', []))}")
    
    logger.info(f"Total outfits created: {len(outfits)}")
    return outfits

