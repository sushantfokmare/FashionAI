"""
Quick test script for improved outfit matcher
Tests the enhanced matching logic with sample data
"""
from logic.image_outfit_matcher import match_outfit_from_image

# Create sample data
anchor_item = {
    "id": "test1",
    "sub_category": "T-Shirts",
    "main_category": "Topwear",
    "color": "Navy Blue",
    "gender": "Men",
    "style": "casual",
    "occasion": "Casual"
}

similar_items = [
    {
        "id": "test2",
        "sub_category": "Jeans",
        "main_category": "Bottomwear",
        "color": "Blue",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    },
    {
        "id": "test3",
        "sub_category": "Trousers",
        "main_category": "Bottomwear",
        "color": "Beige",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    }
]

full_dataset = similar_items + [
    {
        "id": "test4",
        "sub_category": "Sneakers",
        "main_category": "Footwear",
        "color": "White",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    },
    {
        "id": "test5",
        "sub_category": "Boots",
        "main_category": "Footwear",
        "color": "Brown",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    },
    {
        "id": "test6",
        "sub_category": "Watches",
        "main_category": "Accessories",
        "color": "Silver",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    },
    {
        "id": "test7",
        "sub_category": "Bags",
        "main_category": "Accessories",
        "color": "Black",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    },
    {
        "id": "test8",
        "sub_category": "Belts",
        "main_category": "Accessories",
        "color": "Brown",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    },
    {
        "id": "test9",
        "sub_category": "Sunglasses",
        "main_category": "Accessories",
        "color": "Black",
        "gender": "Men",
        "style": "casual",
        "occasion": "Casual"
    }
]

print("Testing improved outfit matcher...")
print(f"Anchor: {anchor_item['color']} {anchor_item['sub_category']}")
print()

outfit = match_outfit_from_image(
    anchor_item=anchor_item,
    similar_items=similar_items,
    full_dataset=full_dataset,
    limit=6
)

print("=== OUTFIT RESULTS ===")
for category, items in outfit.items():
    print(f"\n{category} ({len(items)} items):")
    for item in items:
        print(f"  - {item['color']} {item['sub_category']}")

print("\n✅ Test completed successfully!")
print(f"Total items recommended: {sum(len(items) for items in outfit.values())}")
