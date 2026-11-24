import urllib.request
import re
import json

req = urllib.request.Request('https://www.vaultzet.shop/shop', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=10).read().decode('utf-8', errors='ignore')

with open('scripts/vaultzet_shop.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"Saved HTML, length: {len(html)}")

# Find all img tags
img_tags = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print(f"Total img src matches: {len(img_tags)}")
for img in img_tags[:20]:
    print("Sample img:", img)

next_data = re.findall(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
if next_data:
    print("Found __NEXT_DATA__!")
    data = json.loads(next_data[0])
    with open('scripts/next_data.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    print("Saved next_data.json!")
else:
    print("No __NEXT_DATA__")
