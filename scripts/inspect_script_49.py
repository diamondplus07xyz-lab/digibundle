import re

with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

images = list(set(re.findall(r'https?://[^\s"\'\\]+\.(?:png|jpg|jpeg|webp)', s)))
print(f"Total unique images: {len(images)}")
for img in images[:30]:
    print("Image:", img)
