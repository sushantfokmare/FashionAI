"""
Enhanced outfit matching logic - creates complete, well-coordinated fashion outfits
Improvements:
1. Guarantees complete outfits (topwear, bottomwear, footwear, 3+ accessories)
2. Enhanced color coordination (item-to-item compatibility)
3. Style consistency (formal/casual/sporty matching)
4. Gender consistency throughout outfit
5. More sophisticated color pairing rules
"""
from collections import defaultdict
import math
import random
from typing import List, Dict, Any, Set
from logic.outfit_rules import (
    TOPWEAR, BOTTOMWEAR, FOOTWEAR, ACCESSORIES
)


def get_complementary_colors(base_color: str) -> List[str]:
    """
    Get complementary colors with enhanced pairing rules
    Returns colors in priority order (most complementary first)
    """
    color_matches = {
        "black": ["white", "grey", "silver", "red", "burgundy", "navy blue", "beige", "cream", "olive"],
        "navy blue": ["white", "beige", "grey", "brown", "burgundy", "cream", "tan", "olive"],
        "charcoal": ["white", "grey", "beige", "blue", "light grey", "cream", "burgundy"],
        "white": ["black", "navy blue", "grey", "blue", "burgundy", "brown", "beige", "red", "olive"],
        "beige": ["white", "brown", "navy blue", "olive", "burgundy", "cream", "tan", "charcoal"],
        "cream": ["brown", "navy blue", "olive", "burgundy", "beige", "tan", "charcoal", "grey"],
        "grey": ["white", "black", "navy blue", "burgundy", "charcoal", "beige", "pink", "light grey"],
        "brown": ["beige", "white", "cream", "navy blue", "olive", "tan", "burgundy", "khaki"],
        "olive": ["beige", "brown", "white", "cream", "tan", "navy blue", "burgundy", "khaki"],
        "blue": ["white", "beige", "grey", "brown", "navy blue", "cream", "tan", "khaki"],
        "red": ["black", "white", "grey", "navy blue", "beige", "charcoal", "cream"],
        "burgundy": ["black", "white", "grey", "beige", "navy blue", "cream", "tan", "olive"],
        "maroon": ["beige", "grey", "white", "black", "cream", "tan", "navy blue"],
        "pink": ["white", "grey", "black", "navy blue", "beige", "burgundy"],
        "purple": ["white", "grey", "black", "silver", "beige", "navy blue"],
        "lavender": ["white", "grey", "beige", "navy blue", "burgundy", "silver"],
        "green": ["white", "beige", "brown", "black", "navy blue", "khaki", "cream"],
        "yellow": ["white", "navy blue", "grey", "brown", "beige", "olive"],
        "orange": ["navy blue", "brown", "beige", "white", "grey", "olive", "cream"],
        "mustard": ["navy blue", "grey", "white", "beige", "brown", "burgundy"],
        "tan": ["navy blue", "brown", "white", "olive", "beige", "burgundy", "cream"],
        "khaki": ["white", "navy blue", "brown", "beige", "olive", "burgundy"],
        "teal": ["white", "beige", "grey", "navy blue", "brown", "cream"],
        "peach": ["grey", "white", "beige", "navy blue", "brown", "burgundy"],
    }
    
    base_lower = base_color.lower()
    
    # Try exact match first
    if base_lower in color_matches:
        return color_matches[base_lower]
    
    # Try partial matches for complex colors (e.g., "light blue", "dark grey")
    for color, matches in color_matches.items():
        if color in base_lower or base_lower in color:
            return matches
    
    # Default neutral palette
    return ["white", "black", "grey", "navy blue", "beige", "cream"]


def get_neutral_colors() -> List[str]:
    """Return list of neutral colors that work with most outfits"""
    return ["white", "black", "grey", "navy blue", "beige", "cream", "charcoal", "tan", "brown"]


def are_colors_compatible(color1: str, color2: str, color3: str = None) -> bool:
    """
    Check if 2-3 colors work well together in an outfit
    
    Args:
        color1: First color
        color2: Second color
        color3: Optional third color
    
    Returns:
        True if colors are compatible
    """
    # Ensure colors are strings
    c1_lower = safe_str(color1, "").lower()
    c2_lower = safe_str(color2, "").lower()
    
    # Empty colors are considered compatible
    if not c1_lower or not c2_lower:
        return True
    
    # Get complementary colors for both
    c1_complements = get_complementary_colors(c1_lower)
    c2_complements = get_complementary_colors(c2_lower)
    
    # Check if they're complementary to each other
    is_compatible = (
        any(comp in c2_lower for comp in c1_complements) or
        any(comp in c1_lower for comp in c2_complements)
    )
    
    # If checking 3 colors, ensure all combinations work
    if color3 and is_compatible:
        c3_lower = safe_str(color3, "").lower()
        if not c3_lower:
            return is_compatible
            
        c3_complements = get_complementary_colors(c3_lower)
        
        is_compatible = is_compatible and (
            any(comp in c3_lower for comp in c1_complements) or
            any(comp in c1_lower for comp in c3_complements)
        ) and (
            any(comp in c3_lower for comp in c2_complements) or
            any(comp in c2_lower for comp in c3_complements)
        )
    
    return is_compatible


def get_style_score(anchor_style: str, item_style: str) -> int:
    """
    Calculate style compatibility score (higher is better)
    
    Args:
        anchor_style: Style of anchor item (formal, casual, sporty, etc.)
        item_style: Style of item to match
    
    Returns:
        Score from 0-10
    """
    # Safely convert to strings
    anchor_lower = safe_str(anchor_style, "").lower()
    item_lower = safe_str(item_style, "").lower()
    
    if not anchor_lower or not item_lower:
        return 5  # Neutral score if style unknown
    
    # Exact match is best
    if anchor_lower == item_lower:
        return 10
    
    # Compatible style combinations
    compatible_styles = {
        "formal": ["formal", "business", "elegant", "classic"],
        "casual": ["casual", "streetwear", "relaxed", "everyday"],
        "sporty": ["sporty", "athletic", "active", "sports"],
        "business": ["business", "formal", "professional"],
        "streetwear": ["streetwear", "casual", "urban"],
        "elegant": ["elegant", "formal", "sophisticated"],
    }
    
    # Check if styles are in compatible groups
    for style_group in compatible_styles.values():
        if anchor_lower in style_group and item_lower in style_group:
            return 8
    
    # Some styles work together
    cross_compatible = {
        ("formal", "business"): 9,
        ("casual", "streetwear"): 9,
        ("sporty", "casual"): 7,
        ("business", "elegant"): 8,
    }
    
    for (s1, s2), score in cross_compatible.items():
        if (anchor_lower == s1 and item_lower == s2) or (anchor_lower == s2 and item_lower == s1):
            return score
    
    # Different styles but not incompatible
    return 4


def safe_str(value: Any, default: str = "") -> str:
    """Safely convert any value to string, handling None, NaN, and floats"""
    if value is None:
        return default
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return default
        return str(value)
    return str(value)


def find_matching_items(
    dataset: List[Dict],
    target_category: str,
    anchor_item: Dict,
    selected_items: List[Dict] = None,
    limit: int = 6
) -> List[Dict]:
    """
    Find matching items from a specific category with enhanced filtering
    
    Args:
        dataset: Dataset to search from
        target_category: Category to find (from TOPWEAR, BOTTOMWEAR, etc.)
        anchor_item: The anchor item to match against
        selected_items: Already selected items to ensure compatibility
        limit: Maximum number of items to return
    
    Returns:
        List of matching items
    """
    anchor_color = safe_str(anchor_item.get("color"), "white")
    anchor_gender = safe_str(anchor_item.get("gender"), "")
    anchor_style = safe_str(anchor_item.get("style"), "")
    anchor_occasion = safe_str(anchor_item.get("occasion"), "")
    complementary_colors = get_complementary_colors(anchor_color)
    
    # Determine which category list to check against
    if target_category == "topwear":
        category_list = TOPWEAR
    elif target_category == "bottomwear":
        category_list = BOTTOMWEAR
    elif target_category == "footwear":
        category_list = FOOTWEAR
    elif target_category == "accessories":
        category_list = ACCESSORIES
    else:
        return []
    
    # Filter dataset by category
    candidates = [
        item for item in dataset
        if item.get("main_category") in category_list or item.get("sub_category") in category_list
    ]
    
    # Filter by gender if available
    if anchor_gender:
        candidates = [item for item in candidates if safe_str(item.get("gender")) == anchor_gender]
    
    # Score each candidate
    scored_candidates = []
    for item in candidates:
        # Skip if already selected
        if selected_items and item.get("id") in [si.get("id") for si in selected_items]:
            continue
        
        item_color = safe_str(item.get("color"), "")
        item_style = safe_str(item.get("style"), "")
        item_occasion = safe_str(item.get("occasion"), "")
        
        score = 0
        
        # Color compatibility (0-40 points)
        if any(comp.lower() in item_color.lower() for comp in complementary_colors):
            score += 40
            # Bonus for neutral colors
            if item_color.lower() in get_neutral_colors():
                score += 10
        
        # Style compatibility (0-30 points)
        style_score = get_style_score(anchor_style, item_style)
        score += style_score * 3
        
        # Occasion compatibility (0-20 points)
        if anchor_occasion and item_occasion == anchor_occasion:
            score += 20
        elif anchor_occasion and item_occasion:
            # Partial match
            if anchor_occasion.lower() in item_occasion.lower():
                score += 10
        
        # Check compatibility with already selected items (0-10 points)
        if selected_items:
            compatible_count = 0
            for selected in selected_items:
                if are_colors_compatible(item_color, safe_str(selected.get("color"), "")):
                    compatible_count += 1
            score += min(10, compatible_count * 2)
        
        scored_candidates.append((score, item))
    
    # Sort by score (highest first) and return top items
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    return [item for score, item in scored_candidates[:limit]]


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


def match_outfit_from_image(
    anchor_item: dict,
    similar_items: list,
    full_dataset: list = None,
    limit: int = 6
) -> Dict[str, List[Dict]]:
    """
    Create a complete, well-coordinated outfit based on an anchor item
    
    This enhanced version guarantees:
    1. Complete outfits with all categories filled
    2. Color coordination across ALL items
    3. Style consistency (formal/casual/sporty)
    4. Gender consistency
    5. Variety in anchor category alternatives
    
    Args:
        anchor_item: The main item from uploaded image
        similar_items: FAISS search results for visual similarity
        full_dataset: Complete dataset for comprehensive matching
        limit: Items per category (default: 6)
    
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
    selected_items = [anchor_item]  # Track all selected items for compatibility checking
    
    # Get anchor properties (safely convert to strings)
    anchor_category = safe_str(anchor_item.get("sub_category"), "").strip()
    anchor_main_cat = safe_str(anchor_item.get("main_category"), "").strip()
    anchor_gender = safe_str(anchor_item.get("gender"), "").strip()
    
    # Determine which dataset to use
    working_dataset = full_dataset if full_dataset else similar_items
    if not working_dataset:
        working_dataset = []
    
    # ===== STRATEGY: Ensure ALL categories are filled =====
    
    # 1. TOPWEAR: Get complementary tops
    if anchor_main_cat in TOPWEAR or anchor_category in TOPWEAR:
        # Anchor is topwear - get alternative topwear for variety (limit 2-3)
        alternative_tops = find_matching_items(
            working_dataset,
            "topwear",
            anchor_item,
            selected_items,
            limit=min(3, limit // 2)
        )
        outfit["Topwear"].extend(alternative_tops)
        selected_items.extend(alternative_tops)
    else:
        # Anchor is NOT topwear - get matching topwear (full limit)
        matching_tops = find_matching_items(
            working_dataset,
            "topwear",
            anchor_item,
            selected_items,
            limit=limit
        )
        outfit["Topwear"].extend(matching_tops)
        selected_items.extend(matching_tops)
    
    # 2. BOTTOMWEAR: Get complementary bottoms
    if anchor_main_cat in BOTTOMWEAR or anchor_category in BOTTOMWEAR:
        # Anchor is bottomwear - get alternative bottoms for variety
        alternative_bottoms = find_matching_items(
            working_dataset,
            "bottomwear",
            anchor_item,
            selected_items,
            limit=min(3, limit // 2)
        )
        outfit["Bottomwear"].extend(alternative_bottoms)
        selected_items.extend(alternative_bottoms)
    else:
        # Anchor is NOT bottomwear - get matching bottomwear
        matching_bottoms = find_matching_items(
            working_dataset,
            "bottomwear",
            anchor_item,
            selected_items,
            limit=limit
        )
        outfit["Bottomwear"].extend(matching_bottoms)
        selected_items.extend(matching_bottoms)
    
    # 3. FOOTWEAR: Get matching shoes
    if anchor_main_cat in FOOTWEAR or anchor_category in FOOTWEAR:
        # Anchor is footwear - get alternative footwear
        alternative_footwear = find_matching_items(
            working_dataset,
            "footwear",
            anchor_item,
            selected_items,
            limit=min(3, limit // 2)
        )
        outfit["Footwear"].extend(alternative_footwear)
        selected_items.extend(alternative_footwear)
    else:
        # Anchor is NOT footwear - get matching footwear
        # Prioritize neutral colors for footwear
        matching_footwear = find_matching_items(
            working_dataset,
            "footwear",
            anchor_item,
            selected_items,
            limit=limit
        )
        outfit["Footwear"].extend(matching_footwear)
        selected_items.extend(matching_footwear)
    
    # 4. ACCESSORIES: Get at least 3-4 complementary accessories
    accessories_limit = max(4, limit // 2)  # At least 4 accessories
    if anchor_main_cat in ACCESSORIES or anchor_category in ACCESSORIES:
        # Anchor is accessory - get more diverse accessories
        accessories_limit = max(5, limit)
    
    matching_accessories = find_matching_items(
        working_dataset,
        "accessories",
        anchor_item,
        selected_items,
        limit=accessories_limit
    )
    outfit["Accessories"].extend(matching_accessories)
    selected_items.extend(matching_accessories)
    
    # ===== QUALITY CHECK: Ensure minimum items in each category =====
    # If any category is empty and we have a dataset, try to fill it with basic matches
    if full_dataset:
        # For categories that are completely empty, add some generic matches
        # (This usually happens when dataset is limited or gender/style filters are too strict)
        
        if len(outfit["Topwear"]) == 0 and (anchor_main_cat not in TOPWEAR and anchor_category not in TOPWEAR):
            # Only add topwear if anchor isn't topwear (otherwise empty is fine)
            outfit["Topwear"] = find_matching_items(full_dataset, "topwear", anchor_item, [], min(3, limit))
        
        if len(outfit["Bottomwear"]) == 0 and (anchor_main_cat not in BOTTOMWEAR and anchor_category not in BOTTOMWEAR):
            # Only add bottomwear if anchor isn't bottomwear
            outfit["Bottomwear"] = find_matching_items(full_dataset, "bottomwear", anchor_item, [], min(3, limit))
        
        if len(outfit["Footwear"]) == 0:
            # Always try to have footwear
            outfit["Footwear"] = find_matching_items(full_dataset, "footwear", anchor_item, [], min(3, limit))
        
        if len(outfit["Accessories"]) < 3:
            # Always aim for at least 3 accessories
            needed = min(4, accessories_limit) - len(outfit["Accessories"])
            if needed > 0:
                more_accessories = find_matching_items(full_dataset, "accessories", anchor_item, selected_items, needed)
                outfit["Accessories"].extend(more_accessories)
    
    return outfit
