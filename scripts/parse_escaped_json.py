import re
import json

with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

# Pattern with \\"
titles = re.findall(r'\\\"title\\\":\\\"([^\\\"]+)\\\"', s)
thumbnails = re.findall(r'\\\"thumbnail\\\":\\\"([^\\\"]+)\\\"', s)

print(f"Titles found: {len(titles)}")
print(f"Thumbnails found: {len(thumbnails)}")

# Let's extract full product objects
# Notice each product is inside {...} with \\"
pattern = r'\{[^{}]*?\\\"title\\\":\\\"([^\\\"]+)\\\"[^{}]*?\\\"thumbnail\\\":\\\"([^\\\"]+)\\\"[^{}]*?\}'
matches = re.findall(pattern, s)
print(f"Direct Title-Thumbnail pairs: {len(matches)}")

# What about thumbnail before title or title before thumbnail?
pattern2 = r'\{[^{}]*?\\\"thumbnail\\\":\\\"([^\\\"]+)\\\"[^{}]*?\\\"title\\\":\\\"([^\\\"]+)\\\"[^{}]*?\}'
matches2 = re.findall(pattern2, s)
print(f"Thumbnail-Title pairs: {len(matches2)}")

# Let's inspect the first 20 products
products_map = {}
for t, th in matches:
    products_map[t.strip()] = th.strip()
for th, t in matches2:
    products_map[t.strip()] = th.strip()

print(f"\nTotal unique mapped products: {len(products_map)}")
for t, th in list(products_map.items())[:15]:
    print(f"- {t} -> {th}")

with open('scripts/vaultzet_scraped_images.json', 'w', encoding='utf-8') as f:
    json.dump(products_map, f, indent=2)
print("Saved to scripts/vaultzet_scraped_images.json!")
