import solve_clean_layout

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
    ("REL_DELIVERS", "DELIVERS", 310, 330, 38, 19, False), # Adjusted to avoid PROVIDES
    ("REL_INCLUDES_SB", "INCLUDES", 270, 695, 38, 19, False),
    ("REL_MANAGES_SB", "MANAGES", 340, 430, 36, 18, False), # Shifted left
    ("REL_PAYS_SB", "PAYS", 320, 895, 32, 17, False),
    ("REL_PAYS_APT", "PAYS", 500, 955, 32, 17, False),

    # Center
    ("REL_CONFIRMS", "CONFIRMS", 480, 430, 42, 20, False), # Shifted right to diverge from MANAGES_SB
    ("REL_ATTENDS", "ATTENDS", 700, 620, 40, 19, False),
    ("REL_BOOKS", "BOOKS", 680, 830, 38, 20, False), # Placed near center as original
    ("REL_APT_FOR_PET", "FOR", 840, 710, 32, 17, False),
    ("REL_OWNS", "OWNS", 1075, 460, 36, 18, False),
    ("REL_PRODUCES", "PRODUCES", 810, 1030, 42, 20, False),
    ("REL_PET_HAS_MR", "HAS", 1160, 845, 32, 17, False),
    ("REL_INCLUDES_RX", "INCLUDES", 1270, 1030, 42, 20, False),
    ("REL_PET_HAS_VAX", "HAS", 1240, 650, 32, 17, False),

    # Complaints & Feedback
    ("REL_FILES_COMP", "FILES", 710, 390, 36, 18, False), # Shifted away from VET->ATTENDS line
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
    ("USER", "emergency_contact", 650, 140, False, False, 58, 16), # Safe bottom-left, no line crossing!
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

    ("PET", "pet_id", 1040, 480, True, False, 32, 16),
    ("PET", "pet_name", 1210, 560, False, False, 34, 16), # Safe on the right
    ("PET", "species", 1200, 635, False, False, 30, 16), # Safe on bottom-right
    ("PET", "breed", 1195, 495, False, False, 28, 16), # Safe on top-right

    ("MEDICAL_RECORD", "record_id", 960, 955, True, False, 32, 16),
    ("MEDICAL_RECORD", "diagnosis", 1200, 995, False, False, 34, 16),
    ("MEDICAL_RECORD", "notes", 1175, 940, False, False, 28, 15),

    ("PRESCRIPTION", "prescription_id", 1300, 970, True, False, 44, 16),
    ("PRESCRIPTION", "medication", 1385, 935, False, False, 34, 16),
    ("PRESCRIPTION", "notes", 1450, 980, False, False, 26, 15),

    ("VACCINATION", "vaccination_no", 1440, 815, True, False, 42, 16),
    ("VACCINATION", "vaccine_name", 1320, 850, False, False, 38, 16),

    # Complaints & Feedback
    ("COMPLAINT", "complaint_id", 720, 340, True, False, 38, 16),
    ("COMPLAINT", "date_filed", 610, 345, False, False, 34, 16),
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
    ("RESCUE_CASE", "animal_condition", 1390, 305, False, False, 48, 16),

    ("RESCUED_PET", "rescued_pet_no", 1395, 395, False, True, 44, 16),
    ("RESCUED_PET", "rescue_status", 1380, 465, False, False, 40, 16),

    ("FOSTER_CARE", "foster_id", 1470, 765, True, False, 34, 16),

    ("ADOPTION_APP", "notes", 1190, 290, False, False, 28, 15),
    ("ADOPTION_APP", "status", 1265, 300, False, False, 28, 15),
    ("ADOPTION_APP", "adoption_fee", 1180, 410, False, False, 38, 16),
    ("ADOPTION_APP", "decision_date", 1220, 455, False, False, 42, 16),
    ("ADOPTION_APP", "application_id", 1220, 360, True, False, 44, 16), # Shifted left
    ("ADOPTION_APP", "application_date", 1410, 310, False, False, 46, 16), # Safe top-right
]

connections = [
    ("USER", "REL_RECEIVES", "1", ""),
    ("REL_RECEIVES", "NOTIFICATION", "", "N"),

    ("PET_CARE_PROVIDER", "REL_PROVIDES", "1", ""),
    ("REL_PROVIDES", "SERVICE", "", "N"),

    ("SERVICE", "REL_CONTAINS", "M", ""),
    ("REL_CONTAINS", "SERVICE_PACKAGE", "", "N"),

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

sc, lc = solve_clean_layout.check_layout(entities, relationships, attributes, connections)
print(f"Shape Collisions: {len(sc)}")
for c in sc:
    print(f"  COLLISION: {c[0]} -> {c[1]}")

print(f"\nLine Crossings: {len(lc)}")
for c in lc:
    print(f"  CROSSING: {c[0]} x {c[1]}")
