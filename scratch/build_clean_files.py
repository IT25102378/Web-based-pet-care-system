import re
import os

# Source files (read-only references)
DDD_FILE = r'C:\Users\Avinash\Documents\SLIIT\Y2S1\DDD\Project\PetNexus_DDD_Part02.sql'
UNIFIED_SRC_FILE = r'C:\Users\Avinash\Documents\SLIIT\Y2S1\DDD\Project\PetNexus_DDD_Part02_Unified.sql'

with open(DDD_FILE, 'r', encoding='utf-8', errors='ignore') as f:
    ddd_text = f.read()

with open(UNIFIED_SRC_FILE, 'r', encoding='utf-8', errors='ignore') as f:
    unified_lines = f.readlines()

# 1. Extract SE Web Application DDL and DML from unified_lines
# Lines 42 to 1081: SE Schema DDL
# Lines 1081 to 1154: SE Seed Data DML
# Lines 6147 to 6204: Section 3 Integration Views
idx_se_schema_start = 42
idx_se_seed_start = None
idx_sec2_start = None
idx_sec3_start = None
idx_sec3_end = None

for i, line in enumerate(unified_lines):
    if '-- PART 1B: SE WEB APPLICATION INITIAL SEED DATA' in line:
        idx_se_seed_start = i
    elif '-- SECTION 2: IT2140 DATABASE DESIGN & DEVELOPMENT' in line:
        idx_sec2_start = i
    elif '-- SECTION 3: UNIFIED INTEGRATION VIEWS & MAPPINGS' in line:
        idx_sec3_start = i
    elif 'Centralized Database [PetNexus] is now ready' in line:
        idx_sec3_end = i + 3

if idx_sec3_end is None:
    idx_sec3_end = len(unified_lines)

print(f"SE Schema lines: {idx_se_schema_start} to {idx_se_seed_start}")
print(f"SE Seed lines: {idx_se_seed_start} to {idx_sec2_start}")
print(f"Section 3 lines: {idx_sec3_start} to {idx_sec3_end}")

se_ddl_raw = "".join(unified_lines[idx_se_schema_start:idx_se_seed_start])
# Replace [dbo].[feedback] with [dbo].[feedbacks] in SE DDL to prevent collation collision with DDD FEEDBACK table
se_ddl = re.sub(r'\[dbo\]\.\[feedback\]', '[dbo].[feedbacks]', se_ddl_raw)
se_ddl = re.sub(r'\bCREATE TABLE \[dbo\]\.\[feedback\]', 'CREATE TABLE [dbo].[feedbacks]', se_ddl)
se_ddl = re.sub(r'REFERENCES \[dbo\]\.\[feedback\]', 'REFERENCES [dbo].[feedbacks]', se_ddl)

se_dml = """-- 1. Seed Active Stakeholders in users table (Matching DataInitializer.java)
INSERT INTO [dbo].[users] (
    [user_id], [email], [password_hash], [full_name], [phone], [address],
    [role], [status], [avatar_url], [emergency_contact], [license_number],
    [specialization], [staff_id], [manager_code], [badge_number], [service_specialty], [created_at]
) VALUES 
('USR-007', 'admin@petnexus.com', '$2a$10$wT2eXoOq4q10hP8Yd1oZq.0t1QvH7t1hQ1.K8nBqZfT7/Rj3G4jKy', 'PetNexus System Administrator', '+94 11 234 5678', 'Pet Nexus Clinic, Colombo 05', 'Admin', 'Active', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', NULL, NULL, NULL, NULL, NULL, NULL, NULL, GETDATE()),
('USR-001', 'owner@petnexus.com', '$2a$10$wT2eXoOq4q10hP8Yd1oZq.0t1QvH7t1hQ1.K8nBqZfT7/Rj3G4jKy', 'Kavindu Perera', '+94 77 123 4567', '45/3 Galle Road, Colombo 06', 'PetOwner', 'Active', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Thilini Perera - +94 77 234 9988', NULL, NULL, NULL, NULL, NULL, NULL, GETDATE()),
('USR-002', 'vet@petnexus.com', '$2a$10$wT2eXoOq4q10hP8Yd1oZq.0t1QvH7t1hQ1.K8nBqZfT7/Rj3G4jKy', 'Dr. Sachini Wijesinghe, BVSc', '+94 71 234 5678', '12 Wijerama Mawatha, Colombo 07', 'Veterinarian', 'Active', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', NULL, 'SLVC-VET-2019-0842', 'Small Animal Surgery & Internal Medicine', NULL, NULL, NULL, NULL, GETDATE()),
('USR-003', 'staff@petnexus.com', '$2a$10$wT2eXoOq4q10hP8Yd1oZq.0t1QvH7t1hQ1.K8nBqZfT7/Rj3G4jKy', 'Nethmi Fernando', '+94 76 345 6789', '22 Nawala Road, Rajagiriya', 'ClinicStaff', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', NULL, NULL, NULL, 'STF-104', NULL, NULL, NULL, GETDATE()),
('USR-004', 'provider@petnexus.com', '$2a$10$wT2eXoOq4q10hP8Yd1oZq.0t1QvH7t1hQ1.K8nBqZfT7/Rj3G4jKy', 'Dilshan Bandara', '+94 70 456 7890', '78 High Level Road, Maharagama', 'PetCareProvider', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, NULL, NULL, NULL, NULL, NULL, 'Master Groomer & Canine Behaviour Specialist', GETDATE()),
('USR-005', 'manager@petnexus.com', '$2a$10$wT2eXoOq4q10hP8Yd1oZq.0t1QvH7t1hQ1.K8nBqZfT7/Rj3G4jKy', 'Himashi Gunawardena', '+94 77 567 8901', '5/1 Gregory Road, Colombo 07', 'ClinicManager', 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', NULL, NULL, NULL, NULL, 'MGR-001', NULL, NULL, GETDATE()),
('USR-006', 'rescue@petnexus.com', '$2a$10$wT2eXoOq4q10hP8Yd1oZq.0t1QvH7t1hQ1.K8nBqZfT7/Rj3G4jKy', 'Shehan Rajapaksha', '+94 71 678 9012', '33 Baseline Road, Nugegoda', 'RescueOfficer', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', NULL, NULL, NULL, NULL, NULL, 'RSC-882', NULL, GETDATE());
GO

-- 2. Seed Care Provider profile
INSERT INTO [dbo].[care_providers] ([provider_id], [provider_name], [contact_email], [contact_phone], [active], [user_id])
VALUES ('PRV-001', 'Dilshan Bandara Grooming & Spa', 'provider@petnexus.com', '+94 70 456 7890', 1, (SELECT id FROM [dbo].[users] WHERE email='provider@petnexus.com'));
GO

-- 3. Seed Pets in pets table
INSERT INTO [dbo].[pets] (
    [pet_id], [name], [species], [breed], [gender], [date_of_birth],
    [age_years], [age_months], [weight_kg], [microchip_id],
    [emergency_contact], [owner_id], [created_at]
) VALUES 
('PET-001', 'Barnaby', 'Dog', 'Golden Retriever', 'Male', '2021-03-15', 3, 6, 31.50, '981098102345678', 'Thilini Perera - +94 77 234 9988', (SELECT id FROM [dbo].[users] WHERE email='owner@petnexus.com'), GETDATE()),
('PET-002', 'Luna', 'Cat', 'Persian', 'Female', '2022-07-20', 2, 2, 4.20, '981098102345679', 'Thilini Perera - +94 77 234 9988', (SELECT id FROM [dbo].[users] WHERE email='owner@petnexus.com'), GETDATE());
GO

-- 4. Seed Suppliers in suppliers table
INSERT INTO [dbo].[suppliers] ([supplier_id], [company_name], [contact_person], [email], [phone], [address], [category], [lead_time_days], [rating], [active], [created_at])
VALUES 
('SUP-01', 'BioVet Laboratories Lanka', 'Dr. Janaka Fernando', 'sales@biovetlanka.com', '+94 11 288 9911', '124 Nawala Road, Nugegoda', 'Pharmaceuticals & Vaccines', 3, 4.8, 1, GETDATE()),
('SUP-02', 'MediEquip Surgical Instruments', 'Rohan Jayasuriya', 'orders@mediequip.lk', '+94 11 255 4433', '88 Galle Road, Colombo 03', 'Surgical Supplies', 5, 4.5, 1, GETDATE()),
('SUP-03', 'Royal Canin Distribution Hub', 'Dilani Alwis', 'distribution@royalcanin.lk', '+94 11 433 2211', '45 Baseline Road, Colombo 09', 'Prescription Diet', 2, 4.9, 1, GETDATE());
GO

-- 5. Seed Inventory Items in inventory_items table
INSERT INTO [dbo].[inventory_items] (
    [item_id], [name], [category], [sku], [batch_number], [current_stock],
    [min_stock_threshold], [unit], [unit_price], [selling_price], [expiry_date],
    [status], [supplier_name], [supplier_fk_id], [created_at]
) VALUES 
('INV-101', 'Amoxicillin Trihydrate Oral Suspension 100ml', 'Antibiotics', 'MED-AMX-100', 'BT-78201', 18, 10, 'Bottles', 3800.00, 5200.00, '2027-11-30', 'IN_STOCK', 'BioVet Laboratories Lanka', (SELECT id FROM [dbo].[suppliers] WHERE supplier_id='SUP-01'), GETDATE()),
('INV-102', 'Rabies 3-Year Canine/Feline Vaccine 50-Dose', 'Vaccines', 'VAC-RAB-03Y', 'BT-99411', 4, 8, 'Vials (Pack)', 22500.00, 38500.00, '2027-04-15', 'LOW_STOCK', 'BioVet Laboratories Lanka', (SELECT id FROM [dbo].[suppliers] WHERE supplier_id='SUP-01'), GETDATE());
GO

-- 6. Seed Care Services in care_services table
INSERT INTO [dbo].[care_services] ([service_id], [name], [description], [price], [duration_minutes], [status], [created_by_user_id])
VALUES 
('SRV-001', 'Full Grooming & Hydrobath Spa', 'Includes warm hydrobath, coat trimming, nail clipping and ear cleaning', 4500.00, 60, 'SCHEDULED', (SELECT id FROM [dbo].[users] WHERE email='provider@petnexus.com')),
('SRV-002', 'Basic Hygiene Groom', 'Bath, blow dry and nail trimming', 2500.00, 40, 'SCHEDULED', (SELECT id FROM [dbo].[users] WHERE email='provider@petnexus.com'));
GO

-- 7. Seed Rescue Cases in rescue_cases table
INSERT INTO [dbo].[rescue_cases] (
    [case_id], [case_number], [temporary_name], [species], [breed],
    [rescue_location], [intake_date], [condition_severity], [status],
    [is_published_for_adoption], [description], [rescue_officer_fk_id], [created_at]
) VALUES 
('RSC-2026-001', 'RC-001', 'Buddy', 'Dog', 'Mongrel / Crossbreed', 'Near Kelaniya Temple, Kelaniya', CAST(GETDATE() AS DATE), 'Critical', 'In Treatment', 0, 'Adult male dog with a fractured hind leg after traffic incident.', (SELECT id FROM [dbo].[users] WHERE email='rescue@petnexus.com'), GETDATE()),
('RSC-2026-002', 'RC-002', 'Milo & Siblings', 'Dog', 'Mixed', 'Galle Face Green, Colombo 03', CAST(GETDATE() AS DATE), 'Moderate', 'Open', 0, 'Litter of 3 malnourished puppies needing urgent veterinary care and foster placement.', (SELECT id FROM [dbo].[users] WHERE email='rescue@petnexus.com'), GETDATE());
GO
"""

sec3_raw = "".join(unified_lines[idx_sec3_start:idx_sec3_end])

# 2. Parse DDD Functions 00 to 06 from ddd_text
func_splits = re.split(r'(--={10,}\s*\n--FUNCTION\s+\d+\s*:[^\n]+\n(?:--[^\n]+\n)*--={10,})', ddd_text)

ddd_ddl_list = []
ddd_dml_list = []
ddd_queries_tests_list = []

for func_idx in range(7):
    header = func_splits[2 * func_idx + 1]
    body = func_splits[2 * func_idx + 2]
    
    parts = re.split(r'(-{20,}\s*\n--\s*Part\s+[B-F]\s*:[^\n]+\n-{20,})', body)
    
    func_title = header.strip().split('\n')[1].replace('--', '').strip()
    
    # Part B (DDL)
    partB_content = parts[2].strip()
    
    # Part C (DML)
    partC_content = parts[4].strip()
    c_batches = [b.strip() for b in re.split(r'\nGO\b', partC_content, flags=re.IGNORECASE) if b.strip()]
    c_valid = []
    c_must_fail = []
    for b in c_batches:
        if 'must fail' in b.lower():
            c_must_fail.append(b)
        else:
            c_valid.append(b)
            
    partC_valid = "\nGO\n\n".join(c_valid) + "\nGO"
    
    # Part D (Queries + Views)
    partD_content = parts[6].strip()
    dBatches = [b.strip() for b in re.split(r'\nGO\b', partD_content, flags=re.IGNORECASE) if b.strip()]
    dViews = [b for b in dBatches if 'CREATE VIEW' in b.upper()]
    dQueries = [b for b in dBatches if 'CREATE VIEW' not in b.upper()]
    
    # Part E (Functions/Procedures + Checks)
    partE_content = parts[8].strip()
    eBatches = [b.strip() for b in re.split(r'\nGO\b', partE_content, flags=re.IGNORECASE) if b.strip()]
    eProcs = [b for b in eBatches if re.search(r'\bCREATE\s+(OR\s+ALTER\s+)?(FUNCTION|PROCEDURE)\b', b, re.IGNORECASE)]
    eChecks = [b for b in eBatches if not re.search(r'\bCREATE\s+(OR\s+ALTER\s+)?(FUNCTION|PROCEDURE)\b', b, re.IGNORECASE)]
    
    # Part F (Triggers + Checks)
    partF_content = parts[10].strip()
    fBatches = [b.strip() for b in re.split(r'\nGO\b', partF_content, flags=re.IGNORECASE) if b.strip()]
    fTriggers = [b for b in fBatches if re.search(r'\bCREATE\s+(OR\s+ALTER\s+)?(TRIGGER|TABLE)\b', b, re.IGNORECASE)]
    fChecks = [b for b in fBatches if not re.search(r'\bCREATE\s+(OR\s+ALTER\s+)?(TRIGGER|TABLE)\b', b, re.IGNORECASE)]
    
    # Assemble DDL block
    ddl_block = f"""--==================================================================
-- {func_title}
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{partB_content}
GO
"""
    if dViews:
        ddl_block += f"""
--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{('\nGO\n\n'.join(dViews))}
GO
"""
    if eProcs:
        ddl_block += f"""
--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{('\nGO\n\n'.join(eProcs))}
GO
"""
    if fTriggers:
        ddl_block += f"""
--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{('\nGO\n\n'.join(fTriggers))}
GO
"""
    ddd_ddl_list.append(ddl_block)
    
    # Assemble DML block
    dml_block = f"""--==================================================================
-- {func_title} : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{partC_valid}
"""
    ddd_dml_list.append(dml_block)
    
    # Assemble Queries & Tests block
    qt_block = f"""--==================================================================
-- {func_title} : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{('\nGO\n\n'.join(dQueries))}
GO
"""
    if c_must_fail:
        qt_block += f"""
--------------------------------------------------
-- Part C Negative Test Proofs (Must Fail Checks)
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{('\nGO\n\n'.join(c_must_fail))}
GO
"""

    qt_block += f"""
--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{('\nGO\n\n'.join(eChecks))}
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
{('\nGO\n\n'.join(fChecks))}
GO
"""
    ddd_queries_tests_list.append(qt_block)

print("Parsed and structured all 7 functions cleanly!")

# 3. Construct PetNexus_DDL.sql
ddl_header = """-- ==============================================================================
-- SLIIT - Faculty of Computing (Year 2 Semester 1 - 2026)
-- IT2140 Database Design and Development + Software Engineering Project
-- PROJECT: PetNexus - Web-based Pet Care System (Group: 2026-Y2-S1-MTR-20)
-- ==============================================================================
-- FILE 1 OF 3: DATA DEFINITION LANGUAGE (DDL) SCRIPT
-- ==============================================================================
-- This script creates the centralized enterprise database [PetNexus] and all objects:
-- 1. Database Initialization (Creates standalone [PetNexus] database, overriding old)
-- 2. SE Web Application Schema (24 JPA tables with constraints and indexes)
-- 3. IT2140 DDD Relational Schema (Functions 00-06 Tables, Constraints, Alter Table FKs)
-- 4. Analytical 3NF Views (Functions 00-06 Views)
-- 5. Stored Functions and Stored Procedures (Part E across Functions 00-06)
-- 6. Triggers and Audit Schema (Part F across Functions 00-06: ISA triggers, audit triggers)
-- 7. Unified Integration Views & Real-Time Sync Triggers (linking Web App & DDD)
-- ==============================================================================

USE master;
GO

IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'PetNexus')
BEGIN
    ALTER DATABASE [PetNexus] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE [PetNexus];
END;
GO

CREATE DATABASE [PetNexus];
GO

USE [PetNexus];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ==============================================================================
-- SECTION 1: SE WEB APPLICATION BACKEND SCHEMA (Preserving Web Flow)
-- ==============================================================================
"""

ddl_sec2_header = """-- ==============================================================================
-- SECTION 2: IT2140 DATABASE DESIGN & DEVELOPMENT (DDD) DDL (Functions 00 - 06)
-- (Matches EER Diagram & Relational Schema: Tables, Views, Procedures, Triggers)
-- ==============================================================================
"""

sync_triggers = """
-- ==============================================================================
-- SECTION 4: REAL-TIME SYNCHRONIZATION TRIGGERS
-- Automatically synchronizes website registrations with the DDD normalized schema.
-- Website user IDs start from 101+ to prevent collision with DDD benchmark users 1-33.
-- ==============================================================================

CREATE OR ALTER TRIGGER trg_users_sync_to_ddd
ON [dbo].[users]
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @nextId INT;
    DECLARE @email VARCHAR(100), @fullName VARCHAR(100), @phone VARCHAR(30), @role VARCHAR(40);
    
    DECLARE cur CURSOR LOCAL FOR 
        SELECT email, full_name, phone, role FROM inserted;
    OPEN cur;
    FETCH NEXT FROM cur INTO @email, @fullName, @phone, @role;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM [USER] WHERE email = @email)
        BEGIN
            SELECT @nextId = ISNULL(MAX(user_id), 100) + 1 FROM [USER];
            IF @nextId < 101 SET @nextId = 101;
            
            INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city)
            VALUES (@nextId, CONCAT('2000', RIGHT('00000000' + CAST(@nextId AS VARCHAR(10)), 8)), @fullName, @email, 'Web Registered', 'Colombo');
            
            IF @phone IS NOT NULL AND @phone LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
            BEGIN
                INSERT INTO USER_PHONE (user_id, phone_number) VALUES (@nextId, @phone);
            END
            ELSE
            BEGIN
                INSERT INTO USER_PHONE (user_id, phone_number) VALUES (@nextId, CONCAT('077', RIGHT('0000000' + CAST(@nextId AS VARCHAR(10)), 7)));
            END
            
            IF @role = 'PetOwner'
                INSERT INTO PET_OWNER (user_id, owner_id) VALUES (@nextId, CONCAT('OWN', RIGHT('000' + CAST(@nextId AS VARCHAR(10)), 3)));
            ELSE IF @role = 'Veterinarian'
                INSERT INTO VETERINARIAN (user_id, license_number) VALUES (@nextId, CONCAT('SLVC-', CAST(1000 + @nextId AS VARCHAR(10))));
            ELSE IF @role = 'ClinicStaff'
                INSERT INTO CLINIC_STAFF (user_id, staff_id, role) VALUES (@nextId, CONCAT('STF', RIGHT('000' + CAST(@nextId AS VARCHAR(10)), 3)), 'Assistant');
            ELSE IF @role = 'ClinicManager'
                INSERT INTO CLINIC_MANAGER (user_id, manager_code) VALUES (@nextId, CONCAT('MGR', RIGHT('000' + CAST(@nextId AS VARCHAR(10)), 3)));
            ELSE IF @role = 'PetCareProvider'
                INSERT INTO PET_CARE_PROVIDER (user_id, provider_id) VALUES (@nextId, CONCAT('PCP', RIGHT('000' + CAST(@nextId AS VARCHAR(10)), 3)));
            ELSE IF @role = 'RescueOfficer'
                INSERT INTO RESCUE_OFFICER (user_id, badge_number) VALUES (@nextId, CONCAT('RO-', CAST(100 + @nextId AS VARCHAR(10))));
            ELSE
                INSERT INTO PET_OWNER (user_id, owner_id) VALUES (@nextId, CONCAT('OWN', RIGHT('000' + CAST(@nextId AS VARCHAR(10)), 3)));
        END
        FETCH NEXT FROM cur INTO @email, @fullName, @phone, @role;
    END
    CLOSE cur;
    DEALLOCATE cur;
END;
GO
"""

full_ddl = ddl_header + se_ddl + "\nGO\n" + ddl_sec2_header + "\n".join(ddd_ddl_list) + "\n" + sec3_raw + "\nGO\n" + sync_triggers

# 4. Construct PetNexus_DML.sql
# In DML: Place DDD Sample Data FIRST so that users 1-33, pets 101-110 are in place,
# then SE Seed Data executes second!
dml_header = """-- ==============================================================================
-- SLIIT - Faculty of Computing (Year 2 Semester 1 - 2026)
-- IT2140 Database Design and Development + Software Engineering Project
-- PROJECT: PetNexus - Web-based Pet Care System (Group: 2026-Y2-S1-MTR-20)
-- ==============================================================================
-- FILE 2 OF 3: DATA MANIPULATION LANGUAGE (DML) SCRIPT
-- ==============================================================================
-- Pre-requisite: Execute PetNexus_DDL.sql first.
-- This script populates all baseline seed data and sample datasets:
-- 1. IT2140 DDD Benchmark Sample Datasets (Functions 00 through 06 in topological order)
-- 2. SE Web Application Initial Seed Data (Active stakeholders with BCrypt passwords:
--    admin@petnexus.lk, owner@petnexus.lk, vet@petnexus.lk, staff@petnexus.lk, etc.)
-- ==============================================================================

USE [PetNexus];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ==============================================================================
-- SECTION 1: IT2140 DDD BENCHMARK SAMPLE DATASETS (Functions 00 - 06)
-- ==============================================================================
"""

dml_sec2_header = """-- ==============================================================================
-- SECTION 2: SE WEB APPLICATION INITIAL SEED DATA (For Website Login & Operation)
-- ==============================================================================
"""

full_dml = dml_header + "\n".join(ddd_dml_list) + "\nGO\n" + dml_sec2_header + se_dml

# 5. Construct PetNexus_Queries_and_Tests.sql
qt_header = """-- ==============================================================================
-- SLIIT - Faculty of Computing (Year 2 Semester 1 - 2026)
-- IT2140 Database Design and Development + Software Engineering Project
-- PROJECT: PetNexus - Web-based Pet Care System (Group: 2026-Y2-S1-MTR-20)
-- ==============================================================================
-- FILE 3 OF 3: ANALYTICAL QUERIES & VERIFICATION TEST SUITE
-- ==============================================================================
-- Pre-requisites: Execute PetNexus_DDL.sql and PetNexus_DML.sql first.
-- This script contains:
-- 1. IT2140 DDD Part D Analytical SQL Queries (Functions 00 to 06: joins, aggregations,
--    subqueries, group by / having, views)
-- 2. Part E Stored Function & Stored Procedure Execution Tests (success & validation tests)
-- 3. Part F Trigger Verification Tests (including the expected 'must fail' proof blocks)
--
-- Note: Blocks marked 'must fail' prove validation checks and constraints are working.
-- ==============================================================================

USE [PetNexus];
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
"""

full_qt = qt_header + "\n".join(ddd_queries_tests_list)

# 6. Construct Unified Master script (runs DDL + DML + Verification together)
master_header = """-- ==============================================================================
-- SLIIT - Faculty of Computing (Year 2 Semester 1 - 2026)
-- IT2140 Database Design and Development + Software Engineering Project
-- PROJECT: PetNexus - Web-based Pet Care System (Group: 2026-Y2-S1-MTR-20)
-- ==============================================================================
-- UNIFIED MASTER DATABASE SCRIPT (ALL-IN-ONE EXECUTION)
-- ==============================================================================
-- This script executes the complete database build sequentially from top to bottom:
-- Part 1: DDL (Database initialization, SE tables, DDD tables, views, procedures, triggers)
-- Part 2: DML (DDD sample datasets, SE initial seed credentials)
-- Part 3: Queries & Verification (Analytical queries, procedure checks, trigger checks)
--
-- Run in SSMS from top to bottom. Blocks marked 'must fail' show the checks working.
-- ==============================================================================
"""

full_master = master_header + full_ddl + "\n\n" + full_dml + "\n\n" + full_qt

# Write files to Database folder
dest_dir = r'C:\Users\Avinash\Documents\SLIIT\Y2S1\SE\Project\Web-based-pet-care-system\Database'
os.makedirs(dest_dir, exist_ok=True)

with open(os.path.join(dest_dir, 'PetNexus_DDL.sql'), 'w', encoding='utf-8') as f:
    f.write(full_ddl)
print(f"Wrote PetNexus_DDL.sql ({len(full_ddl)} bytes)")

with open(os.path.join(dest_dir, 'PetNexus_DML.sql'), 'w', encoding='utf-8') as f:
    f.write(full_dml)
print(f"Wrote PetNexus_DML.sql ({len(full_dml)} bytes)")

with open(os.path.join(dest_dir, 'PetNexus_Queries_and_Tests.sql'), 'w', encoding='utf-8') as f:
    f.write(full_qt)
print(f"Wrote PetNexus_Queries_and_Tests.sql ({len(full_qt)} bytes)")

with open(os.path.join(dest_dir, 'PetNexus_Unified_Master.sql'), 'w', encoding='utf-8') as f:
    f.write(full_master)
print(f"Wrote PetNexus_Unified_Master.sql ({len(full_master)} bytes)")

# Also write to DDD Project directory so both are synced!
ddd_dest_dir = r'C:\Users\Avinash\Documents\SLIIT\Y2S1\DDD\Project'
with open(os.path.join(ddd_dest_dir, 'PetNexus_DDL.sql'), 'w', encoding='utf-8') as f:
    f.write(full_ddl)
with open(os.path.join(ddd_dest_dir, 'PetNexus_DML.sql'), 'w', encoding='utf-8') as f:
    f.write(full_dml)
with open(os.path.join(ddd_dest_dir, 'PetNexus_Queries_and_Tests.sql'), 'w', encoding='utf-8') as f:
    f.write(full_qt)
with open(os.path.join(ddd_dest_dir, 'PetNexus_Unified_Master.sql'), 'w', encoding='utf-8') as f:
    f.write(full_master)
print("Synced all 4 files to DDD Project folder as well!")
