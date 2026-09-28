import os
import sys
import subprocess

TARGET_DIR = r"C:\Users\Avinash\Desktop\PetNexus_Diagrams"
os.makedirs(TARGET_DIR, exist_ok=True)

svg_file = os.path.join(TARGET_DIR, "PetNexus_Corrected_EER_Diagram.svg")
drawio_file = os.path.join(TARGET_DIR, "PetNexus_Corrected_EER_Diagram.drawio")
html_file = os.path.join(TARGET_DIR, "PetNexus_Corrected_EER_Diagram.html")
png_file = os.path.join(TARGET_DIR, "PetNexus_Corrected_EER_Diagram.png")
doc_file = os.path.join(TARGET_DIR, "PetNexus_EER_Diagram_Specification.md")

# ==============================================================================
# 1. GENERATE COMPREHENSIVE DOCUMENTATION
# ==============================================================================
def create_specification():
    content = """# PetNexus - Corrected Enhanced Entity-Relationship (EER) Model Specification
**Academic Evaluation & Formal Conceptual Schema Design**  
**Institution:** SLIIT — Year 2 Semester 1 Software Engineering Project  
**System:** PetNexus (Web-Based Pet Care, Clinic & Rescue System)  
**Date:** September 2026  

---

## 1. Executive Summary & Audit of Previous Diagram

The original ER diagram captured the general scope of the PetNexus platform but suffered from **5 critical structural defects** and **several standard EER notation violations** that would fail formal database normalization (BCNF/3NF) and break real-world business transactions.

This revised **EER (Enhanced Entity-Relationship) Model** applies formal Chen / Elmasri & Navathe modeling standards to provide an industry-grade, academically sound, and implementable database design.

---

## 2. Key Logical Corrections Applied

| # | Flaw in Previous Diagram | Formal Logical Error | Correction in Revised EER Diagram |
|---|--------------------------|----------------------|-----------------------------------|
| **1** | **Single `BOOKS` diamond shared between `APPOINTMENT` and `SERVICE BOOKING`** | **Illegal Ternary / Shared Diamond:** A single diamond connecting 3 entities forces every booking to couple an appointment with a care service booking. | Split into two independent binary relationships: `PET OWNER` (1) — `BOOKS` (N) ➔ `APPOINTMENT` and `PET OWNER` (1) — `PLACES` (N) ➔ `SERVICE BOOKING`. |
| **2** | **`SERVICE BOOKING` missing link to `PET`** | **Orphan Transaction:** Service bookings (grooming, boarding) recorded the owner and package, but not *which pet* is receiving the service. | Added relationship `SERVICE BOOKING` (N) — `FOR` (1) ➔ `PET`. |
| **3** | **Attribute `emergency_contact` placed on `VACCINATION`** | **Severe Domain Misplacement:** A vaccine record cannot have an emergency contact. | Moved `emergency_contact` to `USER` / `PET OWNER` (matching the actual backend user entity). |
| **4** | **`USER` ISA marked as `(Disjoint, Total)`** | **Inflexible Specialization:** Strictly prevents a Veterinarian, Clinic Staff, or Rescue Officer from ever owning and registering their own pets. Total also excludes Admins. | Updated to **`(Overlap, Partial)`** (`(o, p)`), allowing multi-role flexibility and administrative superusers. |
| **5** | **`RESCUED PET` and `PET` completely disconnected** | **Broken Lifecycle:** Rescued animals could never be adopted into pet ownership, and couldn't receive clinic vaccinations/records. | Added relationship `RESCUED PET` (1) — `ADOPTED AS` (0..1) ➔ `PET`, creating a formal bridge between rescue intake and household pet care. |
| **6** | **`FOSTER CARE` drawn as Weak Entity with a Solid Primary Key (`foster_id`)** | **Notation Violation:** Weak entities cannot possess primary keys. Also lacked a relationship to the foster parent. | Converted to strong entity `FOSTER CARE RECORD` with PK `foster_id`, related to `RESCUED PET` via `PLACED IN` (N:1) with `start_date`, `end_date`, and `status`. |
| **7** | **`PAYMENT` Multi-1:1 Exclusive Conflict** | **Foreign Key / XOR Anomaly:** Multiple mandatory 1:1 links from `PAYMENT` to `APPOINTMENT` and `SERVICE BOOKING` caused nullability contradictions. Adoption fees were also omitted. | Modeled as clean optional relationships (0..1 : 1) for `APPOINTMENT`, `SERVICE BOOKING`, and `ADOPTION APPLICATION`. Moved `payment_method` to `PAYMENT`. |
| **8** | **`SERVICE` (N) — `CONTAINS` (1) ➔ `SERVICE PACKAGE`** | **1:N Cardinality Error:** Restricted every individual service to at most one bundle. | Corrected to **$M:N$ (Many-to-Many)**: A service can belong to multiple packages, and packages contain multiple services. |
| **9** | **`REPORTS` restricted strictly to `PET OWNER`** | **Domain Logic Error:** Ordinary bystanders or unregistered citizens cannot report stray injured animals. | Connected `REPORTS` to general `USER` (1:N). |
| **10**| **`FEEDBACK` and `COMPLAINT` floating without targets** | **Context-Free Entities:** Ratings and complaints had no foreign key or relationship to what was being evaluated. | `FEEDBACK` now targets `SERVICE` / `APPOINTMENT`. `COMPLAINT` now targets `APPOINTMENT` / `SERVICE BOOKING` and is reviewed by `CLINIC MANAGER`. |

---

## 3. Formal EER Conceptual Model Structure

### 3.1 Superclass & Specialization Hierarchy
* **Superclass:** `USER`
  * **Primary Key:** `user_id`
  * **Attributes:** `nic_no`, `full_name`, `email`, `phone_number`, `address`, `emergency_contact`
  * **Constraint:** `(Overlap, Partial)` — denoted by circle `(o)` with subset notation $\subset$.
* **Subclasses:**
  * `PET OWNER`: Has no role-specific attributes; acts as the primary consumer.
  * `VETERINARIAN`: `license_no`, `specialization`
  * `CLINIC STAFF`: `badge_no`, `shift`
  * `CLINIC MANAGER`: `office_room`
  * `PET CARE PROVIDER`: `provider_type`, `experience_years`
  * `RESCUE OFFICER`: `department`, `badge_no`

### 3.2 Clinical & Medical Module
* **`PET`**: `pet_id` (PK), `pet_name`, `species`, `breed`, `gender`, `dob`
  * `PET OWNER` (1) — `OWNS` (N) ➔ `PET`
* **`APPOINTMENT`**: `appointment_id` (PK), `appointment_date`, `time_slot`, `status`
  * `PET OWNER` (1) — `BOOKS` (N) ➔ `APPOINTMENT`
  * `APPOINTMENT` (N) — `FOR` (1) ➔ `PET`
  * `VETERINARIAN` (1) — `ATTENDS` (N) ➔ `APPOINTMENT`
  * `CLINIC STAFF` (1) — `CONFIRMS` (N) ➔ `APPOINTMENT`
* **`MEDICAL RECORD`**: `record_id` (PK), `visit_date`, `diagnosis`, `treatment_plan`
  * `APPOINTMENT` (1) — `PRODUCES` (1) ➔ `MEDICAL RECORD`
* **`PRESCRIPTION`**: `prescription_id` (PK), `medication`, `dosage`, `instructions`
  * `MEDICAL RECORD` (1) — `INCLUDES` (N) ➔ `PRESCRIPTION`
* **`VACCINATION`**: `vaccination_no` (PK), `vaccine_name`, `date_given`, `next_due_date`, `batch_no`
  * `PET` (1) — `RECEIVES` (N) ➔ `VACCINATION`
  * `VETERINARIAN` (1) — `ADMINISTERS` (N) ➔ `VACCINATION`

### 3.3 Care Services & Packages Module
* **`SERVICE`**: `service_id` (PK), `service_name`, `price`, `duration_minutes`
  * `PET CARE PROVIDER` (1) — `PROVIDES` (N) ➔ `SERVICE`
* **`SERVICE PACKAGE`**: `package_id` (PK), `package_name`, `package_price`, `description`
  * `SERVICE` (N) — `CONTAINS` (M) ➔ `SERVICE PACKAGE` (Attribute: `discount_rate`)
* **`SERVICE BOOKING`**: `booking_id` (PK), `booking_date`, `service_date`, `status`
  * `PET OWNER` (1) — `PLACES` (N) ➔ `SERVICE BOOKING`
  * `SERVICE BOOKING` (N) — `FOR` (1) ➔ `PET`
  * `SERVICE BOOKING` (N) — `BOOKED FOR` (1) ➔ `SERVICE PACKAGE`
  * `PET CARE PROVIDER` (1) — `DELIVERS` (N) ➔ `SERVICE BOOKING`
  * `CLINIC STAFF` (1) — `MANAGES` (N) ➔ `SERVICE BOOKING`

### 3.4 Rescue, Foster & Adoption Module
* **`RESCUE CASE`**: `case_id` (PK), `location`, `status`, `intake_date`, `animal_condition`
  * `USER` (1) — `REPORTS` (N) ➔ `RESCUE CASE`
  * `RESCUE OFFICER` (1) — `MANAGES` (N) ➔ `RESCUE CASE`
* **`RESCUED PET` (Weak Entity)**: `rescued_pet_no` (Partial Key), `pet_name`, `species`, `breed`, `rescue_status`
  * Identifying Relationship: `RESCUE CASE` (1) — `INCLUDES` (N) ➔ `RESCUED PET` (Double Diamond)
* **`FOSTER CARE RECORD`**: `foster_id` (PK), `full_name`, `phone`, `address`, `home_type`, `capacity`
  * `RESCUED PET` (N) — `PLACED IN` (1) ➔ `FOSTER CARE RECORD` (Attributes: `start_date`, `end_date`, `placement_status`)
* **`ADOPTION APPLICATION`**: `application_id` (PK), `application_date`, `status`, `decision_date`, `adoption_fee`, `notes`
  * `PET OWNER` (1) — `SUBMITS` (N) ➔ `ADOPTION APPLICATION`
  * `ADOPTION APPLICATION` (N) — `APPLIES FOR` (1) ➔ `RESCUED PET`
  * `RESCUED PET` (1) — `ADOPTED AS` (0..1) ➔ `PET`

### 3.5 Inventory & Supply Chain
* **`INVENTORY ITEM`**: `item_id` (PK), `item_name`, `stock_qty`, `unit_price`, `reorder_level`
  * `INVENTORY ITEM` (N) — `USED IN` (M) ➔ `SERVICE` (Attribute: `quantity_used`)
  * `CLINIC STAFF` (1) — `TRACKS` (N) ➔ `INVENTORY ITEM`
* **`SUPPLIER`**: `supplier_id` (PK), `supplier_name`, `contact_info`, `address`
  * `SUPPLIER` (1) — `SUPPLIES` (N) ➔ `INVENTORY ITEM` (Attributes: `supply_date`, `supplied_qty`)

### 3.6 Financials, Feedback & Quality Assurance
* **`PAYMENT`**: `payment_id` (PK), `amount`, `payment_date`, `payment_method`, `payment_status`
  * `APPOINTMENT` (0..1) — `PAYS` (1) ➔ `PAYMENT`
  * `SERVICE BOOKING` (0..1) — `PAYS` (1) ➔ `PAYMENT`
  * `ADOPTION APPLICATION` (0..1) — `PAYS` (1) ➔ `PAYMENT`
* **`FEEDBACK`**: `feedback_id` (PK), `rating`, `comments`, `date`
  * `PET OWNER` (1) — `SUBMITS` (N) ➔ `FEEDBACK`
  * `FEEDBACK` (N) — `RATES` (1) ➔ `SERVICE` / `APPOINTMENT`
* **`COMPLAINT`**: `complaint_id` (PK), `details`, `date_filed`, `status`
  * `PET OWNER` (1) — `FILES` (N) ➔ `COMPLAINT`
  * `CLINIC MANAGER` (1) — `REVIEWS` (N) ➔ `COMPLAINT`
  * `COMPLAINT` (N) — `REGARDING` (1) ➔ `APPOINTMENT` / `SERVICE BOOKING`
* **`NOTIFICATION`**: `notification_id` (PK), `message`, `date_sent`, `is_read`
  * `USER` (1) — `RECEIVES` (N) ➔ `NOTIFICATION`

---

## 4. EER Diagram Notation Standards

| Element | Chen / Elmasri Notation | Diagram Appearance |
|---------|-------------------------|--------------------|
| **Strong Entity** | Single Rectangle | Solid stroke border with bold title |
| **Weak Entity** | Double Rectangle | Concentric double border (`RESCUED PET`) |
| **Relationship** | Single Diamond | Rhombus with verb name |
| **Identifying Relationship** | Double Diamond | Concentric double rhombus (`INCLUDES`) |
| **Primary Key Attribute** | Single Ellipse | Solid underline under attribute name |
| **Partial Key (Discriminator)**| Single Ellipse | Dashed underline (`rescued_pet_no`) |
| **Regular Attribute** | Single Ellipse | Plain text inside ellipse |
| **Relationship Attribute** | Ellipse attached to Diamond | Connected by line to the relationship |
| **Specialization Hierarchy** | Triangle or Circle `(o, p)` | Connected to superclass with subset $\subset$ branches |
| **Cardinality** | Min-Max or 1, N, M | Displayed next to entity connectors |

---
*Generated for PetNexus System Project Documentation.*
"""
    with open(doc_file, "w", encoding="utf-8") as f:
        f.write(content)
    print("Specification generated:", doc_file)

create_specification()
