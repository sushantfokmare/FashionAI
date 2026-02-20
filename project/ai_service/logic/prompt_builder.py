"""
Build text prompts for occasion-based outfit generation
"""

def build_occasion_prompt(data: dict) -> str:
    """
    Build a descriptive prompt for image search based on occasion parameters
    
    Args:
        data: Dictionary containing occasion, gender, style, season, color, type
        
    Returns:
        Formatted search query string
    """
    parts = []

    # Add occasion
    parts.append(f"{data['occasion']} outfit")
    
    # Add gender
    parts.append(f"for {data['gender']}")

    # Add style if specified
    if data.get("style"):
        parts.append(data["style"])

    # Add season if not 'all'
    if data.get("season") and data["season"] != "all":
        parts.append(data["season"])

    # Add color preference if not 'any'
    if data.get("color") and data["color"] != "any":
        parts.append(f"{data['color']} colors")

    parts.append("fashion")

    return " ".join(parts)


def build_search_keywords(occasion: str, style: str, gender: str) -> list:
    """
    Build keyword list for filtering dataset items
    
    Args:
        occasion: casual, party, formal, sports
        style: casual, streetwear, elegant, sporty, minimal
        gender: male, female
        
    Returns:
        List of keywords to search for
    """
    keywords = [occasion, style, gender]
    
    # Add related keywords
    if occasion == "formal":
        keywords.extend(["formal", "business", "office"])
    elif occasion == "party":
        keywords.extend(["party", "evening", "night"])
    elif occasion == "sports":
        keywords.extend(["sports", "athletic", "active"])
    elif occasion == "casual":
        keywords.extend(["casual", "everyday", "relaxed"])
    
    return keywords
