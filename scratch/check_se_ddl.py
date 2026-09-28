import re

with open('Database/PetNexus_Database.sql', 'r', encoding='utf-16le', errors='ignore') as f:
    content = f.read()

# Let's extract table definitions without alter database
tables = re.findall(r'(CREATE TABLE \[dbo\]\.\[\w+\].*?GO)', content, re.DOTALL)
print(f'Found {len(tables)} CREATE TABLE blocks in SE DDL.')
for t in tables[:3]:
    print(t[:150] + '...\n')
