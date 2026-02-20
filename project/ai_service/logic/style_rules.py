"""
Style rules for occasion-based footwear and accessory selection
Carefully curated to create impressive, complete outfits
Dataset subcategories: Footwear (Sneakers, Formal Shoes, Sandals, Heels)
                       Accessories (Bags, Belts, Watches, Scarves, Sunglasses)
"""

# Occasion to style mapping
OCCASION_STYLE_MAP = {
    "casual": "casual",
    "party": "elegant",
    "formal": "formal",
    "sports": "sporty"
}

# Footwear rules by occasion and gender - matched to actual dataset subcategories
FOOTWEAR_RULES = {
    "casual": {
        "Men": ["Sneakers", "Sandals"],
        "Women": ["Sneakers", "Sandals", "Heels"]
    },
    "party": {
        "Men": ["Formal Shoes"],  # Elegant, dressy look
        "Women": ["Heels", "Formal Shoes"]  # Heels first for party glamour
    },
    "formal": {
        "Men": ["Formal Shoes"],
        "Women": ["Heels", "Formal Shoes"]  # Professional elegance
    },
    "sports": {
        "Men": ["Sneakers"],
        "Women": ["Sneakers"]
    }
}

# Accessories rules by occasion and gender - curated for impressive combinations
# Priority order matters: most important accessories listed first
ACCESSORIES_RULES = {
    "casual": {
        "Men": ["Watches", "Sunglasses", "Bags", "Belts"],
        "Women": ["Bags", "Sunglasses", "Watches", "Scarves"]
    },
    "party": {
        "Men": ["Watches", "Belts"],  # Sleek, sophisticated
        "Women": ["Bags", "Watches", "Scarves"]  # Elegant accessories for party look
    },
    "formal": {
        "Men": ["Watches", "Belts"],  # Classic professional look
        "Women": ["Bags", "Watches", "Scarves"]  # Professional elegance
    },
    "sports": {
        "Men": ["Watches", "Bags", "Sunglasses"],
        "Women": ["Bags", "Watches", "Sunglasses"]
    }
}

# Season-based clothing filter
SEASON_FILTER = {
    "summer": ["T-Shirts", "Shirts", "Shorts", "Sandals", "Flip Flops"],
    "winter": ["Jackets", "Sweaters", "Sweatshirts", "Coats", "Boots"],
    "all": []
}


def filter_items(dataset, allowed_subcategories, gender):
    """
    Filter dataset items by subcategory and gender
    
    Args:
        dataset: Full dataset list
        allowed_subcategories: List of allowed sub_category values
        gender: Gender to filter by ("Men" or "Women")
    
    Returns:
        Filtered list of items
    """
    if not allowed_subcategories:
        # If no specific subcategories, just filter by gender
        return [
            item for item in dataset
            if item.get("gender", "") == gender
        ]
    
    return [
        item for item in dataset
        if item.get("sub_category") in allowed_subcategories
        and item.get("gender") == gender
    ]


def get_footwear(dataset, occasion, gender):
    """
    Get appropriate footwear from full dataset based on occasion and gender
    
    Args:
        dataset: Full dataset list
        occasion: Occasion type (casual, party, formal, sports)
        gender: Gender ("Men" or "Women")
    
    Returns:
        List of matching footwear items
    """
    allowed = FOOTWEAR_RULES.get(occasion, {}).get(gender, [])
    return filter_items(dataset, allowed, gender)


def get_accessories(dataset, occasion, gender):
    """
    Get appropriate accessories from full dataset based on occasion and gender
    
    Args:
        dataset: Full dataset list
        occasion: Occasion type (casual, party, formal, sports)
        gender: Gender ("Men" or "Women")
    
    Returns:
        List of matching accessory items
    """
    allowed = ACCESSORIES_RULES.get(occasion, {}).get(gender, [])
    return filter_items(dataset, allowed, gender)
