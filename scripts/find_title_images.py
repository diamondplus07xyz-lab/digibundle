import re

with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

# Search for patterns where title and image occur together or in objects
# e.g., name, title, image, img, src, slug, etc.
# Find objects with image URLs
matches = re.findall(r'(\{[^{}]*?https?://[^{}]*?\.(?:png|jpg|jpeg|webp)[^{}]*?\})', s)
print(f"Object matches with images: {len(matches)}")
for m in matches[:10]:
    print("Match:", m[:200])

# Or let's search for "title" or "name" near image URLs
pairs = re.findall(r'["\']?title["\']?\s*:\s*["\']([^"\']+)["\'][^}]*?["\']?image["\']?\s*:\s*["\']([^"\']+)["\']', s)
print(f"Title-image pairs: {len(pairs)}")

pairs2 = re.findall(r'["\']?name["\']?\s*:\s*["\']([^"\']+)["\'][^}]*?["\']?(?:image|img|thumbnail|src)["\']?\s*:\s*["\']([^"\']+)["\']', s)
print(f"Name-image pairs: {len(pairs2)}")
