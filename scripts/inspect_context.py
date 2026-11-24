with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

for match in re.finditer(r'https://reelsbundles\.in/wp-content/uploads/[^\s"\'\\]+\.(?:png|jpg|jpeg|webp)', s):
    start = max(0, match.start() - 150)
    end = min(len(s), match.end() + 150)
    print("--- CONTEXT ---")
    print(s[start:end])
    print("\n")
    break
