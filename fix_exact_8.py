import build_clean_eer
import solve_clean_layout

entities = [list(e) for e in build_clean_eer.entities]
relationships = [list(r) for r in build_clean_eer.relationships]
attributes = [list(a) for a in build_clean_eer.attributes]
connections = [list(c) for c in build_clean_eer.connections]

# Helper to find by id
def get_entity(eid):
    for e in entities:
        if e[0] == eid: return e
def get_rel(rid):
    for r in relationships:
        if r[0] == rid: return r
def get_attr(eid, aname):
    for a in attributes:
        if a[0] == eid and a[1] == aname: return a

# Fix 1: USER -> emergency_contact penetrates user_id
# Place emergency_contact at (660, 140) or (750, 25)
# USER is at (750, 90). user_id is at (610, 50).
# Let's put emergency_contact at (990, 30) or (650, 140)
ec = get_attr("USER", "emergency_contact")
ec[2] = 660
ec[3] = 140

# Fix 2: PET_CARE_PROVIDER -> REL_DELIVERS penetrates PROVIDES
# PET_CARE_PROVIDER is at (180, 135). PROVIDES is at (180, 245). DELIVERS is at (310, 390).
# Move DELIVERS slightly: (310, 340) or (320, 330)
deliv = get_rel("REL_DELIVERS")
deliv[2] = 310
deliv[3] = 330

# Fix 3: CLINIC_STAFF -> MANAGES_SB & CONFIRMS
# CLINIC_STAFF is at (400, 205).
# Move MANAGES_SB to (340, 430) (to the left towards SERVICE_BOOKING at 320)
# Move CONFIRMS to (470, 430) (to the right towards APPOINTMENT at 560)
man_sb = get_rel("REL_MANAGES_SB")
man_sb[2] = 340
man_sb[3] = 430
conf = get_rel("REL_CONFIRMS")
conf[2] = 470
conf[3] = 430

# Fix 4: VETERINARIAN -> ATTENDS penetrates FILES
# VET is at (860, 245). ATTENDS is at (700, 620). Line at y=390 is around x=798.
# Move FILES from (770, 390) to (710, 380)
files = get_rel("REL_FILES_COMP")
files[2] = 710
files[3] = 380

# Fix 5 & 6: REL_APT_FOR_PET -> PET penetrates pet_name, and PET -> species penetrates pet_name
# Move pet_name and species to the right of PET!
# PET is at (1120, 560).
pname = get_attr("PET", "pet_name")
pname[2] = 1210
pname[3] = 560

pspec = get_attr("PET", "species")
pspec[2] = 1190
pspec[3] = 635

# Fix 7: ADOPTION_APP -> application_date penetrates RECEIVES
# ADOPTION_APP is at (1290, 360). RECEIVES is at (1355, 520).
# Move application_date to (1420, 310) (top-right)
app_date = get_attr("ADOPTION_APP", "application_date")
app_date[2] = 1420
app_date[3] = 310

# Move application_id to (1210, 430)
app_id = get_attr("ADOPTION_APP", "application_id")
app_id[2] = 1210
app_id[3] = 430

sc, lc = solve_clean_layout.check_layout(entities, relationships, attributes, connections)
print(f"Shape Collisions: {len(sc)}")
for c in sc:
    print(f"  COLLISION: {c[0]} -> {c[1]}")

print(f"\nLine Crossings: {len(lc)}")
for c in lc:
    print(f"  CROSSING: {c[0]} x {c[1]}")
