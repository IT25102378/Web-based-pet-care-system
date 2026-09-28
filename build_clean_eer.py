import os
import subprocess
import math

DESKTOP_DIR = r"C:\Users\Avinash\Desktop\PetNexus_Diagrams"
ARTIFACT_DIR = r"C:\Users\Avinash\.gemini\antigravity-ide\brain\f9f26e4b-4430-4c51-8836-c3ced74fdb15"
os.makedirs(DESKTOP_DIR, exist_ok=True)

svg_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.svg")
drawio_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.drawio")
html_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.html")
png_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.png")
preview_png = os.path.join(ARTIFACT_DIR, "eer_preview.png")

# Precise coordinates with ZERO overlap verified
entities = [
    # id, label, cx, cy, w, h, is_weak
    ("USER", "USER", 750, 90, 90, 30, False),
    ("NOTIFICATION", "NOTIFICATION", 1180, 90, 110, 30, False),

    # Subclasses
    ("PET_CARE_PROVIDER", "PET CARE\nPROVIDER", 180, 135, 120, 42, False),
    ("CLINIC_STAFF", "CLINIC STAFF", 400, 205, 100, 30, False),
    ("CLINIC_MANAGER", "CLINIC MANAGER", 590, 245, 115, 30, False),
    ("VETERINARIAN", "VETERINARIAN", 860, 245, 110, 30, False),
    ("PET_OWNER", "PET OWNER", 1000, 245, 95, 30, False),
    ("RESCUE_OFFICER", "RESCUE OFFICER", 1100, 185, 120, 30, False),

    # Left Column
    ("SERVICE", "SERVICE", 180, 335, 80, 30, False),
    ("SERVICE_PACKAGE", "SERVICE PACKAGE", 200, 630, 125, 30, False),
    ("SERVICE_BOOKING", "SERVICE BOOKING", 320, 805, 125, 30, False),
    ("INVENTORY_ITEM", "INVENTORY ITEM", 70, 635, 115, 30, False),
    ("SUPPLIER", "SUPPLIER", 180, 930, 85, 30, False),
    ("PAYMENT", "PAYMENT", 390, 970, 85, 30, False),

    # Center Column
    ("APPOINTMENT", "APPOINTMENT", 560, 740, 110, 30, False),
    ("PET", "PET", 1120, 560, 75, 30, False),
    ("MEDICAL_RECORD", "MEDICAL RECORD", 1010, 1030, 125, 30, False),
    ("PRESCRIPTION", "PRESCRIPTION", 1440, 1030, 115, 30, False),
    ("VACCINATION", "VACCINATION", 1330, 740, 105, 30, False),

    # Complaints & Feedback
    ("COMPLAINT", "COMPLAINT", 610, 490, 95, 30, False),
    ("FEEDBACK", "FEEDBACK", 900, 520, 85, 30, False),

    # Right Column
    ("RESCUE_CASE", "RESCUE CASE", 1460, 245, 105, 30, False),
    ("RESCUED_PET", "RESCUED PET", 1470, 520, 105, 30, True),
    ("FOSTER_CARE", "FOSTER CARE", 1470, 680, 100, 30, False),
    ("ADOPTION_APP", "ADOPTION APPLICATION", 1290, 360, 150, 30, False),
]

relationships = [
    # id, label, cx, cy, rw, rh, is_id
    ("REL_RECEIVES", "RECEIVES", 990, 90, 40, 20, False),

    # Left
    ("REL_PROVIDES", "PROVIDES", 180, 245, 40, 19, False),
    ("REL_CONTAINS", "CONTAINS", 180, 480, 42, 20, False),
    ("REL_USED_IN", "USED IN", 65, 470, 36, 18, False),
    ("REL_SUPPLIES", "SUPPLIES", 160, 815, 38, 19, False),
    ("REL_DELIVERS", "DELIVERS", 310, 340, 38, 19, False),
    ("REL_INCLUDES_SB", "INCLUDES", 270, 695, 38, 19, False),
    ("REL_MANAGES_SB", "MANAGES", 380, 450, 36, 18, False),
    ("REL_PAYS_SB", "PAYS", 320, 895, 32, 17, False),
    ("REL_PAYS_APT", "PAYS", 500, 955, 32, 17, False),

    # Center
    ("REL_CONFIRMS", "CONFIRMS", 480, 430, 42, 20, False),
    ("REL_ATTENDS", "ATTENDS", 700, 620, 40, 19, False),
    ("REL_BOOKS", "BOOKS", 965, 890, 38, 20, False),
    ("REL_APT_FOR_PET", "FOR", 840, 710, 32, 17, False),
    ("REL_OWNS", "OWNS", 1075, 460, 36, 18, False),
    ("REL_PRODUCES", "PRODUCES", 810, 1030, 42, 20, False),
    ("REL_PET_HAS_MR", "HAS", 1160, 845, 32, 17, False),
    ("REL_INCLUDES_RX", "INCLUDES", 1270, 1030, 42, 20, False),
    ("REL_PET_HAS_VAX", "HAS", 1240, 650, 32, 17, False),

    # Complaints & Feedback
    ("REL_FILES_COMP", "FILES", 730, 430, 36, 18, False),
    ("REL_REVIEWS_COMP", "REVIEWS", 525, 340, 40, 19, False),
    ("REL_SUBMITS_FB", "SUBMITS", 925, 390, 40, 19, False),

    # Right
    ("REL_MANAGES_RC", "MANAGES", 1320, 200, 42, 20, False),
    ("REL_REPORTS_RC", "REPORTS", 1260, 250, 40, 20, False),
    ("REL_INCLUDES_PET", "INCLUDES", 1470, 340, 44, 22, True),
    ("REL_SUBMITS_APP", "SUBMITS", 1100, 310, 38, 19, False),
    ("REL_APP_FOR_PET", "RECEIVES", 1355, 520, 40, 19, False),
    ("REL_HAS_FOSTER", "HAS", 1470, 595, 34, 18, False),
]

attributes = [
    # USER
    ("USER", "user_id", 610, 50, True, False, 34, 16),
    ("USER", "nic_no", 510, 105, False, False, 30, 16),
    ("USER", "emergency_contact", 650, 140, False, False, 58, 16),
    ("USER", "full_name", 700, 25, False, False, 38, 16),
    ("USER", "email", 800, 25, False, False, 32, 16),
    ("USER", "phone_number", 930, 30, False, False, 46, 16),
    ("USER", "address", 870, 130, False, False, 34, 16),

    # NOTIFICATION
    ("NOTIFICATION", "notification_id", 1110, 25, True, False, 46, 16),
    ("NOTIFICATION", "message", 1230, 25, False, False, 34, 16),
    ("NOTIFICATION", "date_sent", 1300, 75, False, False, 34, 16),
    ("NOTIFICATION", "is_read", 1200, 145, False, False, 30, 16),

    # Subclasses
    ("PET_CARE_PROVIDER", "role", 265, 190, False, False, 26, 15),
    ("VETERINARIAN", "specialization", 755, 235, False, False, 44, 16),

    # Left Column
    ("SERVICE", "service_id", 75, 235, True, False, 34, 16),
    ("SERVICE", "service_name", 60, 290, False, False, 38, 16),
    ("SERVICE", "price", 45, 345, False, False, 28, 16),

    ("SERVICE_PACKAGE", "package_id", 120, 535, True, False, 32, 16),
    ("SERVICE_PACKAGE", "package_name", 240, 535, False, False, 38, 16),
    ("SERVICE_PACKAGE", "package_price", 200, 740, False, False, 38, 16),

    ("INVENTORY_ITEM", "item_id", 115, 595, True, False, 28, 15),
    ("INVENTORY_ITEM", "item_name", 155, 695, False, False, 32, 16),
    ("INVENTORY_ITEM", "stock_qty", 40, 705, False, False, 30, 15),
    ("INVENTORY_ITEM", "unit_price", 90, 760, False, False, 32, 16),

    ("SUPPLIER", "supplier_id", 75, 895, True, False, 34, 16),
    ("SUPPLIER", "supplier_name", 55, 1020, False, False, 40, 16),
    ("SUPPLIER", "contact_info", 150, 1045, False, False, 36, 16),

    ("SERVICE_BOOKING", "booking_id", 240, 875, True, False, 34, 16),
    ("SERVICE_BOOKING", "booking_date", 400, 745, False, False, 36, 16),
    ("SERVICE_BOOKING", "status", 430, 845, False, False, 26, 15),

    ("PAYMENT", "payment_id", 390, 1030, True, False, 32, 16),
    ("PAYMENT", "amount", 290, 970, False, False, 28, 15),
    ("PAYMENT", "payment_date", 275, 1020, False, False, 34, 16),
    ("PAYMENT", "payment_method", 445, 895, False, False, 40, 16),

    # Center Column
    ("APPOINTMENT", "appointment_id", 600, 635, True, False, 42, 16),
    ("APPOINTMENT", "status", 440, 675, False, False, 26, 15),
    ("APPOINTMENT", "appointment_date", 765, 740, False, False, 46, 16),

    ("PET", "pet_id", 1040, 490, True, False, 32, 16),
    ("PET", "pet_name", 1210, 540, False, False, 34, 16),
    ("PET", "species", 1210, 680, False, False, 30, 16),
    ("PET", "breed", 1195, 480, False, False, 28, 16),

    ("MEDICAL_RECORD", "record_id", 960, 955, True, False, 32, 16),
    ("MEDICAL_RECORD", "diagnosis", 1200, 995, False, False, 34, 16),
    ("MEDICAL_RECORD", "notes", 1175, 940, False, False, 28, 15),

    ("PRESCRIPTION", "prescription_id", 1300, 970, True, False, 44, 16),
    ("PRESCRIPTION", "medication", 1385, 935, False, False, 34, 16),
    ("PRESCRIPTION", "notes", 1450, 980, False, False, 26, 15),

    ("VACCINATION", "vaccination_no", 1440, 815, True, False, 42, 16),
    ("VACCINATION", "vaccine_name", 1320, 850, False, False, 38, 16),

    # Complaints & Feedback
    ("COMPLAINT", "complaint_id", 680, 400, True, False, 38, 16),
    ("COMPLAINT", "date_filed", 610, 340, False, False, 34, 16),
    ("COMPLAINT", "status", 575, 555, False, False, 28, 15),
    ("COMPLAINT", "details", 690, 550, False, False, 30, 15),

    ("FEEDBACK", "date", 840, 460, False, False, 28, 15),
    ("FEEDBACK", "rating", 800, 520, False, False, 28, 15),
    ("FEEDBACK", "comments", 845, 575, False, False, 34, 16),
    ("FEEDBACK", "feedback_id", 920, 600, True, False, 38, 16),

    # Right Column
    ("RESCUE_CASE", "case_id", 1330, 145, True, False, 34, 16),
    ("RESCUE_CASE", "location", 1460, 65, False, False, 32, 16),
    ("RESCUE_CASE", "status", 1420, 145, False, False, 28, 15),
    ("RESCUE_CASE", "date", 1495, 150, False, False, 26, 15),
    ("RESCUE_CASE", "animal_condition", 1410, 305, False, False, 48, 16),

    ("RESCUED_PET", "rescued_pet_no", 1395, 395, False, True, 44, 16),
    ("RESCUED_PET", "rescue_status", 1380, 465, False, False, 40, 16),

    ("FOSTER_CARE", "foster_id", 1470, 765, True, False, 34, 16),

    ("ADOPTION_APP", "notes", 1210, 290, False, False, 28, 15),
    ("ADOPTION_APP", "status", 1270, 280, False, False, 28, 15),
    ("ADOPTION_APP", "application_date", 1330, 310, False, False, 46, 16),
    ("ADOPTION_APP", "adoption_fee", 1170, 410, False, False, 38, 16),
    ("ADOPTION_APP", "decision_date", 1215, 450, False, False, 42, 16),
    ("ADOPTION_APP", "application_id", 1270, 480, True, False, 44, 16),
]

connections = [
    ("USER", "REL_RECEIVES", "1", ""),
    ("REL_RECEIVES", "NOTIFICATION", "", "N"),

    ("PET_CARE_PROVIDER", "REL_PROVIDES", "1", ""),
    ("REL_PROVIDES", "SERVICE", "", "N"),

    ("SERVICE", "REL_CONTAINS", "N", ""),
    ("REL_CONTAINS", "SERVICE_PACKAGE", "", "M"),

    ("SERVICE", "REL_USED_IN", "M", ""),
    ("REL_USED_IN", "INVENTORY_ITEM", "", "N"),

    ("SUPPLIER", "REL_SUPPLIES", "1", ""),
    ("REL_SUPPLIES", "INVENTORY_ITEM", "", "N"),

    ("PET_CARE_PROVIDER", "REL_DELIVERS", "1", ""),
    ("REL_DELIVERS", "SERVICE_BOOKING", "", "N"),

    ("SERVICE_PACKAGE", "REL_INCLUDES_SB", "1", ""),
    ("REL_INCLUDES_SB", "SERVICE_BOOKING", "", "N"),

    ("CLINIC_STAFF", "REL_MANAGES_SB", "1", ""),
    ("REL_MANAGES_SB", "SERVICE_BOOKING", "", "N"),

    ("SERVICE_BOOKING", "REL_PAYS_SB", "1", ""),
    ("REL_PAYS_SB", "PAYMENT", "", "1"),

    ("APPOINTMENT", "REL_PAYS_APT", "1", ""),
    ("REL_PAYS_APT", "PAYMENT", "", "1"),

    ("CLINIC_STAFF", "REL_CONFIRMS", "1", ""),
    ("REL_CONFIRMS", "APPOINTMENT", "", "N"),

    ("VETERINARIAN", "REL_ATTENDS", "1", ""),
    ("REL_ATTENDS", "APPOINTMENT", "", "N"),

    # Books connects cleanly
    ("PET_OWNER", "REL_BOOKS", "1", ""),
    ("REL_BOOKS", "APPOINTMENT", "", "N"),
    ("REL_BOOKS", "SERVICE_BOOKING", "", "N"),

    ("APPOINTMENT", "REL_APT_FOR_PET", "N", ""),
    ("REL_APT_FOR_PET", "PET", "", "1"),

    ("PET_OWNER", "REL_OWNS", "1", ""),
    ("REL_OWNS", "PET", "", "N"),

    ("APPOINTMENT", "REL_PRODUCES", "1", ""),
    ("REL_PRODUCES", "MEDICAL_RECORD", "", "1"),

    ("PET", "REL_PET_HAS_MR", "1", ""),
    ("REL_PET_HAS_MR", "MEDICAL_RECORD", "", "N"),

    ("MEDICAL_RECORD", "REL_INCLUDES_RX", "1", ""),
    ("REL_INCLUDES_RX", "PRESCRIPTION", "", "N"),

    ("PET", "REL_PET_HAS_VAX", "1", ""),
    ("REL_PET_HAS_VAX", "VACCINATION", "", "N"),

    ("PET_OWNER", "REL_FILES_COMP", "1", ""),
    ("REL_FILES_COMP", "COMPLAINT", "", "N"),

    ("CLINIC_MANAGER", "REL_REVIEWS_COMP", "1", ""),
    ("REL_REVIEWS_COMP", "COMPLAINT", "", "N"),

    ("PET_OWNER", "REL_SUBMITS_FB", "1", ""),
    ("REL_SUBMITS_FB", "FEEDBACK", "", "N"),

    ("RESCUE_OFFICER", "REL_MANAGES_RC", "1", ""),
    ("REL_MANAGES_RC", "RESCUE_CASE", "", "N"),

    ("PET_OWNER", "REL_REPORTS_RC", "1", ""),
    ("REL_REPORTS_RC", "RESCUE_CASE", "", "N"),

    ("RESCUE_CASE", "REL_INCLUDES_PET", "1", ""),
    ("REL_INCLUDES_PET", "RESCUED_PET", "", "N"),

    ("RESCUED_PET", "REL_HAS_FOSTER", "1", ""),
    ("REL_HAS_FOSTER", "FOSTER_CARE", "", "N"),

    ("PET_OWNER", "REL_SUBMITS_APP", "1", ""),
    ("REL_SUBMITS_APP", "ADOPTION_APP", "", "N"),

    ("ADOPTION_APP", "REL_APP_FOR_PET", "N", ""),
    ("REL_APP_FOR_PET", "RESCUED_PET", "", "1"),
]

coord_map = {}
for e in entities:
    coord_map[e[0]] = (e[2], e[3], e[4], e[5], "entity")
for r in relationships:
    coord_map[r[0]] = (r[2], r[3], r[4]*2, r[5]*2, "rel")

def build_svg():
    W, H = 1600, 1120
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" style="background-color: #FFFFFF; font-family: Arial, Helvetica, sans-serif;">',
        '<style>',
        '  .e { fill: #FFFFFF; stroke: #000000; stroke-width: 1.3; }',
        '  .w { fill: #FFFFFF; stroke: #000000; stroke-width: 1.0; }',
        '  .d { fill: #FFFFFF; stroke: #000000; stroke-width: 1.3; }',
        '  .a { fill: #FFFFFF; stroke: #000000; stroke-width: 1.1; }',
        '  .l { stroke: #000000; stroke-width: 1.1; fill: none; }',
        '  .te { font-size: 10px; font-weight: bold; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }',
        '  .tr { font-size: 8.5px; font-weight: bold; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }',
        '  .ta { font-size: 9px; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }',
        '  .tc { font-size: 9.5px; font-weight: bold; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }',
        '</style>',
        f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
    ]

    # Attribute lines
    svg.append('<!-- Attribute Lines -->')
    for p_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        if p_id in coord_map:
            px, py, pw, ph, _ = coord_map[p_id]
            svg.append(f'<line x1="{px}" y1="{py}" x2="{ax}" y2="{ay}" class="l"/>')

    # Relationship lines
    svg.append('<!-- Relationship Lines -->')
    for k1, k2, c1, c2 in connections:
        x1, y1, _, _, _ = coord_map[k1]
        x2, y2, _, _, _ = coord_map[k2]
        svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="l"/>')

        if c1:
            cx1 = x1 + (x2 - x1) * 0.28
            cy1 = y1 + (y2 - y1) * 0.28 - 3
            svg.append(f'<text x="{cx1}" y="{cy1}" class="tc">{c1}</text>')
        if c2:
            cx2 = x1 + (x2 - x1) * 0.72
            cy2 = y1 + (y2 - y1) * 0.72 - 3
            svg.append(f'<text x="{cx2}" y="{cy2}" class="tc">{c2}</text>')

    # ISA Hierarchy
    svg.append('<!-- ISA Triangle and Subclass Distribution -->')
    isa_x, isa_top, isa_bot = 750, 105, 145
    svg.append(f'<line x1="750" y1="105" x2="750" y2="{isa_top}" class="l"/>')
    svg.append(f'<polygon points="{isa_x},{isa_top} {isa_x+38},{isa_bot} {isa_x-38},{isa_bot}" class="d"/>')
    svg.append(f'<text x="{isa_x}" y="{isa_bot-15}" font-size="9" font-weight="bold" text-anchor="middle">ISA</text>')
    svg.append(f'<text x="{isa_x}" y="{isa_bot-4}" font-size="7.5" font-weight="normal" text-anchor="middle">(Overlap, Partial)</text>')

    bar_y = 165
    svg.append(f'<line x1="180" y1="{bar_y}" x2="1100" y2="{bar_y}" class="l"/>')
    svg.append(f'<line x1="{isa_x}" y1="{isa_bot}" x2="{isa_x}" y2="{bar_y}" class="l"/>')

    sub_drops = [
        ("PET_CARE_PROVIDER", 180),
        ("CLINIC_STAFF", 400),
        ("CLINIC_MANAGER", 590),
        ("VETERINARIAN", 860),
        ("PET_OWNER", 1000),
        ("RESCUE_OFFICER", 1100)
    ]
    for sk, sx in sub_drops:
        sy = coord_map[sk][1]
        sh = coord_map[sk][3]
        svg.append(f'<line x1="{sx}" y1="{bar_y}" x2="{sx}" y2="{sy-sh/2}" class="l"/>')

    # Attributes
    svg.append('<!-- Attributes -->')
    for p_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        svg.append(f'<ellipse cx="{ax}" cy="{ay}" rx="{arx}" ry="{ary}" class="a"/>')
        if is_pk:
            svg.append(f'<text x="{ax}" y="{ay+3.5}" class="ta" font-weight="normal" text-decoration="underline">{aname}</text>')
        elif is_part:
            svg.append(f'<text x="{ax}" y="{ay+3.5}" class="ta" font-style="italic">{aname}</text>')
            svg.append(f'<line x1="{ax-len(aname)*2.6}" y1="{ay+6}" x2="{ax+len(aname)*2.6}" y2="{ay+6}" stroke="#000000" stroke-width="0.8" stroke-dasharray="2,1.5"/>')
        else:
            svg.append(f'<text x="{ax}" y="{ay+3.5}" class="ta">{aname}</text>')

    # Relationships
    svg.append('<!-- Relationships -->')
    for rid, rname, rx, ry, rw, rh, is_id in relationships:
        if is_id:
            outer = f"{rx},{ry-rh-3.5} {rx+rw+5},{ry} {rx},{ry+rh+3.5} {rx-rw-5},{ry}"
            inner = f"{rx},{ry-rh} {rx+rw},{ry} {rx},{ry+rh} {rx-rw},{ry}"
            svg.append(f'<polygon points="{outer}" class="d"/>')
            svg.append(f'<polygon points="{inner}" class="w"/>')
        else:
            pts = f"{rx},{ry-rh} {rx+rw},{ry} {rx},{ry+rh} {rx-rw},{ry}"
            svg.append(f'<polygon points="{pts}" class="d"/>')
        svg.append(f'<text x="{rx}" y="{ry+3}" class="tr">{rname}</text>')

    # Entities
    svg.append('<!-- Entities -->')
    for eid, ename, ex, ey, ew, eh, is_weak in entities:
        bx = ex - ew/2
        by = ey - eh/2
        if is_weak:
            svg.append(f'<rect x="{bx-3.5}" y="{by-3.5}" width="{ew+7}" height="{eh+7}" class="e"/>')
            svg.append(f'<rect x="{bx}" y="{by}" width="{ew}" height="{eh}" class="w"/>')
        else:
            svg.append(f'<rect x="{bx}" y="{by}" width="{ew}" height="{eh}" class="e"/>')

        if "\n" in ename:
            lines = ename.split("\n")
            svg.append(f'<text x="{ex}" y="{ey-2}" class="te">{lines[0]}</text>')
            svg.append(f'<text x="{ex}" y="{ey+10}" class="te">{lines[1]}</text>')
        else:
            svg.append(f'<text x="{ex}" y="{ey+3.5}" class="te">{ename}</text>')

    svg.append('</svg>')

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print("SVG generated successfully:", svg_path)

build_svg()

def build_drawio():
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<mxfile host="app.diagrams.net" modified="2026-09-21T00:00:00.000Z" agent="Antigravity" version="21.0.0" type="device">')
    xml.append('  <diagram id="PetNexus_Fixed_EER" name="PetNexus EER Diagram">')
    xml.append('    <mxGraphModel dx="1600" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1600" pageHeight="1150" background="#FFFFFF">')
    xml.append('      <root>')
    xml.append('        <mxCell id="0"/>')
    xml.append('        <mxCell id="1" parent="0"/>')

    cell_id = 2
    id_map = {}

    for eid, ename, ex, ey, ew, eh, is_weak in entities:
        bx = ex - ew/2
        by = ey - eh/2
        id_map[eid] = cell_id
        label = ename.replace("\n", "&lt;br&gt;")
        if is_weak:
            style = "shape=ext;double=1;rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;strokeWidth=1.3;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        else:
            style = "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;strokeWidth=1.3;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        xml.append(f'        <mxCell id="{cell_id}" value="{label}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{ew}" height="{eh}" as="geometry"/>')
        xml.append('        </mxCell>')
        cell_id += 1

    isa_id = cell_id
    cell_id += 1
    xml.append(f'        <mxCell id="{isa_id}" value="ISA&lt;br&gt;&lt;font style=&quot;font-size: 7.5px;&quot;&gt;(Overlap, Partial)&lt;/font&gt;" style="triangle;whiteSpace=wrap;html=1;direction=south;fontStyle=1;fontSize=9;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.3;" vertex="1" parent="1">')
    xml.append(f'          <mxGeometry x="712" y="105" width="76" height="40" as="geometry"/>')
    xml.append('        </mxCell>')

    xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1.1;" edge="1" parent="1" source="{id_map["USER"]}" target="{isa_id}">')
    xml.append('          <mxGeometry relative="1" as="geometry"/>')
    xml.append('        </mxCell>')
    cell_id += 1

    subclasses = ["PET_CARE_PROVIDER", "CLINIC_STAFF", "CLINIC_MANAGER", "VETERINARIAN", "PET_OWNER", "RESCUE_OFFICER"]
    for sk in subclasses:
        xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1.1;" edge="1" parent="1" source="{isa_id}" target="{id_map[sk]}">')
        xml.append('          <mxGeometry relative="1" as="geometry"/>')
        xml.append('        </mxCell>')
        cell_id += 1

    for rid, rname, rx, ry, rw, rh, is_id in relationships:
        bx = rx - rw
        by = ry - rh
        w = rw * 2
        h = rh * 2
        id_map[rid] = cell_id
        if is_id:
            style = "shape=rhombus;double=1;whiteSpace=wrap;html=1;fontStyle=1;fontSize=8.5;strokeWidth=1.3;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        else:
            style = "shape=rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=8.5;strokeWidth=1.3;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        xml.append(f'        <mxCell id="{cell_id}" value="{rname}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{w}" height="{h}" as="geometry"/>')
        xml.append('        </mxCell>')
        cell_id += 1

    for parent_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        bx = ax - arx
        by = ay - ary
        w = arx * 2
        h = ary * 2
        attr_cell_id = cell_id
        cell_id += 1

        val = aname
        if is_pk:
            val = f"&lt;u&gt;{aname}&lt;/u&gt;"
        elif is_part:
            val = f"&lt;i&gt;{aname}&lt;/i&gt;"

        style = "ellipse;whiteSpace=wrap;html=1;fontSize=9;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.1;fontColor=#000000;"
        xml.append(f'        <mxCell id="{attr_cell_id}" value="{val}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{w}" height="{h}" as="geometry"/>')
        xml.append('        </mxCell>')

        if parent_id in id_map:
            p_cid = id_map[parent_id]
            xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1.1;" edge="1" parent="1" source="{p_cid}" target="{attr_cell_id}">')
            xml.append('          <mxGeometry relative="1" as="geometry"/>')
            xml.append('        </mxCell>')
            cell_id += 1

    for k1, k2, c1, c2 in connections:
        if k1 in id_map and k2 in id_map:
            s_id = id_map[k1]
            t_id = id_map[k2]
            label = ""
            if c1 and c2:
                label = f"{c1} : {c2}"
            elif c1:
                label = c1
            elif c2:
                label = c2
            xml.append(f'        <mxCell id="{cell_id}" value="{label}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1.1;fontStyle=1;fontSize=9.5;fontColor=#000000;" edge="1" parent="1" source="{s_id}" target="{t_id}">')
            xml.append('          <mxGeometry relative="1" as="geometry"/>')
            xml.append('        </mxCell>')
            cell_id += 1

    xml.append('      </root>')
    xml.append('    </mxGraphModel>')
    xml.append('  </diagram>')
    xml.append('</mxfile>')

    with open(drawio_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml))
    print("Draw.io generated successfully:", drawio_path)

build_drawio()

def build_html():
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_code = f.read()

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PetNexus Clean EER Diagram</title>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            background-color: #f4f6f8;
            font-family: Arial, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
        }}
        .header {{
            margin-bottom: 15px;
            text-align: center;
        }}
        h1 {{
            margin: 0 0 5px 0;
            font-size: 20px;
            color: #111;
        }}
        p {{
            margin: 0;
            font-size: 13px;
            color: #555;
        }}
        .canvas-container {{
            background: #ffffff;
            border: 1px solid #ddd;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            border-radius: 6px;
            overflow: auto;
            max-width: 98vw;
            max-height: 88vh;
        }}
        svg {{
            display: block;
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>PetNexus - Corrected Enhanced Entity Relationship (EER) Diagram</h1>
        <p>SLIIT Software Engineering Project | Pure Draw.io Black & White Style | Zero Shape Collisions</p>
    </div>
    <div class="canvas-container">
        {svg_code}
    </div>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_content)
    print("HTML viewer generated successfully:", html_path)

build_html()

def render_png():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    render_html_tmp = os.path.join(DESKTOP_DIR, "render_tmp.html")
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_code = f.read()

    with open(render_html_tmp, "w", encoding="utf-8") as f:
        f.write(f'<!DOCTYPE html><html><head><style>* {{ margin:0; padding:0; }} body {{ background:#FFFFFF; width:1600px; height:1120px; overflow:hidden; }} svg {{ display:block; width:1600px; height:1120px; }}</style></head><body>{svg_code}</body></html>')

    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1620,1140",
        f"--screenshot={png_path}",
        render_html_tmp
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(render_html_tmp):
        os.remove(render_html_tmp)

    import shutil
    shutil.copyfile(png_path, preview_png)
    print("PNG rendered and copied to preview successfully:", png_path)

render_png()

