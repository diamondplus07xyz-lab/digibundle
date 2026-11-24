import urllib.request

test_urls = [
    ('mixkit_space', 'https://assets.mixkit.co/videos/48564/48564-720.mp4'),
    ('mixkit_cat', 'https://assets.mixkit.co/videos/4710/4710-720.mp4'),
    ('mixkit_workout', 'https://assets.mixkit.co/videos/43529/43529-720.mp4'),
    ('mixkit_luxury_car', 'https://assets.mixkit.co/videos/44415/44415-720.mp4'),
    ('commondata_sample', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4')
]

for name, url in test_urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            print(f"{name}: HTTP {resp.status}, {resp.headers.get('content-type')}")
    except Exception as e:
        print(f"{name}: error {e}")
