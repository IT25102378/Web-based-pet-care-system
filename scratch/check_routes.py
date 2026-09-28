import os
import re

app_jsx_path = 'Frontend/src/App.jsx'
with open(app_jsx_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

defined_routes = set()

# Standalone routes
matches = re.findall(r'<Route[^>]+path=["\']([^"\']+)["\']', app_content)
for m in matches:
    if m.startswith('/'):
        defined_routes.add(m)

# Parent and children routes
sections = re.findall(r'<Route\s+path=["\'](/[^"\']+)["\'][^>]*>(.*?)</Route>', app_content, re.DOTALL)
for parent, body in sections:
    defined_routes.add(parent)
    children = re.findall(r'<Route\s+path=["\']([^"\']+)["\']', body)
    for c in children:
        full = parent.rstrip('/') + '/' + c.lstrip('/')
        defined_routes.add(full)

print("Total Defined Routes in App.jsx:", len(defined_routes))
for r in sorted(defined_routes):
    print("  ", r)

# Now check all Link to and navigate calls
links_found = []
for root, _, files in os.walk('Frontend/src'):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            p = os.path.join(root, file)
            with open(p, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                lt = re.findall(r'to=["\'](/[^"\']+)["\']', content)
                for l in lt:
                    links_found.append((p, l))
                nav = re.findall(r'navigate\(["\'](/[^"\']+)["\']', content)
                for n in nav:
                    links_found.append((p, n))

print(f"\nTotal internal navigation links found: {len(links_found)}")
broken = []
for file, link in links_found:
    clean_link = link.split('?')[0].split('#')[0]
    matched = False
    if clean_link in defined_routes:
        matched = True
    else:
        for dr in defined_routes:
            pattern = '^' + re.sub(r':[a-zA-Z0-9_]+', r'[^/]+', dr) + '$'
            if re.match(pattern, clean_link):
                matched = True
                break
    if not matched:
        broken.append((file, link))

if broken:
    print(f"\n[FOUND {len(broken)} UNMATCHED ROUTES]:")
    for f, l in set(broken):
        print(f"  {f} -> {l}")
else:
    print("\n[SUCCESS: ALL INTERNAL LINKS MATCH DEFINED ROUTES!]")
