import solve_clean_layout

entities = [
    ("USER", "USER", 850, 90, 100, 32, False),
    ("NOTIFICATION", "NOTIFICATION", 1350, 90, 120, 32, False),

    # Subclasses
    ("PET_CARE_PROVIDER", "PET CARE\nPROVIDER", 180, 225, 125, 42, False),
    ("CLINIC_STAFF", "CLINIC STAFF", 440, 225, 110, 32, False),
    ("CLINIC_MANAGER", "CLINIC MANAGER", 680, 225, 120, 32, False),
    ("VETERINARIAN", "VETERINARIAN", 920, 225, 115, 32, False),
    ("PET_OWNER", "PET OWNER", 1180, 225, 105, 32, False),
    ("RESCUE_OFFICER", "RESCUE OFFICER", 1540, 225, 125, 32, False),

    # Left Column
    ("SERVICE", "SERVICE", 180, 400, 85, 32, False),
    ("SERVICE_PACKAGE", "SERVICE PACKAGE", 180, 640, 130, 32, False),
    ("SERVICE_BOOKING", "SERVICE BOOKING", 330, 770, 130, 32, False),
    ("INVENTORY_ITEM", "INVENTORY ITEM", 75, 640, 120, 32, False),
    ("SUPPLIER", "SUPPLIER", 75, 890, 90, 32, False),
    ("PAYMENT", "PAYMENT", 440, 960, 90, 32, False),

    # Center Column
    ("APPOINTMENT", "APPOINTMENT", 620, 750, 115, 32, False),
    ("PET", "PET", 1100, 560, 80, 32, False),
    ("MEDICAL_RECORD", "MEDICAL RECORD", 950, 980, 130, 32, False),
    ("PRESCRIPTION", "PRESCRIPTION", 1400, 980, 120, 32, False),
    ("VACCINATION", "VACCINATION", 1320, 720, 110, 32, False),

    # Complaints & Feedback
    ("COMPLAINT", "COMPLAINT", 680, 460, 100, 32, False),
    ("FEEDBACK", "FEEDBACK", 960, 460, 90, 32, False),

    # Right Column
    ("RESCUE_CASE", "RESCUE CASE", 1540, 380, 110, 32, False),
    ("RESCUED_PET", "RESCUED PET", 1540, 570, 110, 32, True),
    ("FOSTER_CARE", "FOSTER CARE", 1540, 730, 105, 32, False),
    ("ADOPTION_APP", "ADOPTION APPLICATION", 1340, 380, 155, 32, False),
]

relationships = [
    ("REL_RECEIVES", "RECEIVES", 1100, 90, 42, 20, False),

    # Left
    ("REL_PROVIDES", "PROVIDES", 180, 310, 42, 20, False),
    ("REL_CONTAINS", "CONTAINS", 180, 520, 42, 20, False),
    ("REL_USED_IN", "USED IN", 75, 520, 38, 19, False),
    ("REL_SUPPLIES", "SUPPLIES", 75, 770, 40, 20, False),
    ("REL_DELIVERS", "DELIVERS", 275, 330, 40, 20, False),
    ("REL_INCLUDES_SB", "INCLUDES", 255, 710, 40, 20, False),
    ("REL_MANAGES_SB", "MANAGES", 370, 430, 38, 19, False),
    ("REL_PAYS_SB", "PAYS", 360, 880, 34, 18, False),
    ("REL_PAYS_APT", "PAYS", 540, 880, 34, 18, False),

    # Center
    ("REL_CONFIRMS", "CONFIRMS", 510, 430, 42, 20, False),
    ("REL_ATTENDS", "ATTENDS", 780, 620, 40, 20, False),
    ("REL_BOOKS", "BOOKS", 780, 830, 40, 20, False),
    ("REL_APT_FOR_PET", "FOR", 900, 680, 32, 17, False),
    ("REL_OWNS", "OWNS", 1120, 430, 36, 19, False),
    ("REL_PRODUCES", "PRODUCES", 790, 890, 42, 20, False),
    ("REL_PET_HAS_MR", "HAS", 1060, 820, 34, 18, False),
    ("REL_INCLUDES_RX", "INCLUDES", 1180, 980, 42, 20, False),
    ("REL_PET_HAS_VAX", "HAS", 1230, 650, 34, 18, False),

    # Complaints & Feedback
    ("REL_FILES_COMP", "FILES", 820, 380, 38, 19, False),
    ("REL_REVIEWS_COMP", "REVIEWS", 680, 340, 40, 20, False),
    ("REL_SUBMITS_FB", "SUBMITS", 1030, 360, 40, 20, False),

    # Right
    ("REL_MANAGES_RC", "MANAGES", 1540, 300, 42, 20, False),
    ("REL_REPORTS_RC", "REPORTS", 1370, 280, 40, 20, False),
    ("REL_INCLUDES_PET", "INCLUDES", 1540, 480, 44, 22, True),
    ("REL_SUBMITS_APP", "SUBMITS", 1240, 310, 38, 19, False),
    ("REL_APP_FOR_PET", "RECEIVES", 1450, 480, 42, 20, False),
    ("REL_HAS_FOSTER", "HAS", 1540, 650, 36, 18, False),
]

attributes = [
    # USER
    ("USER", "nic_no", 640, 90, False, False, 30, 16),
    ("USER", "user_id", 720, 40, True, False, 34, 16),
    ("USER", "full_name", 800, 30, False, False, 38, 16),
    ("USER", "email", 890, 30, False, False, 32, 16),
    ("USER", "phone_number", 970, 40, False, False, 46, 16),
    ("USER", "emergency_contact", 1000, 130, False, False, 58, 16),
    ("USER", "address", 770, 140, False, False, 34, 16),

    # NOTIFICATION
    ("NOTIFICATION", "notification_id", 1260, 35, True, False, 46, 16),
    ("NOTIFICATION", "message", 1370, 35, False, False, 34, 16),
    ("NOTIFICATION", "date_sent", 1460, 75, False, False, 34, 16),
    ("NOTIFICATION", "is_read", 1380, 145, False, False, 30, 16),

    # Subclasses
    ("PET_CARE_PROVIDER", "role", 90, 180, False, False, 26, 15),
    ("VETERINARIAN", "specialization", 830, 190, False, False, 44, 16),

    # Left Column
    ("SERVICE", "service_id", 80, 360, True, False, 34, 16),
    ("SERVICE", "service_name", 65, 410, False, False, 38, 16),
    ("SERVICE", "price", 70, 460, False, False, 28, 16),

    ("SERVICE_PACKAGE", "package_id", 140, 585, True, False, 32, 16),
    ("SERVICE_PACKAGE", "package_name", 230, 585, False, False, 38, 16),
    ("SERVICE_PACKAGE", "package_price", 180, 700, False, False, 38, 16),

    ("INVENTORY_ITEM", "item_id", 30, 595, True, False, 28, 15),
    ("INVENTORY_ITEM", "stock_qty", 25, 645, False, False, 30, 15),
    ("INVENTORY_ITEM", "unit_price", 30, 695, False, False, 32, 16),
    ("INVENTORY_ITEM", "item_name", 100, 700, False, False, 32, 16),

    ("SUPPLIER", "supplier_id", 35, 840, True, False, 34, 16),
    ("SUPPLIER", "supplier_name", 40, 955, False, False, 40, 16),
    ("SUPPLIER", "contact_info", 130, 955, False, False, 36, 16),

    ("SERVICE_BOOKING", "booking_id", 245, 810, True, False, 34, 16),
    ("SERVICE_BOOKING", "booking_date", 270, 855, False, False, 36, 16),
    ("SERVICE_BOOKING", "status", 340, 855, False, False, 26, 15),

    ("PAYMENT", "payment_id", 430, 1025, True, False, 32, 16),
    ("PAYMENT", "amount", 345, 980, False, False, 28, 15),
    ("PAYMENT", "payment_date", 370, 1030, False, False, 34, 16),
    ("PAYMENT", "payment_method", 510, 1020, False, False, 42, 16),

    # Center Column
    ("APPOINTMENT", "appointment_id", 540, 700, True, False, 42, 16),
    ("APPOINTMENT", "status", 530, 780, False, False, 26, 15),
    ("APPOINTMENT", "appointment_date", 640, 690, False, False, 46, 16),

    ("PET", "pet_id", 1030, 505, True, False, 32, 16),
    ("PET", "breed", 1175, 510, False, False, 28, 16),
    ("PET", "pet_name", 1180, 580, False, False, 34, 16),
    ("PET", "species", 1150, 640, False, False, 30, 16),

    ("MEDICAL_RECORD", "record_id", 910, 920, True, False, 32, 16),
    ("MEDICAL_RECORD", "diagnosis", 910, 1040, False, False, 34, 16),
    ("MEDICAL_RECORD", "notes", 990, 1040, False, False, 28, 15),

    ("PRESCRIPTION", "prescription_id", 1330, 930, True, False, 44, 16),
    ("PRESCRIPTION", "medication", 1420, 925, False, False, 34, 16),
    ("PRESCRIPTION", "notes", 1485, 940, False, False, 26, 15),

    ("VACCINATION", "vaccination_no", 1410, 775, True, False, 42, 16),
    ("VACCINATION", "vaccine_name", 1320, 790, False, False, 38, 16),

    # Complaints & Feedback
    ("COMPLAINT", "complaint_id", 610, 480, True, False, 38, 16),
    ("COMPLAINT", "date_filed", 610, 420, False, False, 34, 16),
    ("COMPLAINT", "status", 680, 525, False, False, 28, 15),
    ("COMPLAINT", "details", 745, 520, False, False, 30, 15),

    ("FEEDBACK", "date", 930, 400, False, False, 28, 15),
    ("FEEDBACK", "rating", 980, 400, False, False, 28, 15),
    ("FEEDBACK", "comments", 915, 525, False, False, 34, 16),
    ("FEEDBACK", "feedback_id", 985, 525, True, False, 38, 16),

    # Right Column
    ("RESCUE_CASE", "case_id", 1435, 335, True, False, 34, 16),
    ("RESCUE_CASE", "location", 1540, 315, False, False, 32, 16),
    ("RESCUE_CASE", "status", 1630, 335, False, False, 28, 15),
    ("RESCUE_CASE", "date", 1640, 390, False, False, 26, 15),
    ("RESCUE_CASE", "animal_condition", 1625, 435, False, False, 48, 16),

    ("RESCUED_PET", "rescued_pet_no", 1650, 545, False, True, 44, 16),
    ("RESCUED_PET", "rescue_status", 1645, 605, False, False, 40, 16),

    ("FOSTER_CARE", "foster_id", 1540, 800, True, False, 34, 16),

    ("ADOPTION_APP", "notes", 1255, 345, False, False, 28, 15),
    ("ADOPTION_APP", "status", 1335, 320, False, False, 28, 15),
    ("ADOPTION_APP", "adoption_fee", 1255, 425, False, False, 38, 16),
    ("ADOPTION_APP", "decision_date", 1315, 455, False, False, 42, 16),
    ("ADOPTION_APP", "application_id", 1390, 325, True, False, 44, 16),
    ("ADOPTION_APP", "application_date", 1445, 370, False, False, 46, 16),
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
