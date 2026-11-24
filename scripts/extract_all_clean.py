with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

import json
import re

clean_s = s.replace('\\"', '"')

# Now find all objects that have "slug", "title", "thumbnail"
# e.g. {"id":"prod-...", "slug":"...", "title":"...", ... "thumbnail":"https://..." ...}
matches = re.findall(r'(\{"id":"prod-[^"]+","slug":"[^"]+","title":".*?"thumbnail":"https?://[^"]+".*?\})', clean_s)
print(f"Products matched with regex: {len(matches)}")

# Or let's search with regex for:
# "slug":"(?P<slug>[^"]+)","title":"(?P<title>[^"]+)" ... "thumbnail":"(?P<thumb>https?://[^"]+)"
items = re.findall(r'"slug":"([^"]+)","title":"([^"]+)".*?"thumbnail":"(https?://[^"]+)"', clean_s)
print(f"Slug-Title-Thumbnail items found: {len(items)}")

# Let's extract them cleanly
extracted_products = []
for m in re.finditer(r'\{"id":"(prod-[^"]+)","slug":"([^"]+)","title":"([^"]+)"', clean_s):
    start = m.start()
    # Find matching thumbnail
    thumb_match = re.search(r'"thumbnail":"(https?://[^"]+)"', clean_s[start:start+2500])
    thumb = thumb_match.group(1) if thumb_match else ""
    drive_match = re.search(r'"googleDriveLink":"([^"]+)"', clean_s[start:start+2500])
    drive = drive_match.group(1) if drive_match else ""
    preview_match = re.search(r'"previewVideoUrl":"([^"]+)"', clean_s[start:start+2500])
    preview = preview_match.group(1) if preview_match else ""

    prod_id = m.group(1)
    slug = m.group(2)
    title = m.group(3)

    extracted_products.append({
        "id": prod_id,
        "slug": slug,
        "title": title,
        "thumbnail": thumb,
        "driveLink": drive,
        "previewVideo": preview
    })

print(f"Total extracted products: {len(extracted_products)}")
for p in extracted_products[:15]:
    print(f"- {p['title'][:45]}... -> {p['thumbnail']}")

with open('scripts/vaultzet_all_products.json', 'w', encoding='utf-8') as f:
    json.dump(extracted_products, f, indent=2)
