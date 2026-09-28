import os
import re

api_dir = 'Frontend/src/api'
endpoints = []

for f in os.listdir(api_dir):
    if f.endswith('.js') and f != 'client.js':
        path = os.path.join(api_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            # find apiFetch(`/path...` or '/path...'
            matches = re.findall(r'(?:apiFetch|publicFetch)\([`\'"]([^`\'"]+)[`\'"](?:,\s*\{[^}]*method:\s*[\'"]([A-Z]+)[\'"])?', content)
            for m in matches:
                ep = m[0]
                method = m[1] if m[1] else 'GET'
                endpoints.append((f, method, ep))

print(f"Extracted {len(endpoints)} API calls from Frontend/src/api:")
for f, m, ep in sorted(endpoints, key=lambda x: x[2]):
    print(f"  [{f}] {m:6s} {ep}")
