import re
import urllib.parse
import json

with open('scripts/vaultzet_shop.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Look for patterns where products are rendered.
# Notice the image src had: /_next/image?url=https%3A%2F%2Freelsbundles.in%2Fwp-content...
# Let's extract all decoded URLs
raw_urls = re.findall(r'url=([^&"\'\s]+)', html)
decoded_urls = [urllib.parse.unquote(u) for u in raw_urls]

print(f"Total decoded image URLs found: {len(decoded_urls)}")
for u in decoded_urls[:20]:
    print("Found image:", u)

# Let's also search for JSON objects or script tags containing product lists in the HTML
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print(f"Total script tags: {len(scripts)}")
for idx, s in enumerate(scripts):
    if 'reels' in s.lower() or 'bundle' in s.lower():
        print(f"Script {idx} mentions reels/bundle! Length: {len(s)}")
        # Check if it has JSON
        json_matches = re.findall(r'(\{.*?\"title\".*?\})', s)
        print(f"  Matches with 'title': {len(json_matches)}")
