import urllib.request
import json

base = 'http://localhost:8080/api'

def get_token(email):
    data = json.dumps({'email': email, 'password': 'password123'}).encode('utf-8')
    req = urllib.request.Request(f'{base}/auth/login', data=data, headers={'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))['token']

tokens = {
    'admin': get_token('admin@petnexus.com'),
    'vet': get_token('vet@petnexus.com'),
    'owner': get_token('owner@petnexus.com'),
    'staff': get_token('staff@petnexus.com'),
    'rescue': get_token('rescue@petnexus.com'),
    'manager': get_token('manager@petnexus.com'),
    'provider': get_token('provider@petnexus.com')
}

endpoints = [
    ('admin', 'GET', '/users'),
    ('admin', 'GET', '/users/pending-approvals'),
    ('admin', 'GET', '/admin/approval-history'),
    ('owner', 'GET', '/pets'),
    ('owner', 'GET', '/pets/PET-001/medical-history'),
    ('owner', 'GET', '/notifications'),
    ('vet', 'GET', '/rescue/cases/CAS-001/consultations'),
    ('vet', 'GET', '/vaccinations'),
    ('manager', 'GET', '/inventory/low-stock-alerts'),
    ('manager', 'GET', '/suppliers'),
    ('manager', 'GET', '/feedback'),
    ('provider', 'GET', '/care-services/logs'),
    ('staff', 'GET', '/appointments'),
    ('staff', 'GET', '/appointments/available-slots?vetName=Dr.+Sachini+Wijesinghe&date=2026-09-30'),
    ('rescue', 'GET', '/rescue/cases'),
    ('rescue', 'GET', '/rescue/fosters'),
    ('rescue', 'GET', '/adoptions/listings'),
    ('rescue', 'GET', '/adoptions/applications')
]

for role, method, ep in endpoints:
    token = tokens[role]
    try:
        req = urllib.request.Request(f'{base}{ep}', headers={'Authorization': f'Bearer {token}'}, method=method)
        with urllib.request.urlopen(req) as resp:
            print(f'[OK 200] [{role}] {ep}')
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', errors='ignore')[:150]
        print(f'[FAIL {e.code}] [{role}] {ep} -> {body}')
    except Exception as e:
        print(f'[ERROR] [{role}] {ep} -> {e}')
