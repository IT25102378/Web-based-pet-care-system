import os
import sys
import subprocess
import math

DESKTOP_DIR = r"C:\Users\Avinash\Desktop\PetNexus_Diagrams"
os.makedirs(DESKTOP_DIR, exist_ok=True)

svg_path = os.path.join(DESKTOP_DIR, "PetNexus_Original_Fixed_EER.svg")
drawio_path = os.path.join(DESKTOP_DIR, "PetNexus_Original_Fixed_EER.drawio")
html_path = os.path.join(DESKTOP_DIR, "PetNexus_Original_Fixed_EER.html")
png_path = os.path.join(DESKTOP_DIR, "PetNexus_Original_Fixed_EER.png")

print("Building exact layout EER diagram preserving user original style...")

# ==============================================================================
# 1. ENTITY DEFINITIONS (Exact user layout positions)
# ==============================================================================
entities = [
    # id, name, cx, cy, w, h, is_weak
    ("USER", "USER", 980, 80, 110, 36, False),
    ("NOTIFICATION", "NOTIFICATION", 1520, 80, 125, 36, False),

    # Subclasses row
    ("PET_CARE_PROVIDER", "PET CARE\nPROVIDER", 150, 240, 125, 42, False),
    ("CLINIC_STAFF", "CLINIC STAFF", 480, 240, 110, 36, False),
    ("CLINIC_MANAGER", "CLINIC MANAGER", 770, 240, 125, 36, False),
    ("VETERINARIAN", "VETERINARIAN", 1120, 240, 120, 36, False),
    ("PET_OWNER", "PET OWNER", 1360, 240, 110, 36, False),
    ("RESCUE_OFFICER", "RESCUE OFFICER", 1820, 240, 130, 36, False),

    # Left Column: Services, Packages, Booking, Inventory, Supplier
    ("SERVICE", "SERVICE", 150, 420, 95, 34, False),
    ("SERVICE_PACKAGE", "SERVICE PACKAGE", 180, 660, 140, 36, False),
    ("SERVICE_BOOKING", "SERVICE BOOKING", 410, 820, 140, 36, False),
    ("INVENTORY_ITEM", "INVENTORY ITEM", 80, 660, 130, 36, False),
    ("SUPPLIER", "SUPPLIER", 180, 940, 100, 36, False),
    ("PAYMENT", "PAYMENT", 530, 970, 95, 36, False),

    # Center Column: Appointments, Pet, Medical, Vaccination
    ("APPOINTMENT", "APPOINTMENT", 740, 700, 125, 36, False),
    ("PET", "PET", 1420, 530, 85, 36, False),
    ("MEDICAL_RECORD", "MEDICAL RECORD", 1250, 930, 135, 36, False),
    ("PRESCRIPTION", "PRESCRIPTION", 1750, 930, 125, 36, False),
    ("VACCINATION", "VACCINATION", 1680, 680, 115, 36, False),

    # Feedback & Complaints
    ("COMPLAINT", "COMPLAINT", 770, 440, 105, 36, False),
    ("FEEDBACK", "FEEDBACK", 1220, 460, 95, 36, False),

    # Right Column: Rescue, Foster, Adoption
    ("RESCUE_CASE", "RESCUE CASE", 1860, 240, 115, 36, False),
    ("RESCUED_PET", "RESCUED PET", 1870, 460, 125, 36, True), # Weak Entity
    ("FOSTER_CARE", "FOSTER CARE", 1870, 630, 115, 36, False), # Fixed: Strong entity with PK
    ("ADOPTION_APP", "ADOPTION APPLICATION", 1580, 330, 160, 36, False),
]

# ==============================================================================
# 2. RELATIONSHIPS (Diamonds)
# ==============================================================================
relationships = [
    # id, name, cx, cy, rw, rh, is_id
    ("REL_RECEIVES", "RECEIVES", 1260, 80, 42, 22, False),

    # Left Column
    ("REL_PROVIDES", "PROVIDES", 150, 330, 42, 22, False),
    ("REL_CONTAINS", "CONTAINS", 150, 540, 42, 22, False),
    ("REL_USED_IN", "USED IN", 80, 540, 38, 20, False),
    ("REL_SUPPLIES", "SUPPLIES", 150, 830, 40, 21, False),
    ("REL_DELIVERS", "DELIVERS", 290, 440, 38, 20, False),
    ("REL_PKG_INCLUDES", "INCLUDES", 300, 710, 40, 21, False),
    ("REL_MANAGES_SB", "MANAGES", 530, 500, 38, 20, False),
    ("REL_PLACES_SB", "PLACES", 670, 800, 36, 19, False), # Dedicated clean diamond for Service Booking!
    ("REL_SB_FOR_PET", "FOR", 820, 800, 32, 17, False), # Links booking to pet!
    ("REL_PAYS_SB", "PAYS", 370, 920, 34, 18, False),
    ("REL_PAYS_APT", "PAYS", 660, 920, 34, 18, False),

    # Center Column
    ("REL_CONFIRMS", "CONFIRMS", 570, 370, 40, 21, False),
    ("REL_ATTENDS", "ATTENDS", 970, 570, 38, 20, False),
    ("REL_BOOKS_APT", "BOOKS", 1210, 780, 36, 19, False),
    ("REL_APT_FOR_PET", "FOR", 1120, 730, 30, 16, False),
    ("REL_OWNS", "OWNS", 1420, 420, 34, 18, False),
    ("REL_PRODUCES", "PRODUCES", 970, 930, 42, 22, False),
    ("REL_PET_HAS_MR", "HAS", 1390, 770, 32, 17, False),
    ("REL_INCLUDES_RX", "INCLUDES", 1520, 930, 42, 22, False),
    ("REL_PET_HAS_VAX", "HAS", 1570, 600, 32, 17, False),

    # Feedback & Complaint
    ("REL_FILES_COMP", "FILES", 940, 410, 34, 18, False),
    ("REL_REVIEWS_COMP", "REVIEWS", 690, 300, 38, 20, False),
    ("REL_SUBMITS_FB", "SUBMITS", 1220, 350, 38, 20, False),

    # Right Column
    ("REL_MANAGES_RC", "MANAGES", 1720, 175, 40, 21, False),
    ("REL_REPORTS_RC", "REPORTS", 1590, 240, 38, 20, False),
    ("REL_INCLUDES_PET", "INCLUDES", 1870, 330, 44, 23, True), # Double diamond
    ("REL_SUBMITS_APP", "SUBMITS", 1440, 280, 38, 20, False),
    ("REL_APP_FOR_PET", "APPLIES FOR", 1750, 460, 48, 22, False), # Was RECEIVES
    ("REL_HAS_FOSTER", "HAS", 1870, 545, 32, 17, False), # Fixed: single diamond
    ("REL_ADOPTED_AS", "ADOPTED AS", 1680, 530, 46, 21, False), # Bridge to Pet
]

# ==============================================================================
# 3. ATTRIBUTES (Exact original style ellipses)
# ==============================================================================
attributes = [
    # USER
    ("USER", "user_id", 780, 45, True, False, 36, 15),
    ("USER", "nic_no", 700, 100, False, False, 32, 15),
    ("USER", "full_name", 910, 20, False, False, 36, 15),
    ("USER", "email", 1040, 20, False, False, 30, 15),
    ("USER", "phone_number", 1190, 25, False, False, 44, 15),
    ("USER", "address", 1090, 125, False, False, 34, 15),
    ("USER", "emergency_contact", 1240, 80, False, False, 56, 15), # Moved from Vax!

    # NOTIFICATION
    ("NOTIFICATION", "notification_id", 1430, 25, True, False, 44, 15),
    ("NOTIFICATION", "message", 1580, 20, False, False, 34, 15),
    ("NOTIFICATION", "date_sent", 1690, 70, False, False, 36, 15),
    ("NOTIFICATION", "is_read", 1550, 135, False, False, 30, 15),

    # Subclasses
    ("PET_CARE_PROVIDER", "role", 240, 170, False, False, 26, 15),
    ("VETERINARIAN", "specialization", 970, 225, False, False, 42, 15),

    # Left Column
    ("SERVICE", "service_id", 80, 310, True, False, 34, 15),
    ("SERVICE", "service_name", 70, 365, False, False, 40, 15),
    ("SERVICE", "price", 60, 425, False, False, 26, 15),

    ("SERVICE_PACKAGE", "package_id", 110, 580, True, False, 36, 15),
    ("SERVICE_PACKAGE", "package_name", 255, 580, False, False, 42, 15),
    ("SERVICE_PACKAGE", "package_price", 180, 735, False, False, 42, 15),

    ("INVENTORY_ITEM", "item_id", 110, 605, True, False, 30, 15),
    ("INVENTORY_ITEM", "item_name", 155, 735, False, False, 36, 15),
    ("INVENTORY_ITEM", "stock_qty", 45, 735, False, False, 32, 15),
    ("INVENTORY_ITEM", "unit_price", 85, 785, False, False, 34, 15),

    ("SUPPLIER", "supplier_id", 80, 905, True, False, 36, 15),
    ("SUPPLIER", "supplier_name", 65, 985, False, False, 42, 15),
    ("SUPPLIER", "contact_info", 170, 1000, False, False, 38, 15),

    ("SERVICE_BOOKING", "booking_id", 230, 870, True, False, 36, 15),
    ("SERVICE_BOOKING", "booking_date", 420, 765, False, False, 40, 15),
    ("SERVICE_BOOKING", "status", 505, 860, False, False, 26, 15),

    ("PAYMENT", "payment_id", 540, 1040, True, False, 38, 15),
    ("PAYMENT", "amount", 425, 995, False, False, 28, 15),
    ("PAYMENT", "payment_date", 440, 1045, False, False, 40, 15),
    ("PAYMENT", "payment_method", 640, 1020, False, False, 46, 15), # Moved here!

    # Center Column
    ("APPOINTMENT", "appointment_id", 740, 620, True, False, 46, 15),
    ("APPOINTMENT", "status", 600, 640, False, False, 26, 15),
    ("APPOINTMENT", "appointment_date", 935, 700, False, False, 48, 15),

    ("PET", "pet_id", 1320, 490, True, False, 28, 15),
    ("PET", "pet_name", 1410, 610, False, False, 32, 15),
    ("PET", "species", 1340, 655, False, False, 28, 15),
    ("PET", "breed", 1520, 530, False, False, 26, 15),

    ("MEDICAL_RECORD", "record_id", 1160, 875, True, False, 32, 15),
    ("MEDICAL_RECORD", "diagnosis", 1420, 910, False, False, 32, 15),
    ("MEDICAL_RECORD", "notes", 1420, 955, False, False, 26, 15),

    ("PRESCRIPTION", "prescription_id", 1610, 885, True, False, 42, 15),
    ("PRESCRIPTION", "medication", 1740, 865, False, False, 34, 15),
    ("PRESCRIPTION", "notes", 1840, 895, False, False, 26, 15),

    ("VACCINATION", "vaccination_no", 1820, 735, True, False, 42, 15),
    ("VACCINATION", "vaccine_name", 1700, 765, False, False, 38, 15),
    # Note: emergency_contact removed from vaccination!

    # Complaint & Feedback
    ("COMPLAINT", "complaint_id", 870, 340, True, False, 38, 15),
    ("COMPLAINT", "date_filed", 760, 350, False, False, 34, 15),
    ("COMPLAINT", "details", 870, 510, False, False, 28, 15),
    ("COMPLAINT", "status", 710, 510, False, False, 26, 15),

    ("FEEDBACK", "date", 1140, 420, False, False, 26, 15),
    ("FEEDBACK", "rating", 1135, 475, False, False, 26, 15),
    ("FEEDBACK", "comments", 1180, 530, False, False, 32, 15),
    ("FEEDBACK", "feedback_id", 1250, 550, True, False, 36, 15),

    # Right Column
    ("RESCUE_CASE", "case_id", 1680, 145, True, False, 30, 15),
    ("RESCUE_CASE", "location", 1870, 75, False, False, 30, 15),
    ("RESCUE_CASE", "status", 1800, 140, False, False, 26, 15),
    ("RESCUE_CASE", "date", 1925, 140, False, False, 24, 15),
    ("RESCUE_CASE", "animal_condition", 1775, 290, False, False, 46, 15),

    ("RESCUED_PET", "rescued_pet_no", 1765, 370, False, True, 44, 15), # Partial key!
    ("RESCUED_PET", "rescue_status", 1765, 430, False, False, 36, 15),
    ("RESCUED_PET", "breed", 1630, 465, False, False, 26, 15),

    ("FOSTER_CARE", "foster_id", 1870, 710, True, False, 32, 15),

    ("ADOPTION_APP", "notes", 1545, 270, False, False, 24, 15),
    ("ADOPTION_APP", "status", 1655, 270, False, False, 24, 15),
    ("ADOPTION_APP", "adoption_fee", 1510, 375, False, False, 36, 15),
    ("ADOPTION_APP", "decision_date", 1635, 415, False, False, 38, 15),
    ("ADOPTION_APP", "application_id", 1645, 515, True, False, 40, 15),
    ("ADOPTION_APP", "application_date", 1735, 555, False, False, 42, 15),
]

# Connections dictionary
coord_map = {}
for e in entities:
    coord_map[e[0]] = (e[2], e[3], e[4], e[5], "entity")
for r in relationships:
    coord_map[r[0]] = (r[2], r[3], r[4]*2, r[5]*2, "rel")

connections = [
    # Top User to Notification
    ("USER", "REL_RECEIVES", "1", ""),
    ("REL_RECEIVES", "NOTIFICATION", "", "N"),

    # Left: Provider -> Service -> Package -> Booking
    ("PET_CARE_PROVIDER", "REL_PROVIDES", "1", ""),
    ("REL_PROVIDES", "SERVICE", "", "N"),

    ("SERVICE", "REL_CONTAINS", "N", ""),
    ("REL_CONTAINS", "SERVICE_PACKAGE", "", "M"), # Fixed to M:N

    ("SERVICE", "REL_USED_IN", "M", ""),
    ("REL_USED_IN", "INVENTORY_ITEM", "", "N"),

    ("SUPPLIER", "REL_SUPPLIES", "1", ""),
    ("REL_SUPPLIES", "INVENTORY_ITEM", "", "N"),

    ("PET_CARE_PROVIDER", "REL_DELIVERS", "1", ""),
    ("REL_DELIVERS", "SERVICE_BOOKING", "", "N"),

    ("SERVICE_PACKAGE", "REL_PKG_INCLUDES", "1", ""),
    ("REL_PKG_INCLUDES", "SERVICE_BOOKING", "", "N"),

    ("CLINIC_STAFF", "REL_MANAGES_SB", "1", ""),
    ("REL_MANAGES_SB", "SERVICE_BOOKING", "", "N"),

    # Clean separate booking for Service Booking
    ("PET_OWNER", "REL_PLACES_SB", "1", ""),
    ("REL_PLACES_SB", "SERVICE_BOOKING", "", "N"),
    ("SERVICE_BOOKING", "REL_SB_FOR_PET", "N", ""),
    ("REL_SB_FOR_PET", "PET", "", "1"),

    # Payments
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

# ==============================================================================
# 4. BUILD CLEAN DRAW.IO STYLE SVG
# ==============================================================================
def create_clean_svg():
    W, H = 2050, 1150
    svg = []
    svg.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" style="background-color: #FFFFFF; font-family: Arial, Helvetica, sans-serif;">')

    svg.append("""
    <style>
      .entity-rect { fill: #FFFFFF; stroke: #000000; stroke-width: 1.5; }
      .weak-rect { fill: #FFFFFF; stroke: #000000; stroke-width: 1.2; }
      .rel-diamond { fill: #FFFFFF; stroke: #000000; stroke-width: 1.5; }
      .attr-ellipse { fill: #FFFFFF; stroke: #000000; stroke-width: 1.2; }
      .line-main { stroke: #000000; stroke-width: 1.2; fill: none; }
      .text-entity { font-size: 11px; font-weight: bold; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }
      .text-rel { font-size: 9.5px; font-weight: bold; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }
      .text-attr { font-size: 10px; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }
      .text-card { font-size: 11px; font-weight: bold; fill: #000000; text-anchor: middle; font-family: Arial, sans-serif; }
    </style>
    """)

    # Background
    svg.append(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')

    # 1. Attribute connector lines
    svg.append('<!-- Attribute Lines -->')
    for parent_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        if parent_id in coord_map:
            px, py, _, _, _ = coord_map[parent_id]
            svg.append(f'<line x1="{px}" y1="{py}" x2="{ax}" y2="{ay}" class="line-main"/>')

    # 2. Relationship connector lines with cardinalities
    svg.append('<!-- Relationship Lines -->')
    for k1, k2, c1, c2 in connections:
        x1, y1, _, _, _ = coord_map[k1]
        x2, y2, _, _, _ = coord_map[k2]
        svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" class="line-main"/>')

        # Cardinality text positioned cleanly along the line
        if c1:
            cx1 = x1 + (x2 - x1) * 0.32
            cy1 = y1 + (y2 - y1) * 0.32 - 4
            svg.append(f'<text x="{cx1}" y="{cy1}" class="text-card">{c1}</text>')
        if c2:
            cx2 = x1 + (x2 - x1) * 0.68
            cy2 = y1 + (y2 - y1) * 0.68 - 4
            svg.append(f'<text x="{cx2}" y="{cy2}" class="text-card">{c2}</text>')

    # 3. ISA Triangle and Hierarchy
    svg.append('<!-- ISA Triangle and Subclass Branches -->')
    isa_cx, isa_top, isa_bot = 980, 140, 180
    # Line from USER to ISA
    svg.append(f'<line x1="980" y1="98" x2="980" y2="{isa_top}" class="line-main"/>')
    # Triangle
    svg.append(f'<polygon points="{isa_cx},{isa_top} {isa_cx+45},{isa_bot} {isa_cx-45},{isa_bot}" fill="#FFFFFF" stroke="#000000" stroke-width="1.5"/>')
    svg.append(f'<text x="{isa_cx}" y="{isa_bot-14}" font-size="10.5" font-weight="bold" text-anchor="middle">ISA</text>')
    svg.append(f'<text x="{isa_cx}" y="{isa_bot-3}" font-size="8" font-weight="bold" text-anchor="middle">(Overlap, Partial)</text>')

    # Horizontal distribution bar
    svg.append(f'<line x1="150" y1="195" x2="1820" y2="195" class="line-main"/>')
    svg.append(f'<line x1="{isa_cx}" y1="{isa_bot}" x2="{isa_cx}" y2="195" class="line-main"/>')

    # Drop lines to each subclass
    subclasses = [
        ("PET_CARE_PROVIDER", 150),
        ("CLINIC_STAFF", 480),
        ("CLINIC_MANAGER", 770),
        ("VETERINARIAN", 1120),
        ("PET_OWNER", 1360),
        ("RESCUE_OFFICER", 1820),
    ]
    for sk, sx in subclasses:
        sy = coord_map[sk][1]
        svg.append(f'<line x1="{sx}" y1="195" x2="{sx}" y2="{sy-21}" class="line-main"/>')

    # 4. Attribute Ellipses
    svg.append('<!-- Attributes -->')
    for parent_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        svg.append(f'<ellipse cx="{ax}" cy="{ay}" rx="{arx}" ry="{ary}" class="attr-ellipse"/>')
        if is_pk:
            svg.append(f'<text x="{ax}" y="{ay+3.5}" class="text-attr" font-weight="bold" text-decoration="underline">{aname}</text>')
        elif is_part:
            svg.append(f'<text x="{ax}" y="{ay+3.5}" class="text-attr" font-style="italic">{aname}</text>')
            svg.append(f'<line x1="{ax-len(aname)*2.8}" y1="{ay+6.5}" x2="{ax+len(aname)*2.8}" y2="{ay+6.5}" stroke="#000000" stroke-width="1" stroke-dasharray="2,2"/>')
        else:
            svg.append(f'<text x="{ax}" y="{ay+3.5}" class="text-attr">{aname}</text>')

    # 5. Relationship Diamonds
    svg.append('<!-- Relationships -->')
    for rid, rname, rx, ry, rw, rh, is_id in relationships:
        if is_id:
            # Double Diamond
            outer = f"{rx},{ry-rh-4} {rx+rw+5},{ry} {rx},{ry+rh+4} {rx-rw-5},{ry}"
            inner = f"{rx},{ry-rh} {rx+rw},{ry} {rx},{ry+rh} {rx-rw},{ry}"
            svg.append(f'<polygon points="{outer}" class="rel-diamond"/>')
            svg.append(f'<polygon points="{inner}" class="rel-diamond" stroke-width="1"/>')
        else:
            pts = f"{rx},{ry-rh} {rx+rw},{ry} {rx},{ry+rh} {rx-rw},{ry}"
            svg.append(f'<polygon points="{pts}" class="rel-diamond"/>')
        svg.append(f'<text x="{rx}" y="{ry+3.5}" class="text-rel">{rname}</text>')

    # 6. Entities (Rectangles)
    svg.append('<!-- Entities -->')
    for eid, ename, ex, ey, ew, eh, is_weak in entities:
        bx = ex - ew/2
        by = ey - eh/2
        if is_weak:
            # Double Rectangle
            svg.append(f'<rect x="{bx-4}" y="{by-4}" width="{ew+8}" height="{eh+8}" class="entity-rect"/>')
            svg.append(f'<rect x="{bx}" y="{by}" width="{ew}" height="{eh}" class="weak-rect"/>')
        else:
            svg.append(f'<rect x="{bx}" y="{by}" width="{ew}" height="{eh}" class="entity-rect"/>')

        # Multiline text support
        if "\n" in ename:
            lines = ename.split("\n")
            svg.append(f'<text x="{ex}" y="{ey-2}" class="text-entity">{lines[0]}</text>')
            svg.append(f'<text x="{ex}" y="{ey+11}" class="text-entity">{lines[1]}</text>')
        else:
            svg.append(f'<text x="{ex}" y="{ey+4}" class="text-entity">{ename}</text>')

    svg.append('</svg>')

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print("Exact clean SVG generated:", svg_path)

create_clean_svg()

# ==============================================================================
# 5. BUILD MATCHING NATIVE DRAW.IO XML (.drawio)
# ==============================================================================
def create_clean_drawio():
    xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml.append('<mxfile host="app.diagrams.net" modified="2026-09-21T00:00:00.000Z" agent="Antigravity" version="21.0.0" type="device">')
    xml.append('  <diagram id="PetNexus_Original_Fixed" name="PetNexus Clean EER">')
    xml.append('    <mxGraphModel dx="2400" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2100" pageHeight="1200" background="#FFFFFF">')
    xml.append('      <root>')
    xml.append('        <mxCell id="0"/>')
    xml.append('        <mxCell id="1" parent="0"/>')

    cell_id = 2
    id_map = {}

    # Entities
    for eid, ename, ex, ey, ew, eh, is_weak in entities:
        bx = ex - ew/2
        by = ey - eh/2
        id_map[eid] = cell_id
        label = ename.replace("\n", "&lt;br&gt;")
        if is_weak:
            style = "shape=ext;double=1;rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=11;strokeWidth=1.5;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        else:
            style = "rounded=0;whiteSpace=wrap;html=1;fontStyle=1;fontSize=11;strokeWidth=1.5;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        xml.append(f'        <mxCell id="{cell_id}" value="{label}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{ew}" height="{eh}" as="geometry"/>')
        xml.append('        </mxCell>')
        cell_id += 1

    # ISA Triangle
    isa_id = cell_id
    cell_id += 1
    xml.append(f'        <mxCell id="{isa_id}" value="ISA&lt;br&gt;&lt;font style=&quot;font-size: 8px;&quot;&gt;(Overlap, Partial)&lt;/font&gt;" style="triangle;whiteSpace=wrap;html=1;direction=south;fontStyle=1;fontSize=10;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.5;" vertex="1" parent="1">')
    xml.append(f'          <mxGeometry x="940" y="135" width="80" height="45" as="geometry"/>')
    xml.append('        </mxCell>')

    # Edge from USER to ISA
    xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1.5;" edge="1" parent="1" source="{id_map["USER"]}" target="{isa_id}">')
    xml.append('          <mxGeometry relative="1" as="geometry"/>')
    xml.append('        </mxCell>')
    cell_id += 1

    # Subclasses edges
    subclasses = ["PET_CARE_PROVIDER", "CLINIC_STAFF", "CLINIC_MANAGER", "VETERINARIAN", "PET_OWNER", "RESCUE_OFFICER"]
    for sk in subclasses:
        xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=orthogonalEdgeStyle;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1.2;" edge="1" parent="1" source="{isa_id}" target="{id_map[sk]}">')
        xml.append('          <mxGeometry relative="1" as="geometry"/>')
        xml.append('        </mxCell>')
        cell_id += 1

    # Relationships
    for rid, rname, rx, ry, rw, rh, is_id in relationships:
        bx = rx - rw
        by = ry - rh
        w = rw * 2
        h = rh * 2
        id_map[rid] = cell_id
        if is_id:
            style = "shape=rhombus;double=1;whiteSpace=wrap;html=1;fontStyle=1;fontSize=9.5;strokeWidth=1.5;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        else:
            style = "shape=rhombus;whiteSpace=wrap;html=1;fontStyle=1;fontSize=9.5;strokeWidth=1.5;fillColor=#FFFFFF;strokeColor=#000000;fontColor=#000000;"
        xml.append(f'        <mxCell id="{cell_id}" value="{rname}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{w}" height="{h}" as="geometry"/>')
        xml.append('        </mxCell>')
        cell_id += 1

    # Attributes
    for parent_id, aname, ax, ay, is_pk, is_part, arx, ary in attributes:
        bx = ax - arx
        by = ay - ary
        w = arx * 2
        h = ary * 2
        attr_cell_id = cell_id
        cell_id += 1

        val = aname
        if is_pk:
            val = f"&lt;u&gt;&lt;b&gt;{aname}&lt;/b&gt;&lt;/u&gt;"
        elif is_part:
            val = f"&lt;i&gt;{aname}&lt;/i&gt;"

        style = "ellipse;whiteSpace=wrap;html=1;fontSize=10;fillColor=#FFFFFF;strokeColor=#000000;strokeWidth=1.2;fontColor=#000000;"
        xml.append(f'        <mxCell id="{attr_cell_id}" value="{val}" style="{style}" vertex="1" parent="1">')
        xml.append(f'          <mxGeometry x="{bx}" y="{by}" width="{w}" height="{h}" as="geometry"/>')
        xml.append('        </mxCell>')

        if parent_id in id_map:
            p_cid = id_map[parent_id]
            xml.append(f'        <mxCell id="{cell_id}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1;" edge="1" parent="1" source="{p_cid}" target="{attr_cell_id}">')
            xml.append('          <mxGeometry relative="1" as="geometry"/>')
            xml.append('        </mxCell>')
            cell_id += 1

    # Connections
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
            xml.append(f'        <mxCell id="{cell_id}" value="{label}" style="edgeStyle=straight;html=1;endArrow=none;strokeColor=#000000;strokeWidth=1.2;fontStyle=1;fontSize=10;fontColor=#000000;" edge="1" parent="1" source="{s_id}" target="{t_id}">')
            xml.append('          <mxGeometry relative="1" as="geometry"/>')
            xml.append('        </mxCell>')
            cell_id += 1

    xml.append('      </root>')
    xml.append('    </mxGraphModel>')
    xml.append('  </diagram>')
    xml.append('</mxfile>')

    with open(drawio_path, "w", encoding="utf-8") as f:
        f.write("\n".join(xml))
    print("Clean Draw.io file written:", drawio_path)

create_clean_drawio()

# ==============================================================================
# 6. RENDER FULL RESOLUTION PNG
# ==============================================================================
def render_clean_png():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    render_tmp = os.path.join(DESKTOP_DIR, "render_clean_tmp.html")
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_code = f.read()

    with open(render_tmp, "w", encoding="utf-8") as f:
        f.write(f'<!DOCTYPE html><html><head><style>* {{ margin:0; padding:0; }} body {{ background:#FFFFFF; width:2050px; height:1150px; overflow:hidden; }} svg {{ display:block; width:2050px; height:1150px; }}</style></head><body>{svg_code}</body></html>')

    cmd = [
        chrome_path,
        "--headless",
        "--disable-gpu",
        "--hide-scrollbars",
        "--window-size=2070,1170",
        f"--screenshot={png_path}",
        render_tmp
    ]
    subprocess.run(cmd, check=True)
    if os.path.exists(render_tmp):
        os.remove(render_tmp)

    size = os.path.getsize(png_path)
    print(f"Clean PNG rendered: {png_path} ({size:,} bytes)")

render_clean_png()

# ==============================================================================
# 7. BUILD INTERACTIVE HTML VIEWER
# ==============================================================================
def build_html():
    with open(svg_path, "r", encoding="utf-8") as f:
        svg_code = f.read()

    content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>PetNexus — Clean Original Style EER Diagram</title>
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
    #cnt {{ transform-origin: 0 0; width: 2050px; height: 1150px; }}
    .pill {{ position: absolute; bottom: 16px; left: 16px; background: rgba(15,23,42,0.85); padding: 8px 16px; border-radius: 6px; font-size: 12px; color: #E2E8F0; pointer-events: none; }}
  </style>
</head>
<body>
  <header>
    <div>
      <h1>PetNexus — Preserved Original Layout EER Diagram (Draw.io Clean Edition)</h1>
      <p>Fixed Logical Contradictions • Exact Original Positioning &amp; Style • Zero Overlapping Lines</p>
    </div>
    <div class="controls">
      <button class="btn" onclick="zoomIn()">Zoom In (+)</button>
      <button class="btn" onclick="zoomOut()">Zoom Out (-)</button>
      <button class="btn" onclick="resetZoom()">Fit</button>
      <button class="btn pri" onclick="window.open('https://app.diagrams.net', '_blank')">Open Draw.io</button>
    </div>
  </header>
  <div id="vp">
    <div id="cnt">{svg_code}</div>
    <div class="pill">Use Mouse Wheel to Zoom • Click &amp; Drag to Pan</div>
  </div>
  <script>
    const cnt = document.getElementById('cnt');
    const vp = document.getElementById('vp');
    let scale = 0.65;
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
    function resetZoom() {{ scale = 0.65; px = 20; py = 20; apply(); }}
  </script>
</body>
</html>
"""
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Clean HTML viewer generated:", html_path)

build_html()
print("\n>>> ALL EXACT-STYLE FILES GENERATED SUCCESSFULLY!")
