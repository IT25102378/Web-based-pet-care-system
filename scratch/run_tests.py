import requests
import json
import traceback

BASE_URL = "http://localhost:8080/api"

results = []

def record(test_id, title, expected, status, actual, notes=""):
    results.append(f"| {test_id} | {title} | Executed via API | N/A | {expected} | {actual} | **{status}** | {notes} |")
    print(f"[{status}] {test_id}: {actual}")

# Auth Tokens
tokens = {}

def login(email, password, role):
    try:
        r = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
        if r.status_code == 200:
            tokens[role] = r.json().get('token')
            return True, r.status_code, r.text
        return False, r.status_code, r.text
    except Exception as e:
        return False, 0, str(e)

# PO_01
try:
    r = requests.post(f"{BASE_URL}/auth/register", json={
        "fullName": "Test Owner",
        "email": "newowner99@petnexus.com",
        "password": "password123",
        "role": "PetOwner",
        "phone": "+94771234567"
    })
    if r.status_code == 201 or r.status_code == 200:
        record("PO_01", "Register Pet Owner", "PendingApproval", "Pass", f"Status: {r.status_code}, Body: {r.json()}", "Used API")
    else:
        record("PO_01", "Register Pet Owner", "PendingApproval", "Fail", f"Status: {r.status_code}, Body: {r.text}", "Used API")
except Exception as e:
    record("PO_01", "Register Pet Owner", "PendingApproval", "Not Executed", str(e), "")

# PO_02
success, sc, text = login("owner@petnexus.com", "password123", "owner")
if success:
    record("PO_02", "Login owner", "JWT stored", "Pass", f"Status 200, JWT obtained", "Used API")
else:
    record("PO_02", "Login owner", "JWT stored", "Fail", f"Status {sc}, {text}", "Used API")

# PO_03
success, sc, text = login("owner@petnexus.com", "wrongpass", "none")
record("PO_03", "Wrong password", "Invalid email or password", "Pass" if sc in [400, 401] else "Fail", f"Status {sc}, Body: {text}", "Used API")

# Getting other tokens
login("vet@petnexus.com", "password123", "vet")
login("staff@petnexus.com", "password123", "staff")
login("provider@petnexus.com", "password123", "provider")
login("manager@petnexus.com", "password123", "manager")
login("rescue@petnexus.com", "password123", "rescue")
login("admin@petnexus.com", "password123", "admin")

def auth_get(endpoint, role):
    return requests.get(f"{BASE_URL}{endpoint}", headers={"Authorization": f"Bearer {tokens.get(role, '')}"})

def auth_post(endpoint, role, data):
    return requests.post(f"{BASE_URL}{endpoint}", json=data, headers={"Authorization": f"Bearer {tokens.get(role, '')}"})

# PO_04 & PO_05
if "owner" in tokens:
    # PO_05
    r_bad = auth_post("/pets", "owner", {"species": "Dog"})
    record("PO_05", "Add pet empty name", "validation error", "Pass" if r_bad.status_code==400 else "Fail", f"Status {r_bad.status_code}, {r_bad.text}", "")
    
    # PO_04
    r_good = auth_post("/pets", "owner", {"name": "Buddy", "species": "Dog", "breed": "Golden", "age": 2, "gender": "Male", "weight": 15.0})
    if r_good.status_code in [200, 201]:
        record("PO_04", "Add pet", "saved", "Pass", f"Status {r_good.status_code}, PetID: {r_good.json().get('petId', '')}", "")
    else:
        record("PO_04", "Add pet", "saved", "Fail", f"Status {r_good.status_code}, {r_good.text}", "")
else:
    record("PO_04", "Add pet", "saved", "Not Executed", "No owner token", "")
    record("PO_05", "Add pet empty name", "error", "Not Executed", "No owner token", "")

# Output all results
with open("scratch/results.md", "w") as f:
    f.write("| Test Case ID | Test Title | Steps Performed | Test Data | Expected | Actual | Status | Notes |\n")
    f.write("|---|---|---|---|---|---|---|---|\n")
    for res in results:
        f.write(res + "\n")
