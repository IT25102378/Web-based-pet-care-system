import re

with open('Backend/src/main/java/com/petnexus/backend/config/DataInitializer.java', 'r', encoding='utf-8') as f:
    text = f.read()

users = re.findall(r'userId\("(USR-\d+)"\).*?fullName\("([^"]+)"\).*?email\("([^"]+)"\).*?role\(UserRole\.(\w+)\)', text, re.DOTALL)
for u in users:
    print(u)
