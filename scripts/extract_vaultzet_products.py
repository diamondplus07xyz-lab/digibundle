import re
import json

with open('scripts/script_49.js', 'r', encoding='utf-8') as f:
    s = f.read()

# Let's find where the array starts and ends or extract each product object
# Notice the pattern: {"id":"...", ... "thumbnail":"https://..." ...}
# Let's find occurrences of "thumbnail":"https://
pos = s.find('"thumbnail":"')
print("Position of thumbnail:", pos)

# Find the start of the array around this position
array_start = s.rfind('[', 0, pos)
print("Array start:", array_start)

# Let's look at the text around array_start
print("Surrounding text:", s[array_start:array_start+300])

# Let's find the matching closing bracket ']' for array_start
bracket_count = 0
array_end = -1
in_string = False
escape = False

for i in range(array_start, len(s)):
    ch = s[i]
    if escape:
        escape = False
        continue
    if ch == '\\':
        escape = True
        continue
    if ch == '"':
        in_string = not in_string
        continue
    if not in_string:
        if ch == '[':
            bracket_count += 1
        elif ch == ']':
            bracket_count -= 1
            if bracket_count == 0:
                array_end = i + 1
                break

print("Array end:", array_end)
if array_end != -1:
    array_str = s[array_start:array_end]
    print(f"Extracted array string of length {len(array_str)}")
    try:
        products = json.loads(array_str)
        print(f"Successfully parsed JSON array with {len(products)} products!")
        with open('scripts/vaultzet_products.json', 'w', encoding='utf-8') as f:
            json.dump(products, f, indent=2)
        print("Saved to scripts/vaultzet_products.json!")
        for p in products[:5]:
            print(f"- {p.get('title')}: {p.get('thumbnail')}")
    except Exception as e:
        print("JSON parse error:", e)
        # fallback regex
        with open('scripts/raw_array.txt', 'w', encoding='utf-8') as f:
            f.write(array_str)
