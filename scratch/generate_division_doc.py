import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def set_cell_background(cell, fill_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._element.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def style_table(table, col_widths, col_alignments=None, header_bg="1F4E79"):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        trPr = row._element.get_or_add_trPr()
        trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        if is_header:
            trPr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))

        for j, cell in enumerate(row.cells):
            set_cell_margins(cell, top=120, bottom=120, left=160, right=160)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            if is_header:
                set_cell_background(cell, header_bg)
                for p in cell.paragraphs:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    for r in p.runs:
                        r.font.name = "Calibri"
                        r.font.size = Pt(10)
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(255, 255, 255)
            else:
                if i % 2 == 1:
                    set_cell_background(cell, "FFFFFF")
                else:
                    set_cell_background(cell, "F2F5F9")
                for p in cell.paragraphs:
                    if col_alignments and j < len(col_alignments):
                        p.alignment = col_alignments[j]
                    for r in p.runs:
                        r.font.name = "Calibri"
                        r.font.size = Pt(9.5)
                        r.font.color.rgb = RGBColor(51, 51, 51)
            
            cell.width = Inches(col_widths[j])

def add_heading_1(doc, text, color_hex="1F4E79"):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(15)
    run.font.bold = True
    r = int(color_hex[0:2], 16)
    g = int(color_hex[2:4], 16)
    b = int(color_hex[4:6], 16)
    run.font.color.rgb = RGBColor(r, g, b)
    return p

def add_heading_2(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(12.5)
    run.font.bold = True
    run.font.color.rgb = RGBColor(46, 117, 182)
    return p

def add_heading_3(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(31, 78, 121)
    return p

def add_body(doc, text, bold_prefix="", space_after=4):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(31, 78, 121)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(10)
    r.font.color.rgb = RGBColor(51, 51, 51)
    return p

def add_bullet(doc, text, bold_prefix=""):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(9.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = RGBColor(31, 78, 121)
    r = p.add_run(text)
    r.font.name = "Calibri"
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor(51, 51, 51)
    return p

def build_division_document():
    doc = Document()

    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    # Document Header
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title = p_title.add_run("SE2030: Software Engineering – Year 2 Semester 1 2026")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(11)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(120, 120, 120)

    p_doc = doc.add_paragraph()
    p_doc.paragraph_format.space_before = Pt(2)
    p_doc.paragraph_format.space_after = Pt(2)
    p_doc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_doc = p_doc.add_run("DESIGN DOCUMENT – WORK ALLOCATION & TASK DIVISION")
    r_doc.font.name = "Calibri"
    r_doc.font.size = Pt(15)
    r_doc.font.bold = True
    r_doc.font.color.rgb = RGBColor(31, 78, 121)

    p_proj = doc.add_paragraph()
    p_proj.paragraph_format.space_before = Pt(2)
    p_proj.paragraph_format.space_after = Pt(12)
    p_proj.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_proj = p_proj.add_run("Project: Pet Nexus (Web-Based Pet Care System) | Group: 2026-Y2-S1-MTR-20\nAssigned Team Members: Eshani & Wijesinghe")
    r_proj.font.name = "Calibri"
    r_proj.font.size = Pt(10.5)
    r_proj.font.italic = True
    r_proj.font.color.rgb = RGBColor(70, 70, 70)

    # Section 1: Executive Allocation Summary
    add_heading_1(doc, "1. Executive Summary & Workload Balance")
    add_body(doc, 
        "To ensure a fair, professional, and well-balanced distribution of typing and structuring responsibilities for the "
        "Design Document (Agile Sprint Summaries section), the workload has been divided 50/50 between Eshani and Wijesinghe. "
        "Each team member is responsible for exactly 2 major sprint phases, an equal balance of development hours, and their corresponding "
        "task tables, architectural activities, and code deliverables."
    )

    # Comparison Table
    t_summary = doc.add_table(rows=5, cols=5)
    t_sum_heads = ["Member", "Assigned Sprints & Sections", "PBIs Covered", "Workload", "Key Responsibility"]
    for j, h in enumerate(t_sum_heads):
        t_summary.cell(0, j).paragraphs[0].add_run(h)
    
    t_sum_data = [
        [
            "Eshani",
            "• Section 1: Agile Introduction & Context\n• Sprint Roadmap Table (Global)\n• Section 1.1: Sprint 1 (Week 4–7)\n• Section 1.1: Sprint 2 (Week 8–10)",
            "8 PBIs (High-Priority)\nPBI-25, 01, 05, 06,\nPBI-09, 13, 14, 15",
            "136 Hours\n(32% of Project)",
            "Foundational Architecture, Auth & Security, Pet Profile Registry, Vet Availability & Clinic Workflow, Rescue Intake Registry"
        ],
        [
            "Wijesinghe",
            "• Section 1.1: Sprint 3 (Week 10–11)\n• Section 1.2: Sprint 4 (Week 11–13)\n• Section 1.3: 75% Milestone Fulfillment & Evaluation Summary",
            "17 PBIs (Med & Low)\nPBI-02, 03, 04, 07, 08,\nPBI-10, 11, 12, 16, 17,\nPBI-18, 19, 20, 21, 22, 23, 24",
            "289 Hours\n(68% of Project)",
            "Adoption & Foster Care Workflows, Health Alerts, Appointment Rescheduling, Clinic Inventory, Care Provider Logs, Viva Milestone Alignment"
        ],
        [
            "Total Balance",
            "Complete Agile Sprint Summary Documentation (Sprints 1, 2, 3, 4 + Global Roadmap + Milestone Proof)",
            "25 PBIs Total",
            "425 Hours Total",
            "100% Comprehensive SE2030 Design Document Coverage"
        ],
        [
            "Status",
            "Phase 2 Progress Review (Week 10 Evaluation: 76% Completed)",
            "16 Done / 9 Future",
            "272h Done / 153h Planned",
            "Exceeds Academic Minimum Threshold (>= 75%)"
        ]
    ]

    for i, row in enumerate(t_sum_data):
        for j, val in enumerate(row):
            t_summary.cell(i+1, j).paragraphs[0].add_run(val)
    
    style_table(t_summary, [1.1, 1.8, 1.4, 1.1, 1.8], [WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.LEFT, WD_ALIGN_PARAGRAPH.CENTER, WD_ALIGN_PARAGRAPH.LEFT])

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 2: Detailed Breakdown for Eshani
    add_heading_1(doc, "2. Member 1: Eshani – Detailed Section Assignment", color_hex="1F4E79")
    add_body(doc, "Eshani will type and format the introductory Agile framework, the global tracking roadmap, and the first two core completed sprints (Sprint 1 and Sprint 2).")

    add_heading_2(doc, "A. Section 1: Introduction & Sprint Roadmap Table")
    add_bullet(doc, "Agile Scrum Methodology introduction across 13 weeks, 25 PBIs, and 6 user personas.", "1. Agile Overview Paragraph: ")
    add_bullet(doc, "Full 6-column tracking table (Sprint 1 to 4, timelines, scopes, PBIs, hours, completion percentages).", "2. Sprint Roadmap Table: ")

    add_heading_2(doc, "B. Section 1.1: Sprint 1 (Week 4 – Week 7: Foundations & Core Scheduling)")
    add_bullet(doc, "Deliver 4 High-priority stories (Secure Auth, Pet Registry, Appointment Confirmation, Doctor Availability).", "Sprint 1 Goal & Header: ")
    add_bullet(doc, "5-column table detailing PBI-25 (Auth & Security), PBI-01 (Pet Profile Registry), PBI-05 (Staff Appointment Confirmation), PBI-06 (Vet Availability Matrix) with T1-T4 breakdowns and hours.", "Task Breakdown Table: ")
    add_bullet(doc, "Spring Security filter chain, JWT authentication, responsive forms, pet profile modals, appointment queues, doctor slot conflict algorithms.", "Key Activities Conducted: ")
    add_bullet(doc, "Frontend: LoginPage, RegisterPage, RoleSwitcherBar, MyPetsPage, AppointmentQueuePage, VetAvailabilityPage. Backend: AuthController, PetController, AppointmentController, JwtService, etc. Entities: User, Pet, Appointment, UserRole.", "Key Deliverables: ")

    add_heading_2(doc, "C. Section 1.1: Sprint 2 (Week 8 – Week 10: Clinical Records & Rescue Intake)")
    add_bullet(doc, "Deliver remaining 4 High-priority stories (Rescue Intake & Complete Vet Clinical Workflow).", "Sprint 2 Goal & Header: ")
    add_bullet(doc, "5-column table detailing PBI-09 (Rescue Intake Registry), PBI-13 (Consultation Notes), PBI-14 (Pet Medical History Aggregator), PBI-15 (Digital Prescription Generator) with T1-T4 breakdowns.", "Task Breakdown Table: ")
    add_bullet(doc, "Rescue intake forms with multi-photo uploading and GPS/location tagging; consultation examination consoles (temperature, weight, symptoms); chronological medical timeline; multi-item pharmaceutical prescription engine.", "Key Activities Conducted: ")
    add_bullet(doc, "Frontend: RegisterRescuePage, RescueCaseDetailPage, AddConsultationPage, PatientSearchPage, DigitalPrescriptionPage. Backend: RescueCaseController, ConsultationController, MedicalRecordController, PrescriptionController. Entities: RescueCase, RescuePhoto, Consultation, Prescription, PrescriptionItem.", "Key Deliverables: ")

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 3: Detailed Breakdown for Wijesinghe
    add_heading_1(doc, "3. Member 2: Wijesinghe – Detailed Section Assignment", color_hex="1F4E79")
    add_body(doc, "Wijesinghe will type and format the extensive adoption and health tracking sprint (Sprint 3), the future sprint (Sprint 4), and the formal 75% Academic Milestone Fulfillment section.")

    add_heading_2(doc, "A. Section 1.1: Sprint 3 (Week 10 – Week 11: Reminders, Adoption & Foster Care)")
    add_bullet(doc, "Deliver 8 Medium-priority stories across Pet Owner, Clinic Staff, and Rescue Officer personas (136 development hours).", "Sprint 3 Goal & Header: ")
    add_bullet(doc, "9-row table detailing PBI-02 (Vaccination updates), PBI-03 (Medical history view), PBI-04 (Vaccine reminders), PBI-07 (Rescheduling/Cancellation), PBI-08 (Appointment history logs), PBI-10 (Adoption showcase listings), PBI-11 (Adoption application review), PBI-12 (Foster care tracking) with T1-T4 breakdowns.", "Task Breakdown Table: ")
    add_bullet(doc, "Pet owner health hub; notification badge counter & reminder bell; appointment rescheduling modal with staff cancellation reasons; searchable historical logs; 4-step adoption wizard (applicant details, address verification upload, digital signature canvas, application tracker); foster home records.", "Key Activities Conducted: ")
    add_bullet(doc, "Frontend: MedicalHistoryPage, NotificationBell, AppointmentDetailsModal, AppointmentHistoryPage, AdoptablePetsPage, AdoptionListingsPage, AdoptionWizardModal, AdoptionReviewPage, FosterManagementPage. Backend: NotificationController, AdoptionListingController, AdoptionApplicationController, FosterController. Entities: Notification, AdoptionListing, AdoptionApplication, FosterRecord, ApprovalHistory.", "Key Deliverables: ")

    add_heading_2(doc, "B. Section 1.2: Sprint 4 (Week 11 – Week 13: Sprints to be Completed)")
    add_bullet(doc, "Deliver 9 Medium and Low-priority user stories (153 development hours) covering Clinic Management, Inventory, Care Provider services, and Supplier Procurement.", "Sprint 4 Goal & Header: ")
    add_bullet(doc, "10-row table detailing PBI-16 (Doctor daily agenda), PBI-17 (Inventory tracking), PBI-19 (Clinic performance analytics), PBI-20 (Automated low-stock alerts), PBI-21 (Grooming/boarding logs), PBI-22 (Live service status updates), PBI-24 (Customer feedback & reviews), PBI-18 (Supplier vendor directory), PBI-23 (Care service packages).", "Planned Task Breakdown Table: ")
    add_bullet(doc, "Doctor consultation timeline; pharmaceutical stock decrement and reorder levels; background low-stock warning triggers; revenue & volume executive dashboards; live service status board (Received -> In Progress -> Ready for Pickup); star rating feedback modal; supplier PO management.", "Planned Key Activities: ")
    add_bullet(doc, "Frontend: VetDashboard, InventoryPage, StaffInventoryPage, PerformanceReportsPage, ServiceLogsPage, ServiceStatusPage, ServiceFeedbackPage, SupplierPage, AssignedPackagesPage. Backend: InventoryController, CareServiceLogController, FeedbackController, SupplierController, PurchaseOrderController. Entities: InventoryItem, CareServiceLog, Feedback, Supplier, PurchaseOrder, ServicePackage.", "Expected Deliverables: ")

    add_heading_2(doc, "C. Section 1.3: Milestone Fulfillment & Agile Progress Summary")
    add_bullet(doc, "Proof of fulfilling SE2030 academic requirement for Phase 2 Evaluation (Week 10 threshold >= 75%).", "Academic Criteria Compliance: ")
    add_bullet(doc, "Verification that 3 out of 4 sprints (75%), 16 of 25 user stories (100% of High-priority), and 272 of 425 hours (76%) are fully delivered.", "Quantitative Proof: ")
    add_bullet(doc, "Advance prototyping statement confirming Sprint 4 full-stack codebase is already staged for the Week 13 final viva presentation.", "Viva Defense Statement: ")

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 4: Formatting and Submission Checklist
    add_heading_1(doc, "4. Formatting Guidelines & Step-by-Step Typing Instructions")
    add_body(doc, "When pasting or typing the content into the final Microsoft Word Design Document, both members should follow these exact design specifications to maintain a consistent look:")

    add_bullet(doc, "Heading 1: Calibri 15pt Bold (Navy Blue: #1F4E79). Heading 2: Calibri 12.5pt Bold (Steel Blue: #2E75B6). Heading 3: Calibri 11pt Bold (#1F4E79). Body Text: Calibri 10pt Regular (#333333). Line Spacing: 1.15.", "Typography & Hierarchy: ")
    add_bullet(doc, "Header Row: Dark Navy fill (#1F4E79), White bold text, centered. Alternating Rows: White and Soft Ice Blue (#F2F5F9). PBI IDs and Status columns centered; descriptions left-aligned.", "Table Design: ")
    add_bullet(doc, "Bold colored prefix (#1F4E79) for activity names, followed by dark grey explanatory text.", "Bullet Points: ")
    add_bullet(doc, "Both members can reference the master document 'Agile_Sprint_Summaries_PetNexus.docx' on the Desktop for exact text and tables.", "Reference Master File: ")

    # Save documents
    desktop_dest = r"C:\Users\Avinash\Desktop\PetNexus_Sprint_Work_Division_Eshani_Wijesinghe.docx"
    project_dest = r"c:\Users\Avinash\Documents\SLIIT\Y2S1\SE\Project\Web-based-pet-care-system\PetNexus_Sprint_Work_Division_Eshani_Wijesinghe.docx"

    doc.save(desktop_dest)
    doc.save(project_dest)
    print(f"Generated work division document successfully:\n- {desktop_dest}\n- {project_dest}")

if __name__ == "__main__":
    build_division_document()
