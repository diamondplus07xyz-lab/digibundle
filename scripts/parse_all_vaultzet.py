with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

import json
import re

clean_s = s.replace('\\"', '"')

# Find all occurrences of "slug":"...","title":"..."
matches = list(re.finditer(r'"slug":"([^"]+)","title":"([^"]+)"', clean_s))
print(f"Total slug & title matches: {len(matches)}")

extracted = []
for idx, m in enumerate(matches):
    slug = m.group(1)
    title = m.group(2)
    start = m.start()
    # next match start or +3000
    next_start = matches[idx+1].start() if idx+1 < len(matches) else start + 3000
    chunk = clean_s[start:next_start]
    
    thumb_match = re.search(r'"thumbnail":"(https?://[^"]+)"', chunk)
    thumb = thumb_match.group(1) if thumb_match else ""
    if not thumb:
        # Check for /_next or other image
        thumb_match = re.search(r'"thumbnail":"([^"]+)"', chunk)
        thumb = thumb_match.group(1) if thumb_match else ""

    # Clean escaped chars in thumb
    thumb = thumb.replace('\\u0026', '&').replace('&amp;', '&')

    drive_match = re.search(r'"googleDriveLink":"([^"]+)"', chunk)
    drive = drive_match.group(1) if drive_match else ""

    preview_match = re.search(r'"previewVideoUrl":"([^"]+)"', chunk)
    preview = preview_match.group(1) if preview_match else ""

    extracted.append({
        "slug": slug,
        "title": title.encode().decode('unicode_escape', errors='ignore'),
        "thumbnail": thumb,
        "driveLink": drive,
        "previewVideo": preview
    })

print(f"Extracted {len(extracted)} products with Vaultzet thumbnails!")
with open('scripts/vaultzet_products_full.json', 'w', encoding='utf-8') as f:
    json.dump(extracted, f, indent=2)

for p in extracted[:20]:
    print(f"[{p['slug']}] -> {p['thumbnail']}")
