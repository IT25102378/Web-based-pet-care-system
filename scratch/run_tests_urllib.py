import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8080/api"

def request(endpoint, payload=None, method="POST", token=None):
    req = urllib.request.Request(BASE_URL + endpoint, method=method)
    if payload:
        data = json.dumps(payload).encode('utf-8')
        req.add_header('Content-Type', 'application/json')
        req.data = data
    if token:
        req.add_header('Authorization', f'Bearer {token}')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))
    except Exception as e:
        return 0, str(e)

# PO_02
status, body = request("/auth/login", {"email": "owner@petnexus.com", "password": "password123"})
print(f"PO_02 (Login Owner): Expected 200, Actual {status} - Token length: {len(body.get('token', ''))}")
token = body.get('token')

# PO_03
status, body = request("/auth/login", {"email": "owner@petnexus.com", "password": "wrongpassword"})
print(f"PO_03 (Wrong Pass): Expected 400/401, Actual {status} - Body: {body}")

# CS_01 (Staff queue)
status, body = request("/auth/login", {"email": "staff@petnexus.com", "password": "password123"})
staff_token = body.get('token')
status, body = request("/appointments", method="GET", token=staff_token)
print(f"CS_01 (Staff Queue): Expected 200, Actual {status} - Body items: {len(body) if isinstance(body, list) else body}")

# VT_01 (Vet schedule)
status, body = request("/auth/login", {"email": "vet@petnexus.com", "password": "password123"})
vet_token = body.get('token')
status, body = request("/appointments/my-appointments", method="GET", token=vet_token) # guessing endpoint
print(f"VT_01 (Vet Schedule): Expected 200, Actual {status} - Body: {str(body)[:50]}...")
