with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

import re

# Find the first 3 occurrences of \"thumbnail\" and print 500 characters around them
matches = [m.start() for m in re.finditer(r'\\\"thumbnail\\\"', s)]
print(f"Total thumbnail occurrences: {len(matches)}")

for idx, pos in enumerate(matches[:3]):
    print(f"--- MATCH {idx+1} ---")
    start = max(0, pos - 400)
    end = min(len(s), pos + 400)
    print(s[start:end])
    print("\n")
