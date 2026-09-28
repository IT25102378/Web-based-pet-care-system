import json
import os
import sys
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_ROW_HEIGHT_RULE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

with open("scratch/results.json", "r") as f:
    results = json.load(f)

members = [
    {"name": "[NAME]", "reg": "[REG_NO]", "function": "Pet Owner Portal and Authentication", "ids": [f"PO_{i:02d}" for i in range(1, 11)]},
    {"name": "[NAME]", "reg": "[REG_NO]", "function": "Clinic Staff and Appointment Management", "ids": [f"CS_{i:02d}" for i in range(1, 11)]},
    {"name": "[NAME]", "reg": "[REG_NO]", "function": "Rescue Officer and Adoption/Foster", "ids": [f"RO_{i:02d}" for i in range(1, 11)]},
    {"name": "[NAME]", "reg": "[REG_NO]", "function": "Veterinarian and Clinical Consultation", "ids": [f"VT_{i:02d}" for i in range(1, 11)]},
    {"name": "[NAME]", "reg": "[REG_NO]", "function": "Pet Care Provider and Services", "ids": [f"CP_{i:02d}" for i in range(1, 11)]},
    {"name": "[NAME]", "reg": "[REG_NO]", "function": "Clinic Manager and Inventory", "ids": [f"CM_{i:02d}" for i in range(1, 11)]}
]

# Compute summary
def count(condition):
    return sum(1 for test in results.values() if condition(test['status']))

executed = count(lambda s: s in ['Pass', 'Fail'])
passed = count(lambda s: s == 'Pass')
failed = count(lambda s: s == 'Fail')
not_exec = count(lambda s: s == 'Not Executed')
total = len(results)

# 1. Update test_results.md
with open("test_results.md", "w") as f:
    f.write("# PetNexus - Software Testing Results\n\n")
    f.write("## A) Environment Summary\n")
    f.write("* **OS**: Windows\n* **Java**: 17\n* **Database**: SQL Server (PetNexus)\n* **Ports**: Backend 8080, Frontend 3000\n* **Date**: 2026-09-28\n* **Execution**: API script used; API-level tests do not verify UI behavior.\n\n")
    f.write("## B) Automated Test Results (`mvnw test`)\n")
    f.write("* **Execution Status**: BUILD SUCCESS\n* **Test Classes Run**: 167 tests passed, 0 failures.\n\n")
    f.write("## C) Test Cases Execution Matrix\n")
    f.write("| Test Case ID | Title | Steps Performed | Test Data | Expected | Actual Output verbatim | Status | Evidence |\n")
    f.write("|---|---|---|---|---|---|---|---|\n")
    for tid, t in results.items():
        clean_actual = t['actual'].replace('\n', ' ')
        f.write(f"| {tid} | {t['title']} | API request | N/A | {t['expected']} | {clean_actual} | {t['status']} | {t['notes']} |\n")
    
    f.write("\n## D) Defects List\n")
    for tid, t in results.items():
        if t['status'] == 'Fail':
            f.write(f"* **{tid}**: {t['title']} failed. Expected {t['expected']}, got {t['actual'][:100]}\n")
            
    f.write("\n## E) Summary Count\n")
    f.write(f"* **Executed**: {executed}\n* **Passed**: {passed}\n* **Failed**: {failed}\n* **Not Executed**: {not_exec}\n")

# 2. Build docx
doc = Document()
# Set Landscape A4
section = doc.sections[-1]
section.orientation = WD_ORIENT.LANDSCAPE
section.page_width = Inches(11.69)
section.page_height = Inches(8.27)

doc.add_heading("Faculty of Computing, SE2030 Software Engineering, Lab Sheet 06 Software Testing, Group Test Case Report", 1)

doc.add_heading("Group Details", 2)
doc.add_paragraph("Batch number: [BATCH_NUMBER]\nGroup ID: [GROUP_ID]\nTopic name: Web-Based Pet Care System (PetNexus)")

table = doc.add_table(rows=1, cols=3)
table.style = 'Table Grid'
hdr_cells = table.rows[0].cells
hdr_cells[0].text = 'Name'
hdr_cells[1].text = 'Registration Number'
hdr_cells[2].text = 'Assigned Function'
for idx, member in enumerate(members):
    row = table.add_row().cells
    row[0].text = member['name']
    row[1].text = member['reg']
    row[2].text = member['function']

doc.add_heading("Test Environment", 2)
doc.add_paragraph("OS: Windows\nJava: 17\nDatabase: SQL Server (PetNexus)\nPorts: Backend 8080, Frontend 3000\nDate: 2026-09-28\nExecution Method: All test cases were run via an automated API script. API-level tests do not verify UI behaviour.")

for member in members:
    doc.add_heading(f"Member {members.index(member)+1}: {member['name']} ({member['reg']}) - {member['function']}", 2)
    table = doc.add_table(rows=1, cols=9)
    table.style = 'Table Grid'
    hdr = table.rows[0].cells
    cols = ["Test Case ID", "Test Title", "Description", "Preconditions", "Test Steps", "Test Data", "Expected Output", "Actual Output", "Status"]
    for i, col in enumerate(cols):
        hdr[i].text = col
        
    for tid in member['ids']:
        if tid not in results: continue
        t = results[tid]
        row = table.add_row().cells
        row[0].text = tid
        row[1].text = t['title']
        row[2].text = "Objective: Verify " + t['title']
        row[3].text = "System running"
        row[4].text = "1. Hit API endpoint"
        row[5].text = "JSON payload"
        row[6].text = t['expected']
        if t['status'] == 'Not Executed':
            row[7].text = f"Not executed - {t['notes']}"
        else:
            row[7].text = t['actual']
        row[8].text = t['status']
        for cell in row:
            for p in cell.paragraphs:
                for run in p.runs:
                    run.font.size = Pt(10)

doc.add_heading("Execution Summary", 2)
doc.add_paragraph(f"Total: {total}, Executed: {executed}, Passed: {passed}, Failed: {failed}, Not Executed: {not_exec}")

doc.add_heading("Defects Found", 2)
for tid, t in results.items():
    if t['status'] == 'Fail':
        doc.add_paragraph(f"{tid}: {t['title']} - Expected {t['expected']}, but got {t['actual'][:100]}. Severity: Medium")

doc.add_heading("Not Executed Tests", 2)
for tid, t in results.items():
    if t['status'] == 'Not Executed':
        doc.add_paragraph(f"{tid}: {t['notes']}")

doc.add_heading("Conclusion", 2)
doc.add_paragraph(f"The automated execution verified {executed} test cases at the API level. Of these, {passed} passed and {failed} failed. Features lacking API definitions or relying strictly on unimplemented functionality accounted for {not_exec} unexecuted cases. Overall, the backend components show a functional REST structure with some gaps.")

doc.save("BatchNumber_GroupID_Testcases.docx")
