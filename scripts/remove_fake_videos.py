import json

with open('src/data/bundles.js', 'r', encoding='utf-8') as f:
    content = f.read()

parts = content.split('export const initialBundles = ')
header = parts[0]
rest = parts[1].split(';\n\nexport const categories = ')
bundles = json.loads(rest[0])
categories_str = rest[1]

# Remove fake videos from all bundles
removed_fake_count = 0
for b in bundles:
    if 'videoPreview' in b:
        if 'mixkit.co' in b['videoPreview']:
            b['videoPreview'] = ""
            removed_fake_count += 1
        elif b.get('vaultzetPreview') and 'drive.google.com' in b['vaultzetPreview']:
            # Vaultzet's real Google Drive video preview!
            b['videoPreview'] = b['vaultzetPreview']

print(f"Removed fake videos from {removed_fake_count} bundles. Cleaned!")

new_content = f"{header}export const initialBundles = {json.dumps(bundles, indent=2)};\n\nexport const categories = {categories_str}"

with open('src/data/bundles.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated src/data/bundles.js without fake videos!")
