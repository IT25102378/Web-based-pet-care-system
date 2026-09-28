import os
import re

img_refs = []
for root, _, files in os.walk('Frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            p = os.path.join(root, file)
            with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                srcs = re.findall(r'src=["\']([^"\']+)["\']', content)
                for s in srcs:
                    if s.startswith('/') and not s.startswith('data:') and not s.startswith('http'):
                        img_refs.append((p, s))

print('Image / asset refs found:', len(img_refs))
missing_count = 0
for f, s in img_refs:
    public_path = os.path.join('Frontend/public', s.lstrip('/'))
    root_path = os.path.join('Frontend', s.lstrip('/'))
    if not os.path.exists(public_path) and not os.path.exists(root_path):
        print(f'Missing asset: {s} referenced in {f}')
        missing_count += 1

if missing_count == 0:
    print('All static assets and images exist!')
