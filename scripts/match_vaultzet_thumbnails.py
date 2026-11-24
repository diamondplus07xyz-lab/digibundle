import json
import re

# Load scraped vaultzet products
with open('scripts/vaultzet_products_full.json', 'r', encoding='utf-8') as f:
    vaultzet_prods = json.load(f)

print(f"Loaded {len(vaultzet_prods)} vaultzet products")

# Load existing bundles.js
with open('src/data/bundles.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract json array
json_str = content.split('export const initialBundles = ')[1].split(';\n\nexport const categories =')[0]
bundles = json.loads(json_str)

print(f"Loaded {len(bundles)} store bundles")

# Normalize string helper
def normalize(s):
    s = s.lower()
    s = re.sub(r'[\W_]+', ' ', s)
    return s.strip()

# Build index of vaultzet products
vz_index = []
for p in vaultzet_prods:
    norm_title = normalize(p['title'])
    norm_slug = normalize(p['slug'])
    thumb = p['thumbnail']
    if thumb and thumb.startswith('http'):
        vz_index.append({
            'title': norm_title,
            'slug': norm_slug,
            'thumb': thumb,
            'preview': p.get('previewVideo') or ''
        })

print(f"Valid vaultzet indexed thumbnails: {len(vz_index)}")

# Matching logic
matched_count = 0
for b in bundles:
    if b['id'] == 'bundle-mega-all-in-one':
        # Use vaultzet's main hero image or mega bundle
        for vz in vz_index:
            if 'mega' in vz['slug'] or 'sheru' in vz['thumb']:
                b['thumbnail'] = vz['thumb']
                break
        continue

    b_norm = normalize(b['title'])
    b_words = set(w for w in b_norm.split() if len(w) > 2 and not w.isdigit())

    best_match = None
    best_score = 0

    for vz in vz_index:
        score = 0
        vz_words = set(w for w in (vz['title'] + ' ' + vz['slug']).split() if len(w) > 2 and not w.isdigit())
        
        # Word overlap
        common = b_words.intersection(vz_words)
        score = len(common)

        # Key phrases matching bonus
        for phrase in ['free fire', 'pubg bgmi', 'cats', 'dogs', 'space', 'stoic', 'sigma male', 'gta', 'anushka sen', 'ghibli', 'chibi', 'stickman', 'mad scientist', 'hulk', 'premanand', 'rust restoration', 'baby dancing', 'runway models', 'hot girls', 'mini car', 'timelapse', 'cricket', 'football', 'woodwork', 'arpit bala', 'f1', 'valorant', 'fortnite', 'call of duty']:
            if phrase in b_norm and phrase in vz['slug']:
                score += 8

        if score > best_score:
            best_score = score
            best_match = vz

    if best_match and best_score >= 2:
        b['thumbnail'] = best_match['thumb']
        matched_count += 1
        # If vaultzet has a preview video url that is valid, can also attach
        if best_match['preview'] and best_match['preview'].startswith('http'):
            b['vaultzetPreview'] = best_match['preview']

print(f"Successfully matched and assigned Vaultzet thumbnails to {matched_count} / {len(bundles)} bundles!")

# Save updated bundles.js
with open('src/data/bundles.js', 'r', encoding='utf-8') as f:
    orig_content = f.read()

categories_part = orig_content.split('export const categories = ')[1]
new_content = f"// Generated Real Bundles Dataset with Vaultzet Photos ({len(bundles)} bundles)\n"
new_content += f"export const initialBundles = {json.dumps(bundles, indent=2)};\n\n"
new_content += f"export const categories = {categories_part}"

with open('src/data/bundles.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated src/data/bundles.js!")
