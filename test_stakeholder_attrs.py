import solve_clean_layout

# We add personal separate attributes for each stakeholder:
# 1. PET CARE PROVIDER: service_specialty, experience_years
# 2. CLINIC STAFF: staff_id, shift
# 3. CLINIC MANAGER: manager_code, office_no
# 4. VETERINARIAN: license_no, specialization
# 5. PET OWNER: loyalty_points, emergency_contact
# 6. RESCUE OFFICER: badge_no, assigned_zone

# Also USER retains: user_id (PK), nic_no, full_name, email, phone_number, address

entities = [
    # id, label, cx, cy, w, h, is_weak
    ("USER", "USER", 750, 75, 90, 30, False),
    ("NOTIFICATION", "NOTIFICATION", 1200, 75, 110, 30, False),

    # Subclasses (row at y ≈ 235)
    ("PET_CARE_PROVIDER", "PET CARE\nPROVIDER", 180, 215, 120, 40, False),
    ("CLINIC_STAFF", "CLINIC STAFF", 400, 235, 100, 30, False),
    ("CLINIC_MANAGER", "CLINIC MANAGER", 600, 235, 115, 30, False),
    ("VETERINARIAN", "VETERINARIAN", 860, 235, 110, 30, False),
    ("PET_OWNER", "PET OWNER", 1060, 235, 95, 30, False),
    ("RESCUE_OFFICER", "RESCUE OFFICER", 1280, 215, 120, 30, False),

    # Left Column
    ("SERVICE", "SERVICE", 180, 375, 80, 30, False),
    ("SERVICE_PACKAGE", "SERVICE PACKAGE", 200, 650, 125, 30, False),
    ("SERVICE_BOOKING", "SERVICE BOOKING", 320, 825, 125, 30, False),
    ("INVENTORY_ITEM", "INVENTORY ITEM", 70, 655, 115, 30, False),
    ("SUPPLIER", "SUPPLIER", 180, 950, 85, 30, False),
    ("PAYMENT", "PAYMENT", 390, 990, 85, 30, False),

    # Center Column
    ("APPOINTMENT", "APPOINTMENT", 560, 760, 110, 30, False),
    ("PET", "PET", 1120, 580, 75, 30, False),
    ("MEDICAL_RECORD", "MEDICAL RECORD", 1010, 1050, 125, 30, False),
    ("PRESCRIPTION", "PRESCRIPTION", 1440, 1050, 115, 30, False),
    ("VACCINATION", "VACCINATION", 1330, 760, 105, 30, False),

    # Complaints & Feedback
    ("COMPLAINT", "COMPLAINT", 610, 510, 95, 30, False),
    ("FEEDBACK", "FEEDBACK", 900, 540, 85, 30, False),

    # Right Column
    ("RESCUE_CASE", "RESCUE CASE", 1480, 265, 105, 30, False),
    ("RESCUED_PET", "RESCUED PET", 1480, 540, 105, 30, True),
    ("FOSTER_CARE", "FOSTER CARE", 1480, 700, 100, 30, False),
    ("ADOPTION_APP", "ADOPTION APPLICATION", 1300, 380, 150, 30, False),
]

relationships = [
    ("REL_RECEIVES", "RECEIVES", 1000, 75, 40, 20, False),

    # Left
    ("REL_PROVIDES", "PROVIDES", 180, 300, 40, 19, False),
    ("REL_CONTAINS", "CONTAINS", 180, 505, 42, 20, False),
    ("REL_USED_IN", "USED IN", 65, 495, 36, 18, False),
    ("REL_SUPPLIES", "SUPPLIES", 160, 835, 38, 19, False),
    ("REL_DELIVERS", "DELIVERS", 310, 350, 38, 19, False),
    ("REL_INCLUDES_SB", "INCLUDES", 270, 715, 38, 19, False),
    ("REL_MANAGES_SB", "MANAGES", 380, 470, 36, 18, False),
    ("REL_PAYS_SB", "PAYS", 320, 915, 32, 17, False),
    ("REL_PAYS_APT", "PAYS", 500, 975, 32, 17, False),

    # Center
    ("REL_CONFIRMS", "CONFIRMS", 480, 450, 42, 20, False),
    ("REL_ATTENDS", "ATTENDS", 700, 640, 40, 19, False),
    ("REL_BOOKS", "BOOKS", 965, 910, 38, 20, False),
    ("REL_APT_FOR_PET", "FOR", 840, 730, 32, 17, False),
    ("REL_OWNS", "OWNS", 1075, 480, 36, 18, False),
    ("REL_PRODUCES", "PRODUCES", 810, 1050, 42, 20, False),
    ("REL_PET_HAS_MR", "HAS", 1160, 865, 32, 17, False),
    ("REL_INCLUDES_RX", "INCLUDES", 1270, 1050, 42, 20, False),
    ("REL_PET_HAS_VAX", "HAS", 1240, 670, 32, 17, False),

    # Complaints & Feedback
    ("REL_FILES_COMP", "FILES", 730, 450, 36, 18, False),
    ("REL_REVIEWS_COMP", "REVIEWS", 525, 360, 40, 19, False),
    ("REL_SUBMITS_FB", "SUBMITS", 935, 410, 40, 19, False),

    # Right
    ("REL_MANAGES_RC", "MANAGES", 1350, 220, 42, 20, False),
    ("REL_REPORTS_RC", "REPORTS", 1280, 270, 40, 20, False),
    ("REL_INCLUDES_PET", "INCLUDES", 1480, 360, 44, 22, True),
    ("REL_SUBMITS_APP", "SUBMITS", 1120, 330, 38, 19, False),
    ("REL_APP_FOR_PET", "RECEIVES", 1365, 540, 40, 19, False),
    ("REL_HAS_FOSTER", "HAS", 1480, 615, 34, 18, False),
]

attributes = [
    # USER
    ("USER", "user_id", 610, 40, True, False, 34, 16),
    ("USER", "nic_no", 510, 85, False, False, 30, 16),
    ("USER", "full_name", 700, 25, False, False, 38, 16),
    ("USER", "email", 800, 25, False, False, 32, 16),
    ("USER", "phone_number", 930, 30, False, False, 46, 16),
    ("USER", "address", 870, 115, False, False, 34, 16),

    # NOTIFICATION
    ("NOTIFICATION", "notification_id", 1130, 25, True, False, 46, 16),
    ("NOTIFICATION", "message", 1250, 25, False, False, 34, 16),
    ("NOTIFICATION", "date_sent", 1320, 75, False, False, 34, 16),
    ("NOTIFICATION", "is_read", 1220, 135, False, False, 30, 16),

    # =========================================================================
    # STAKEHOLDER-SPECIFIC (SUBCLASS) PERSONAL ATTRIBUTES
    # =========================================================================
    # 1. PET CARE PROVIDER
    ("PET_CARE_PROVIDER", "service_specialty", 70, 165, False, False, 52, 16),
    ("PET_CARE_PROVIDER", "experience_years", 70, 225, False, False, 52, 16),

    # 2. CLINIC STAFF
    ("CLINIC_STAFF", "staff_id", 340, 180, False, False, 32, 15),
    ("CLINIC_STAFF", "shift", 430, 180, False, False, 26, 15),

    # 3. CLINIC MANAGER
    ("CLINIC_MANAGER", "manager_code", 550, 180, False, False, 44, 16),
    ("CLINIC_MANAGER", "office_no", 640, 180, False, False, 34, 15),

    # 4. VETERINARIAN
    ("VETERINARIAN", "license_no", 775, 185, False, False, 38, 16),
    ("VETERINARIAN", "specialization", 865, 180, False, False, 44, 16),

    # 5. PET OWNER
    ("PET_OWNER", "loyalty_points", 995, 180, False, False, 44, 16),
    ("PET_OWNER", "emergency_contact", 1080, 180, False, False, 56, 16),

    # 6. RESCUE OFFICER
    ("RESCUE_OFFICER", "badge_no", 1240, 155, False, False, 34, 15),
    ("RESCUE_OFFICER", "assigned_zone", 1330, 155, False, False, 46, 16),

    # =========================================================================
    # Left Column
    ("SERVICE", "service_id", 75, 275, True, False, 34, 16),
    ("SERVICE", "service_name", 60, 330, False, False, 38, 16),
    ("SERVICE", "price", 45, 385, False, False, 28, 16),

    ("SERVICE_PACKAGE", "package_id", 120, 555, True, False, 32, 16),
    ("SERVICE_PACKAGE", "package_name", 240, 555, False, False, 38, 16),
    ("SERVICE_PACKAGE", "package_price", 200, 760, False, False, 38, 16),

    ("INVENTORY_ITEM", "item_id", 115, 615, True, False, 28, 15),
    ("INVENTORY_ITEM", "item_name", 155, 715, False, False, 32, 16),
    ("INVENTORY_ITEM", "stock_qty", 40, 725, False, False, 30, 15),
    ("INVENTORY_ITEM", "unit_price", 90, 780, False, False, 32, 16),

    ("SUPPLIER", "supplier_id", 75, 915, True, False, 34, 16),
    ("SUPPLIER", "supplier_name", 55, 1040, False, False, 40, 16),
    ("SUPPLIER", "contact_info", 150, 1065, False, False, 36, 16),

    ("SERVICE_BOOKING", "booking_id", 240, 895, True, False, 34, 16),
    ("SERVICE_BOOKING", "booking_date", 400, 765, False, False, 36, 16),
    ("SERVICE_BOOKING", "status", 430, 865, False, False, 26, 15),

    ("PAYMENT", "payment_id", 390, 1050, True, False, 32, 16),
    ("PAYMENT", "amount", 290, 990, False, False, 28, 15),
    ("PAYMENT", "payment_date", 275, 1040, False, False, 34, 16),
    ("PAYMENT", "payment_method", 445, 915, False, False, 40, 16),

    # Center Column
    ("APPOINTMENT", "appointment_id", 600, 655, True, False, 42, 16),
    ("APPOINTMENT", "status", 440, 695, False, False, 26, 15),
    ("APPOINTMENT", "appointment_date", 765, 760, False, False, 46, 16),

    ("PET", "pet_id", 1040, 510, True, False, 32, 16),
    ("PET", "pet_name", 1210, 560, False, False, 34, 16),
    ("PET", "species", 1210, 700, False, False, 30, 16),
    ("PET", "breed", 1195, 500, False, False, 28, 16),

    ("MEDICAL_RECORD", "record_id", 960, 975, True, False, 32, 16),
    ("MEDICAL_RECORD", "diagnosis", 1200, 1015, False, False, 34, 16),
    ("MEDICAL_RECORD", "notes", 1175, 960, False, False, 28, 15),

    ("PRESCRIPTION", "prescription_id", 1300, 990, True, False, 44, 16),
    ("PRESCRIPTION", "medication", 1385, 955, False, False, 34, 16),
    ("PRESCRIPTION", "notes", 1450, 1000, False, False, 26, 15),

    ("VACCINATION", "vaccination_no", 1440, 835, True, False, 42, 16),
    ("VACCINATION", "vaccine_name", 1320, 870, False, False, 38, 16),

    # Complaints & Feedback
    ("COMPLAINT", "complaint_id", 680, 420, True, False, 38, 16),
    ("COMPLAINT", "date_filed", 610, 360, False, False, 34, 16),
    ("COMPLAINT", "status", 575, 575, False, False, 28, 15),
    ("COMPLAINT", "details", 690, 570, False, False, 30, 15),

    ("FEEDBACK", "date", 840, 480, False, False, 28, 15),
    ("FEEDBACK", "rating", 800, 540, False, False, 28, 15),
    ("FEEDBACK", "comments", 845, 595, False, False, 34, 16),
    ("FEEDBACK", "feedback_id", 920, 620, True, False, 38, 16),

    # Right Column
    ("RESCUE_CASE", "case_id", 1350, 165, True, False, 34, 16),
    ("RESCUE_CASE", "location", 1480, 85, False, False, 32, 16),
    ("RESCUE_CASE", "status", 1440, 165, False, False, 28, 15),
    ("RESCUE_CASE", "date", 1515, 170, False, False, 26, 15),
    ("RESCUE_CASE", "animal_condition", 1430, 325, False, False, 48, 16),

    ("RESCUED_PET", "rescued_pet_no", 1405, 415, False, True, 44, 16),
    ("RESCUED_PET", "rescue_status", 1390, 485, False, False, 40, 16),

    ("FOSTER_CARE", "foster_id", 1480, 785, True, False, 34, 16),

    ("ADOPTION_APP", "notes", 1220, 310, False, False, 28, 15),
    ("ADOPTION_APP", "status", 1280, 300, False, False, 28, 15),
    ("ADOPTION_APP", "application_date", 1340, 330, False, False, 46, 16),
    ("ADOPTION_APP", "adoption_fee", 1180, 430, False, False, 38, 16),
    ("ADOPTION_APP", "decision_date", 1225, 470, False, False, 42, 16),
    ("ADOPTION_APP", "application_id", 1280, 500, True, False, 44, 16),
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
print(f"Shape Collisions with Stakeholder Attributes: {len(sc)}")
for c in sc:
    print(f"  COLLISION: {c[0]} -> {c[1]}")

print(f"\nLine Crossings: {len(lc)}")
for c in lc:
    print(f"  CROSSING: {c[0]} x {c[1]}")
