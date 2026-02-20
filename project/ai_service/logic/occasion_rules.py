"""
Occasion-based outfit rules and mappings
"""

TOPWEAR = ["Topwear"]
BOTTOMWEAR = ["Bottomwear"]
DRESSES = ["Dresses"]
FOOTWEAR = ["Footwear", "Shoes"]
ACCESSORIES = ["Accessories"]

# Occasion to style mapping
OCCASION_STYLE_MAP = {
    "casual": ["casual", "streetwear"],
    "party": ["elegant", "fashion"],
    "formal": ["formal", "minimal"],
    "sports": ["sporty", "sports"]
}

# Season-based color preferences
SEASON_COLORS = {
    "summer": ["White", "Beige", "Yellow", "Blue", "Pink", "Orange"],
    "winter": ["Black", "Grey", "Brown", "Navy Blue", "Maroon", "Green"],
    "all": []  # No specific preference
}

# Color preference mapping
COLOR_MAP = {
    "light": ["White", "Beige", "Cream", "Off White", "Silver", "Grey", "Blue"],
    "dark": ["Black", "Navy Blue", "Charcoal", "Brown", "Grey", "Green"],
    "neutral": ["Beige", "Grey", "White", "Cream", "Tan", "Taupe"],
    "any": []  # No filtering
}
