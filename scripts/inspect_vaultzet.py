import urllib.request
import re

urls_to_try = [
    'https://www.vaultzet.shop/',
    'https://www.vaultzet.shop/products.json',
    'https://www.vaultzet.shop/sitemap.xml',
    'https://www.vaultzet.shop/shop'
]

for url in urls_to_try:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            content_type = resp.headers.get('content-type', '')
            data = resp.read()
            print(f"{url} -> HTTP {resp.status}, {content_type}, len={len(data)}")
            if 'products.json' in url:
                print("Found products.json!")
    except Exception as e:
        print(f"{url} -> {e}")
