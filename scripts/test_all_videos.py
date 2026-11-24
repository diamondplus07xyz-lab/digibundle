import urllib.request

video_candidates = {
    'space': 'https://assets.mixkit.co/videos/48564/48564-720.mp4',
    'cat': 'https://assets.mixkit.co/videos/4710/4710-720.mp4',
    'dog': 'https://assets.mixkit.co/videos/4665/4665-720.mp4',
    'workout': 'https://assets.mixkit.co/videos/43529/43529-720.mp4',
    'car': 'https://assets.mixkit.co/videos/44415/44415-720.mp4',
    'rain': 'https://assets.mixkit.co/videos/43525/43525-720.mp4',
    'city': 'https://assets.mixkit.co/videos/4713/4713-720.mp4',
    'fashion': 'https://assets.mixkit.co/videos/48512/48512-720.mp4',
    'dance': 'https://assets.mixkit.co/videos/42944/42944-720.mp4',
    'spiritual': 'https://assets.mixkit.co/videos/43528/43528-720.mp4',
    'gaming': 'https://assets.mixkit.co/videos/44589/44589-720.mp4',
    'craft': 'https://assets.mixkit.co/videos/43526/43526-720.mp4',
}

results = {}
for name, url in video_candidates.items():
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            results[name] = resp.status
    except Exception as e:
        results[name] = str(e)

print(results)
