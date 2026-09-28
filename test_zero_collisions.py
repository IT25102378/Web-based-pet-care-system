import build_clean_eer
import solve_clean_layout

entities = [list(e) for e in build_clean_eer.entities]
relationships = [list(r) for r in build_clean_eer.relationships]
attributes = [list(a) for a in build_clean_eer.attributes]
connections = [list(c) for c in build_clean_eer.connections]

def get_entity(eid):
    for e in entities:
        if e[0] == eid: return e
def get_rel(rid):
    for r in relationships:
        if r[0] == rid: return r
def get_attr(eid, aname):
    for a in attributes:
        if a[0] == eid and a[1] == aname: return a

# 1. USER
ec = get_attr("USER", "emergency_contact")
ec[2] = 650
ec[3] = 140

# 2. DELIVERS & MANAGES_SB & CONFIRMS
deliv = get_rel("REL_DELIVERS")
deliv[2] = 310
deliv[3] = 340

man_sb = get_rel("REL_MANAGES_SB")
man_sb[2] = 380
man_sb[3] = 450

conf = get_rel("REL_CONFIRMS")
conf[2] = 480
conf[3] = 430

# 3. VETERINARIAN -> ATTENDS & FILES
files = get_rel("REL_FILES_COMP")
files[2] = 730
files[3] = 430

comp_id = get_attr("COMPLAINT", "complaint_id")
comp_id[2] = 680
comp_id[3] = 400

comp_date = get_attr("COMPLAINT", "date_filed")
comp_date[2] = 610
comp_date[3] = 340

# 4. PET attributes
pname = get_attr("PET", "pet_name")
pname[2] = 1210
pname[3] = 540

pspec = get_attr("PET", "species")
pspec[2] = 1040
pspec[3] = 555 # Left of PET

pbreed = get_attr("PET", "breed")
pbreed[2] = 1195
pbreed[3] = 480

pid = get_attr("PET", "pet_id")
pid[2] = 1040
pid[3] = 490

# 5. ADOPTION_APP attributes - all on top and left, clear of REL_APP_FOR_PET (x >= 1290, y >= 360)
app_notes = get_attr("ADOPTION_APP", "notes")
app_notes[2] = 1200
app_notes[3] = 285

app_status = get_attr("ADOPTION_APP", "status")
app_status[2] = 1275
app_status[3] = 285

app_fee = get_attr("ADOPTION_APP", "adoption_fee")
app_fee[2] = 1180
app_fee[3] = 370

app_dec = get_attr("ADOPTION_APP", "decision_date")
app_dec[2] = 1210
app_dec[3] = 440

app_id = get_attr("ADOPTION_APP", "application_id")
app_id[2] = 1255
app_id[3] = 485

app_date = get_attr("ADOPTION_APP", "application_date")
app_date[2] = 1200
app_date[3] = 530

sc, lc = solve_clean_layout.check_layout(entities, relationships, attributes, connections)
print(f"Shape Collisions: {len(sc)}")
for c in sc:
    print(f"  COLLISION: {c[0]} -> {c[1]}")

print(f"\nLine Crossings: {len(lc)}")
for c in lc:
    print(f"  CROSSING: {c[0]} x {c[1]}")
