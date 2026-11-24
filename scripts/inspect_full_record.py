with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

matches = [m.start() for m in re.finditer(r'\\\"thumbnail\\\"', s)]

for idx, pos in enumerate(matches[:3]):
    print(f"=== FULL RECORD {idx+1} ===")
    start = max(0, pos - 800)
    end = min(len(s), pos + 100)
    print(s[start:end])
    print("\n")
