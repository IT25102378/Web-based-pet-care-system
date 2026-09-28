import os
import subprocess
import math

DESKTOP_DIR = r"C:\Users\Avinash\Desktop\PetNexus_Diagrams"
os.makedirs(DESKTOP_DIR, exist_ok=True)

svg_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.svg")
drawio_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.drawio")
html_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.html")
png_path = os.path.join(DESKTOP_DIR, "PetNexus_EER_Fixed.png")

# Coordinates mapped directly from the user's uploaded diagram
entities = [
    # id, label, cx, cy, w, h, is_weak
    ("USER", "USER", 650, 75, 75, 25, False),
    ("NOTIFICATION", "NOTIFICATION", 1030, 80, 95, 25, False),

    # Subclasses
    ("PET_CARE_PROVIDER", "PET CARE\nPROVIDER", 175, 125, 115, 38, False),
    ("CLINIC_STAFF", "CLINIC STAFF", 350, 185, 85, 25, False),
    ("CLINIC_MANAGER", "CLINIC MANAGER", 520, 220, 105, 25, False),
    ("VETERINARIAN", "VETERINARIAN", 750, 220, 95, 25, False),
    ("PET_OWNER", "PET OWNER", 870, 220, 80, 25, False),
    ("RESCUE_OFFICER", "RESCUE OFFICER", 960, 165, 110, 25, False),

    # Left Column
    ("SERVICE", "SERVICE", 175, 300, 70, 25, False),
    ("SERVICE_PACKAGE", "SERVICE PACKAGE", 195, 580, 115, 25, False),
    ("SERVICE_BOOKING", "SERVICE BOOKING", 290, 755, 115, 25, False),
    ("INVENTORY_ITEM", "INVENTORY ITEM", 65, 585, 105, 25, False),
    ("SUPPLIER", "SUPPLIER", 170, 865, 80, 25, False),
    ("PAYMENT", "PAYMENT", 350, 920, 75, 25, False),

    # Center Column
    ("APPOINTMENT", "APPOINTMENT", 500, 685, 100, 25, False),
    ("PET", "PET", 990, 510, 65, 25, False),
    ("MEDICAL_RECORD", "MEDICAL RECORD", 900, 965, 115, 25, False),
    ("PRESCRIPTION", "PRESCRIPTION", 1280, 965, 105, 25, False),
    ("VACCINATION", "VACCINATION", 1180, 690, 95, 25, False),

    # Complaints & Feedback
    ("COMPLAINT", "COMPLAINT", 540, 450, 85, 25, False),
    ("FEEDBACK", "FEEDBACK", 800, 475, 75, 25, False),

    # Right Column
    ("RESCUE_CASE", "RESCUE CASE", 1280, 220, 95, 25, False),
    ("RESCUED_PET", "RESCUED PET", 1285, 475, 95, 25, True), # Weak Entity
    ("FOSTER_CARE", "FOSTER CARE", 1285, 615, 95, 25, False), # Strong Entity
    ("ADOPTION_APP", "ADOPTION APPLICATION", 1130, 320, 140, 25, False),
]

relationships = [
    # id, label, cx, cy, rw, rh, is_id
    ("REL_RECEIVES", "RECEIVES", 865, 80, 38, 18, False),

    # Left
    ("REL_PROVIDES", "PROVIDES", 175, 220, 38, 18, False),
    ("REL_CONTAINS", "CONTAINS", 175, 440, 38, 18, False),
    ("REL_USED_IN", "USED IN", 60, 425, 34, 16, False),
    ("REL_SUPPLIES", "SUPPLIES", 150, 750, 36, 17, False),
    ("REL_DELIVERS", "DELIVERS", 290, 355, 36, 17, False),
    ("REL_INCLUDES_SB", "INCLUDES", 250, 645, 36, 17, False),
    ("REL_MANAGES_SB", "MANAGES", 375, 420, 34, 16, False),
    ("REL_PLACES_SB", "PLACES", 480, 740, 32, 16, False), # Clean separate diamond for booking!
    ("REL_SB_FOR_PET", "FOR", 640, 730, 28, 14, False), # Links booking to pet!
    ("REL_PAYS_SB", "PAYS", 290, 845, 30, 15, False),
    ("REL_PAYS_APT", "PAYS", 500, 905, 30, 15, False),

    # Center
    ("REL_CONFIRMS", "CONFIRMS", 420, 365, 36, 17, False),
    ("REL_ATTENDS", "ATTENDS", 650, 575, 36, 17, False),
    ("REL_BOOKS_APT", "BOOKS", 870, 820, 34, 16, False),
    ("REL_APT_FOR_PET", "FOR", 800, 750, 28, 14, False),
    ("REL_OWNS", "OWNS", 950, 420, 30, 15, False),
    ("REL_PRODUCES", "PRODUCES", 720, 965, 38, 18, False),
    ("REL_PET_HAS_MR", "HAS", 1040, 785, 28, 14, False),
    ("REL_INCLUDES_RX", "INCLUDES", 1140, 965, 36, 17, False),
    ("REL_PET_HAS_VAX", "HAS", 1100, 595, 28, 14, False),

    # Complaints & Feedback
    ("REL_FILES_COMP", "FILES", 640, 405, 30, 15, False),
    ("REL_REVIEWS_COMP", "REVIEWS", 460, 305, 34, 16, False),
    ("REL_SUBMITS_FB", "SUBMITS", 820, 350, 34, 16, False),

    # Right
    ("REL_MANAGES_RC", "MANAGES", 1150, 180, 36, 17, False),
    ("REL_REPORTS_RC", "REPORTS", 1100, 225, 36, 17, False),
    ("REL_INCLUDES_PET", "INCLUDES", 1285, 305, 38, 18, True), # Double diamond
    ("REL_SUBMITS_APP", "SUBMITS", 965, 280, 34, 16, False),
    ("REL_APP_FOR_PET", "RECEIVES", 1170, 475, 36, 17, False), # Kept user's label
    ("REL_HAS_FOSTER", "HAS", 1285, 540, 28, 14, False), # Single diamond
    ("REL_ADOPTED_AS", "ADOPTED AS", 1140, 530, 40, 17, False), # Bridge to Pet
]

attributes = [
    # USER
    ("USER", "user_id", 520, 42, True, False, 26, 13),
    ("USER", "nic_no", 460, 95, False, False, 24, 13),
    ("USER", "full_name", 625, 18, False, False, 28, 13),
    ("USER", "email", 725, 18, False, False, 24, 13),
    ("USER", "phone_number", 850, 24, False, False, 36, 13),
    ("USER", "address", 750, 120, False, False, 26, 13),
    ("USER", "emergency_contact", 890, 80, False, False, 44, 13), # Corrected placement!

    # NOTIFICATION
    ("NOTIFICATION", "notification_id", 985, 20, True, False, 36, 13),
    ("NOTIFICATION", "message", 1085, 20, False, False, 26, 13),
    ("NOTIFICATION", "date_sent", 1135, 65, False, False, 26, 13),
    ("NOTIFICATION", "is_read", 1055, 130, False, False, 24, 13),

    # Subclasses
    ("PET_CARE_PROVIDER", "role", 255, 175, False, False, 20, 13),
    ("VETERINARIAN", "specialization", 650, 230, False, False, 34, 13),

    # Left Column
    ("SERVICE", "service_id", 80, 205, True, False, 28, 13),
    ("SERVICE", "service_name", 65, 255, False, False, 34, 13),
    ("SERVICE", "price", 50, 310, False, False, 22, 13),

    ("SERVICE_PACKAGE", "package_id", 115, 485, True, False, 28, 13),
    ("SERVICE_PACKAGE", "package_name", 235, 485, False, False, 34, 13),
    ("SERVICE_PACKAGE", "package_price", 195, 690, False, False, 34, 13),

    ("INVENTORY_ITEM", "item_id", 105, 545, True, False, 24, 13),
    ("INVENTORY_ITEM", "item_name", 145, 640, False, False, 28, 13),
    ("INVENTORY_ITEM", "stock_qty", 35, 655, False, False, 26, 13),
    ("INVENTORY_ITEM", "unit_price", 85, 705, False, False, 26, 13),

    ("SUPPLIER", "supplier_id", 65, 830, True, False, 28, 13),
    ("SUPPLIER", "supplier_name", 50, 950, False, False, 34, 13),
    ("SUPPLIER", "contact_info", 140, 980, False, False, 30, 13),

    ("SERVICE_BOOKING", "booking_id", 215, 820, True, False, 28, 13),
    ("SERVICE_BOOKING", "booking_date", 360, 700, False, False, 32, 13),
    ("SERVICE_BOOKING", "status", 390, 795, False, False, 22, 13),

    ("PAYMENT", "payment_id", 350, 980, True, False, 28, 13),
    ("PAYMENT", "amount", 255, 920, False, False, 22, 13),
    ("PAYMENT", "payment_date", 245, 965, False, False, 30, 13),
    ("PAYMENT", "payment_method", 400, 850, False, False, 36, 13), # Moved here!

    # Center Column
    ("APPOINTMENT", "appointment_id", 530, 575, True, False, 34, 13),
    ("APPOINTMENT", "status", 390, 615, False, False, 20, 13),
    ("APPOINTMENT", "appointment_date", 680, 675, False, False, 36, 13),

    ("PET", "pet_id", 910, 470, True, False, 24, 13),
    ("PET", "pet_name", 950, 550, False, False, 26, 13),
    ("PET", "species", 930, 630, False, False, 24, 13),
    ("PET", "breed", 1045, 455, False, False, 22, 13),

    ("MEDICAL_RECORD", "record_id", 855, 890, True, False, 26, 13),
    ("MEDICAL_RECORD", "diagnosis", 1070, 930, False, False, 26, 13),
    ("MEDICAL_RECORD", "notes", 1050, 875, False, False, 22, 13),

    ("PRESCRIPTION", "prescription_id", 1165, 905, True, False, 34, 13),
    ("PRESCRIPTION", "medication", 1235, 870, False, False, 26, 13),
    ("PRESCRIPTION", "notes", 1295, 915, False, False, 20, 13),

    ("VACCINATION", "vaccination_no", 1285, 765, True, False, 32, 13),
    ("VACCINATION", "vaccine_name", 1175, 795, False, False, 30, 13),

    # Complaints & Feedback
    ("COMPLAINT", "complaint_id", 635, 320, True, False, 30, 13),
    ("COMPLAINT", "date_filed", 540, 330, False, False, 26, 13),
    ("COMPLAINT", "details", 610, 505, False, False, 24, 13),
    ("COMPLAINT", "status", 485, 500, False, False, 22, 13),

    ("FEEDBACK", "date", 750, 420, False, False, 22, 13),
    ("FEEDBACK", "rating", 710, 475, False, False, 22, 13),
    ("FEEDBACK", "comments", 750, 525, False, False, 26, 13),
    ("FEEDBACK", "feedback_id", 815, 550, True, False, 28, 13),

    # Right Column
    ("RESCUE_CASE", "case_id", 1160, 130, True, False, 24, 13),
    ("RESCUE_CASE", "location", 1270, 55, False, False, 24, 13),
    ("RESCUE_CASE", "status", 1235, 130, False, False, 20, 13),
    ("RESCUE_CASE", "date", 1300, 135, False, False, 18, 13),
    ("RESCUE_CASE", "animal_condition", 1215, 270, False, False, 36, 13),

    ("RESCUED_PET", "rescued_pet_no", 1220, 360, False, True, 34, 13),
    ("RESCUED_PET", "rescue_status", 1205, 420, False, False, 28, 13),
    ("RESCUED_PET", "breed", 1370, 465, False, False, 22, 13),

    ("FOSTER_CARE", "foster_id", 1285, 700, True, False, 26, 13),

    ("ADOPTION_APP", "notes", 1040, 260, False, False, 20, 13),
    ("ADOPTION_APP", "status", 1105, 270, False, False, 20, 13),
    ("ADOPTION_APP", "adoption_fee", 1030, 365, False, False, 28, 13),
    ("ADOPTION_APP", "decision_date", 1065, 405, False, False, 30, 13),
    ("ADOPTION_APP", "application_id", 1105, 510, True, False, 32, 13),
    ("ADOPTION_APP", "application_date", 1185, 555, False, False, 34, 13),
]

connections = [
    # Top User to Notification
    ("USER", "REL_RECEIVES", "1", ""),
    ("REL_RECEIVES", "NOTIFICATION", "", "N"),

    # Left: Provider -> Service -> Package -> Booking
    ("PET_CARE_PROVIDER", "REL_PROVIDES", "1", ""),
    ("REL_PROVIDES", "SERVICE", "", "N"),

    ("SERVICE", "REL_CONTAINS", "N", ""),
    ("REL_CONTAINS", "SERVICE_PACKAGE", "", "M"), # Fixed M:N

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

    ("PET_OWNER", "REL_PLACES_SB", "1", ""),
    ("REL_PLACES_SB", "SERVICE_BOOKING", "", "N"),
    ("SERVICE_BOOKING", "REL_SB_FOR_PET", "N", ""),
    ("REL_SB_FOR_PET", "PET", "", "1"),

    ("SERVICE_BOOKING", "REL_PAYS_SB", "1", ""),
    ("REL_PAYS_SB", "PAYMENT", "", "1"),

    ("APPOINTMENT", "REL_PAYS_APT", "1", ""),
    ("REL_PAYS_APT", "PAYMENT", "", "1"),

    # Center: Appointments, Pets, Records
    ("CLINIC_STAFF", "REL_CONFIRMS", "1", ""),
    ("REL_CONFIRMS", "APPOINTMENT", "", "N"),

    ("VETERINARIAN", "REL_ATTENDS", "1", ""),
    ("REL_ATTENDS", "APPOINTMENT", "", "N"),

    ("PET_OWNER", "REL_BOOKS_APT", "1", ""),
    ("REL_BOOKS_APT", "APPOINTMENT", "", "N"),

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

    # Complaints & Feedback
    ("PET_OWNER", "REL_FILES_COMP", "1", ""),
    ("REL_FILES_COMP", "COMPLAINT", "", "N"),

    ("CLINIC_MANAGER", "REL_REVIEWS_COMP", "1", ""),
    ("REL_REVIEWS_COMP", "COMPLAINT", "", "N"),

    ("PET_OWNER", "REL_SUBMITS_FB", "1", ""),
    ("REL_SUBMITS_FB", "FEEDBACK", "", "N"),

    # Right: Rescue, Foster, Adoption
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

    ("RESCUED_PET", "REL_ADOPTED_AS", "1", ""),
    ("REL_ADOPTED_AS", "PET", "", "0..1"),
]

coord_map = {}
for e in entities:
    coord_map[e[0]] = (e[2], e[3], e[4], e[5], "entity")
for r in relationships:
    coord_map[r[0]] = (r[2], r[3], r[4]*2, r[5]*2, "rel")

def build_svg():
    W, H = 1450, 1040
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" style="background-color: #FFFFFF; font-family: Helvetica, Arial, sans-serif;">',
        '<style>',
        '  .e { fill: #FFFFFF; stroke: #000000; stroke-width: 1.2; }',
        '  .w { fill: #FFFFFF; stroke: #000000; stroke-width: 1.0; }',
        '  .d { fill: #FFFFFF; stroke: #000000; stroke-width: 1.2; }',
        '  .a { fill: #FFFFFF; stroke: #000000; stroke-width: 1.0; }',
        '  .l { stroke: #000000; stroke-width: 1.0; fill: none; }',
        '  .te { font-size: 9px; font-weight: bold; fill: #000000; text-anchor: middle; }',
        '  .tr { font-size: 8px; font-weight: bold; fill: #000000; text-anchor: middle; }',
        '  .ta { font-size: 8.5px; fill: #000000; text-anchor: middle; }',
        '  .tc { font-size: 9px; font-weight: normal; fill: #000000; text-anchor: middle; }',
        '</style>',
        f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>'
    ]

    # 1. Attribute connector lines
    svg.append('<!-- Attribute Lines -->')
    for p_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        if p_id in coord_map:
            px, py, pw, ph, _ = coord_map[p_id]
            # Clean connection from node to attribute
            svg.append(f'<line x1="{px}" y1="{py}" x2="{ax}" y2="{ay}" class="l"/>')

    # 2. Relationship connector lines with exact clean cardinalities
    svg.append('<!-- Relationship Lines -->')
    for k1, k2, c1, c2 in connections:
        x1, y1, _, _, _ = coord_map[k1]
        x2, y2, _, _, _ = coord_map[k2]
        svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="l"/>')

        if c1:
            cx1 = x1 + (x2 - x1) * 0.32
            cy1 = y1 + (y2 - y1) * 0.32 - 3
            svg.append(f'<text x="{cx1}" y="{cy1}" class="tc">{c1}</text>')
        if c2:
            cx2 = x1 + (x2 - x1) * 0.68
            cy2 = y1 + (y2 - y1) * 0.68 - 3
            svg.append(f'<text x="{cx2}" y="{cy2}" class="tc">{c2}</text>')

    # 3. ISA Triangle and Subclass Distribution
    svg.append('<!-- ISA Hierarchy -->')
    isa_x, isa_top, isa_bot = 650, 95, 135
    svg.append(f'<line x1="650" y1="87" x2="650" y2="{isa_top}" class="l"/>')
    svg.append(f'<polygon points="{isa_x},{isa_top} {isa_x+35},{isa_bot} {isa_x-35},{isa_bot}" class="d"/>')
    svg.append(f'<text x="{isa_x}" y="{isa_bot-14}" font-size="8.5" font-weight="bold" text-anchor="middle">ISA</text>')
    svg.append(f'<text x="{isa_x}" y="{isa_bot-3}" font-size="7" font-weight="normal" text-anchor="middle">(Overlap, Partial)</text>')

    # Horizontal distribution bar
    bar_y = 150
    svg.append(f'<line x1="175" y1="{bar_y}" x2="960" y2="{bar_y}" class="l"/>')
    svg.append(f'<line x1="{isa_x}" y1="{isa_bot}" x2="{isa_x}" y2="{bar_y}" class="l"/>')

    # Drop lines to each subclass
    sub_drops = [
        ("PET_CARE_PROVIDER", 175),
        ("CLINIC_STAFF", 350),
        ("CLINIC_MANAGER", 520),
        ("VETERINARIAN", 750),
        ("PET_OWNER", 870),
        ("RESCUE_OFFICER", 960)
    ]
    for sk, sx in sub_drops:
        sy = coord_map[sk][1]
        sh = coord_map[sk][3]
        svg.append(f'<line x1="{sx}" y1="{bar_y}" x2="{sx}" y2="{sy-sh/2}" class="l"/>')

    # 4. Attribute Ellipses
    svg.append('<!-- Attribute Ellipses -->')
    for p_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        svg.append(f'<ellipse cx="{ax}" cy="{ay}" rx="{arx}" ry="{ary}" class="a"/>')
        if is_pk:
            svg.append(f'<text x="{ax}" y="{ay+3}" class="ta" font-weight="normal" text-decoration="underline">{aname}</text>')
        elif is_part:
            svg.append(f'<text x="{ax}" y="{ay+3}" class="ta" font-style="italic">{aname}</text>')
            svg.append(f'<line x1="{ax-len(aname)*2.4}" y1="{ay+5.5}" x2="{ax+len(aname)*2.4}" y2="{ay+5.5}" stroke="#000000" stroke-width="0.8" stroke-dasharray="2,1.5"/>')
        else:
            svg.append(f'<text x="{ax}" y="{ay+3}" class="ta">{aname}</text>')

    # 5. Relationship Diamonds
    svg.append('<!-- Relationship Diamonds -->')
    for rid, rname, rx, ry, rw, rh, is_id in relationships:
        if is_id:
            # Double Diamond
            outer = f"{rx},{ry-rh-3} {rx+rw+4},{ry} {rx},{ry+rh+3} {rx-rw-4},{ry}"
            inner = f"{rx},{ry-rh} {rx+rw},{ry} {rx},{ry+rh} {rx-rw},{ry}"
            svg.append(f'<polygon points="{outer}" class="d"/>')
            svg.append(f'<polygon points="{inner}" class="w"/>')
        else:
            pts = f"{rx},{ry-rh} {rx+rw},{ry} {rx},{ry+rh} {rx-rw},{ry}"
            svg.append(f'<polygon points="{pts}" class="d"/>')
        svg.append(f'<text x="{rx}" y="{ry+2.5}" class="tr">{rname}</text>')

    # 6. Entities (Rectangles)
    svg.append('<!-- Entities -->')
    for eid, ename, ex, ey, ew, eh, is_weak in entities:
        bx = ex - ew/2
        by = ey - eh/2
        if is_weak:
            # Double Rectangle
            svg.append(f'<rect x="{bx-3}" y="{by-3}" width="{ew+6}" height="{eh+6}" class="e"/>')
            svg.append(f'<rect x="{bx}" y="{by}" width="{ew}" height="{eh}" class="w"/>')
        else:
            svg.append(f'<rect x="{bx}" y="{by}" width="{ew}" height="{eh}" class="e"/>')

        if "\n" in ename:
            lines = ename.split("\n")
            svg.append(f'<text x="{ex}" y="{ey-1.5}" class="te">{lines[0]}</text>')
            svg.append(f'<text x="{ex}" y="{ey+9.5}" class="te">{lines[1]}</text>')
        else:
            svg.append(f'<text x="{ex}" y="{ey+3}" class="te">{ename}</text>')

    svg.append('</svg>')

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print("SVG generated successfully:", svg_path)

build_svg()

def build_drawio():
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<mxfile host="app.diagrams.net" modified="2026-09-21T00:00:00.000Z" agent="Antigravity" version="21.0.0" type="device">')
    xml.append('  <diagram id="PetNexus_Exact_EER" name="PetNexus EER Diagram">')
    xml.append('    <mxGraphModel dx="1600" dy="1100" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1450" pageHeight="1050" background="#FFFFFF">')
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
            style = "shape=ext;double=1;rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;strokeWidth=1.2;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        else:
            style = "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=10;strokeWidth=1.2;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        xml.append(f'        <mxCell id="{cell_id}" value="{label}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{ew}" height="{eh}" as="geometry"/>')
        xml.append('        </mxCell>')
        cell_id += 1

    isa_id = cell_id
    cell_id += 1
    xml.append(f'        <mxCell id="{isa_id}" value="ISA&lt;br&gt;&lt;font style=&quot;font-size: 7px;&quot;&gt;(Overlap, Partial)&lt;/font&gt;" style="triangle;whiteSpace=wrap;html=1;direction=south;fontStyle=1;fontSize=8.5;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.2;" vertex="1" parent="1">')
    xml.append(f'          <mxGeometry x="615" y="95" width="70" height="40" as="geometry"/>')
    xml.append('        </mxCell>')

    xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1;" edge="1" parent="1" source="{id_map["USER"]}" target="{isa_id}">')
    xml.append('          <mxGeometry relative="1" as="geometry"/>')
    xml.append('        </mxCell>')
    cell_id += 1

    subclasses = ["PET_CARE_PROVIDER", "CLINIC_STAFF", "CLINIC_MANAGER", "VETERINARIAN", "PET_OWNER", "RESCUE_OFFICER"]
    for sk in subclasses:
        xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1;" edge="1" parent="1" source="{isa_id}" target="{id_map[sk]}">')
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
            style = "shape=rhombus;double=1;whiteSpace=wrap;html=1;fontStyle=1;fontSize=8;strokeWidth=1.2;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        else:
            style = "shape=rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=8;strokeWidth=1.2;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
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

        style = "ellipse;whiteSpace=wrap;html=1;fontSize=8.5;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1;fontColor=#000000;"
        xml.append(f'        <mxCell id="{attr_cell_id}" value="{val}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{w}" height="{h}" as="geometry"/>')
        xml.append('        </mxCell>')

        if parent_id in id_map:
            p_cid = id_map[parent_id]
            xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1;" edge="1" parent="1" source="{p_cid}" target="{attr_cell_id}">')
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
            xml.append(f'        <mxCell id="{cell_id}" value="{label}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1;fontStyle=0;fontSize=9;fontColor=#000000;" edge="1" parent="1" source="{s_id}" target="{t_id}">')
            xml.append('          <mxGeometry relative="1" as="geometry"/>')
            xml.append('        </mxCell>')
            cell_id += 1

    xml.append('      </root>')
    xml.append('    </mxGraphModel>')
    xml.append('  </diagram>')
    xml.append('</mxfile>')

    with open(drawio_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml))
    print("Draw.io file generated successfully:", drawio_path)

build_drawio()

def render_png():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    render_html_tmp = os.path.join(DESKTOP_DIR, "render_tmp.html")
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_code = f.read()

    with open(render_html_tmp, "w", encoding="utf-8") as f:
        f.write(f'<!DOCTYPE html><html><head><style>* {{ margin:0; padding:0; }} body {{ background:#FFFFFF; width:1450px; height:1040px; overflow:hidden; }} svg {{ display:block; width:1450px; height:1040px; }}</style></head><body>{svg_code}</body></html>')

    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=1470,1060",
        f"--screenshot={png_path}",
        render_html_tmp
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(render_html_tmp):
        os.remove(render_html_tmp)

    size = os.path.getsize(png_path)
    print(f"PNG rendered successfully: {png_path} ({size:,} bytes)")

render_png()

def build_html():
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_code = f.read()

    content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PetNexus — EER Diagram (Clean Exact Style)</title>
  <style>
    * {{ margin:0; padding:0; box-sizing:border-box; }}
    body {{ background: #1E293B; color: #FFF; font-family: Arial, sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden; }}
    header {{ background: #0F172A; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }}
    header h1 {{ font-size: 16px; color: #38BDF8; }}
    header p {{ font-size: 11px; color: #94A3B8; }}
    .controls {{ display: flex; gap: 8px; }}
    .btn {{ background: #334155; color: #FFF; border: none; padding: 6px 14px; border-radius: 4px; cursor: pointer; font-size: 12px; }}
    .btn:hover {{ background: #475569; }}
    .btn.pri {{ background: #0284C7; }}
    #vp {{ flex: 1; position: relative; overflow: hidden; background: #FFFFFF; cursor: grab; }}
    #vp:active {{ cursor: grabbing; }}
    #cnt {{ transform-origin: 0 0; width: 1450px; height: 1040px; }}
    .pill {{ position: absolute; bottom: 16px; left: 16px; background: rgba(15,23,42,0.85); padding: 8px 16px; border-radius: 6px; font-size: 12px; color: #E2E8F0; pointer-events: none; }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>PetNexus — Preserved Exact Layout EER Diagram</h1>
      <p>Clean Draw.io Format • Zero Overlapping Lines • Exact Original Placement Preserved</p>
    </div>
    <div class="controls">
      <button class="btn" onclick="zoomIn()">Zoom In (+)</button>
      <button class="btn" onclick="zoomOut()">Zoom Out (-)</button>
      <button class="btn" onclick="resetZoom()">Fit</button>
      <button class="btn pri" onclick="window.open('https://app.diagrams.net', '_blank')">Open in Draw.io</button>
    </div>
  </header>
  <div id="vp">
    <div id="cnt">{svg_code}</div>
    <div class="pill">Use Mouse Wheel to Zoom • Click &amp; Drag to Pan Canvas</div>
  </div>
  <script>
    const cnt = document.getElementById('cnt');
    const vp = document.getElementById('vp');
    let scale = 0.85;
    let px = 20, py = 20, isPan = false, sx = 0, sy = 0;
    function apply() {{ cnt.style.transform = `translate(${{px}}px, ${{py}}px) scale(${{scale}})`; }}
    apply();
    vp.onmousedown = (e) => {{ isPan = true; sx = e.clientX - px; sy = e.clientY - py; }};
    window.onmousemove = (e) => {{ if (!isPan) return; px = e.clientX - sx; py = e.clientY - sy; apply(); }};
    window.onmouseup = () => isPan = false;
    vp.onwheel = (e) => {{
      e.preventDefault();
      const xs = (e.clientX - px) / scale;
      const ys = (e.clientY - py) / scale;
      scale = e.deltaY < 0 ? scale * 1.15 : scale / 1.15;
      scale = Math.min(Math.max(0.2, scale), 3.0);
      px = e.clientX - xs * scale;
      py = e.clientY - ys * scale;
      apply();
    }};
    function zoomIn() {{ scale *= 1.25; apply(); }}
    function zoomOut() {{ scale /= 1.25; apply(); }}
    function resetZoom() {{ scale = 0.85; px = 20; py = 20; apply(); }}
  </script>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("HTML viewer generated successfully:", html_path)

build_html()
print("\n>>> ALL EXACT-STYLE REPLICA FILES GENERATED SUCCESSFULLY IN:", DESKTOP_DIR)
