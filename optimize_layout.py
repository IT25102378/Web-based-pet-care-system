import solve_clean_layout

# Scaled layout based on the user's original diagram topology
# Scale factors: X ≈ 1.55, Y ≈ 1.55 (Canvas: 1650 x 1150)

entities = [
    # id, label, cx, cy, w, h, is_weak
    ("USER", "USER", 750, 75, 100, 32, False),
    ("NOTIFICATION", "NOTIFICATION", 1260, 75, 115, 32, False),

    # Subclasses (y ≈ 210)
    ("PET_CARE_PROVIDER", "PET CARE\nPROVIDER", 160, 185, 120, 40, False),
    ("CLINIC_STAFF", "CLINIC STAFF", 380, 210, 105, 32, False),
    ("CLINIC_MANAGER", "CLINIC MANAGER", 580, 210, 115, 32, False),
    ("VETERINARIAN", "VETERINARIAN", 840, 210, 110, 32, False),
    ("PET_OWNER", "PET OWNER", 1040, 210, 100, 32, False),
    ("RESCUE_OFFICER", "RESCUE OFFICER", 1240, 185, 120, 32, False),

    # Left Column
    ("SERVICE", "SERVICE", 160, 330, 85, 32, False),
    ("SERVICE_PACKAGE", "SERVICE PACKAGE", 170, 600, 130, 32, False),
    ("SERVICE_BOOKING", "SERVICE BOOKING", 310, 790, 130, 32, False),
    ("INVENTORY_ITEM", "INVENTORY ITEM", 60, 600, 115, 32, False),
    ("SUPPLIER", "SUPPLIER", 140, 930, 90, 32, False),
    ("PAYMENT", "PAYMENT", 390, 960, 90, 32, False),

    # Center Column
    ("APPOINTMENT", "APPOINTMENT", 560, 710, 115, 32, False),
    ("PET", "PET", 1160, 520, 80, 32, False),
    ("MEDICAL_RECORD", "MEDICAL RECORD", 1030, 990, 130, 32, False),
    ("PRESCRIPTION", "PRESCRIPTION", 1460, 990, 120, 32, False),
    ("VACCINATION", "VACCINATION", 1370, 720, 110, 32, False),

    # Complaints & Feedback
    ("COMPLAINT", "COMPLAINT", 600, 460, 100, 32, False),
    ("FEEDBACK", "FEEDBACK", 890, 480, 90, 32, False),

    # Right Column
    ("RESCUE_CASE", "RESCUE CASE", 1480, 220, 110, 32, False),
    ("RESCUED_PET", "RESCUED PET", 1480, 480, 110, 32, True),
    ("FOSTER_CARE", "FOSTER CARE", 1480, 640, 105, 32, False),
    ("ADOPTION_APP", "ADOPTION APPLICATION", 1300, 330, 155, 32, False),
]

relationships = [
    ("REL_RECEIVES", "RECEIVES", 1010, 75, 42, 20, False),

    # Left
    ("REL_PROVIDES", "PROVIDES", 160, 255, 40, 19, False),
    ("REL_CONTAINS", "CONTAINS", 160, 460, 42, 20, False),
    ("REL_USED_IN", "USED IN", 60, 460, 38, 19, False),
    ("REL_SUPPLIES", "SUPPLIES", 100, 810, 40, 20, False),
    ("REL_DELIVERS", "DELIVERS", 270, 370, 40, 20, False),
    ("REL_INCLUDES_SB", "INCLUDES", 245, 700, 40, 20, False),
    ("REL_MANAGES_SB", "MANAGES", 345, 440, 38, 19, False),
    ("REL_PAYS_SB", "PAYS", 310, 890, 34, 18, False),
    ("REL_PAYS_APT", "PAYS", 500, 900, 34, 18, False),

    # Center
    ("REL_CONFIRMS", "CONFIRMS", 445, 410, 42, 20, False),
    ("REL_ATTENDS", "ATTENDS", 720, 590, 40, 20, False),
    ("REL_BOOKS", "BOOKS", 850, 820, 40, 20, False),
    ("REL_APT_FOR_PET", "FOR", 880, 680, 32, 17, False),
    ("REL_OWNS", "OWNS", 1120, 420, 36, 19, False),
    ("REL_PRODUCES", "PRODUCES", 820, 990, 42, 20, False),
    ("REL_PET_HAS_MR", "HAS", 1150, 810, 34, 18, False),
    ("REL_INCLUDES_RX", "INCLUDES", 1250, 990, 42, 20, False),
    ("REL_PET_HAS_VAX", "HAS", 1270, 630, 34, 18, False),

    # Complaints & Feedback
    ("REL_FILES_COMP", "FILES", 740, 380, 38, 19, False),
    ("REL_REVIEWS_COMP", "REVIEWS", 580, 320, 40, 20, False),
    ("REL_SUBMITS_FB", "SUBMITS", 960, 370, 40, 20, False),

    # Right
    ("REL_MANAGES_RC", "MANAGES", 1370, 185, 42, 20, False),
    ("REL_REPORTS_RC", "REPORTS", 1300, 240, 40, 20, False),
    ("REL_INCLUDES_PET", "INCLUDES", 1480, 340, 44, 22, True),
    ("REL_SUBMITS_APP", "SUBMITS", 1170, 290, 38, 19, False),
    ("REL_APP_FOR_PET", "RECEIVES", 1380, 480, 42, 20, False),
    ("REL_HAS_FOSTER", "HAS", 1480, 560, 36, 18, False),
]

attributes = [
    # USER
    ("USER", "nic_no", 530, 80, False, False, 30, 16),
    ("USER", "user_id", 630, 35, True, False, 34, 16),
    ("USER", "full_name", 720, 25, False, False, 38, 16),
    ("USER", "email", 810, 25, False, False, 32, 16),
    ("USER", "phone_number", 900, 30, False, False, 46, 16),
    ("USER", "emergency_contact", 920, 115, False, False, 58, 16),
    ("USER", "address", 830, 120, False, False, 34, 16),

    # NOTIFICATION
    ("NOTIFICATION", "notification_id", 1180, 25, True, False, 46, 16),
    ("NOTIFICATION", "message", 1290, 25, False, False, 34, 16),
    ("NOTIFICATION", "date_sent", 1380, 60, False, False, 34, 16),
    ("NOTIFICATION", "is_read", 1290, 130, False, False, 30, 16),

    # Subclasses
    ("PET_CARE_PROVIDER", "role", 255, 185, False, False, 26, 15),
    ("VETERINARIAN", "specialization", 760, 175, False, False, 44, 16),

    # Left Column
    ("SERVICE", "service_id", 70, 270, True, False, 34, 16),
    ("SERVICE", "service_name", 55, 330, False, False, 38, 16),
    ("SERVICE", "price", 60, 385, False, False, 28, 16),

    ("SERVICE_PACKAGE", "package_id", 110, 535, True, False, 32, 16),
    ("SERVICE_PACKAGE", "package_name", 225, 535, False, False, 38, 16),
    ("SERVICE_PACKAGE", "package_price", 160, 675, False, False, 38, 16),

    ("INVENTORY_ITEM", "item_id", 35, 545, True, False, 28, 15),
    ("INVENTORY_ITEM", "stock_qty", 25, 605, False, False, 30, 15),
    ("INVENTORY_ITEM", "unit_price", 30, 665, False, False, 32, 16),
    ("INVENTORY_ITEM", "item_name", 85, 670, False, False, 32, 16),

    ("SUPPLIER", "supplier_id", 55, 875, True, False, 34, 16),
    ("SUPPLIER", "supplier_name", 55, 995, False, False, 40, 16),
    ("SUPPLIER", "contact_info", 145, 1010, False, False, 36, 16),

    ("SERVICE_BOOKING", "booking_id", 230, 845, True, False, 34, 16),
    ("SERVICE_BOOKING", "booking_date", 380, 745, False, False, 36, 16),
    ("SERVICE_BOOKING", "status", 400, 830, False, False, 26, 15),

    ("PAYMENT", "payment_id", 390, 1020, True, False, 32, 16),
    ("PAYMENT", "amount", 295, 960, False, False, 28, 15),
    ("PAYMENT", "payment_date", 290, 1015, False, False, 34, 16),
    ("PAYMENT", "payment_method", 485, 960, False, False, 42, 16),

    # Center Column
    ("APPOINTMENT", "appointment_id", 480, 640, True, False, 42, 16),
    ("APPOINTMENT", "status", 440, 710, False, False, 26, 15),
    ("APPOINTMENT", "appointment_date", 690, 710, False, False, 46, 16),

    ("PET", "pet_id", 1085, 465, True, False, 32, 16),
    ("PET", "breed", 1235, 470, False, False, 28, 16),
    ("PET", "pet_name", 1240, 540, False, False, 34, 16),
    ("PET", "species", 1210, 610, False, False, 30, 16),

    ("MEDICAL_RECORD", "record_id", 960, 925, True, False, 32, 16),
    ("MEDICAL_RECORD", "diagnosis", 990, 1060, False, False, 34, 16),
    ("MEDICAL_RECORD", "notes", 1070, 1060, False, False, 28, 15),

    ("PRESCRIPTION", "prescription_id", 1390, 935, True, False, 44, 16),
    ("PRESCRIPTION", "medication", 1475, 925, False, False, 34, 16),
    ("PRESCRIPTION", "notes", 1540, 950, False, False, 26, 15),

    ("VACCINATION", "vaccination_no", 1460, 780, True, False, 42, 16),
    ("VACCINATION", "vaccine_name", 1370, 790, False, False, 38, 16),

    # Complaints & Feedback
    ("COMPLAINT", "complaint_id", 680, 395, True, False, 38, 16),
    ("COMPLAINT", "date_filed", 590, 395, False, False, 34, 16),
    ("COMPLAINT", "status", 570, 520, False, False, 28, 15),
    ("COMPLAINT", "details", 655, 525, False, False, 30, 15),

    ("FEEDBACK", "date", 860, 415, False, False, 28, 15),
    ("FEEDBACK", "rating", 930, 415, False, False, 28, 15),
    ("FEEDBACK", "comments", 850, 545, False, False, 34, 16),
    ("FEEDBACK", "feedback_id", 925, 550, True, False, 38, 16),

    # Right Column
    ("RESCUE_CASE", "case_id", 1370, 140, True, False, 34, 16),
    ("RESCUE_CASE", "location", 1480, 140, False, False, 32, 16),
    ("RESCUE_CASE", "status", 1570, 150, False, False, 28, 15),
    ("RESCUE_CASE", "date", 1585, 210, False, False, 26, 15),
    ("RESCUE_CASE", "animal_condition", 1580, 275, False, False, 48, 16),

    ("RESCUED_PET", "rescued_pet_no", 1590, 455, False, True, 44, 16),
    ("RESCUED_PET", "rescue_status", 1585, 515, False, False, 40, 16),

    ("FOSTER_CARE", "foster_id", 1480, 715, True, False, 34, 16),

    ("ADOPTION_APP", "notes", 1210, 275, False, False, 28, 15),
    ("ADOPTION_APP", "status", 1290, 260, False, False, 28, 15),
    ("ADOPTION_APP", "adoption_fee", 1220, 385, False, False, 38, 16),
    ("ADOPTION_APP", "decision_date", 1275, 420, False, False, 42, 16),
    ("ADOPTION_APP", "application_id", 1370, 265, True, False, 44, 16),
    ("ADOPTION_APP", "application_date", 1440, 310, False, False, 46, 16),
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
