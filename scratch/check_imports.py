import os
import re

src_dir = 'Frontend/src'
all_files = {}
for root, _, files in os.walk(src_dir):
    for f in files:
        if f.endswith('.js') or f.endswith('.jsx') or f.endswith('.css'):
            rel = os.path.relpath(os.path.join(root, f), src_dir).replace('\\', '/')
            all_files[rel] = os.path.join(root, f)

print(f"Found {len(all_files)} source files in {src_dir}")

broken_imports = []

for rel, path in all_files.items():
    if not (rel.endswith('.js') or rel.endswith('.jsx')):
        continue
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    # Find import ... from '...'
    imports = re.findall(r'import\s+(?:(?:{[^}]+})|(?:[^{}\'\"]+))\s+from\s+[\'"]([^\'"]+)[\'"]', content)
    # Also find bare imports: import '...'
    bare_imports = re.findall(r'import\s+[\'"]([^\'"]+)[\'"]', content)
    
    file_dir = os.path.dirname(path)
    for imp in imports + bare_imports:
        if imp.startswith('.'):
            # relative import
            target_base = os.path.normpath(os.path.join(file_dir, imp))
            candidates = [
                target_base,
                target_base + '.js',
                target_base + '.jsx',
                target_base + '.css',
                os.path.join(target_base, 'index.js'),
                os.path.join(target_base, 'index.jsx'),
            ]
            if not any(os.path.exists(c) for c in candidates):
                broken_imports.append((rel, imp))

if broken_imports:
    print(f"\n[FOUND {len(broken_imports)} BROKEN IMPORTS]:")
    for r, imp in broken_imports:
        print(f"  In {r} -> import '{imp}'")
else:
    print("\n[ALL 100% INTERNAL RELATIVE IMPORTS ARE VALID!]")
