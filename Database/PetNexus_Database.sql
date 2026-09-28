-- ==============================================================================
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
-- ==============================================================================
-- SLIIT - Faculty of Computing (Year 2 Semester 1 - 2026)
-- IT2140 Database Design and Development + Software Engineering Project
-- PROJECT: PetNexus - Web-based Pet Care System (Group: 2026-Y2-S1-MTR-20)
-- ==============================================================================
-- FILE 1 OF 3: DATA DEFINITION LANGUAGE (DDL) SCRIPT
-- ==============================================================================
-- This script creates the centralized enterprise database PetNexus and all objects:
-- 1. Database Initialization (Creates standalone PetNexus database, overriding old)
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
    ALTER DATABASE PetNexus SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PetNexus;
END;
GO

CREATE DATABASE PetNexus;
GO

USE PetNexus;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ==============================================================================
-- SECTION 1: SE WEB APPLICATION BACKEND SCHEMA (Preserving Web Flow)
-- ==============================================================================
-- SECTION 1: SE WEB APPLICATION BACKEND SCHEMA & SEED DATA (Preserving Website)
-- ==============================================================================
CREATE TABLE adoption_applications(
	application_id varchar(255) NOT NULL,
	applicant_name varchar(255) NOT NULL,
	applicant_phone varchar(255) NOT NULL,
	created_at datetime2(7) NOT NULL,
	pet_name varchar(255) NOT NULL,
	review_notes varchar(255) NULL,
	reviewed_at datetime2(7) NULL,
	status varchar(255) NOT NULL,
	applicant_id bigint NOT NULL,
	case_id bigint NOT NULL,
	reviewed_by bigint NULL,
PRIMARY KEY CLUSTERED 
(
	application_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table adoption_listings    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE adoption_listings(
	listing_id varchar(255) NOT NULL,
	created_at datetime2(7) NOT NULL,
	is_published_for_adoption bit NOT NULL,
	updated_at datetime2(7) NOT NULL,
	case_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	listing_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT UKs3837mck1g3sg5akv9orth206 UNIQUE NONCLUSTERED 
(
	case_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table appointments    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE appointments(
	id bigint IDENTITY(1,1) NOT NULL,
	appointment_date date NOT NULL,
	appointment_id varchar(20) NOT NULL,
	breed varchar(100) NULL,
	cancellation_reason varchar(500) NULL,
	cancelled_at datetime2(7) NULL,
	created_at datetime2(7) NOT NULL,
	notes varchar(2000) NULL,
	owner_id varchar(20) NULL,
	owner_name varchar(150) NOT NULL,
	owner_phone varchar(50) NULL,
	pet_id varchar(20) NULL,
	pet_name varchar(100) NOT NULL,
	reason varchar(1000) NULL,
	reschedule_reason varchar(500) NULL,
	rescheduled_from_date date NULL,
	rescheduled_from_time_slot varchar(30) NULL,
	rescheduled_from_vet_name varchar(150) NULL,
	service_type varchar(100) NOT NULL,
	species varchar(50) NULL,
	status varchar(30) NOT NULL,
	symptoms varchar(1000) NULL,
	time_slot varchar(30) NOT NULL,
	token_number varchar(20) NULL,
	updated_at datetime2(7) NULL,
	vet_id varchar(20) NULL,
	vet_name varchar(150) NOT NULL,
	owner_fk_id bigint NULL,
	pet_fk_id bigint NULL,
	vet_fk_id bigint NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_appointments_appointment_id UNIQUE NONCLUSTERED 
(
	appointment_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table approval_history    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE approval_history(
	id bigint IDENTITY(1,1) NOT NULL,
	action varchar(50) NOT NULL,
	admin_id varchar(20) NOT NULL,
	history_id varchar(30) NOT NULL,
	reason varchar(500) NULL,
	timestamp datetime2(7) NOT NULL,
	user_full_name varchar(150) NOT NULL,
	user_id varchar(20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table care_providers    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE care_providers(
	id bigint IDENTITY(1,1) NOT NULL,
	active bit NOT NULL,
	contact_email varchar(100) NULL,
	contact_phone varchar(20) NULL,
	provider_id varchar(20) NOT NULL,
	provider_name varchar(100) NOT NULL,
	user_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_care_provider_user UNIQUE NONCLUSTERED 
(
	user_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table care_service_logs    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE care_service_logs(
	id bigint IDENTITY(1,1) NOT NULL,
	case_id varchar(20) NULL,
	created_at date NOT NULL,
	intake_condition varchar(500) NULL,
	notes varchar(1000) NULL,
	owner_id varchar(20) NULL,
	owner_name varchar(100) NULL,
	pet_id varchar(20) NULL,
	pet_name varchar(100) NULL,
	provider_id varchar(20) NULL,
	provider_name varchar(100) NULL,
	return_to_rescue bit NOT NULL,
	service_date date NOT NULL,
	service_log_id varchar(20) NOT NULL,
	service_type varchar(100) NOT NULL,
	services_performed varchar(1000) NULL,
	status varchar(30) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_care_service_log_id UNIQUE NONCLUSTERED 
(
	service_log_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table care_services    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE care_services(
	id bigint IDENTITY(1,1) NOT NULL,
	description varchar(500) NULL,
	duration_minutes int NOT NULL,
	name varchar(100) NOT NULL,
	price numeric(10, 2) NOT NULL,
	service_id varchar(20) NOT NULL,
	status varchar(30) NOT NULL,
	created_by_user_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_care_service_name UNIQUE NONCLUSTERED 
(
	name ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table consultations    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE consultations(
	id bigint IDENTITY(1,1) NOT NULL,
	appointment_id varchar(20) NULL,
	assessment_diagnosis varchar(2000) NOT NULL,
	case_id varchar(30) NULL,
	consultation_date datetime2(7) NOT NULL,
	consultation_id varchar(30) NOT NULL,
	created_at datetime2(7) NOT NULL,
	follow_up_date date NULL,
	heart_rate_bpm int NULL,
	objective_findings varchar(2000) NULL,
	pass_to_provider bit NULL,
	pet_id varchar(20) NULL,
	pet_name varchar(100) NOT NULL,
	rescue_medical_summary varchar(2000) NULL,
	respiratory_rate_bpm int NULL,
	status varchar(30) NULL,
	subjective_notes varchar(2000) NULL,
	temperaturec numeric(4, 1) NULL,
	treatment_plan varchar(2000) NOT NULL,
	updated_at datetime2(7) NULL,
	vet_id varchar(20) NULL,
	vet_name varchar(150) NOT NULL,
	weight_kg numeric(5, 2) NULL,
	appointment_fk_id bigint NULL,
	pet_fk_id bigint NULL,
	vet_fk_id bigint NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_consultations_consultation_id UNIQUE NONCLUSTERED 
(
	consultation_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table feedbacks    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE feedbacks(
	id bigint IDENTITY(1,1) NOT NULL,
	comments varchar(2000) NOT NULL,
	created_at datetime2(7) NOT NULL,
	feedback_id varchar(30) NOT NULL,
	manager_responded_at datetime2(7) NULL,
	manager_response varchar(2000) NULL,
	rating int NOT NULL,
	service_category varchar(100) NOT NULL,
	staff_mentioned varchar(150) NULL,
	title varchar(200) NOT NULL,
	updated_at datetime2(7) NULL,
	user_name varchar(150) NOT NULL,
	user_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_feedback_feedback_id UNIQUE NONCLUSTERED 
(
	feedback_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table foster_records    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE foster_records(
	id bigint IDENTITY(1,1) NOT NULL,
	active_placements int NULL,
	address varchar(300) NULL,
	created_at datetime2(7) NOT NULL,
	email varchar(150) NULL,
	foster_id varchar(30) NOT NULL,
	full_name varchar(150) NOT NULL,
	home_type varchar(200) NULL,
	max_capacity int NULL,
	phone varchar(30) NULL,
	rating numeric(3, 1) NULL,
	status varchar(20) NULL,
	updated_at datetime2(7) NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_foster_records_foster_id UNIQUE NONCLUSTERED 
(
	foster_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table inventory_items    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE inventory_items(
	id bigint IDENTITY(1,1) NOT NULL,
	batch_number varchar(50) NULL,
	category varchar(100) NOT NULL,
	created_at datetime2(7) NOT NULL,
	current_stock int NOT NULL,
	expiry_date date NULL,
	item_id varchar(20) NOT NULL,
	min_stock_threshold int NOT NULL,
	name varchar(150) NOT NULL,
	selling_price numeric(10, 2) NOT NULL,
	sku varchar(50) NOT NULL,
	status varchar(30) NOT NULL,
	supplier_name varchar(150) NULL,
	unit varchar(50) NOT NULL,
	unit_price numeric(10, 2) NOT NULL,
	updated_at datetime2(7) NULL,
	supplier_fk_id bigint NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_inventory_items_item_id UNIQUE NONCLUSTERED 
(
	item_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_inventory_items_sku UNIQUE NONCLUSTERED 
(
	sku ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table notifications    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE notifications(
	id bigint IDENTITY(1,1) NOT NULL,
	created_at datetime2(7) NOT NULL,
	is_read bit NOT NULL,
	link varchar(300) NULL,
	message varchar(1000) NOT NULL,
	notification_id varchar(40) NOT NULL,
	title varchar(200) NOT NULL,
	type varchar(30) NOT NULL,
	user_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_notifications_notification_id UNIQUE NONCLUSTERED 
(
	notification_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table pet_documents    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE pet_documents(
	id bigint IDENTITY(1,1) NOT NULL,
	document_id varchar(20) NOT NULL,
	document_type varchar(100) NOT NULL,
	file_name varchar(255) NOT NULL,
	file_size varchar(50) NULL,
	file_url varchar(1000) NULL,
	notes varchar(2000) NULL,
	owner_id varchar(20) NOT NULL,
	pet_name varchar(100) NULL,
	uploaded_at datetime2(7) NOT NULL,
	pet_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_pet_documents_document_id UNIQUE NONCLUSTERED 
(
	document_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table pets    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE pets(
	id bigint IDENTITY(1,1) NOT NULL,
	age_months int NULL,
	age_years int NULL,
	allergies varchar(500) NULL,
	breed varchar(100) NOT NULL,
	created_at datetime2(7) NOT NULL,
	date_of_birth date NULL,
	emergency_contact varchar(300) NULL,
	gender varchar(30) NULL,
	image_url varchar(500) NULL,
	medical_notes varchar(2000) NULL,
	microchip_id varchar(20) NULL,
	name varchar(100) NOT NULL,
	pet_id varchar(20) NOT NULL,
	species varchar(50) NOT NULL,
	updated_at datetime2(7) NULL,
	weight_kg numeric(5, 2) NULL,
	owner_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_pets_pet_id UNIQUE NONCLUSTERED 
(
	pet_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table prescription_items    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE prescription_items(
	id bigint IDENTITY(1,1) NOT NULL,
	dosage varchar(100) NULL,
	duration_days int NULL,
	frequency varchar(100) NULL,
	item_id varchar(50) NOT NULL,
	medication_name varchar(200) NOT NULL,
	prescription_id varchar(30) NULL,
	quantity_prescribed int NULL,
	refills_allowed int NULL,
	prescription_fk_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_prescription_items_item_id UNIQUE NONCLUSTERED 
(
	item_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table prescriptions    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE prescriptions(
	id bigint IDENTITY(1,1) NOT NULL,
	consultation_id varchar(30) NULL,
	created_at datetime2(7) NOT NULL,
	digital_signature varchar(300) NULL,
	instructions varchar(1000) NULL,
	issue_date date NOT NULL,
	owner_name varchar(150) NULL,
	pet_id varchar(20) NULL,
	pet_name varchar(100) NOT NULL,
	prescription_id varchar(30) NOT NULL,
	status varchar(30) NOT NULL,
	updated_at datetime2(7) NULL,
	valid_until date NULL,
	vet_id varchar(20) NULL,
	vet_license varchar(50) NULL,
	vet_name varchar(150) NOT NULL,
	consultation_fk_id bigint NULL,
	pet_fk_id bigint NULL,
	vet_fk_id bigint NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_prescriptions_rx_id UNIQUE NONCLUSTERED 
(
	prescription_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table purchase_orders    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE purchase_orders(
	id bigint IDENTITY(1,1) NOT NULL,
	created_at datetime2(7) NOT NULL,
	items_description varchar(1000) NULL,
	order_id varchar(30) NOT NULL,
	status varchar(30) NOT NULL,
	supplier_id varchar(20) NULL,
	supplier_name varchar(150) NOT NULL,
	total_amount numeric(12, 2) NOT NULL,
	notes varchar(500) NULL,
	updated_at datetime2(7) NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_purchase_orders_order_id UNIQUE NONCLUSTERED 
(
	order_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table rescue_cases    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE rescue_cases(
	id bigint IDENTITY(1,1) NOT NULL,
	breed varchar(100) NULL,
	case_id varchar(30) NOT NULL,
	case_number varchar(20) NULL,
	condition_severity varchar(20) NULL,
	cover_photo_url varchar(500) NULL,
	created_at datetime2(7) NOT NULL,
	description varchar(2000) NULL,
	estimated_age varchar(50) NULL,
	foster_parent_id varchar(30) NULL,
	foster_parent_name varchar(150) NULL,
	gender varchar(20) NULL,
	intake_date date NOT NULL,
	intake_officer varchar(150) NULL,
	is_published_for_adoption bit NOT NULL,
	medical_summary varchar(2000) NULL,
	microchip_id varchar(50) NULL,
	rescue_location varchar(500) NOT NULL,
	species varchar(50) NULL,
	status varchar(30) NOT NULL,
	temporary_name varchar(100) NOT NULL,
	updated_at datetime2(7) NULL,
	rescue_officer_fk_id bigint NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_rescue_cases_case_id UNIQUE NONCLUSTERED 
(
	case_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table rescue_photos    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE rescue_photos(
	id bigint IDENTITY(1,1) NOT NULL,
	caption varchar(300) NULL,
	case_id varchar(30) NOT NULL,
	photo_id varchar(30) NOT NULL,
	photo_url varchar(500) NOT NULL,
	tag varchar(50) NULL,
	uploaded_at datetime2(7) NULL,
	rescue_case_fk_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_rescue_photos_photo_id UNIQUE NONCLUSTERED 
(
	photo_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table rescue_progress_logs    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE rescue_progress_logs(
	id bigint IDENTITY(1,1) NOT NULL,
	case_id varchar(30) NOT NULL,
	created_at datetime2(7) NOT NULL,
	log_date datetime2(7) NOT NULL,
	log_id varchar(30) NOT NULL,
	log_type varchar(30) NULL,
	logged_by varchar(150) NOT NULL,
	notes varchar(2000) NULL,
	title varchar(200) NOT NULL,
	rescue_case_fk_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_rescue_progress_logs_log_id UNIQUE NONCLUSTERED 
(
	log_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table service_package_bookings    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE service_package_bookings(
	id bigint IDENTITY(1,1) NOT NULL,
	booking_id varchar(20) NOT NULL,
	completed_sessions int NOT NULL,
	created_at date NOT NULL,
	expiry_date date NOT NULL,
	owner_id varchar(20) NOT NULL,
	package_name varchar(100) NOT NULL,
	purchase_date date NOT NULL,
	remaining_sessions int NOT NULL,
	status varchar(30) NOT NULL,
	total_sessions int NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_service_package_booking_id UNIQUE NONCLUSTERED 
(
	booking_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table suppliers    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE suppliers(
	id bigint IDENTITY(1,1) NOT NULL,
	active bit NOT NULL,
	address varchar(300) NULL,
	category varchar(100) NULL,
	company_name varchar(150) NOT NULL,
	contact_person varchar(100) NULL,
	created_at datetime2(7) NOT NULL,
	email varchar(100) NOT NULL,
	lead_time_days int NOT NULL,
	phone varchar(30) NULL,
	rating numeric(3, 1) NOT NULL,
	supplier_id varchar(20) NOT NULL,
	updated_at datetime2(7) NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_suppliers_supplier_id UNIQUE NONCLUSTERED 
(
	supplier_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table users    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE users(
	id bigint IDENTITY(1,1) NOT NULL,
	address varchar(300) NULL,
	avatar_url varchar(MAX) NULL,
	badge_number varchar(30) NULL,
	created_at datetime2(7) NOT NULL,
	email varchar(255) NOT NULL,
	emergency_contact varchar(200) NULL,
	full_name varchar(150) NOT NULL,
	license_number varchar(50) NULL,
	manager_code varchar(30) NULL,
	password_hash varchar(255) NOT NULL,
	password_reset_token varchar(100) NULL,
	phone varchar(30) NULL,
	rejection_reason varchar(500) NULL,
	role varchar(30) NOT NULL,
	service_specialty varchar(150) NULL,
	specialization varchar(150) NULL,
	staff_id varchar(30) NULL,
	status varchar(40) NOT NULL,
	suspension_reason varchar(500) NULL,
	updated_at datetime2(7) NULL,
	user_id varchar(20) NOT NULL,
	approval_token varchar(100) NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_users_email UNIQUE NONCLUSTERED 
(
	email ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_users_user_id UNIQUE NONCLUSTERED 
(
	user_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table vaccinations    Script Date: 9/10/2026 8:37:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE vaccinations(
	id bigint IDENTITY(1,1) NOT NULL,
	administered_by varchar(150) NULL,
	administered_date date NULL,
	batch_number varchar(50) NULL,
	next_due_date date NULL,
	pet_name varchar(100) NULL,
	status varchar(30) NULL,
	vaccine_id varchar(20) NOT NULL,
	vaccine_name varchar(200) NOT NULL,
	pet_id bigint NOT NULL,
PRIMARY KEY CLUSTERED 
(
	id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT uk_vaccinations_vaccine_id UNIQUE NONCLUSTERED 
(
	vaccine_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_appointments_date_slot    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_appointments_date_slot ON appointments
(
	appointment_date ASC,
	time_slot ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_appointments_owner    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_appointments_owner ON appointments
(
	owner_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_appointments_pet    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_appointments_pet ON appointments
(
	pet_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_appointments_vet_date    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_appointments_vet_date ON appointments
(
	vet_id ASC,
	appointment_date ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_approval_history_user_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_approval_history_user_id ON approval_history
(
	user_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_consultations_appointment_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_consultations_appointment_id ON consultations
(
	appointment_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_consultations_case_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_consultations_case_id ON consultations
(
	case_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_consultations_pet_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_consultations_pet_id ON consultations
(
	pet_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_consultations_vet_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_consultations_vet_id ON consultations
(
	vet_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_feedback_category    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_feedback_category ON feedbacks
(
	service_category ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index idx_feedback_user    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_feedback_user ON feedbacks
(
	user_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_inventory_items_category    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_inventory_items_category ON inventory_items
(
	category ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_inventory_items_status    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_inventory_items_status ON inventory_items
(
	status ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index idx_notifications_is_read    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_notifications_is_read ON notifications
(
	is_read ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index idx_notifications_user    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_notifications_user ON notifications
(
	user_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_prescription_items_rx_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_prescription_items_rx_id ON prescription_items
(
	prescription_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_prescriptions_consultation_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_prescriptions_consultation_id ON prescriptions
(
	consultation_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_prescriptions_pet_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_prescriptions_pet_id ON prescriptions
(
	pet_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_prescriptions_vet_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_prescriptions_vet_id ON prescriptions
(
	vet_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index idx_rescue_cases_published    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_rescue_cases_published ON rescue_cases
(
	is_published_for_adoption ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_rescue_cases_status    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_rescue_cases_status ON rescue_cases
(
	status ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_rescue_photos_case_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_rescue_photos_case_id ON rescue_photos
(
	case_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index idx_rescue_logs_case_id    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_rescue_logs_case_id ON rescue_progress_logs
(
	case_id ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
/****** Object:  Index idx_rescue_logs_log_date    Script Date: 9/10/2026 8:37:25 PM ******/
CREATE NONCLUSTERED INDEX idx_rescue_logs_log_date ON rescue_progress_logs
(
	log_date ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE adoption_applications  WITH CHECK ADD  CONSTRAINT FKpssmak6donrlh7l463qtlkxx4 FOREIGN KEY(case_id)
REFERENCES rescue_cases (id)
GO
ALTER TABLE adoption_applications CHECK CONSTRAINT FKpssmak6donrlh7l463qtlkxx4
GO
ALTER TABLE adoption_applications  WITH CHECK ADD  CONSTRAINT FKrlnujyyfb9sbrtjw3y7ph3kvv FOREIGN KEY(reviewed_by)
REFERENCES users (id)
GO
ALTER TABLE adoption_applications CHECK CONSTRAINT FKrlnujyyfb9sbrtjw3y7ph3kvv
GO
ALTER TABLE adoption_applications  WITH CHECK ADD  CONSTRAINT FKvw031wcwn8gl97r8pmu63ntk FOREIGN KEY(applicant_id)
REFERENCES users (id)
GO
ALTER TABLE adoption_applications CHECK CONSTRAINT FKvw031wcwn8gl97r8pmu63ntk
GO
ALTER TABLE adoption_listings  WITH CHECK ADD  CONSTRAINT FKcdr2kc9eruujmg8y53jjuub2g FOREIGN KEY(case_id)
REFERENCES rescue_cases (id)
GO
ALTER TABLE adoption_listings CHECK CONSTRAINT FKcdr2kc9eruujmg8y53jjuub2g
GO
ALTER TABLE appointments  WITH CHECK ADD  CONSTRAINT fk_appointments_owner FOREIGN KEY(owner_fk_id)
REFERENCES users (id)
GO
ALTER TABLE appointments CHECK CONSTRAINT fk_appointments_owner
GO
ALTER TABLE appointments  WITH CHECK ADD  CONSTRAINT fk_appointments_pet FOREIGN KEY(pet_fk_id)
REFERENCES pets (id)
GO
ALTER TABLE appointments CHECK CONSTRAINT fk_appointments_pet
GO
ALTER TABLE appointments  WITH CHECK ADD  CONSTRAINT fk_appointments_vet FOREIGN KEY(vet_fk_id)
REFERENCES users (id)
GO
ALTER TABLE appointments CHECK CONSTRAINT fk_appointments_vet
GO
ALTER TABLE care_providers  WITH CHECK ADD  CONSTRAINT fk_care_provider_user FOREIGN KEY(user_id)
REFERENCES users (id)
GO
ALTER TABLE care_providers CHECK CONSTRAINT fk_care_provider_user
GO
ALTER TABLE care_services  WITH CHECK ADD  CONSTRAINT fk_care_service_user FOREIGN KEY(created_by_user_id)
REFERENCES users (id)
GO
ALTER TABLE care_services CHECK CONSTRAINT fk_care_service_user
GO
ALTER TABLE consultations  WITH CHECK ADD  CONSTRAINT fk_consultations_appointment FOREIGN KEY(appointment_fk_id)
REFERENCES appointments (id)
GO
ALTER TABLE consultations CHECK CONSTRAINT fk_consultations_appointment
GO
ALTER TABLE consultations  WITH CHECK ADD  CONSTRAINT fk_consultations_pet FOREIGN KEY(pet_fk_id)
REFERENCES pets (id)
GO
ALTER TABLE consultations CHECK CONSTRAINT fk_consultations_pet
GO
ALTER TABLE consultations  WITH CHECK ADD  CONSTRAINT fk_consultations_vet FOREIGN KEY(vet_fk_id)
REFERENCES users (id)
GO
ALTER TABLE consultations CHECK CONSTRAINT fk_consultations_vet
GO
ALTER TABLE feedbacks  WITH CHECK ADD  CONSTRAINT fk_feedback_user FOREIGN KEY(user_id)
REFERENCES users (id)
GO
ALTER TABLE feedbacks CHECK CONSTRAINT fk_feedback_user
GO
ALTER TABLE inventory_items  WITH CHECK ADD  CONSTRAINT fk_inventory_items_supplier FOREIGN KEY(supplier_fk_id)
REFERENCES suppliers (id)
GO
ALTER TABLE inventory_items CHECK CONSTRAINT fk_inventory_items_supplier
GO
ALTER TABLE notifications  WITH CHECK ADD  CONSTRAINT fk_notifications_user FOREIGN KEY(user_id)
REFERENCES users (id)
GO
ALTER TABLE notifications CHECK CONSTRAINT fk_notifications_user
GO
ALTER TABLE pet_documents  WITH CHECK ADD  CONSTRAINT fk_pet_documents_pet FOREIGN KEY(pet_id)
REFERENCES pets (id)
GO
ALTER TABLE pet_documents CHECK CONSTRAINT fk_pet_documents_pet
GO
ALTER TABLE pets  WITH CHECK ADD  CONSTRAINT fk_pets_owner FOREIGN KEY(owner_id)
REFERENCES users (id)
GO
ALTER TABLE pets CHECK CONSTRAINT fk_pets_owner
GO
ALTER TABLE prescription_items  WITH CHECK ADD  CONSTRAINT fk_rx_items_prescription FOREIGN KEY(prescription_fk_id)
REFERENCES prescriptions (id)
GO
ALTER TABLE prescription_items CHECK CONSTRAINT fk_rx_items_prescription
GO
ALTER TABLE prescriptions  WITH CHECK ADD  CONSTRAINT fk_prescriptions_consultation FOREIGN KEY(consultation_fk_id)
REFERENCES consultations (id)
GO
ALTER TABLE prescriptions CHECK CONSTRAINT fk_prescriptions_consultation
GO
ALTER TABLE prescriptions  WITH CHECK ADD  CONSTRAINT fk_prescriptions_pet FOREIGN KEY(pet_fk_id)
REFERENCES pets (id)
GO
ALTER TABLE prescriptions CHECK CONSTRAINT fk_prescriptions_pet
GO
ALTER TABLE prescriptions  WITH CHECK ADD  CONSTRAINT fk_prescriptions_vet FOREIGN KEY(vet_fk_id)
REFERENCES users (id)
GO
ALTER TABLE prescriptions CHECK CONSTRAINT fk_prescriptions_vet
GO
ALTER TABLE rescue_cases  WITH CHECK ADD  CONSTRAINT fk_rescue_cases_officer FOREIGN KEY(rescue_officer_fk_id)
REFERENCES users (id)
GO
ALTER TABLE rescue_cases CHECK CONSTRAINT fk_rescue_cases_officer
GO
ALTER TABLE rescue_photos  WITH CHECK ADD  CONSTRAINT fk_rescue_photos_case FOREIGN KEY(rescue_case_fk_id)
REFERENCES rescue_cases (id)
GO
ALTER TABLE rescue_photos CHECK CONSTRAINT fk_rescue_photos_case
GO
ALTER TABLE rescue_progress_logs  WITH CHECK ADD  CONSTRAINT fk_rescue_logs_case FOREIGN KEY(rescue_case_fk_id)
REFERENCES rescue_cases (id)
GO
ALTER TABLE rescue_progress_logs CHECK CONSTRAINT fk_rescue_logs_case
GO
ALTER TABLE vaccinations  WITH CHECK ADD  CONSTRAINT fk_vaccinations_pet FOREIGN KEY(pet_id)
REFERENCES pets (id)
GO
ALTER TABLE vaccinations CHECK CONSTRAINT fk_vaccinations_pet
GO
ALTER TABLE adoption_applications  WITH CHECK ADD CHECK  ((status='CANCELLED' OR status='REJECTED' OR status='APPROVED' OR status='UNDER_REVIEW' OR status='SUBMITTED'))
GO
ALTER TABLE appointments  WITH CHECK ADD CHECK  ((status='NoShow' OR status='Cancelled' OR status='Completed' OR status='InRoom' OR status='CheckedIn' OR status='Confirmed' OR status='Pending' OR status='Scheduled'))
GO
ALTER TABLE care_service_logs  WITH CHECK ADD CHECK  ((status='COMPLETED' OR status='READY_FOR_PICKUP' OR status='IN_PROGRESS' OR status='CHECKED_IN' OR status='SCHEDULED'))
GO
ALTER TABLE care_services  WITH CHECK ADD CHECK  ((status='COMPLETED' OR status='READY_FOR_PICKUP' OR status='IN_PROGRESS' OR status='CHECKED_IN' OR status='SCHEDULED'))
GO
ALTER TABLE inventory_items  WITH CHECK ADD CHECK  ((status='EXPIRED' OR status='OUT_OF_STOCK' OR status='LOW_STOCK' OR status='IN_STOCK'))
GO
ALTER TABLE notifications  WITH CHECK ADD CHECK  ((type='System' OR type='Health' OR type='Inventory' OR type='Approval' OR type='Adoption' OR type='Rescue' OR type='Appointment'))
GO
ALTER TABLE users  WITH CHECK ADD CHECK  ((role='Admin' OR role='RescueOfficer' OR role='ClinicManager' OR role='PetCareProvider' OR role='ClinicStaff' OR role='Veterinarian' OR role='PetOwner'))
GO
ALTER TABLE users  WITH CHECK ADD CHECK  ((status='Suspended' OR status='Rejected' OR status='Active' OR status='PendingApproval' OR status='PendingEmailVerification'))
GO

GO

-- ==============================================================================

GO
-- ==============================================================================
-- SECTION 2: IT2140 DATABASE DESIGN & DEVELOPMENT (DDD) DDL (Functions 00 - 06)
-- (Matches EER Diagram & Relational Schema: Tables, Views, Procedures, Triggers)
-- ==============================================================================
--==================================================================
-- FUNCTION 00 : IDENTITY AND ACCESS MANAGEMENT (common to all functions)
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--order : USER -> USER_PHONE -> 6 subclass tables -> VETERINARIAN_SPECIALIZATION -> NOTIFICATION
--USER is a reserved word in SQL Server, so it is always written as [USER]

CREATE TABLE [USER] (
  user_id INT NOT NULL,
  nic_no VARCHAR(12) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  street VARCHAR(100),
  city VARCHAR(50),

  CONSTRAINT user_pk PRIMARY KEY (user_id),
  CONSTRAINT unique_user_nic UNIQUE (nic_no),
  CONSTRAINT unique_user_email UNIQUE (email)
);
GO

--multivalued attribute phone_number
CREATE TABLE USER_PHONE (
  user_id INT NOT NULL,
  phone_number CHAR(10) NOT NULL,

  CONSTRAINT user_phone_pk PRIMARY KEY (user_id, phone_number),
  CONSTRAINT user_phone_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

--ISA option 1 : each subclass uses user_id as PK and FK to USER
CREATE TABLE PET_CARE_PROVIDER (
  user_id INT NOT NULL,
  provider_id VARCHAR(10) NOT NULL,

  CONSTRAINT pet_care_provider_pk PRIMARY KEY (user_id),
  CONSTRAINT unique_provider_id UNIQUE (provider_id),
  CONSTRAINT pet_care_provider_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE CLINIC_MANAGER (
  user_id INT NOT NULL,
  manager_code VARCHAR(10) NOT NULL,

  CONSTRAINT clinic_manager_pk PRIMARY KEY (user_id),
  CONSTRAINT unique_manager_code UNIQUE (manager_code),
  CONSTRAINT clinic_manager_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE CLINIC_STAFF (
  user_id INT NOT NULL,
  staff_id VARCHAR(10) NOT NULL,
  role VARCHAR(30) NOT NULL,

  CONSTRAINT clinic_staff_pk PRIMARY KEY (user_id),
  CONSTRAINT unique_staff_id UNIQUE (staff_id),
  CONSTRAINT clinic_staff_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE VETERINARIAN (
  user_id INT NOT NULL,
  license_number VARCHAR(20) NOT NULL,

  CONSTRAINT veterinarian_pk PRIMARY KEY (user_id),
  CONSTRAINT unique_license_number UNIQUE (license_number),
  CONSTRAINT veterinarian_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE PET_OWNER (
  user_id INT NOT NULL,
  owner_id VARCHAR(10) NOT NULL,

  CONSTRAINT pet_owner_pk PRIMARY KEY (user_id),
  CONSTRAINT unique_owner_id UNIQUE (owner_id),
  CONSTRAINT pet_owner_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE RESCUE_OFFICER (
  user_id INT NOT NULL,
  badge_number VARCHAR(10) NOT NULL,

  CONSTRAINT rescue_officer_pk PRIMARY KEY (user_id),
  CONSTRAINT unique_badge_number UNIQUE (badge_number),
  CONSTRAINT rescue_officer_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

--multivalued attribute specialization of VETERINARIAN
CREATE TABLE VETERINARIAN_SPECIALIZATION (
  user_id INT NOT NULL,
  specialization VARCHAR(50) NOT NULL,

  CONSTRAINT vet_specialization_pk PRIMARY KEY (user_id, specialization),
  CONSTRAINT vet_specialization_vet_fk FOREIGN KEY (user_id) REFERENCES VETERINARIAN(user_id) ON DELETE CASCADE
);
GO

--notifications are sent to every type of user, so NOTIFICATION is kept here
--notifications are made by the system, so notification_id is generated with IDENTITY
CREATE TABLE NOTIFICATION (
  notification_id INT IDENTITY(1601, 1) NOT NULL,
  message VARCHAR(200) NOT NULL,
  date_sent DATETIME NOT NULL DEFAULT GETDATE(),
  is_read BIT NOT NULL DEFAULT 0,
  user_id INT NOT NULL,

  CONSTRAINT notification_pk PRIMARY KEY (notification_id),
  CONSTRAINT notification_user_fk FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

--format checks added with ALTER TABLE 
ALTER TABLE [USER]
ADD CONSTRAINT check_user_nic
CHECK (nic_no LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]VvXx'              --For OLD SL NIC  
    OR nic_no LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]');   --For New SL NIC from 2016

ALTER TABLE [USER]
ADD CONSTRAINT check_user_email
CHECK (email LIKE '%_@_%._%');

ALTER TABLE USER_PHONE
ADD CONSTRAINT check_user_phone
CHECK (phone_number LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]');
GO
GO

--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--l.) VIEW : veterinarians and how many specializations they have
CREATE VIEW vet_specialization_view (vet_id, vet_name, license_number, no_of_specializations) AS
SELECT v.user_id, u.full_name, v.license_number, COUNT(s.specialization)
FROM VETERINARIAN v
INNER JOIN [USER] u ON v.user_id = u.user_id
LEFT OUTER JOIN VETERINARIAN_SPECIALIZATION s ON v.user_id = s.user_id
GROUP BY v.user_id, u.full_name, v.license_number;
GO

--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--E1.) Function : returns the user type of a given user
CREATE FUNCTION dbo.GetUserType (@userId INT)
RETURNS VARCHAR(30)
AS
BEGIN
    DECLARE @userType VARCHAR(30);

    IF EXISTS (SELECT 1 FROM PET_OWNER WHERE user_id = @userId)
        SET @userType = 'Pet Owner';
    ELSE IF EXISTS (SELECT 1 FROM VETERINARIAN WHERE user_id = @userId)
        SET @userType = 'Veterinarian';
    ELSE IF EXISTS (SELECT 1 FROM CLINIC_STAFF WHERE user_id = @userId)
        SET @userType = 'Clinic Staff';
    ELSE IF EXISTS (SELECT 1 FROM CLINIC_MANAGER WHERE user_id = @userId)
        SET @userType = 'Clinic Manager';
    ELSE IF EXISTS (SELECT 1 FROM PET_CARE_PROVIDER WHERE user_id = @userId)
        SET @userType = 'Pet Care Provider';
    ELSE IF EXISTS (SELECT 1 FROM RESCUE_OFFICER WHERE user_id = @userId)
        SET @userType = 'Rescue Officer';
    ELSE
        SET @userType = 'Not Assigned';

    RETURN @userType;
END;
GO

--E2.) Function : returns in how many user type tables a user is (must be exactly 1)
CREATE FUNCTION dbo.GetUserRoleCount (@userId INT)
RETURNS INT
AS
BEGIN
    DECLARE @roleCount INT;

    SET @roleCount = (SELECT COUNT(*) FROM PET_CARE_PROVIDER WHERE user_id = @userId)
                   + (SELECT COUNT(*) FROM CLINIC_MANAGER WHERE user_id = @userId)
                   + (SELECT COUNT(*) FROM CLINIC_STAFF WHERE user_id = @userId)
                   + (SELECT COUNT(*) FROM VETERINARIAN WHERE user_id = @userId)
                   + (SELECT COUNT(*) FROM PET_OWNER WHERE user_id = @userId)
                   + (SELECT COUNT(*) FROM RESCUE_OFFICER WHERE user_id = @userId);

    RETURN @roleCount;
END;
GO

--E3.) Function : number of unread notifications of a user
CREATE FUNCTION dbo.GetUnreadCount (@userId INT)
RETURNS INT
AS
BEGIN
    DECLARE @unread INT;

    SELECT @unread = COUNT(*)
    FROM NOTIFICATION
    WHERE user_id = @userId
      AND is_read = 0;

    RETURN ISNULL(@unread, 0);
END;
GO

--------------------------------------------------
-- E4 : Procedures (Registration Suite)
--------------------------------------------------

-- E4.a) Procedure: Registers a new Pet Care Provider
CREATE PROCEDURE add_pet_care_provider
    @userId INT,
    @nicNo VARCHAR(12),
    @fullName VARCHAR(100),
    @email VARCHAR(100),
    @street VARCHAR(100),
    @city VARCHAR(50),
    @phone CHAR(10),
    @providerId VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [USER] WHERE user_id = @userId OR email = @email OR nic_no = @nicNo)
       OR EXISTS (SELECT 1 FROM PET_CARE_PROVIDER WHERE provider_id = @providerId)
    BEGIN
        RAISERROR('This user or provider ID is already registered', 16, 1);
        RETURN;
    END;

    IF @providerId IS NULL OR @phone IS NULL OR @phone NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('Provider ID and a valid phone number are required', 16, 1);
        RETURN;
    END;

    INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city)
    VALUES (@userId, @nicNo, @fullName, @email, @street, @city);

    INSERT INTO USER_PHONE (user_id, phone_number)
    VALUES (@userId, @phone);

    INSERT INTO PET_CARE_PROVIDER (user_id, provider_id)
    VALUES (@userId, @providerId);
END;
GO

-- E4.b) Procedure: Registers a new Clinic Manager
CREATE PROCEDURE add_clinic_manager
    @userId INT,
    @nicNo VARCHAR(12),
    @fullName VARCHAR(100),
    @email VARCHAR(100),
    @street VARCHAR(100),
    @city VARCHAR(50),
    @phone CHAR(10),
    @managerCode VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [USER] WHERE user_id = @userId OR email = @email OR nic_no = @nicNo)
       OR EXISTS (SELECT 1 FROM CLINIC_MANAGER WHERE manager_code = @managerCode)
    BEGIN
        RAISERROR('This user or manager code is already registered', 16, 1);
        RETURN;
    END;

    IF @managerCode IS NULL OR @phone IS NULL OR @phone NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('Manager code and a valid phone number are required', 16, 1);
        RETURN;
    END;

    INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city)
    VALUES (@userId, @nicNo, @fullName, @email, @street, @city);

    INSERT INTO USER_PHONE (user_id, phone_number)
    VALUES (@userId, @phone);

    INSERT INTO CLINIC_MANAGER (user_id, manager_code)
    VALUES (@userId, @managerCode);
END;
GO

-- E4.c) Procedure: Registers a new Clinic Staff
CREATE PROCEDURE add_clinic_staff
    @userId INT,
    @nicNo VARCHAR(12),
    @fullName VARCHAR(100),
    @email VARCHAR(100),
    @street VARCHAR(100),
    @city VARCHAR(50),
    @phone CHAR(10),
    @staffId VARCHAR(10),
    @role VARCHAR(30)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [USER] WHERE user_id = @userId OR email = @email OR nic_no = @nicNo)
       OR EXISTS (SELECT 1 FROM CLINIC_STAFF WHERE staff_id = @staffId)
    BEGIN
        RAISERROR('This user or staff ID is already registered', 16, 1);
        RETURN;
    END;

    IF @staffId IS NULL OR @role IS NULL OR @phone IS NULL OR @phone NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('Staff ID, role, and a valid phone number are required', 16, 1);
        RETURN;
    END;

    INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city)
    VALUES (@userId, @nicNo, @fullName, @email, @street, @city);

    INSERT INTO USER_PHONE (user_id, phone_number)
    VALUES (@userId, @phone);

    INSERT INTO CLINIC_STAFF (user_id, staff_id, role)
    VALUES (@userId, @staffId, @role);
END;
GO

-- E4.d) Procedure: Registers a new Veterinarian
CREATE PROCEDURE add_veterinarian
    @userId INT,
    @nicNo VARCHAR(12),
    @fullName VARCHAR(100),
    @email VARCHAR(100),
    @street VARCHAR(100),
    @city VARCHAR(50),
    @phone CHAR(10),
    @licenseNumber VARCHAR(20),
    @specialization VARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [USER] WHERE user_id = @userId OR email = @email OR nic_no = @nicNo)
       OR EXISTS (SELECT 1 FROM VETERINARIAN WHERE license_number = @licenseNumber)
    BEGIN
        RAISERROR('This user or license number is already registered', 16, 1);
        RETURN;
    END;

    IF @licenseNumber IS NULL OR @specialization IS NULL OR @phone IS NULL OR @phone NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('License number, specialization and a valid phone number are required', 16, 1);
        RETURN;
    END;

    INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city)
    VALUES (@userId, @nicNo, @fullName, @email, @street, @city);

    INSERT INTO USER_PHONE (user_id, phone_number)
    VALUES (@userId, @phone);

    INSERT INTO VETERINARIAN (user_id, license_number)
    VALUES (@userId, @licenseNumber);

    INSERT INTO VETERINARIAN_SPECIALIZATION (user_id, specialization)
    VALUES (@userId, @specialization);
END;
GO

-- E4.e) Procedure: Registers a new Pet Owner
CREATE PROCEDURE add_pet_owner
    @userId INT,
    @nicNo VARCHAR(12),
    @fullName VARCHAR(100),
    @email VARCHAR(100),
    @street VARCHAR(100),
    @city VARCHAR(50),
    @phone CHAR(10),
    @ownerId VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [USER] WHERE user_id = @userId OR email = @email OR nic_no = @nicNo)
       OR EXISTS (SELECT 1 FROM PET_OWNER WHERE owner_id = @ownerId)
    BEGIN
        RAISERROR('This user or owner ID is already registered', 16, 1);
        RETURN;
    END;

    IF @ownerId IS NULL OR @phone IS NULL OR @phone NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('Owner ID and a valid phone number are required', 16, 1);
        RETURN;
    END;

    INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city)
    VALUES (@userId, @nicNo, @fullName, @email, @street, @city);

    INSERT INTO USER_PHONE (user_id, phone_number)
    VALUES (@userId, @phone);

    INSERT INTO PET_OWNER (user_id, owner_id)
    VALUES (@userId, @ownerId);
END;
GO

-- E4.f) Procedure: Registers a new Rescue Officer
CREATE PROCEDURE add_rescue_officer
    @userId INT,
    @nicNo VARCHAR(12),
    @fullName VARCHAR(100),
    @email VARCHAR(100),
    @street VARCHAR(100),
    @city VARCHAR(50),
    @phone CHAR(10),
    @badgeNumber VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM [USER] WHERE user_id = @userId OR email = @email OR nic_no = @nicNo)
       OR EXISTS (SELECT 1 FROM RESCUE_OFFICER WHERE badge_number = @badgeNumber)
    BEGIN
        RAISERROR('This user or badge number is already registered', 16, 1);
        RETURN;
    END;

    IF @badgeNumber IS NULL OR @phone IS NULL OR @phone NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('Badge number and a valid phone number are required', 16, 1);
        RETURN;
    END;

    INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city)
    VALUES (@userId, @nicNo, @fullName, @email, @street, @city);

    INSERT INTO USER_PHONE (user_id, phone_number)
    VALUES (@userId, @phone);

    INSERT INTO RESCUE_OFFICER (user_id, badge_number)
    VALUES (@userId, @badgeNumber);
END;
GO

--E5.) Procedure with OUTPUT parameters : access lookup, gives the user ID and the user type of an email (the user type decides the access)
CREATE PROCEDURE get_user_access
    @email VARCHAR(100),
    @userId INT OUTPUT,
    @userType VARCHAR(30) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SET @userId = NULL;

    SELECT @userId = user_id
    FROM [USER]
    WHERE email = @email;

    IF @userId IS NULL
        SET @userType = 'Not Registered';
    ELSE
        SET @userType = dbo.GetUserType(@userId);
END;
GO

--E6.) Procedure : marks all unread notifications of a user as read (when the user opens the notification list)
CREATE PROCEDURE mark_notifications_read
    @userId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM [USER] WHERE user_id = @userId)
    BEGIN
        RAISERROR('User not found', 16, 1)
        RETURN
    END

    UPDATE NOTIFICATION
    SET is_read = 1
    WHERE user_id = @userId
      AND is_read = 0;
END;
GO

--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
-- T1.) Validation triggers : ISA Enforcement
-- Total Participation : Enforced procedurally via registration procedures 
--                        (add_pet_care_provider, add_clinic_manager, add_clinic_staff,
--                         add_veterinarian, add_pet_owner, add_rescue_officer).
-- Disjointness        : Enforced dynamically via subclass triggers (trg_*_ISA)
--                        to prevent a user from existing in multiple role tables or losing their final role.

CREATE TRIGGER trg_PetCareProvider_ISA
ON PET_CARE_PROVIDER
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE dbo.GetUserRoleCount(user_id) > 1)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This user already belongs to another user type', 16, 1)
    END
    ELSE IF EXISTS (SELECT 1 FROM deleted
                    WHERE user_id IN (SELECT user_id FROM [USER])
                      AND dbo.GetUserRoleCount(user_id) = 0)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Every user must belong to one user type', 16, 1)
    END
END;
GO

CREATE TRIGGER trg_ClinicManager_ISA
ON CLINIC_MANAGER
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE dbo.GetUserRoleCount(user_id) > 1)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This user already belongs to another user type', 16, 1)
    END
    ELSE IF EXISTS (SELECT 1 FROM deleted
                    WHERE user_id IN (SELECT user_id FROM [USER])
                      AND dbo.GetUserRoleCount(user_id) = 0)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Every user must belong to one user type', 16, 1)
    END
END;
GO

CREATE TRIGGER trg_ClinicStaff_ISA
ON CLINIC_STAFF
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE dbo.GetUserRoleCount(user_id) > 1)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This user already belongs to another user type', 16, 1)
    END
    ELSE IF EXISTS (SELECT 1 FROM deleted
                    WHERE user_id IN (SELECT user_id FROM [USER])
                      AND dbo.GetUserRoleCount(user_id) = 0)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Every user must belong to one user type', 16, 1)
    END
END;
GO

CREATE TRIGGER trg_Veterinarian_ISA
ON VETERINARIAN
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE dbo.GetUserRoleCount(user_id) > 1)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This user already belongs to another user type', 16, 1)
    END
    ELSE IF EXISTS (SELECT 1 FROM deleted
                    WHERE user_id IN (SELECT user_id FROM [USER])
                      AND dbo.GetUserRoleCount(user_id) = 0)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Every user must belong to one user type', 16, 1)
    END
END;
GO

CREATE TRIGGER trg_PetOwner_ISA
ON PET_OWNER
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE dbo.GetUserRoleCount(user_id) > 1)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This user already belongs to another user type', 16, 1)
    END
    ELSE IF EXISTS (SELECT 1 FROM deleted
                    WHERE user_id IN (SELECT user_id FROM [USER])
                      AND dbo.GetUserRoleCount(user_id) = 0)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Every user must belong to one user type', 16, 1)
    END
END;
GO

CREATE TRIGGER trg_RescueOfficer_ISA
ON RESCUE_OFFICER
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE dbo.GetUserRoleCount(user_id) > 1)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This user already belongs to another user type', 16, 1)
    END
    ELSE IF EXISTS (SELECT 1 FROM deleted
                    WHERE user_id IN (SELECT user_id FROM [USER])
                      AND dbo.GetUserRoleCount(user_id) = 0)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Every user must belong to one user type', 16, 1)
    END
END;
GO

--==================================================================
-- FUNCTION 01 : MANAGE PET AND OWNER PROFILES
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--R2 : breed -> species is kept in BREED, so PET stores only the breed
CREATE TABLE BREED (
  breed VARCHAR(50) NOT NULL,
  species VARCHAR(30) NOT NULL,

  CONSTRAINT breed_pk PRIMARY KEY (breed)
);
GO

--R1 : age is not stored (it is calculated in the view PET_DETAILS)
CREATE TABLE PET (
  pet_id INT NOT NULL,
  pet_name VARCHAR(50) NOT NULL,
  breed VARCHAR(50) NOT NULL,
  date_of_birth DATE,
  emergency_contact CHAR(10),
  owner_user_id INT NOT NULL,

  CONSTRAINT pet_pk PRIMARY KEY (pet_id),
  CONSTRAINT pet_breed_fk FOREIGN KEY (breed) REFERENCES BREED(breed) ON UPDATE CASCADE,
  CONSTRAINT pet_owner_fk FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id) ON DELETE CASCADE, 
  CONSTRAINT check_pet_dob CHECK (date_of_birth <= GETDATE()),
  CONSTRAINT check_pet_contact CHECK (emergency_contact LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
);
GO

--R1 : PET_DETAILS joins PET and BREED back together and calculates age every time it is read
--age in whole years = (today as yyyymmdd - birthday as yyyymmdd) / 10000
CREATE VIEW PET_DETAILS (pet_id, pet_name, species, breed, date_of_birth, age, emergency_contact, owner_user_id) AS
SELECT p.pet_id, p.pet_name, b.species, p.breed, p.date_of_birth,
       (CONVERT(INT, CONVERT(CHAR(8), GETDATE(), 112)) - CONVERT(INT, CONVERT(CHAR(8), p.date_of_birth, 112))) / 10000,
       p.emergency_contact, p.owner_user_id
FROM PET p
INNER JOIN BREED b ON p.breed = b.breed;
GO
GO

--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--m.) VIEW : pet profile with owner details (built on the PET_DETAILS view)
CREATE VIEW pet_profile_view (pet_id, pet_name, species, breed, age, owner_name, owner_email) AS
SELECT d.pet_id, d.pet_name, d.species, d.breed, d.age, u.full_name, u.email
FROM PET_DETAILS d
INNER JOIN [USER] u ON d.owner_user_id = u.user_id;
GO

--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--E1.) Function : number of pets registered by an owner (shown on the owner profile)
CREATE FUNCTION dbo.GetPetCount (@ownerId INT)
RETURNS INT
AS
BEGIN
    DECLARE @petCount INT;

    SELECT @petCount = COUNT(*)
    FROM PET
    WHERE owner_user_id = @ownerId;

    RETURN ISNULL(@petCount, 0);
END;
GO

--E3.) Procedure : updates the profile of a pet owner (a NULL value keeps the old value, a new phone number is added)
CREATE PROCEDURE update_owner_profile
    @userId INT,
    @email VARCHAR(100),
    @street VARCHAR(100),
    @city VARCHAR(50),
    @phone CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PET_OWNER WHERE user_id = @userId)
    BEGIN
        RAISERROR('Pet owner not found', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM [USER] WHERE email = @email AND user_id <> @userId)
    BEGIN
        RAISERROR('This email is already used by another user', 16, 1)
        RETURN
    END

    --the formats are checked first, so the profile is never half updated
    IF @email NOT LIKE '%_@_%._%'
       OR @phone NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    BEGIN
        RAISERROR('Invalid email or phone number', 16, 1)
        RETURN
    END

    UPDATE [USER]
    SET email = ISNULL(@email, email),
        street = ISNULL(@street, street),
        city = ISNULL(@city, city)
    WHERE user_id = @userId;

    --phone_number is multivalued, so the new number is added and the old ones are kept
    IF @phone IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM USER_PHONE WHERE user_id = @userId AND phone_number = @phone)
    BEGIN
        INSERT INTO USER_PHONE (user_id, phone_number)
        VALUES (@userId, @phone);
    END
END;
GO

--E4.) Procedure : registers a pet for an owner (a new breed is added to BREED first, R2)
CREATE PROCEDURE register_pet
    @petId INT,
    @petName VARCHAR(50),
    @breed VARCHAR(50),
    @species VARCHAR(30),
    @dateOfBirth DATE,
    @emergencyContact CHAR(10),
    @ownerId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PET_OWNER WHERE user_id = @ownerId)
       OR EXISTS (SELECT 1 FROM PET WHERE pet_id = @petId)
    BEGIN
        RAISERROR('Pet owner not found or the pet ID is already used', 16, 1)
        RETURN
    END

    IF @petName IS NULL OR @breed IS NULL OR @dateOfBirth > GETDATE()
    BEGIN
        RAISERROR('Pet name and breed are required and the birthday cannot be in the future', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM BREED WHERE breed = @breed)
    BEGIN
        IF @species IS NULL
        BEGIN
            RAISERROR('Species is required for a new breed', 16, 1)
            RETURN
        END

        INSERT INTO BREED (breed, species)
        VALUES (@breed, @species);
    END

    INSERT INTO PET (pet_id, pet_name, breed, date_of_birth, emergency_contact, owner_user_id)
    VALUES (@petId, @petName, @breed, @dateOfBirth, @emergencyContact, @ownerId);
END;
GO

--E5.) Procedure : an owner updates the profile of their own pet (a NULL value keeps the old value)
CREATE PROCEDURE update_pet_profile
    @petId INT,
    @ownerId INT,
    @petName VARCHAR(50),
    @emergencyContact CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PET WHERE pet_id = @petId AND owner_user_id = @ownerId)
    BEGIN
        RAISERROR('This pet is not registered under this owner', 16, 1)
        RETURN
    END

    UPDATE PET
    SET pet_name = ISNULL(@petName, pet_name),
        emergency_contact = ISNULL(@emergencyContact, emergency_contact)
    WHERE pet_id = @petId;
END;
GO

--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--T1.) Validation trigger : the same owner cannot register the same pet twice (same name and breed)
CREATE TRIGGER trg_Pet_CheckDuplicate
ON PET
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               INNER JOIN PET p ON i.owner_user_id = p.owner_user_id
                               AND i.pet_name = p.pet_name
                               AND i.breed = p.breed
                               AND i.pet_id <> p.pet_id)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This owner has already registered a pet with the same name and breed', 16, 1)
    END
END;
GO

--T2.) Update trigger : a pet saved without an emergency contact gets the phone number of its owner
CREATE TRIGGER trg_Pet_DefaultContact
ON PET
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE PET
    SET emergency_contact = (SELECT MIN(ph.phone_number)
                             FROM USER_PHONE ph
                             WHERE ph.user_id = PET.owner_user_id)
    WHERE pet_id IN (SELECT pet_id FROM inserted)
      AND emergency_contact IS NULL;
END;
GO

--==================================================================
-- FUNCTION 02 : APPOINTMENT AND BOOKING MANAGEMENT
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--Pending = booked online by the owner and waiting for the staff, Scheduled = booked by the clinic
CREATE TABLE APPOINTMENT (
  appointment_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
  staff_user_id INT,
  pet_id INT NOT NULL,
  owner_user_id INT NOT NULL,
  vet_user_id INT NOT NULL,

  CONSTRAINT appointment_pk PRIMARY KEY (appointment_id),
  CONSTRAINT appointment_staff_fk FOREIGN KEY (staff_user_id) REFERENCES CLINIC_STAFF(user_id),
  CONSTRAINT appointment_pet_fk FOREIGN KEY (pet_id) REFERENCES PET(pet_id),
  CONSTRAINT appointment_owner_fk FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
  CONSTRAINT appointment_vet_fk FOREIGN KEY (vet_user_id) REFERENCES VETERINARIAN(user_id),
  CONSTRAINT check_appointment_status CHECK (status IN ('Scheduled', 'Pending', 'Confirmed', 'CheckedIn', 'InRoom', 'Completed', 'Cancelled', 'NoShow'))
);
GO

--R3 : a payment is for a service booking OR an appointment OR an adoption application (exactly one of them)
--(ADOPTION_APPLICATION and SERVICE_BOOKING are created later, so their FKs are added in Functions 03 and 06 with ALTER TABLE)
CREATE TABLE PAYMENT (
  payment_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT GETDATE(),
  payment_method VARCHAR(20) NOT NULL,
  booking_id INT,
  appointment_id INT,
  application_id INT,

  CONSTRAINT payment_pk PRIMARY KEY (payment_id),
  CONSTRAINT payment_appointment_fk FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id),
  CONSTRAINT check_payment_amount CHECK (amount >= 0),
  CONSTRAINT check_payment_method CHECK (payment_method IN ('Cash', 'Card')),
  CONSTRAINT check_payment_for CHECK ((booking_id IS NOT NULL AND appointment_id IS NULL AND application_id IS NULL)
                                   OR (booking_id IS NULL AND appointment_id IS NOT NULL AND application_id IS NULL)
                                   OR (booking_id IS NULL AND appointment_id IS NULL AND application_id IS NOT NULL))
);
GO

--1:1 PAYS : a booking / an appointment / an application can be paid only once
--(a UNIQUE constraint allows only one NULL in SQL Server, so these unique indexes skip the NULL rows)
CREATE UNIQUE INDEX unique_payment_booking
ON PAYMENT(booking_id)
WHERE booking_id IS NOT NULL;

CREATE UNIQUE INDEX unique_payment_appointment
ON PAYMENT(appointment_id)
WHERE appointment_id IS NOT NULL;

CREATE UNIQUE INDEX unique_payment_application
ON PAYMENT(application_id)
WHERE application_id IS NOT NULL;
GO
GO

--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--l.) VIEW : schedule of the vets (active appointments only)
CREATE VIEW vet_schedule_view (appointment_id, appointment_date, time_slot, vet_name, pet_name, owner_name, status) AS
SELECT a.appointment_id, a.appointment_date, a.time_slot, v.full_name, p.pet_name, o.full_name, a.status
FROM APPOINTMENT a
INNER JOIN [USER] v ON a.vet_user_id = v.user_id
INNER JOIN PET p ON a.pet_id = p.pet_id
INNER JOIN [USER] o ON a.owner_user_id = o.user_id
WHERE a.status NOT IN ('Cancelled', 'NoShow', 'Completed');
GO

--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--E1.) Function : number of appointments of a vet on a given date (not counting Cancelled / NoShow)
CREATE FUNCTION dbo.GetVetAppointmentCount (@vetId INT, @date DATE)
RETURNS INT
AS
BEGIN
    DECLARE @count INT;

    SELECT @count = COUNT(*)
    FROM APPOINTMENT
    WHERE vet_user_id = @vetId
      AND appointment_date = @date
      AND status NOT IN ('Cancelled', 'NoShow');

    RETURN ISNULL(@count, 0);
END;
GO

--E2.) Function : checks if a vet is free at a date and time (1 = free, 0 = busy)
CREATE FUNCTION dbo.IsVetAvailable (@vetId INT, @date DATE, @timeSlot TIME)
RETURNS BIT
AS
BEGIN
    DECLARE @available BIT;

    IF EXISTS (SELECT 1
               FROM APPOINTMENT
               WHERE vet_user_id = @vetId
                 AND appointment_date = @date
                 AND time_slot = @timeSlot
                 AND status NOT IN ('Cancelled', 'NoShow'))
        SET @available = 0;
    ELSE
        SET @available = 1;

    RETURN @available;
END;
GO

--E3.) Procedure : an owner books an appointment, it stays Pending until the clinic staff confirm it
CREATE PROCEDURE book_appointment
    @appointmentId INT,
    @date DATE,
    @timeSlot TIME,
    @petId INT,
    @vetId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @ownerId INT;

    SELECT @ownerId = owner_user_id
    FROM PET
    WHERE pet_id = @petId;

    IF @ownerId IS NULL
    BEGIN
        RAISERROR('Pet not found', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM VETERINARIAN WHERE user_id = @vetId)
    BEGIN
        RAISERROR('Veterinarian not found', 16, 1)
        RETURN
    END

    IF @date < CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR('An appointment cannot be booked for a past date', 16, 1)
        RETURN
    END

    IF dbo.IsVetAvailable(@vetId, @date, @timeSlot) = 0
    BEGIN
        RAISERROR('The vet is not available in this time slot, please choose another time', 16, 1)
        RETURN
    END

    INSERT INTO APPOINTMENT (appointment_id, appointment_date, time_slot, status, pet_id, owner_user_id, vet_user_id)
    VALUES (@appointmentId, @date, @timeSlot, 'Pending', @petId, @ownerId, @vetId);
END;
GO

--E4.) Procedure : a clinic staff member confirms a Pending or Scheduled appointment
CREATE PROCEDURE confirm_appointment
    @appointmentId INT,
    @staffId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM APPOINTMENT
                   WHERE appointment_id = @appointmentId
                     AND status IN ('Pending', 'Scheduled'))
    BEGIN
        RAISERROR('Only a Pending or Scheduled appointment can be confirmed', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM CLINIC_STAFF WHERE user_id = @staffId)
    BEGIN
        RAISERROR('Clinic staff member not found', 16, 1)
        RETURN
    END

    UPDATE APPOINTMENT
    SET status = 'Confirmed', staff_user_id = @staffId
    WHERE appointment_id = @appointmentId;
END;
GO

--E5.) Procedure : the clinic staff check in a Confirmed appointment when the owner arrives with the pet
CREATE PROCEDURE check_in_appointment
    @appointmentId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM APPOINTMENT
                   WHERE appointment_id = @appointmentId
                     AND status = 'Confirmed')
    BEGIN
        RAISERROR('Only a Confirmed appointment can be checked in', 16, 1)
        RETURN
    END

    UPDATE APPOINTMENT
    SET status = 'CheckedIn'
    WHERE appointment_id = @appointmentId;
END;
GO

--E6.) Procedure : moves an active appointment to a new date and time when the same vet is free (it must be confirmed again)
CREATE PROCEDURE reschedule_appointment
    @appointmentId INT,
    @newDate DATE,
    @newTimeSlot TIME
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @vetId INT;

    SELECT @vetId = vet_user_id
    FROM APPOINTMENT
    WHERE appointment_id = @appointmentId
      AND status IN ('Pending', 'Scheduled', 'Confirmed');

    IF @vetId IS NULL
    BEGIN
        RAISERROR('Only an active appointment with a vet can be rescheduled', 16, 1)
        RETURN
    END

    IF @newDate < CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR('An appointment cannot be moved to a past date', 16, 1)
        RETURN
    END

    IF dbo.IsVetAvailable(@vetId, @newDate, @newTimeSlot) = 0
    BEGIN
        RAISERROR('The vet is not available in this time slot, please choose another time', 16, 1)
        RETURN
    END

    UPDATE APPOINTMENT
    SET appointment_date = @newDate, time_slot = @newTimeSlot, status = 'Pending'
    WHERE appointment_id = @appointmentId;
END;
GO

--E7.) Procedure : cancels an appointment that has not started yet (by the owner, or by the staff when a request is wrong)
CREATE PROCEDURE cancel_appointment
    @appointmentId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM APPOINTMENT
                   WHERE appointment_id = @appointmentId
                     AND status IN ('Pending', 'Scheduled', 'Confirmed'))
    BEGIN
        RAISERROR('Only an appointment that has not started can be cancelled', 16, 1)
        RETURN
    END

    UPDATE APPOINTMENT
    SET status = 'Cancelled'
    WHERE appointment_id = @appointmentId;
END;
GO

--E8.) Procedure : cancels Pending requests whose date is already over (nobody confirmed them), the clinic runs it every day
CREATE PROCEDURE expire_pending_appointments
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE APPOINTMENT
    SET status = 'Cancelled'
    WHERE status = 'Pending'
      AND appointment_date < CAST(GETDATE() AS DATE);
END;
GO

--E9.) Procedure with OUTPUT parameters : total and completed appointments of a vet
CREATE PROCEDURE get_vet_appointment_stats
    @vetId INT,
    @totalAppointments INT OUTPUT,
    @completedAppointments INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @totalAppointments = COUNT(*)
    FROM APPOINTMENT
    WHERE vet_user_id = @vetId;

    SELECT @completedAppointments = COUNT(*)
    FROM APPOINTMENT
    WHERE vet_user_id = @vetId
      AND status = 'Completed';
END;
GO

--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--T1.) Validation trigger : checks every new / changed appointment
--1) the pet must belong to the owner who booked it
--2) a vet cannot have two active appointments at the same date and time
CREATE TRIGGER trg_Appointment_Validate
ON APPOINTMENT
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               INNER JOIN PET p ON i.pet_id = p.pet_id
               WHERE i.owner_user_id <> p.owner_user_id)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This pet does not belong to the given owner', 16, 1)
    END
    ELSE IF EXISTS (SELECT 1
                    FROM inserted i
                    INNER JOIN APPOINTMENT a ON a.vet_user_id = i.vet_user_id
                                            AND a.appointment_date = i.appointment_date
                                            AND a.time_slot = i.time_slot
                                            AND a.appointment_id <> i.appointment_id
                    WHERE a.status NOT IN ('Cancelled', 'NoShow')
                      AND i.status NOT IN ('Cancelled', 'NoShow'))
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('The vet already has an appointment in this time slot', 16, 1)
    END
END;
GO

--T2.) Trigger : the owner gets a notification when an appointment is confirmed, moved, cancelled or completed
CREATE TRIGGER trg_Appointment_Notify
ON APPOINTMENT
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id)
    SELECT CONCAT('Your appointment ', i.appointment_id, ' on ', i.appointment_date, ' at ', CONVERT(VARCHAR(5), i.time_slot, 108), ' is now ', i.status),
           GETDATE(), 0, i.owner_user_id
    FROM inserted i
    INNER JOIN deleted d ON i.appointment_id = d.appointment_id
    WHERE i.status <> d.status
       OR i.appointment_date <> d.appointment_date
       OR i.time_slot <> d.time_slot;
END;
GO

--T3.) Validation trigger : an appointment can be paid only after it is Completed
CREATE TRIGGER trg_Payment_CheckAppointment
ON PAYMENT
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               INNER JOIN APPOINTMENT a ON i.appointment_id = a.appointment_id
               WHERE a.status <> 'Completed')
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('An appointment can be paid only after it is completed', 16, 1)
    END
END;
GO

--==================================================================
-- FUNCTION 03 : PET RESCUE AND ADOPTION MANAGEMENT
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE TABLE RESCUE_CASE (
  case_id INT NOT NULL,
  location VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Open',
  animal_condition VARCHAR(100),
  owner_user_id INT,
  officer_user_id INT,

  CONSTRAINT rescue_case_pk PRIMARY KEY (case_id),
  CONSTRAINT rescue_case_owner_fk FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
  CONSTRAINT rescue_case_officer_fk FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id),
  CONSTRAINT check_rescue_case_status CHECK (status IN ('Open', 'In Progress', 'Closed'))
);
GO

CREATE TABLE FOSTER_CARE (
  foster_id INT NOT NULL,
  foster_name VARCHAR(100) NOT NULL,
  officer_user_id INT,

  CONSTRAINT foster_care_pk PRIMARY KEY (foster_id),
  CONSTRAINT foster_care_officer_fk FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id)
);
GO

--weak entity : PK = owner PK (case_id) + partial key (rescued_pet_no)
CREATE TABLE RESCUED_PET (
  case_id INT NOT NULL,
  rescued_pet_no INT NOT NULL,
  rescue_status VARCHAR(20) NOT NULL DEFAULT 'In Treatment',
  foster_id INT,

  CONSTRAINT rescued_pet_pk PRIMARY KEY (case_id, rescued_pet_no),
  CONSTRAINT rescued_pet_case_fk FOREIGN KEY (case_id) REFERENCES RESCUE_CASE(case_id) ON DELETE CASCADE,
  CONSTRAINT rescued_pet_foster_fk FOREIGN KEY (foster_id) REFERENCES FOSTER_CARE(foster_id),
  CONSTRAINT check_rescued_pet_no CHECK (rescued_pet_no > 0),
  CONSTRAINT check_rescue_status CHECK (rescue_status IN ('In Treatment', 'In Foster Care', 'Available', 'Adopted'))
);
GO

--(case_id, rescued_pet_no) is one composite FK to RESCUED_PET
CREATE TABLE ADOPTION_APPLICATION (
  application_id INT NOT NULL,
  application_date DATE NOT NULL DEFAULT GETDATE(),
  status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
  decision_date DATE,
  adoption_fee DECIMAL(10,2),
  notes VARCHAR(200),
  owner_user_id INT NOT NULL,
  case_id INT NOT NULL,
  rescued_pet_no INT NOT NULL,
  officer_user_id INT,

  CONSTRAINT adoption_application_pk PRIMARY KEY (application_id),
  CONSTRAINT adoption_owner_fk FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
  CONSTRAINT adoption_rescued_pet_fk FOREIGN KEY (case_id, rescued_pet_no) REFERENCES RESCUED_PET(case_id, rescued_pet_no),
  CONSTRAINT adoption_officer_fk FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id),
  CONSTRAINT check_adoption_status CHECK (status IN ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED')),
  CONSTRAINT check_adoption_fee CHECK (adoption_fee >= 0),
  CONSTRAINT check_decision_date CHECK (decision_date >= application_date)
);
GO

--R3 : PAYMENT (Function 02) was created before ADOPTION_APPLICATION, so this FK is added now
ALTER TABLE PAYMENT
ADD CONSTRAINT payment_application_fk
FOREIGN KEY (application_id) REFERENCES ADOPTION_APPLICATION(application_id);
GO
GO

--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--m.) VIEW : adoption status for rescue officers (adoption history)
CREATE VIEW adoption_status_view (application_id, applicant_name, rescue_location, rescued_pet_no, application_status, pet_status, officer_name) AS
SELECT a.application_id, u.full_name, rc.location, a.rescued_pet_no, a.status, rp.rescue_status, o.full_name
FROM ADOPTION_APPLICATION a
INNER JOIN [USER] u ON a.owner_user_id = u.user_id
INNER JOIN RESCUED_PET rp ON a.case_id = rp.case_id
                         AND a.rescued_pet_no = rp.rescued_pet_no
INNER JOIN RESCUE_CASE rc ON rp.case_id = rc.case_id
LEFT OUTER JOIN [USER] o ON a.officer_user_id = o.user_id;
GO

--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--E1.) Function : number of open applications (SUBMITTED / UNDER_REVIEW) for a rescued pet (composite key as two parameters)
CREATE FUNCTION dbo.GetOpenApplicationCount (@caseId INT, @petNo INT)
RETURNS INT
AS
BEGIN
    DECLARE @openCount INT;

    SELECT @openCount = COUNT(*)
    FROM ADOPTION_APPLICATION
    WHERE case_id = @caseId
      AND rescued_pet_no = @petNo
      AND status IN ('SUBMITTED', 'UNDER_REVIEW');

    RETURN ISNULL(@openCount, 0);
END;
GO

--E2.) Procedure : registers a rescue case and its rescued pets (numbered 1, 2, 3 ... with a WHILE loop)
--the same location on the same date is a duplicate, so the number of the existing case is shown instead
-- MINIMAL FIX: Added optional check for @ownerId existence if provided
--==================================================================
CREATE OR ALTER PROCEDURE register_rescue_case
    @caseId INT,
    @location VARCHAR(100),
    @rescueDate DATE,
    @animalCondition VARCHAR(100),
    @ownerId INT,
    @officerId INT,
    @noOfPets INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @existingCaseId INT, @message VARCHAR(200), @petNo INT;

    SELECT @existingCaseId = case_id
    FROM RESCUE_CASE
    WHERE location = @location
      AND date = @rescueDate;

    IF @existingCaseId IS NOT NULL
    BEGIN
        SET @message = CONCAT('This rescue is already registered as case ', @existingCaseId);
        RAISERROR(@message, 16, 1);
        RETURN;
    END

    -- All checks done before INSERT: checks officer existence and optional owner existence
    IF EXISTS (SELECT 1 FROM RESCUE_CASE WHERE case_id = @caseId)
       OR @noOfPets IS NULL OR @noOfPets < 1
       OR NOT EXISTS (SELECT 1 FROM RESCUE_OFFICER WHERE user_id = @officerId)
       OR (@ownerId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM PET_OWNER WHERE user_id = @ownerId))
    BEGIN
        RAISERROR('A new case ID, a valid rescue officer, a valid pet owner (if specified), and at least one rescued pet are required', 16, 1);
        RETURN;
    END

    INSERT INTO RESCUE_CASE (case_id, location, date, status, animal_condition, owner_user_id, officer_user_id)
    VALUES (@caseId, @location, @rescueDate, 'Open', @animalCondition, @ownerId, @officerId);

    SET @petNo = 1;

    WHILE @petNo <= @noOfPets
    BEGIN
        INSERT INTO RESCUED_PET (case_id, rescued_pet_no, rescue_status, foster_id)
        VALUES (@caseId, @petNo, 'In Treatment', NULL);

        SET @petNo = @petNo + 1;
    END
END;
GO

--E3.) Procedure : moves a rescued pet to a foster home (only while it is in treatment or already in foster care)
CREATE PROCEDURE assign_foster_care
    @caseId INT,
    @petNo INT,
    @fosterId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM FOSTER_CARE WHERE foster_id = @fosterId)
    BEGIN
        RAISERROR('Foster home not found', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM RESCUED_PET
                   WHERE case_id = @caseId
                     AND rescued_pet_no = @petNo
                     AND rescue_status IN ('In Treatment', 'In Foster Care'))
    BEGIN
        RAISERROR('Only a pet that is in treatment or in foster care can be moved to a foster home', 16, 1)
        RETURN
    END

    UPDATE RESCUED_PET
    SET foster_id = @fosterId, rescue_status = 'In Foster Care'
    WHERE case_id = @caseId
      AND rescued_pet_no = @petNo;
END;
GO

--E4.) Procedure : lists a rescued pet for adoption only after its treatment is over (it must be in foster care)
CREATE PROCEDURE list_pet_for_adoption
    @caseId INT,
    @petNo INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM RESCUED_PET
                   WHERE case_id = @caseId
                     AND rescued_pet_no = @petNo
                     AND rescue_status = 'In Foster Care')
    BEGIN
        RAISERROR('Only a pet that has finished treatment and is in foster care can be listed', 16, 1)
        RETURN
    END

    UPDATE RESCUED_PET
    SET rescue_status = 'Available'
    WHERE case_id = @caseId
      AND rescued_pet_no = @petNo;
END;
GO

--E5.) Procedure : a pet owner applies to adopt a listed pet (an owner can have only one open application for the same pet)
CREATE PROCEDURE submit_adoption_application
    @applicationId INT,
    @ownerId INT,
    @caseId INT,
    @petNo INT,
    @adoptionFee DECIMAL(10,2),
    @notes VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PET_OWNER WHERE user_id = @ownerId)
    BEGIN
        RAISERROR('Only a registered pet owner can apply', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM ADOPTION_APPLICATION
               WHERE owner_user_id = @ownerId
                 AND case_id = @caseId
                 AND rescued_pet_no = @petNo
                 AND status IN ('SUBMITTED', 'UNDER_REVIEW'))
    BEGIN
        RAISERROR('This owner has already applied for this pet', 16, 1)
        RETURN
    END

    INSERT INTO ADOPTION_APPLICATION (application_id, application_date, status, adoption_fee, notes, owner_user_id, case_id, rescued_pet_no)
    VALUES (@applicationId, GETDATE(), 'SUBMITTED', @adoptionFee, @notes, @ownerId, @caseId, @petNo);
END;
GO

--==================================================================
-- E6.) Procedure : approves an application, rejects other open ones
-- FIX: Checks that the pet is still 'Available' before approving
--==================================================================
CREATE OR ALTER PROCEDURE approve_adoption
    @applicationId INT,
    @officerId INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @caseId INT, @petNo INT;

    -- 1. Find the application details
    SELECT @caseId = case_id, @petNo = rescued_pet_no
    FROM ADOPTION_APPLICATION
    WHERE application_id = @applicationId
      AND status IN ('SUBMITTED', 'UNDER_REVIEW');

    IF @caseId IS NULL
    BEGIN
        RAISERROR('Application not found or already decided', 16, 1);
        RETURN;
    END

    -- 2. Verify officer exists
    IF NOT EXISTS (SELECT 1 FROM RESCUE_OFFICER WHERE user_id = @officerId)
    BEGIN
        RAISERROR('Rescue officer not found', 16, 1);
        RETURN;
    END

    -- 3. FIX: Ensure the pet is still 'Available' for adoption
    IF NOT EXISTS (
        SELECT 1 
        FROM RESCUED_PET 
        WHERE case_id = @caseId 
          AND rescued_pet_no = @petNo 
          AND rescue_status = 'Available'
    )
    BEGIN
        RAISERROR('This rescued pet is no longer available for adoption', 16, 1);
        RETURN;
    END

    -- 4. Approve selected application
    UPDATE ADOPTION_APPLICATION
    SET status = 'APPROVED', 
        decision_date = GETDATE(), 
        officer_user_id = @officerId
    WHERE application_id = @applicationId;

    -- 5. Reject other open applications for the same pet
    UPDATE ADOPTION_APPLICATION
    SET status = 'REJECTED', 
        decision_date = GETDATE(), 
        officer_user_id = @officerId
    WHERE case_id = @caseId
      AND rescued_pet_no = @petNo
      AND application_id <> @applicationId
      AND status IN ('SUBMITTED', 'UNDER_REVIEW');

    -- 6. Update pet status to Adopted
    UPDATE RESCUED_PET
    SET rescue_status = 'Adopted'
    WHERE case_id = @caseId
      AND rescued_pet_no = @petNo;
END;
GO

--E7.) Procedure : rejects an application and saves the reason in its notes
CREATE PROCEDURE reject_adoption
    @applicationId INT,
    @officerId INT,
    @reason VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM ADOPTION_APPLICATION
                   WHERE application_id = @applicationId
                     AND status IN ('SUBMITTED', 'UNDER_REVIEW'))
    BEGIN
        RAISERROR('Application not found or already decided', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM RESCUE_OFFICER WHERE user_id = @officerId)
    BEGIN
        RAISERROR('Rescue officer not found', 16, 1)
        RETURN
    END

    UPDATE ADOPTION_APPLICATION
    SET status = 'REJECTED', decision_date = GETDATE(), officer_user_id = @officerId, notes = @reason
    WHERE application_id = @applicationId;
END;
GO

--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--T1.) Validation trigger : an open application can only be for a pet that is listed for adoption (Available)
CREATE TRIGGER trg_Adoption_CheckPet
ON ADOPTION_APPLICATION
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               INNER JOIN RESCUED_PET rp ON i.case_id = rp.case_id
                                        AND i.rescued_pet_no = rp.rescued_pet_no
               WHERE rp.rescue_status <> 'Available'
                 AND i.status IN ('SUBMITTED', 'UNDER_REVIEW'))
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This rescued pet is not available for adoption', 16, 1)
    END
END;
GO

--T2.) Trigger : when the status of an application changes, the applicant gets a notification
CREATE TRIGGER trg_Adoption_Notify
ON ADOPTION_APPLICATION
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id)
    SELECT CONCAT('Your adoption application ', i.application_id, ' is now ', i.status), GETDATE(), 0, i.owner_user_id
    FROM inserted i
    INNER JOIN deleted d ON i.application_id = d.application_id
    WHERE i.status <> d.status;
END;
GO

--T3.) Update trigger : keeps the status of a rescue case up to date
--Open -> In Progress when one of its pets leaves treatment, and Closed when all of its pets are adopted
CREATE TRIGGER trg_RescuedPet_UpdateCase
ON RESCUED_PET
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE RESCUE_CASE
    SET status = 'In Progress'
    WHERE case_id IN (SELECT case_id FROM inserted WHERE rescue_status <> 'In Treatment')
      AND status = 'Open';

    UPDATE RESCUE_CASE
    SET status = 'Closed'
    WHERE case_id IN (SELECT case_id FROM inserted)
      AND status <> 'Closed'
      AND NOT EXISTS (SELECT 1
                      FROM RESCUED_PET rp
                      WHERE rp.case_id = RESCUE_CASE.case_id
                        AND rp.rescue_status <> 'Adopted');
END;
GO

--T4.) Validation trigger : an adoption fee can be paid only for an APPROVED application, and the full fee must be paid
CREATE TRIGGER trg_Payment_AdoptionFee
ON PAYMENT
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               INNER JOIN ADOPTION_APPLICATION a ON i.application_id = a.application_id
               WHERE a.status <> 'APPROVED'
                  OR i.amount <> ISNULL(a.adoption_fee, 0))
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Only an approved application can be paid, and the amount must be the adoption fee', 16, 1)
    END
END;
GO

--==================================================================
-- FUNCTION 04 : PET SERVICES AND HEALTH MANAGEMENT
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--weak entity : PK = owner PK (pet_id) + partial key (vaccination_no)
CREATE TABLE VACCINATION (
  pet_id INT NOT NULL,
  vaccination_no INT NOT NULL,
  vaccine_name VARCHAR(50) NOT NULL,
  next_due_date DATE,

  CONSTRAINT vaccination_pk PRIMARY KEY (pet_id, vaccination_no),
  CONSTRAINT vaccination_pet_fk FOREIGN KEY (pet_id) REFERENCES PET(pet_id) ON DELETE CASCADE,
  CONSTRAINT check_vaccination_no CHECK (vaccination_no > 0)
);
GO

CREATE TABLE MEDICAL_RECORD (
  record_id INT NOT NULL,
  diagnosis VARCHAR(200) NOT NULL,
  treatment_plan VARCHAR(200),
  notes VARCHAR(200),
  appointment_id INT,
  pet_id INT,

  CONSTRAINT medical_record_pk PRIMARY KEY (record_id),
  CONSTRAINT medical_record_appointment_fk FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id),
  CONSTRAINT medical_record_pet_fk FOREIGN KEY (pet_id) REFERENCES PET(pet_id)
);
GO

--1:1 PRODUCES : one appointment gives only one record
--(a UNIQUE constraint allows only one NULL in SQL Server, so this unique index skips the NULL walk-in rows)
CREATE UNIQUE INDEX unique_record_appointment
ON MEDICAL_RECORD(appointment_id)
WHERE appointment_id IS NOT NULL;
GO

--weak entity : PK = owner PK (record_id) + partial key (prescription_id)
CREATE TABLE PRESCRIPTION (
  record_id INT NOT NULL,
  prescription_id INT NOT NULL,
  notes VARCHAR(200),

  CONSTRAINT prescription_pk PRIMARY KEY (record_id, prescription_id),
  CONSTRAINT prescription_record_fk FOREIGN KEY (record_id) REFERENCES MEDICAL_RECORD(record_id) ON DELETE CASCADE,
  CONSTRAINT check_prescription_id CHECK (prescription_id > 0)
);
GO

--multivalued attribute medication, (record_id, prescription_id) is one composite FK to PRESCRIPTION
CREATE TABLE PRESCRIPTION_MEDICATION (
  record_id INT NOT NULL,
  prescription_id INT NOT NULL,
  medication VARCHAR(100) NOT NULL,

  CONSTRAINT prescription_medication_pk PRIMARY KEY (record_id, prescription_id, medication),
  CONSTRAINT prescription_medication_fk FOREIGN KEY (record_id, prescription_id) REFERENCES PRESCRIPTION(record_id, prescription_id) ON DELETE CASCADE
);
GO

--grooming, training, boarding and daycare services offered by pet care providers
CREATE TABLE SERVICE (
  service_id INT NOT NULL,
  service_name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  provider_user_id INT,

  CONSTRAINT service_pk PRIMARY KEY (service_id),
  CONSTRAINT service_provider_fk FOREIGN KEY (provider_user_id) REFERENCES PET_CARE_PROVIDER(user_id),
  CONSTRAINT check_service_price CHECK (price >= 0)
);
GO
GO

--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--r.) VIEW : prescription details for the pharmacy
CREATE VIEW prescription_details_view (record_id, prescription_id, pet_name, diagnosis, medication, notes) AS
SELECT pr.record_id, pr.prescription_id, p.pet_name, m.diagnosis, pm.medication, pr.notes
FROM PRESCRIPTION pr
INNER JOIN MEDICAL_RECORD m ON pr.record_id = m.record_id
INNER JOIN PET p ON m.pet_id = p.pet_id
INNER JOIN PRESCRIPTION_MEDICATION pm ON pr.record_id = pm.record_id
                                    AND pr.prescription_id = pm.prescription_id;
GO

--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--E1.) Function : vaccination status of a pet (No Records / Overdue / Up to Date)
CREATE FUNCTION dbo.GetVaccinationStatus (@petId INT)
RETURNS VARCHAR(20)
AS
BEGIN
    DECLARE @status VARCHAR(20);

    IF NOT EXISTS (SELECT 1 FROM VACCINATION WHERE pet_id = @petId)
        SET @status = 'No Records';
    --overdue when the latest due date of a vaccine is already over (due today is not overdue)
    ELSE IF EXISTS (SELECT vaccine_name
                    FROM VACCINATION
                    WHERE pet_id = @petId
                    GROUP BY vaccine_name
                    HAVING DATEDIFF(DAY, MAX(next_due_date), GETDATE()) > 0)
        SET @status = 'Overdue';
    ELSE
        SET @status = 'Up to Date';

    RETURN @status;
END;
GO

--E2.) Function : the next vaccination date of a pet that is still to come (NULL = nothing due)
CREATE FUNCTION dbo.GetNextVaccinationDue (@petId INT)
RETURNS DATE
AS
BEGIN
    DECLARE @nextDue DATE;

    SELECT @nextDue = MIN(next_due_date)
    FROM VACCINATION
    WHERE pet_id = @petId
      AND next_due_date >= CAST(GETDATE() AS DATE);

    RETURN @nextDue;
END;
GO

--E3.) Function : total number of medicines prescribed to a pet
CREATE FUNCTION dbo.GetMedicationCount (@petId INT)
RETURNS INT
AS
BEGIN
    DECLARE @medCount INT;

    --record_id is part of the key of PRESCRIPTION_MEDICATION, so it joins MEDICAL_RECORD directly
    SELECT @medCount = COUNT(pm.medication)
    FROM MEDICAL_RECORD m
    INNER JOIN PRESCRIPTION_MEDICATION pm ON m.record_id = pm.record_id
    WHERE m.pet_id = @petId;

    RETURN ISNULL(@medCount, 0);
END;
GO

--E4.) Procedure : adds a vaccination, vaccination_no (partial key) is calculated for that pet
CREATE PROCEDURE add_vaccination
    @petId INT,
    @vaccineName VARCHAR(50),
    @nextDueDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nextNo INT;

    IF NOT EXISTS (SELECT 1 FROM PET WHERE pet_id = @petId)
    BEGIN
        RAISERROR('Pet not found', 16, 1)
        RETURN
    END

    SELECT @nextNo = ISNULL(MAX(vaccination_no), 0) + 1
    FROM VACCINATION
    WHERE pet_id = @petId;

    INSERT INTO VACCINATION (pet_id, vaccination_no, vaccine_name, next_due_date)
    VALUES (@petId, @nextNo, @vaccineName, @nextDueDate);
END;
GO

--E5.) Procedure : a vet records a check-up or consultation (for an appointment, or a walk-in when there is no appointment)
CREATE PROCEDURE add_medical_record
    @recordId INT,
    @appointmentId INT,
    @petId INT,
    @diagnosis VARCHAR(200),
    @treatmentPlan VARCHAR(200),
    @notes VARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;

    --for an appointment the pet is always taken from the appointment
    IF @appointmentId IS NOT NULL
    BEGIN
        SET @petId = NULL;

        SELECT @petId = pet_id
        FROM APPOINTMENT
        WHERE appointment_id = @appointmentId;
    END

    IF @petId IS NULL OR NOT EXISTS (SELECT 1 FROM PET WHERE pet_id = @petId)
    BEGIN
        RAISERROR('Pet or appointment not found', 16, 1)
        RETURN
    END

    IF @diagnosis IS NULL
    BEGIN
        RAISERROR('A diagnosis is required', 16, 1)
        RETURN
    END

    INSERT INTO MEDICAL_RECORD (record_id, diagnosis, treatment_plan, notes, appointment_id, pet_id)
    VALUES (@recordId, @diagnosis, @treatmentPlan, @notes, @appointmentId, @petId);
END;
GO

--E6.) Procedure : adds a prescription with its first medicine, prescription_id (partial key) is calculated for that record
CREATE PROCEDURE add_prescription
    @recordId INT,
    @notes VARCHAR(200),
    @medication VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @nextNo INT;

    IF NOT EXISTS (SELECT 1 FROM MEDICAL_RECORD WHERE record_id = @recordId)
    BEGIN
        RAISERROR('Medical record not found', 16, 1)
        RETURN
    END

    IF @medication IS NULL
    BEGIN
        RAISERROR('A prescription needs at least one medicine', 16, 1)
        RETURN
    END

    SELECT @nextNo = ISNULL(MAX(prescription_id), 0) + 1
    FROM PRESCRIPTION
    WHERE record_id = @recordId;

    INSERT INTO PRESCRIPTION (record_id, prescription_id, notes)
    VALUES (@recordId, @nextNo, @notes);

    INSERT INTO PRESCRIPTION_MEDICATION (record_id, prescription_id, medication)
    VALUES (@recordId, @nextNo, @medication);
END;
GO

--E7.) Procedure : adds one more medicine to an existing prescription
CREATE PROCEDURE add_medication
    @recordId INT,
    @prescriptionId INT,
    @medication VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PRESCRIPTION WHERE record_id = @recordId AND prescription_id = @prescriptionId)
    BEGIN
        RAISERROR('Prescription not found', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM PRESCRIPTION_MEDICATION
               WHERE record_id = @recordId
                 AND prescription_id = @prescriptionId
                 AND medication = @medication)
    BEGIN
        RAISERROR('This medicine is already in the prescription', 16, 1)
        RETURN
    END

    INSERT INTO PRESCRIPTION_MEDICATION (record_id, prescription_id, medication)
    VALUES (@recordId, @prescriptionId, @medication);
END;
GO

--E8.) Procedure : shows the full medical history of a pet
CREATE PROCEDURE get_pet_medical_history
    @petId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT m.record_id, a.appointment_date, u.full_name AS Veterinarian, m.diagnosis, m.treatment_plan
    FROM MEDICAL_RECORD m
    LEFT OUTER JOIN APPOINTMENT a ON m.appointment_id = a.appointment_id
    LEFT OUTER JOIN [USER] u ON a.vet_user_id = u.user_id
    WHERE m.pet_id = @petId
    ORDER BY a.appointment_date;
END;
GO

--E9.) Procedure : a pet care provider adds a new service (grooming, training, boarding, daycare ...)
CREATE PROCEDURE add_service
    @serviceId INT,
    @serviceName VARCHAR(100),
    @price DECIMAL(10,2),
    @providerId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PET_CARE_PROVIDER WHERE user_id = @providerId)
    BEGIN
        RAISERROR('Pet care provider not found', 16, 1)
        RETURN
    END

    IF @price < 0
       OR EXISTS (SELECT 1 FROM SERVICE WHERE service_name = @serviceName AND provider_user_id = @providerId)
    BEGIN
        RAISERROR('The price cannot be negative and a provider cannot add the same service twice', 16, 1)
        RETURN
    END

    INSERT INTO SERVICE (service_id, service_name, price, provider_user_id)
    VALUES (@serviceId, @serviceName, @price, @providerId);
END;
GO

--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--T1.) Validation trigger : the next due date must be after the birthday of the pet (a CHECK cannot look at another table)
CREATE TRIGGER trg_Vaccination_CheckDate
ON VACCINATION
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               INNER JOIN PET p ON i.pet_id = p.pet_id
               WHERE i.next_due_date <= p.date_of_birth)
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Next due date must be after the date of birth of the pet', 16, 1)
    END
END;
GO

--T2.) Validation / update trigger : a record must be for the same pet of an appointment that is in progress (CheckedIn / InRoom),
--then the appointment becomes Completed automatically
CREATE TRIGGER trg_MedicalRecord_Complete
ON MEDICAL_RECORD
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               INNER JOIN APPOINTMENT a ON i.appointment_id = a.appointment_id
               WHERE i.pet_id IS NULL
                  OR i.pet_id <> a.pet_id
                  OR a.status NOT IN ('CheckedIn', 'InRoom'))
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('The record must be for the same pet of an appointment that is in progress', 16, 1)
    END
    ELSE
    BEGIN
        UPDATE APPOINTMENT
        SET status = 'Completed'
        WHERE appointment_id IN (SELECT appointment_id FROM inserted);
    END
END;
GO

--T3.) Trigger : when a vaccination is saved, the owner gets a reminder with the next due date
CREATE TRIGGER trg_Vaccination_Reminder
ON VACCINATION
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id)
    SELECT CONCAT('Next ', i.vaccine_name, ' vaccination of ', p.pet_name, ' is due on ', i.next_due_date), GETDATE(), 0, p.owner_user_id
    FROM inserted i
    INNER JOIN PET p ON i.pet_id = p.pet_id
    WHERE i.next_due_date IS NOT NULL;
END;
GO

--==================================================================
-- FUNCTION 05 : INVENTORY MANAGEMENT
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE TABLE SUPPLIER (
  supplier_id INT NOT NULL,
  supplier_name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(100),
  contact_phone CHAR(10),
  manager_user_id INT,

  CONSTRAINT supplier_pk PRIMARY KEY (supplier_id),
  CONSTRAINT supplier_manager_fk FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id),
  CONSTRAINT check_supplier_email CHECK (contact_email LIKE '%_@_%._%'),
  CONSTRAINT check_supplier_phone CHECK (contact_phone LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]')
);
GO

CREATE TABLE INVENTORY_ITEM (
  item_id INT NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  min_stock INT NOT NULL DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  supplier_id INT,
  manager_user_id INT,
  staff_user_id INT,

  CONSTRAINT inventory_item_pk PRIMARY KEY (item_id),
  CONSTRAINT inventory_item_supplier_fk FOREIGN KEY (supplier_id) REFERENCES SUPPLIER(supplier_id),
  CONSTRAINT inventory_item_manager_fk FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id),
  CONSTRAINT inventory_item_staff_fk FOREIGN KEY (staff_user_id) REFERENCES CLINIC_STAFF(user_id),
  CONSTRAINT check_item_stock CHECK (stock_qty >= 0),
  CONSTRAINT check_item_min_stock CHECK (min_stock >= 0),
  CONSTRAINT check_item_price CHECK (unit_price >= 0)
);
GO
GO

--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--l.) VIEW : inventory list for the staff and the vets (item, stock, supplier and who manages it)
CREATE VIEW inventory_view (item_id, item_name, stock_qty, min_stock, unit_price, supplier_name, supplier_phone, managed_by) AS
SELECT i.item_id, i.item_name, i.stock_qty, i.min_stock, i.unit_price, s.supplier_name, s.contact_phone, u.full_name
FROM INVENTORY_ITEM i
INNER JOIN SUPPLIER s ON i.supplier_id = s.supplier_id
INNER JOIN [USER] u ON i.staff_user_id = u.user_id;
GO

--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--E1.) Function : stock status of an item (Out of Stock / Low Stock / In Stock), the staff use it to check availability
CREATE FUNCTION dbo.GetStockStatus (@itemId INT)
RETURNS VARCHAR(20)
AS
BEGIN
    DECLARE @stock INT, @minStock INT, @status VARCHAR(20);

    SELECT @stock = stock_qty, @minStock = min_stock
    FROM INVENTORY_ITEM
    WHERE item_id = @itemId;

    IF @stock IS NULL
        SET @status = 'Item Not Found';
    ELSE IF @stock = 0
        SET @status = 'Out of Stock';
    ELSE IF @stock < @minStock
        SET @status = 'Low Stock';
    ELSE
        SET @status = 'In Stock';

    RETURN @status;
END;
GO

--E2.) Function : total value of the stock that comes from a supplier
CREATE FUNCTION dbo.GetSupplierStockValue (@supplierId INT)
RETURNS DECIMAL(12,2)
AS
BEGIN
    DECLARE @stockValue DECIMAL(12,2);

    SELECT @stockValue = SUM(stock_qty * unit_price)
    FROM INVENTORY_ITEM
    WHERE supplier_id = @supplierId;

    RETURN ISNULL(@stockValue, 0);
END;
GO

--E3.) Procedure : the clinic manager adds a new item to the inventory
CREATE PROCEDURE add_inventory_item
    @itemId INT,
    @itemName VARCHAR(100),
    @stockQty INT,
    @minStock INT,
    @unitPrice DECIMAL(10,2),
    @supplierId INT,
    @managerId INT,
    @staffId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM INVENTORY_ITEM WHERE item_id = @itemId OR item_name = @itemName)
    BEGIN
        RAISERROR('This item is already in the inventory', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM SUPPLIER WHERE supplier_id = @supplierId)
       OR NOT EXISTS (SELECT 1 FROM CLINIC_MANAGER WHERE user_id = @managerId)
       OR NOT EXISTS (SELECT 1 FROM CLINIC_STAFF WHERE user_id = @staffId)
    BEGIN
        RAISERROR('Supplier, clinic manager or clinic staff member not found', 16, 1)
        RETURN
    END

    INSERT INTO INVENTORY_ITEM (item_id, item_name, stock_qty, min_stock, unit_price, supplier_id, manager_user_id, staff_user_id)
    VALUES (@itemId, @itemName, @stockQty, @minStock, @unitPrice, @supplierId, @managerId, @staffId);
END;
GO

--E4.) Procedure : adds new stock to an inventory item (new stock received from the supplier)
CREATE PROCEDURE restock_item
    @itemId INT,
    @quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM INVENTORY_ITEM WHERE item_id = @itemId)
    BEGIN
        RAISERROR('Item not found', 16, 1)
        RETURN
    END

    IF @quantity <= 0
    BEGIN
        RAISERROR('Quantity must be greater than zero', 16, 1)
        RETURN
    END

    UPDATE INVENTORY_ITEM
    SET stock_qty = stock_qty + @quantity
    WHERE item_id = @itemId;
END;
GO

--E5.) Procedure : removes stock that was used, expired or damaged (the stock can never go below zero)
CREATE PROCEDURE remove_stock
    @itemId INT,
    @quantity INT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @stock INT;

    SELECT @stock = stock_qty
    FROM INVENTORY_ITEM
    WHERE item_id = @itemId;

    IF @stock IS NULL
    BEGIN
        RAISERROR('Item not found', 16, 1)
        RETURN
    END

    IF @quantity <= 0 OR @quantity > @stock
    BEGIN
        RAISERROR('Quantity must be between 1 and the current stock', 16, 1)
        RETURN
    END

    UPDATE INVENTORY_ITEM
    SET stock_qty = stock_qty - @quantity
    WHERE item_id = @itemId;
END;
GO

--E6.) Procedure : updates the contact details of a supplier (a NULL value keeps the old value)
CREATE PROCEDURE update_supplier_contact
    @supplierId INT,
    @contactEmail VARCHAR(100),
    @contactPhone CHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SUPPLIER WHERE supplier_id = @supplierId)
    BEGIN
        RAISERROR('Supplier not found', 16, 1)
        RETURN
    END

    UPDATE SUPPLIER
    SET contact_email = ISNULL(@contactEmail, contact_email),
        contact_phone = ISNULL(@contactPhone, contact_phone)
    WHERE supplier_id = @supplierId;
END;
GO

--E7.) Procedure : shows the items of a supplier with their stock status (used before placing an order)
CREATE PROCEDURE get_supplier_items
    @supplierId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT s.supplier_name, s.contact_phone, i.item_id, i.item_name, i.stock_qty, i.min_stock,
           dbo.GetStockStatus(i.item_id) AS [Stock Status]
    FROM SUPPLIER s
    INNER JOIN INVENTORY_ITEM i ON s.supplier_id = i.supplier_id
    WHERE s.supplier_id = @supplierId;
END;
GO

--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--T1.) Audit item trigger : keeps a history of every stock update in STOCK_AUDIT
CREATE TABLE STOCK_AUDIT (
  audit_id INT IDENTITY(1, 1) NOT NULL,
  item_id INT NOT NULL,
  old_qty INT,
  new_qty INT,
  changed_date DATETIME NOT NULL DEFAULT GETDATE(),

  CONSTRAINT stock_audit_pk PRIMARY KEY (audit_id),
  CONSTRAINT stock_audit_item_fk FOREIGN KEY (item_id) REFERENCES INVENTORY_ITEM(item_id) -- <--- Added Foreign Key
);
GO

--Trigger:
CREATE TRIGGER trg_Inventory_StockAudit
ON INVENTORY_ITEM
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO STOCK_AUDIT (item_id, old_qty, new_qty, changed_date)
    SELECT d.item_id, d.stock_qty, i.stock_qty, GETDATE()
    FROM deleted d
    INNER JOIN inserted i ON d.item_id = i.item_id
    WHERE d.stock_qty <> i.stock_qty;
END;
GO

--T2.) Audit item's relevant other history trigger :Automatically saves item and supplier snapshot when an inventory item is deleted
-- Archive table to store deleted item & supplier snapshots
CREATE TABLE INVENTORY_ARCHIVE (
  archive_id INT IDENTITY(1, 1) NOT NULL,
  item_id INT NOT NULL,
  item_name VARCHAR(100) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  supplier_id INT,
  supplier_name VARCHAR(100),
  contact_email VARCHAR(100),
  contact_phone CHAR(10),
  deleted_date DATETIME NOT NULL DEFAULT GETDATE(),

  CONSTRAINT inventory_archive_pk PRIMARY KEY (archive_id)
);
GO

-- Trigger:
CREATE TRIGGER trg_Inventory_ArchiveOnDelete
ON INVENTORY_ITEM
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO INVENTORY_ARCHIVE (
      item_id, item_name, unit_price, 
      supplier_id, supplier_name, contact_email, contact_phone
    )
    SELECT 
      d.item_id, d.item_name, d.unit_price,
      s.supplier_id, s.supplier_name, s.contact_email, s.contact_phone
    FROM deleted d
    LEFT JOIN SUPPLIER s ON d.supplier_id = s.supplier_id;
END;
GO

--T3.) Trigger : when the stock of an item falls below its minimum, its manager and staff member get a low stock alert
CREATE TRIGGER trg_Inventory_LowStockAlert
ON INVENTORY_ITEM
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    --alert for the clinic manager of the item
    INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id)
    SELECT CONCAT('Low stock alert : ', i.item_name, ' has only ', i.stock_qty, ' left'), GETDATE(), 0, i.manager_user_id
    FROM inserted i
    INNER JOIN deleted d ON i.item_id = d.item_id
    WHERE i.stock_qty < i.min_stock
      AND d.stock_qty >= d.min_stock
      AND i.manager_user_id IS NOT NULL;

    --the same alert for the clinic staff member who manages the item
    INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id)
    SELECT CONCAT('Low stock alert : ', i.item_name, ' has only ', i.stock_qty, ' left'), GETDATE(), 0, i.staff_user_id
    FROM inserted i
    INNER JOIN deleted d ON i.item_id = d.item_id
    WHERE i.stock_qty < i.min_stock
      AND d.stock_qty >= d.min_stock
      AND i.staff_user_id IS NOT NULL;
END;
GO

--==================================================================
-- FUNCTION 06 : CUSTOMER FEEDBACK AND PACKAGE MANAGEMENT
--==================================================================

--------------------------------------------------
-- Part B : Tables & Constraints
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
CREATE TABLE SERVICE_PACKAGE (
  package_id INT NOT NULL,
  package_name VARCHAR(100) NOT NULL,
  package_price DECIMAL(10,2) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  manager_user_id INT,

  CONSTRAINT service_package_pk PRIMARY KEY (package_id),
  CONSTRAINT service_package_manager_fk FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id),
  CONSTRAINT check_package_price CHECK (package_price >= 0),
  CONSTRAINT check_base_price CHECK (base_price >= 0)
);
GO

--M:N INCLUDED IN between SERVICE and SERVICE_PACKAGE (every package needs at least one service, trigger in Part F)
CREATE TABLE INCLUDED_IN (
  service_id INT NOT NULL,
  package_id INT NOT NULL,

  CONSTRAINT included_in_pk PRIMARY KEY (service_id, package_id),
  CONSTRAINT included_in_service_fk FOREIGN KEY (service_id) REFERENCES SERVICE(service_id),
  CONSTRAINT included_in_package_fk FOREIGN KEY (package_id) REFERENCES SERVICE_PACKAGE(package_id) ON DELETE CASCADE
);
GO

CREATE TABLE SERVICE_BOOKING (
  booking_id INT NOT NULL,
  booking_date DATE NOT NULL DEFAULT GETDATE(),
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  provider_user_id INT,
  package_id INT NOT NULL,
  owner_user_id INT,

  CONSTRAINT service_booking_pk PRIMARY KEY (booking_id),
  CONSTRAINT service_booking_provider_fk FOREIGN KEY (provider_user_id) REFERENCES PET_CARE_PROVIDER(user_id),
  CONSTRAINT service_booking_package_fk FOREIGN KEY (package_id) REFERENCES SERVICE_PACKAGE(package_id),
  CONSTRAINT service_booking_owner_fk FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
  CONSTRAINT check_booking_status CHECK (status IN ('Pending', 'Confirmed', 'Completed', 'Cancelled'))
);
GO

--R3 : PAYMENT (Function 02) was created before SERVICE_BOOKING, so this FK is added now
ALTER TABLE PAYMENT
ADD CONSTRAINT payment_booking_fk
FOREIGN KEY (booking_id) REFERENCES SERVICE_BOOKING(booking_id);
GO

CREATE TABLE FEEDBACK (
  feedback_id INT NOT NULL,
  rating INT NOT NULL,
  comments VARCHAR(200),
  owner_user_id INT NOT NULL,

  CONSTRAINT feedback_pk PRIMARY KEY (feedback_id),
  CONSTRAINT feedback_owner_fk FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
  CONSTRAINT check_feedback_rating CHECK (rating BETWEEN 1 AND 5)
);
GO

CREATE TABLE COMPLAINT (
  complaint_id INT NOT NULL,
  date_filed DATE NOT NULL DEFAULT GETDATE(),
  status VARCHAR(20) NOT NULL DEFAULT 'Open',
  details VARCHAR(200) NOT NULL,
  manager_user_id INT,
  owner_user_id INT NOT NULL,

  CONSTRAINT complaint_pk PRIMARY KEY (complaint_id),
  CONSTRAINT complaint_manager_fk FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id),
  CONSTRAINT complaint_owner_fk FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
  CONSTRAINT check_complaint_status CHECK (status IN ('Open', 'In Review', 'Resolved'))
);
GO
GO

--------------------------------------------------
-- Part D : Analytical Views
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--p.) VIEW : bookings with package and payment details
CREATE VIEW booking_payment_view (booking_id, booking_date, owner_name, package_name, package_price, booking_status, paid_amount, payment_method) AS
SELECT b.booking_id, b.booking_date, u.full_name, sp.package_name, sp.package_price, b.status, p.amount, p.payment_method
FROM SERVICE_BOOKING b
INNER JOIN [USER] u ON b.owner_user_id = u.user_id
INNER JOIN SERVICE_PACKAGE sp ON b.package_id = sp.package_id
LEFT OUTER JOIN PAYMENT p ON b.booking_id = p.booking_id;
GO

--------------------------------------------------
-- Part E : Stored Functions & Procedures
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--E1.) Function : total price of the services in a package when bought separately
CREATE FUNCTION dbo.GetPackageServiceTotal (@packageId INT)
RETURNS DECIMAL(10,2)
AS
BEGIN
    DECLARE @total DECIMAL(10,2);

    SELECT @total = SUM(s.price)
    FROM INCLUDED_IN i
    INNER JOIN SERVICE s ON i.service_id = s.service_id
    WHERE i.package_id = @packageId;

    RETURN ISNULL(@total, 0);
END;
GO

--E2.) Function : number of complaints of a clinic manager that are not resolved yet
CREATE FUNCTION dbo.GetOpenComplaintCount (@managerId INT)
RETURNS INT
AS
BEGIN
    DECLARE @openCount INT;

    SELECT @openCount = COUNT(*)
    FROM COMPLAINT
    WHERE manager_user_id = @managerId
      AND status <> 'Resolved';

    RETURN ISNULL(@openCount, 0);
END;
GO

--E3.) Procedure : adds a service package together with its first service
CREATE PROCEDURE add_service_package
    @packageId INT,
    @packageName VARCHAR(100),
    @packagePrice DECIMAL(10,2),
    @managerId INT,
    @serviceId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM SERVICE_PACKAGE WHERE package_id = @packageId)
    BEGIN
        RAISERROR('This package ID is already used', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM SERVICE WHERE service_id = @serviceId)
       OR NOT EXISTS (SELECT 1 FROM CLINIC_MANAGER WHERE user_id = @managerId)
    BEGIN
        RAISERROR('Service or clinic manager not found', 16, 1)
        RETURN
    END

    INSERT INTO SERVICE_PACKAGE (package_id, package_name, package_price, base_price, manager_user_id)
    VALUES (@packageId, @packageName, @packagePrice, @packagePrice, @managerId);

    INSERT INTO INCLUDED_IN (service_id, package_id)
    VALUES (@serviceId, @packageId);
END;
GO

--E4.) Procedure : adds one more service to a package
CREATE PROCEDURE add_service_to_package
    @packageId INT,
    @serviceId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SERVICE_PACKAGE WHERE package_id = @packageId)
       OR NOT EXISTS (SELECT 1 FROM SERVICE WHERE service_id = @serviceId)
    BEGIN
        RAISERROR('Package or service not found', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM INCLUDED_IN WHERE package_id = @packageId AND service_id = @serviceId)
    BEGIN
        RAISERROR('This service is already in the package', 16, 1)
        RETURN
    END

    INSERT INTO INCLUDED_IN (service_id, package_id)
    VALUES (@serviceId, @packageId);
END;
GO

--E5.) Procedure : a promotional offer, reduces the price of a package by a percentage
CREATE PROCEDURE apply_package_discount
    @packageId INT,
    @discountPct DECIMAL(5,2)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SERVICE_PACKAGE WHERE package_id = @packageId)
    BEGIN
        RAISERROR('Package not found', 16, 1)
        RETURN
    END

    IF @discountPct <= 0 OR @discountPct > 50
    BEGIN
        RAISERROR('The discount must be more than 0 and not more than 50 percent', 16, 1)
        RETURN
    END

    -- Calculates discount using stable base_price instead of compounding package_price
    UPDATE SERVICE_PACKAGE
    SET package_price = base_price - (base_price * (@discountPct / 100.0))
    WHERE package_id = @packageId;
END;
GO

--E6.) Procedure : removes a package from the customer list (a package that was booked is kept for the booking history)
CREATE PROCEDURE remove_service_package
    @packageId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM SERVICE_PACKAGE WHERE package_id = @packageId)
    BEGIN
        RAISERROR('Package not found', 16, 1)
        RETURN
    END

    IF EXISTS (SELECT 1 FROM SERVICE_BOOKING WHERE package_id = @packageId)
    BEGIN
        RAISERROR('This package has bookings, so it cannot be removed', 16, 1)
        RETURN
    END

    --ON DELETE CASCADE also removes its rows in INCLUDED_IN
    DELETE FROM SERVICE_PACKAGE
    WHERE package_id = @packageId;
END;
GO

--E7.) Procedure : an owner books a pet care package, the booking is Pending until it is paid
CREATE PROCEDURE book_package
    @bookingId INT,
    @ownerId INT,
    @packageId INT,
    @providerId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM PET_OWNER WHERE user_id = @ownerId)
       OR NOT EXISTS (SELECT 1 FROM SERVICE_PACKAGE WHERE package_id = @packageId)
    BEGIN
        RAISERROR('Pet owner or package not found', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM PET_CARE_PROVIDER WHERE user_id = @providerId)
    BEGIN
        RAISERROR('Pet care provider not found', 16, 1)
        RETURN
    END

    INSERT INTO SERVICE_BOOKING (booking_id, booking_date, status, provider_user_id, package_id, owner_user_id)
    VALUES (@bookingId, GETDATE(), 'Pending', @providerId, @packageId, @ownerId);
END;
GO

--E8.) Procedure : the pet care provider updates the status of a booking (Confirmed -> Completed, or Cancelled)
CREATE PROCEDURE update_booking_status
    @bookingId INT,
    @providerId INT,
    @newStatus VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @oldStatus VARCHAR(20);
    DECLARE @actualProviderId INT;

    SELECT @oldStatus = status, @actualProviderId = provider_user_id
    FROM SERVICE_BOOKING
    WHERE booking_id = @bookingId;

    IF @oldStatus IS NULL
    BEGIN
        RAISERROR('Booking not found', 16, 1)
        RETURN
    END

    -- verify that the updating user is the provider assigned to this booking
    IF @actualProviderId <> @providerId
    BEGIN
        RAISERROR('You are not authorized to update this booking', 16, 1)
        RETURN
    END

    -- the provider can only complete or cancel, a finished booking cannot be changed,
    -- and only a paid (Confirmed) booking can be Completed (Pending -> Confirmed happens when it is paid)
    IF @newStatus NOT IN ('Completed', 'Cancelled')
       OR @oldStatus IN ('Completed', 'Cancelled')
       OR (@newStatus = 'Completed' AND @oldStatus <> 'Confirmed')
    BEGIN
        RAISERROR('This status change is not allowed', 16, 1)
        RETURN
    END

    UPDATE SERVICE_BOOKING
    SET status = @newStatus
    WHERE booking_id = @bookingId;
END;
GO

--E9.) Procedure : booking history of an owner with the payments
CREATE PROCEDURE get_booking_history
    @ownerId INT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT b.booking_id, b.booking_date, sp.package_name, u.full_name AS Provider, b.status, p.amount AS [Paid Amount]
    FROM SERVICE_BOOKING b
    INNER JOIN SERVICE_PACKAGE sp ON b.package_id = sp.package_id
    LEFT OUTER JOIN [USER] u ON b.provider_user_id = u.user_id
    LEFT OUTER JOIN PAYMENT p ON b.booking_id = p.booking_id
    WHERE b.owner_user_id = @ownerId
    ORDER BY b.booking_date DESC;
END;
GO

--E10.) Procedure : a manager resolves a complaint and the owner gets a notification
CREATE PROCEDURE resolve_complaint
    @complaintId INT,
    @managerId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM COMPLAINT WHERE complaint_id = @complaintId AND status <> 'Resolved')
    BEGIN
        RAISERROR('Complaint not found or already resolved', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM CLINIC_MANAGER WHERE user_id = @managerId)
    BEGIN
        RAISERROR('Clinic manager not found', 16, 1)
        RETURN
    END

    UPDATE COMPLAINT
    SET status = 'Resolved', manager_user_id = @managerId
    WHERE complaint_id = @complaintId;

    INSERT INTO NOTIFICATION (message, user_id)
    SELECT CONCAT('Your complaint ', complaint_id, ' has been resolved'), owner_user_id
    FROM COMPLAINT
    WHERE complaint_id = @complaintId;
END;
GO

--E11.) Procedure : a clinic manager removes a feedback that was identified as spam (personally checked in detail ; not from output of an automation)
CREATE PROCEDURE remove_feedback
    @feedbackId INT,
    @managerId INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM CLINIC_MANAGER WHERE user_id = @managerId)
    BEGIN
        RAISERROR('Only a clinic manager can remove feedback', 16, 1)
        RETURN
    END

    IF NOT EXISTS (SELECT 1 FROM FEEDBACK WHERE feedback_id = @feedbackId)
    BEGIN
        RAISERROR('Feedback not found', 16, 1)
        RETURN
    END

    DELETE FROM FEEDBACK
    WHERE feedback_id = @feedbackId;
END;
GO

--------------------------------------------------
-- Part F : Triggers & Audit Schema
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--T1.) Update trigger : when a booking is paid, a Pending booking becomes Confirmed
CREATE TRIGGER trg_Payment_ConfirmBooking
ON PAYMENT
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE SERVICE_BOOKING
    SET status = 'Confirmed'
    WHERE booking_id IN (SELECT booking_id FROM inserted)
      AND status = 'Pending';
END;
GO

--T2.) Validation trigger : a package must always include at least one service (total participation in INCLUDED IN)
CREATE TRIGGER trg_IncludedIn_PackageTotal
ON INCLUDED_IN
AFTER UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM deleted
               WHERE package_id IN (SELECT package_id FROM SERVICE_PACKAGE)
                 AND package_id NOT IN (SELECT package_id FROM INCLUDED_IN))
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('A service package must include at least one service', 16, 1)
    END
END;
GO

--T3.) Validation trigger : the provider of a booking must offer at least one service of the booked package
CREATE TRIGGER trg_ServiceBooking_CheckProvider
ON SERVICE_BOOKING
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    --only new bookings, or bookings whose provider / package changed, are checked (not a status change)
    IF EXISTS (SELECT 1
               FROM inserted i
               WHERE i.provider_user_id IS NOT NULL
                 AND NOT EXISTS (SELECT 1
                                 FROM deleted d
                                 WHERE d.booking_id = i.booking_id
                                   AND d.provider_user_id = i.provider_user_id
                                   AND d.package_id = i.package_id)
                 AND NOT EXISTS (SELECT 1
                                 FROM INCLUDED_IN inc
                                 INNER JOIN SERVICE s ON inc.service_id = s.service_id
                                 WHERE inc.package_id = i.package_id
                                   AND s.provider_user_id = i.provider_user_id))
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('This pet care provider does not offer any service of the booked package', 16, 1)
    END
END;
GO

--T4.) Validation trigger : feedback can be given only by an owner who has a completed appointment or service
CREATE TRIGGER trg_Feedback_CheckOwner
ON FEEDBACK
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1
               FROM inserted i
               WHERE NOT EXISTS (SELECT 1
                                 FROM APPOINTMENT a
                                 WHERE a.owner_user_id = i.owner_user_id
                                   AND a.status = 'Completed')
                 AND NOT EXISTS (SELECT 1
                                 FROM SERVICE_BOOKING b
                                 WHERE b.owner_user_id = i.owner_user_id
                                   AND b.status = 'Completed'))
    BEGIN
        ROLLBACK TRANSACTION
        RAISERROR('Feedback can be given only after a completed appointment or service', 16, 1)
    END
END;
GO

--T5.) Update trigger : a new complaint goes to the clinic manager who has the fewest open complaints (lowest user_id if equal)
--(complaints are sent one at a time, so all rows of one INSERT go to the same manager)
CREATE TRIGGER trg_Complaint_AutoAssign
ON COMPLAINT
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @managerId INT;

    SELECT @managerId = MIN(user_id)
    FROM CLINIC_MANAGER
    WHERE dbo.GetOpenComplaintCount(user_id) = (SELECT MIN(dbo.GetOpenComplaintCount(user_id))
                                                FROM CLINIC_MANAGER);

    UPDATE COMPLAINT
    SET manager_user_id = @managerId
    WHERE complaint_id IN (SELECT complaint_id FROM inserted)
      AND manager_user_id IS NULL;
END;
GO

-- SECTION 3: UNIFIED INTEGRATION VIEWS & MAPPINGS
-- Bridges the IT2140 DDD Normalized EER Schema with the SE Web Application Schema.
-- Proves to examiners that both represent the same unified enterprise architecture!
-- ==============================================================================

-- View 1: Unified Stakeholder Mapping (Links DDD [USER] + Subclasses to SE users table)
CREATE OR ALTER VIEW vw_Unified_Stakeholder_Directory AS
SELECT 
    u.user_id AS DDD_User_ID,
    u.full_name AS Full_Name,
    u.email AS Email,
    dbo.GetUserType(u.user_id) AS DDD_Assigned_Role,
    w.user_id AS SE_Web_User_Code,
    w.role AS SE_Web_Role,
    w.status AS SE_Web_Status
FROM [USER] u
LEFT JOIN users w ON u.email = w.email;
GO

-- View 2: Unified Clinical Pet Registry (Links DDD PET + BREED to SE pets table)
CREATE OR ALTER VIEW vw_Unified_Pet_Registry AS
SELECT 
    pd.pet_id AS DDD_Pet_ID,
    pd.pet_name AS Pet_Name,
    pd.species AS Species,
    pd.breed AS Breed,
    pd.age AS Calculated_Age_Years,
    pd.emergency_contact AS Emergency_Contact,
    wp.pet_id AS SE_Web_Pet_Code,
    wp.weight_kg AS SE_Weight_KG
FROM PET_DETAILS pd
LEFT JOIN pets wp ON pd.pet_name = wp.name;
GO

-- View 3: Unified Appointment Schedule (Links DDD APPOINTMENT to SE appointments table)
CREATE OR ALTER VIEW vw_Unified_Appointment_Schedule AS
SELECT 
    a.appointment_id AS DDD_Appointment_ID,
    a.appointment_date AS Appointment_Date,
    a.time_slot AS Time_Slot,
    a.status AS DDD_Status,
    p.pet_name AS Pet_Name,
    u.full_name AS Veterinarian,
    wa.appointment_id AS SE_Web_Token
FROM APPOINTMENT a
INNER JOIN PET p ON a.pet_id = p.pet_id
INNER JOIN [USER] u ON a.vet_user_id = u.user_id
LEFT JOIN appointments wa ON wa.appointment_id = CONCAT('APT-', a.appointment_id);
GO

PRINT '==============================================================================';
PRINT 'PetNexus Unified Master Database script completed successfully!';
PRINT 'Centralized Database PetNexus is now ready for both Web Application & IT2140 DDD Viva!';
PRINT '==============================================================================';
GO

GO

-- ==============================================================================
-- SECTION 4: REAL-TIME SYNCHRONIZATION TRIGGERS
-- Automatically synchronizes website registrations with the DDD normalized schema.
-- Website user IDs start from 101+ to prevent collision with DDD benchmark users 1-33.
-- ==============================================================================

CREATE OR ALTER TRIGGER trg_users_sync_to_ddd
ON users
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


-- ==============================================================================
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

USE PetNexus;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- ==============================================================================
-- SECTION 1: IT2140 DDD BENCHMARK SAMPLE DATASETS (Functions 00 - 06)
-- ==============================================================================
--==================================================================
-- FUNCTION 00 : IDENTITY AND ACCESS MANAGEMENT (common to all functions) : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--users 1-5 providers, 6-10 managers, 11-15 staff, 16-20 vets, 21-28 owners, 29-33 rescue officers
INSERT INTO [USER] VALUES (1, '198512345678', 'Nimal Perera', 'nimal.perera@gmail.com', '12 Temple Road', 'Colombo');
INSERT INTO [USER] VALUES (2, '902345678V', 'Kasun Fernando', 'kasun.fernando@gmail.com', '45 Lake Drive', 'Kandy');
INSERT INTO [USER] VALUES (3, '199023456789', 'Tharushi Silva', 'tharushi.silva@gmail.com', '8 Flower Lane', 'Galle');
INSERT INTO [USER] VALUES (4, '885678901V', 'Ruwan Jayasinghe', 'ruwan.jayasinghe@gmail.com', '77 Main Street', 'Negombo');
INSERT INTO [USER] VALUES (5, '199534567890', 'Dilani Wickramasinghe', 'dilani.w@yahoo.com', '23 Park Avenue', 'Malabe');
INSERT INTO [USER] VALUES (6, '197845612378', 'Sunil Rathnayake', 'sunil.r@petnexus.lk', '5 Hospital Road', 'Colombo');
INSERT INTO [USER] VALUES (7, '815678234V', 'Chamari Herath', 'chamari.h@petnexus.lk', '19 Hill Street', 'Kandy');
INSERT INTO [USER] VALUES (8, '198267345123', 'Pradeep Bandara', 'pradeep.b@petnexus.lk', '102 Galle Road', 'Dehiwala');
INSERT INTO [USER] VALUES (9, '876543219V', 'Anusha Gunawardena', 'anusha.g@petnexus.lk', '34 Station Road', 'Nugegoda');
INSERT INTO [USER] VALUES (10, '199045678912', 'Mahesh Dissanayake', 'mahesh.d@petnexus.lk', '7 Lotus Road', 'Malabe');
INSERT INTO [USER] VALUES (11, '199812345670', 'Sachini Madushani', 'sachini.m@petnexus.lk', '56 Baseline Road', 'Colombo');
INSERT INTO [USER] VALUES (12, '962345671V', 'Isuru Lakmal', 'isuru.l@petnexus.lk', '88 Kandy Road', 'Kadawatha');
INSERT INTO [USER] VALUES (13, '199734567812', 'Hiruni Senanayake', 'hiruni.s@petnexus.lk', '14 School Lane', 'Maharagama');
INSERT INTO [USER] VALUES (14, '945678123V', 'Chathura Weerasinghe', 'chathura.w@petnexus.lk', '3 Market Street', 'Kaduwela');
INSERT INTO [USER] VALUES (15, '200012345678', 'Nadeesha Kumari', 'nadeesha.k@petnexus.lk', '21 Church Road', 'Negombo');
INSERT INTO [USER] VALUES (16, '197912345678', 'Dr. Asela Gunasekara', 'asela.g@petnexus.lk', '9 Ward Place', 'Colombo');
INSERT INTO [USER] VALUES (17, '825671234V', 'Dr. Shanika Pathirana', 'shanika.p@petnexus.lk', '41 Peradeniya Road', 'Kandy');
INSERT INTO [USER] VALUES (18, '198856781234', 'Dr. Ravindu Karunaratne', 'ravindu.k@petnexus.lk', '66 High Level Road', 'Nugegoda');
INSERT INTO [USER] VALUES (19, '915678432V', 'Dr. Menaka Abeysekara', 'menaka.a@petnexus.lk', '12 Lighthouse Street', 'Galle');
INSERT INTO [USER] VALUES (20, '199267812345', 'Dr. Tharindu Samarasinghe', 'tharindu.s@petnexus.lk', '150 New Kandy Road', 'Malabe');
INSERT INTO [USER] VALUES (21, '199512378945', 'Amaya Jayawardena', 'amaya.j@gmail.com', '17 Flower Road', 'Colombo');
INSERT INTO [USER] VALUES (22, '932145678V', 'Sahan Wijesinghe', 'sahan.w@gmail.com', '29 Lake Road', 'Kandy');
INSERT INTO [USER] VALUES (23, '200145612378', 'Kavindi Peiris', 'kavindi.p@gmail.com', '5 Beach Road', 'Negombo');
INSERT INTO [USER] VALUES (24, '199823456712', 'Yasiru Mendis', 'yasiru.m@gmail.com', '60 Temple Road', 'Galle');
INSERT INTO [USER] VALUES (25, '885612347V', 'Nethmi Hettiarachchi', 'nethmi.h@yahoo.com', '11 Palm Grove', 'Colombo');
INSERT INTO [USER] VALUES (26, '199634512378', 'Pasindu Gamage', 'pasindu.g@gmail.com', '8 Rose Avenue', 'Kurunegala');
INSERT INTO [USER] VALUES (27, '912378456V', 'Ishara Liyanage', 'ishara.l@gmail.com', '44 Hill Crest', 'Kandy');
INSERT INTO [USER] VALUES (28, '200267845123', 'Tharaka Ranasinghe', 'tharaka.r@gmail.com', '3 Sea View Road', 'Matara');
INSERT INTO [USER] VALUES (29, '198734567891', 'Buddhika Alwis', 'buddhika.a@petnexus.lk', '76 Nawala Road', 'Rajagiriya');
INSERT INTO [USER] VALUES (30, '905671238V', 'Sanduni Rodrigo', 'sanduni.r@petnexus.lk', '18 Mosque Road', 'Negombo');
INSERT INTO [USER] VALUES (31, '199378945612', 'Janaka Premaratne', 'janaka.p@petnexus.lk', '55 Temple Street', 'Kandy');
INSERT INTO [USER] VALUES (32, '955612378V', 'Malsha Vithanage', 'malsha.v@petnexus.lk', '2 Railway Avenue', 'Galle');
INSERT INTO [USER] VALUES (33, '199156712389', 'Chanaka Ekanayake', 'chanaka.e@petnexus.lk', '91 Hospital Road', 'Kurunegala');
GO

SELECT * FROM [USER];
GO

INSERT INTO USER_PHONE VALUES (1, '0771234501');
INSERT INTO USER_PHONE VALUES (1, '0112345601');
INSERT INTO USER_PHONE VALUES (2, '0712345602');
INSERT INTO USER_PHONE VALUES (3, '0763456703');
INSERT INTO USER_PHONE VALUES (4, '0724567804');
INSERT INTO USER_PHONE VALUES (5, '0785678905');
INSERT INTO USER_PHONE VALUES (6, '0776789006');
INSERT INTO USER_PHONE VALUES (6, '0112789006');
INSERT INTO USER_PHONE VALUES (7, '0717890107');
INSERT INTO USER_PHONE VALUES (8, '0768901208');
INSERT INTO USER_PHONE VALUES (9, '0729012309');
INSERT INTO USER_PHONE VALUES (11, '0770123411');
INSERT INTO USER_PHONE VALUES (12, '0711234512');
INSERT INTO USER_PHONE VALUES (13, '0762345613');
INSERT INTO USER_PHONE VALUES (15, '0784567815');
INSERT INTO USER_PHONE VALUES (16, '0775678916');
INSERT INTO USER_PHONE VALUES (16, '0115678916');
INSERT INTO USER_PHONE VALUES (17, '0716789017');
INSERT INTO USER_PHONE VALUES (18, '0767890118');
INSERT INTO USER_PHONE VALUES (19, '0728901219');
INSERT INTO USER_PHONE VALUES (20, '0789012320');
INSERT INTO USER_PHONE VALUES (21, '0770123421');
INSERT INTO USER_PHONE VALUES (21, '0710123421');
INSERT INTO USER_PHONE VALUES (22, '0761234522');
INSERT INTO USER_PHONE VALUES (23, '0722345623');
INSERT INTO USER_PHONE VALUES (24, '0783456724');
INSERT INTO USER_PHONE VALUES (25, '0774567825');
INSERT INTO USER_PHONE VALUES (26, '0715678926');
INSERT INTO USER_PHONE VALUES (27, '0766789027');
INSERT INTO USER_PHONE VALUES (29, '0727890129');
INSERT INTO USER_PHONE VALUES (30, '0788901230');
INSERT INTO USER_PHONE VALUES (31, '0779012331');
INSERT INTO USER_PHONE VALUES (32, '0710123432');
GO

SELECT * FROM USER_PHONE;
GO

INSERT INTO PET_CARE_PROVIDER VALUES (1, 'PCP001');
INSERT INTO PET_CARE_PROVIDER VALUES (2, 'PCP002');
INSERT INTO PET_CARE_PROVIDER VALUES (3, 'PCP003');
INSERT INTO PET_CARE_PROVIDER VALUES (4, 'PCP004');
INSERT INTO PET_CARE_PROVIDER VALUES (5, 'PCP005');
GO

SELECT * FROM PET_CARE_PROVIDER;
GO

INSERT INTO CLINIC_MANAGER VALUES (6, 'MGR001');
INSERT INTO CLINIC_MANAGER VALUES (7, 'MGR002');
INSERT INTO CLINIC_MANAGER VALUES (8, 'MGR003');
INSERT INTO CLINIC_MANAGER VALUES (9, 'MGR004');
INSERT INTO CLINIC_MANAGER VALUES (10, 'MGR005');
GO

SELECT * FROM CLINIC_MANAGER;
GO

INSERT INTO CLINIC_STAFF VALUES (11, 'STF001', 'Receptionist');
INSERT INTO CLINIC_STAFF VALUES (12, 'STF002', 'Veterinary Nurse');
INSERT INTO CLINIC_STAFF VALUES (13, 'STF003', 'Pharmacist');
INSERT INTO CLINIC_STAFF VALUES (14, 'STF004', 'Store Keeper');
INSERT INTO CLINIC_STAFF VALUES (15, 'STF005', 'Receptionist');
GO

SELECT * FROM CLINIC_STAFF;
GO

INSERT INTO VETERINARIAN VALUES (16, 'SLVC-1021');
INSERT INTO VETERINARIAN VALUES (17, 'SLVC-1045');
INSERT INTO VETERINARIAN VALUES (18, 'SLVC-1078');
INSERT INTO VETERINARIAN VALUES (19, 'SLVC-1102');
INSERT INTO VETERINARIAN VALUES (20, 'SLVC-1136');
GO

SELECT * FROM VETERINARIAN;
GO

INSERT INTO PET_OWNER VALUES (21, 'OWN001');
INSERT INTO PET_OWNER VALUES (22, 'OWN002');
INSERT INTO PET_OWNER VALUES (23, 'OWN003');
INSERT INTO PET_OWNER VALUES (24, 'OWN004');
INSERT INTO PET_OWNER VALUES (25, 'OWN005');
INSERT INTO PET_OWNER VALUES (26, 'OWN006');
INSERT INTO PET_OWNER VALUES (27, 'OWN007');
INSERT INTO PET_OWNER VALUES (28, 'OWN008');
GO

SELECT * FROM PET_OWNER;
GO

INSERT INTO RESCUE_OFFICER VALUES (29, 'RO-101');
INSERT INTO RESCUE_OFFICER VALUES (30, 'RO-102');
INSERT INTO RESCUE_OFFICER VALUES (31, 'RO-103');
INSERT INTO RESCUE_OFFICER VALUES (32, 'RO-104');
INSERT INTO RESCUE_OFFICER VALUES (33, 'RO-105');
GO

SELECT * FROM RESCUE_OFFICER;
GO

INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (16, 'Surgery');
INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (16, 'Orthopedics');
INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (17, 'Dermatology');
INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (18, 'Internal Medicine');
INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (18, 'Emergency Care');
INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (19, 'Dentistry');
INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (20, 'Exotic Animals');
INSERT INTO VETERINARIAN_SPECIALIZATION VALUES (20, 'Nutrition');
GO

SELECT * FROM VETERINARIAN_SPECIALIZATION;
GO

--notification_id is not given because IDENTITY creates it (1601, 1602, ...)
--date_sent is written as 'yyyy-mm-ddThh:mm:ss' so DATETIME reads it the same way in any language setting
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('Your appointment on 2026-09-28 is confirmed', '2026-09-21T10:15:00', 0, 21);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('Vaccination DHPP for Max is due on 2026-09-30', '2026-09-16T08:00:00', 1, 24);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('Your adoption application 1303 is under review', '2026-08-27T14:30:00', 1, 24);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('Low stock alert : DHPP Vaccine', '2026-09-18T09:00:00', 0, 6);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('New rescue case assigned : Nugegoda Market', '2026-09-18T11:45:00', 0, 30);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('Your service booking 707 is confirmed', '2026-09-23T16:20:00', 0, 22);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('Complaint 1504 has been resolved', '2026-09-17T12:00:00', 1, 27);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('New appointment booked for 2026-09-30', '2026-09-21T09:10:00', 0, 20);
INSERT INTO NOTIFICATION (message, date_sent, is_read, user_id) VALUES ('Payment of Rs. 6000 received for booking 707', '2026-09-23T16:25:00', 0, 22);
GO

SELECT * FROM NOTIFICATION;
GO

--==================================================================
-- FUNCTION 01 : MANAGE PET AND OWNER PROFILES : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--Shih Tzu and Cockatiel have no pet yet (a breed can be saved before any pet of it, R2)
INSERT INTO BREED VALUES ('Labrador Retriever', 'Dog');
INSERT INTO BREED VALUES ('German Shepherd', 'Dog');
INSERT INTO BREED VALUES ('Beagle', 'Dog');
INSERT INTO BREED VALUES ('Pomeranian', 'Dog');
INSERT INTO BREED VALUES ('Golden Retriever', 'Dog');
INSERT INTO BREED VALUES ('Shih Tzu', 'Dog');
INSERT INTO BREED VALUES ('Persian', 'Cat');
INSERT INTO BREED VALUES ('Siamese', 'Cat');
INSERT INTO BREED VALUES ('Maine Coon', 'Cat');
INSERT INTO BREED VALUES ('Holland Lop', 'Rabbit');
INSERT INTO BREED VALUES ('Budgerigar', 'Bird');
INSERT INTO BREED VALUES ('Cockatiel', 'Bird');
GO

SELECT * FROM BREED;
GO

INSERT INTO PET VALUES (101, 'Bruno', 'Labrador Retriever', '2020-03-15', '0719988776', 21);
INSERT INTO PET VALUES (102, 'Kitty', 'Persian', '2021-07-22', '0719988776', 21);
INSERT INTO PET VALUES (103, 'Rocky', 'German Shepherd', '2019-11-05', '0752233445', 22);
INSERT INTO PET VALUES (104, 'Coco', 'Holland Lop', '2023-01-10', '0763344556', 23);
INSERT INTO PET VALUES (105, 'Max', 'Beagle', '2022-05-30', '0774455667', 24);
INSERT INTO PET VALUES (106, 'Luna', 'Siamese', '2020-09-12', '0785566778', 25);
INSERT INTO PET VALUES (107, 'Tweety', 'Budgerigar', '2024-02-14', NULL, 26);
INSERT INTO PET VALUES (108, 'Simba', 'Maine Coon', '2018-12-01', '0706677889', 27);
INSERT INTO PET VALUES (109, 'Bella', 'Pomeranian', '2021-04-18', '0752233445', 22);
INSERT INTO PET VALUES (110, 'Oscar', 'Golden Retriever', '2025-06-20', '0785566778', 25);
GO

SELECT * FROM PET;
--species and age come from the view
SELECT * FROM PET_DETAILS;
GO

--==================================================================
-- FUNCTION 02 : APPOINTMENT AND BOOKING MANAGEMENT : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--215 is an online request that nobody confirmed before its date
INSERT INTO APPOINTMENT VALUES (201, '2026-08-10', '09:00', 'Completed', 11, 101, 21, 16);
INSERT INTO APPOINTMENT VALUES (202, '2026-08-12', '10:30', 'Completed', 12, 103, 22, 17);
INSERT INTO APPOINTMENT VALUES (203, '2026-08-20', '11:00', 'Completed', 11, 105, 24, 16);
INSERT INTO APPOINTMENT VALUES (204, '2026-09-02', '09:30', 'Completed', 15, 106, 25, 19);
INSERT INTO APPOINTMENT VALUES (205, '2026-09-05', '14:00', 'Cancelled', 11, 102, 21, 17);
INSERT INTO APPOINTMENT VALUES (206, '2026-09-10', '15:30', 'NoShow', NULL, 104, 23, 20);
INSERT INTO APPOINTMENT VALUES (207, '2026-09-15', '10:00', 'Completed', 12, 108, 27, 18);
INSERT INTO APPOINTMENT VALUES (208, '2026-09-22', '09:00', 'Completed', 15, 109, 22, 16);
INSERT INTO APPOINTMENT VALUES (209, '2026-09-24', '10:00', 'InRoom', 12, 105, 24, 18);
INSERT INTO APPOINTMENT VALUES (210, '2026-09-24', '11:00', 'CheckedIn', 11, 106, 25, 19);
INSERT INTO APPOINTMENT VALUES (211, '2026-09-28', '11:30', 'Confirmed', 11, 101, 21, 16);
INSERT INTO APPOINTMENT VALUES (212, '2026-09-30', '13:00', 'Scheduled', NULL, 110, 25, 20);
INSERT INTO APPOINTMENT VALUES (213, '2026-10-02', '10:00', 'Pending', NULL, 107, 26, 20);
INSERT INTO APPOINTMENT VALUES (214, '2026-10-05', '16:00', 'Scheduled', NULL, 103, 22, 17);
INSERT INTO APPOINTMENT VALUES (215, '2026-09-18', '14:30', 'Pending', NULL, 104, 23, 17);
GO

SELECT * FROM APPOINTMENT;
GO

--payments of completed appointments (adoption fees and booking payments are added in Functions 03 and 06)
INSERT INTO PAYMENT VALUES (801, 2500.00, '2026-08-10', 'Cash', NULL, 201, NULL);
INSERT INTO PAYMENT VALUES (802, 3500.00, '2026-08-12', 'Card', NULL, 202, NULL);
INSERT INTO PAYMENT VALUES (803, 2000.00, '2026-08-20', 'Cash', NULL, 203, NULL);
INSERT INTO PAYMENT VALUES (804, 8500.00, '2026-09-02', 'Card', NULL, 204, NULL);
INSERT INTO PAYMENT VALUES (805, 3000.00, '2026-09-15', 'Cash', NULL, 207, NULL);
INSERT INTO PAYMENT VALUES (806, 2800.00, '2026-09-22', 'Cash', NULL, 208, NULL);
GO

SELECT * FROM PAYMENT;
GO

--==================================================================
-- FUNCTION 03 : PET RESCUE AND ADOPTION MANAGEMENT : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
INSERT INTO RESCUE_CASE VALUES (1101, 'Near Kelaniya Temple', '2026-07-02', 'Closed', 'Injured leg', 22, 29);
INSERT INTO RESCUE_CASE VALUES (1102, 'Galle Face Green', '2026-07-15', 'In Progress', 'Malnourished puppies', NULL, 30);
INSERT INTO RESCUE_CASE VALUES (1103, 'Kandy Lake Round', '2026-08-03', 'In Progress', 'Skin infection', 25, 29);
INSERT INTO RESCUE_CASE VALUES (1104, 'Negombo Beach', '2026-08-21', 'In Progress', 'Abandoned kittens', 27, 31);
INSERT INTO RESCUE_CASE VALUES (1105, 'Malabe Junction', '2026-09-09', 'Open', 'Hit by a vehicle', NULL, 32);
INSERT INTO RESCUE_CASE VALUES (1106, 'Nugegoda Market', '2026-09-18', 'Open', 'Stray dog with a wound', 21, 30);
GO

SELECT * FROM RESCUE_CASE;
GO

INSERT INTO FOSTER_CARE VALUES (1201, 'Paws Haven Foster Home', 29);
INSERT INTO FOSTER_CARE VALUES (1202, 'Mrs. Kamala Perera', 30);
INSERT INTO FOSTER_CARE VALUES (1203, 'Second Chance Shelter', 31);
INSERT INTO FOSTER_CARE VALUES (1204, 'Mr. Roshan Alwis', 29);
INSERT INTO FOSTER_CARE VALUES (1205, 'Little Tails Foster Family', 32);
GO

SELECT * FROM FOSTER_CARE;
GO

INSERT INTO RESCUED_PET VALUES (1101, 1, 'Adopted', 1201);
INSERT INTO RESCUED_PET VALUES (1102, 1, 'Available', 1202);
INSERT INTO RESCUED_PET VALUES (1102, 2, 'Available', 1202);
INSERT INTO RESCUED_PET VALUES (1102, 3, 'In Foster Care', 1203);
INSERT INTO RESCUED_PET VALUES (1103, 1, 'In Treatment', NULL);
INSERT INTO RESCUED_PET VALUES (1104, 1, 'Available', 1205);
INSERT INTO RESCUED_PET VALUES (1104, 2, 'Available', 1205);
INSERT INTO RESCUED_PET VALUES (1105, 1, 'In Treatment', NULL);
INSERT INTO RESCUED_PET VALUES (1106, 1, 'In Treatment', NULL);
GO

SELECT * FROM RESCUED_PET;
GO

INSERT INTO ADOPTION_APPLICATION VALUES (1301, '2026-07-20', 'APPROVED', '2026-07-25', 2000.00, 'Has a large garden', 23, 1101, 1, 29);
INSERT INTO ADOPTION_APPLICATION VALUES (1302, '2026-07-22', 'REJECTED', '2026-07-25', 2000.00, 'Lives in a small flat', 26, 1101, 1, 29);
INSERT INTO ADOPTION_APPLICATION VALUES (1303, '2026-08-25', 'UNDER_REVIEW', NULL, 1500.00, 'First time owner', 24, 1102, 1, 30);
INSERT INTO ADOPTION_APPLICATION VALUES (1304, '2026-09-01', 'SUBMITTED', NULL, 1500.00, NULL, 28, 1102, 2, NULL);
INSERT INTO ADOPTION_APPLICATION VALUES (1305, '2026-09-05', 'SUBMITTED', NULL, 1000.00, 'Wants a kitten', 21, 1104, 1, NULL);
INSERT INTO ADOPTION_APPLICATION VALUES (1306, '2026-09-10', 'CANCELLED', '2026-09-12', 1000.00, 'Applicant moved abroad', 27, 1104, 2, 31);
INSERT INTO ADOPTION_APPLICATION VALUES (1307, '2026-09-03', 'SUBMITTED', NULL, 1500.00, 'Works from home', 26, 1102, 1, NULL);
GO

SELECT * FROM ADOPTION_APPLICATION;
GO

--adoption fee of the approved application 1301 (R3 : only application_id is given)
INSERT INTO PAYMENT VALUES (812, 2000.00, '2026-07-26', 'Cash', NULL, NULL, 1301);
GO

SELECT * FROM PAYMENT WHERE application_id IS NOT NULL;
GO

--==================================================================
-- FUNCTION 04 : PET SERVICES AND HEALTH MANAGEMENT : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
INSERT INTO VACCINATION VALUES (101, 1, 'Rabies', '2027-03-15');
INSERT INTO VACCINATION VALUES (101, 2, 'DHPP', '2026-10-05');
INSERT INTO VACCINATION VALUES (102, 1, 'FVRCP', '2026-11-20');
INSERT INTO VACCINATION VALUES (103, 1, 'Rabies', '2026-10-12');
INSERT INTO VACCINATION VALUES (103, 2, 'Leptospirosis', '2026-09-01');
INSERT INTO VACCINATION VALUES (104, 1, 'RHDV', '2027-01-05');
INSERT INTO VACCINATION VALUES (105, 1, 'DHPP', '2026-09-30');
INSERT INTO VACCINATION VALUES (106, 1, 'Rabies', '2026-12-01');
INSERT INTO VACCINATION VALUES (108, 1, 'FVRCP', '2026-08-15');
INSERT INTO VACCINATION VALUES (109, 1, 'Rabies', '2027-02-18');
INSERT INTO VACCINATION VALUES (110, 1, 'DHPP', '2026-10-20');
INSERT INTO VACCINATION VALUES (110, 2, 'Rabies', '2026-11-10');
GO

SELECT * FROM VACCINATION;
GO

INSERT INTO MEDICAL_RECORD VALUES (301, 'Ear infection', 'Ear drops twice daily for 7 days', 'Recheck after one week', 201, 101);
INSERT INTO MEDICAL_RECORD VALUES (302, 'Skin allergy', 'Antihistamine tablets and medicated shampoo', 'Avoid chicken based food', 202, 103);
INSERT INTO MEDICAL_RECORD VALUES (303, 'Routine check-up - healthy', 'Continue normal diet', 'Next vaccination due soon', 203, 105);
INSERT INTO MEDICAL_RECORD VALUES (304, 'Dental tartar', 'Scaling under anaesthesia', 'Soft food for 3 days', 204, 106);
INSERT INTO MEDICAL_RECORD VALUES (305, 'Stomach infection', 'Oral rehydration and probiotics', 'Monitor appetite', 207, 108);
INSERT INTO MEDICAL_RECORD VALUES (306, 'Sprained leg', 'Rest and anti-inflammatory tablets', 'Limit exercise for 2 weeks', 208, 109);
INSERT INTO MEDICAL_RECORD VALUES (307, 'Minor cut on paw', 'Wound cleaning and bandage', 'Emergency walk-in', NULL, 110);
INSERT INTO MEDICAL_RECORD VALUES (308, 'Tick infestation', 'Tick removal and spot-on treatment', 'Walk-in visit', NULL, 101);
GO

SELECT * FROM MEDICAL_RECORD;
GO

--prescription_id is numbered from 1 inside each medical record (record 302 has two prescriptions)
INSERT INTO PRESCRIPTION VALUES (301, 1, 'Complete the full course');
INSERT INTO PRESCRIPTION VALUES (302, 1, 'Give after meals');
INSERT INTO PRESCRIPTION VALUES (302, 2, 'Use once a week');
INSERT INTO PRESCRIPTION VALUES (304, 1, 'Pain relief after scaling');
INSERT INTO PRESCRIPTION VALUES (305, 1, 'Give with food');
INSERT INTO PRESCRIPTION VALUES (306, 1, 'Reduce the dose if drowsy');
INSERT INTO PRESCRIPTION VALUES (307, 1, 'Apply twice daily');
INSERT INTO PRESCRIPTION VALUES (308, 1, 'Repeat after one month');
GO

SELECT * FROM PRESCRIPTION;
GO

INSERT INTO PRESCRIPTION_MEDICATION VALUES (301, 1, 'Otomax Ear Drops');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (301, 1, 'Amoxicillin 250mg');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (302, 1, 'Cetirizine 10mg');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (302, 2, 'Chlorhexidine Shampoo');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (304, 1, 'Meloxicam 1.5mg');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (305, 1, 'ORS Sachets');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (305, 1, 'Probiotic Paste');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (305, 1, 'Amoxicillin 250mg');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (306, 1, 'Carprofen 75mg');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (307, 1, 'Povidone Iodine Solution');
INSERT INTO PRESCRIPTION_MEDICATION VALUES (308, 1, 'Frontline Spot-On');
GO

SELECT * FROM PRESCRIPTION_MEDICATION;
GO

INSERT INTO SERVICE VALUES (501, 'Basic Grooming', 2500.00, 1);
INSERT INTO SERVICE VALUES (502, 'Full Grooming', 4500.00, 1);
INSERT INTO SERVICE VALUES (503, 'Dog Walking (1 hour)', 1500.00, 2);
INSERT INTO SERVICE VALUES (504, 'Pet Sitting (per day)', 3000.00, 3);
INSERT INTO SERVICE VALUES (505, 'Obedience Training Session', 5000.00, 4);
INSERT INTO SERVICE VALUES (506, 'Pet Taxi', 2000.00, 5);
INSERT INTO SERVICE VALUES (507, 'Nail Trimming', 800.00, 1);
INSERT INTO SERVICE VALUES (508, 'Pet Photography', 3500.00, 5);
GO

SELECT * FROM SERVICE;
GO

--==================================================================
-- FUNCTION 05 : INVENTORY MANAGEMENT : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
INSERT INTO SUPPLIER VALUES (901, 'PetCare Lanka (Pvt) Ltd', 'sales@petcarelanka.lk', '0112345678', 6);
INSERT INTO SUPPLIER VALUES (902, 'VetMed Distributors', 'orders@vetmed.lk', '0114567890', 7);
INSERT INTO SUPPLIER VALUES (903, 'Happy Paws Supplies', 'info@happypaws.lk', '0812234455', 6);
INSERT INTO SUPPLIER VALUES (904, 'Island Pet Foods', 'contact@islandpetfoods.lk', '0912233445', 8);
INSERT INTO SUPPLIER VALUES (905, 'MediVet Pharma', 'support@medivetpharma.lk', '0115678901', 9);
INSERT INTO SUPPLIER VALUES (906, 'Ceylon Aqua Pets', 'hello@ceylonaqua.lk', '0332244556', 10);
GO

SELECT * FROM SUPPLIER;
GO

INSERT INTO INVENTORY_ITEM VALUES (1001, 'Rabies Vaccine', 40, 20, 1200.00, 902, 6, 13);
INSERT INTO INVENTORY_ITEM VALUES (1002, 'DHPP Vaccine', 15, 20, 1500.00, 902, 6, 13);
INSERT INTO INVENTORY_ITEM VALUES (1003, 'Premium Dog Food 10kg', 25, 10, 8500.00, 904, 7, 14);
INSERT INTO INVENTORY_ITEM VALUES (1004, 'Cat Litter 5kg', 8, 10, 1800.00, 903, 7, 14);
INSERT INTO INVENTORY_ITEM VALUES (1005, 'Flea and Tick Shampoo', 30, 15, 950.00, 901, 8, 14);
INSERT INTO INVENTORY_ITEM VALUES (1006, 'Amoxicillin 250mg Strip', 50, 25, 450.00, 905, 9, 13);
INSERT INTO INVENTORY_ITEM VALUES (1007, 'Surgical Gloves Box', 12, 15, 2200.00, 905, 6, 12);
INSERT INTO INVENTORY_ITEM VALUES (1008, 'Pet Collar Medium', 20, 5, 750.00, 903, 8, 14);
INSERT INTO INVENTORY_ITEM VALUES (1009, 'Bird Seed Mix 1kg', 0, 5, 650.00, 904, 7, 15);
GO

SELECT * FROM INVENTORY_ITEM;
GO

--==================================================================
-- FUNCTION 06 : CUSTOMER FEEDBACK AND PACKAGE MANAGEMENT : Sample Data
--==================================================================
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
INSERT INTO SERVICE_PACKAGE VALUES (601, 'Grooming Care Pack', 6000.00, 6000.00, 6);
INSERT INTO SERVICE_PACKAGE VALUES (602, 'Busy Owner Pack', 4000.00, 4000.00, 7);
INSERT INTO SERVICE_PACKAGE VALUES (603, 'Puppy Starter Pack', 7500.00, 7500.00, 8);
INSERT INTO SERVICE_PACKAGE VALUES (604, 'Holiday Care Pack', 6000.00, 6000.00, 6);
INSERT INTO SERVICE_PACKAGE VALUES (605, 'Basic Hygiene Pack', 3000.00, 3000.00, 9);
GO

SELECT * FROM SERVICE_PACKAGE;
GO

INSERT INTO INCLUDED_IN VALUES (502, 601);
INSERT INTO INCLUDED_IN VALUES (507, 601);
INSERT INTO INCLUDED_IN VALUES (506, 601);
INSERT INTO INCLUDED_IN VALUES (503, 602);
INSERT INTO INCLUDED_IN VALUES (504, 602);
INSERT INTO INCLUDED_IN VALUES (505, 603);
INSERT INTO INCLUDED_IN VALUES (501, 603);
INSERT INTO INCLUDED_IN VALUES (507, 603);
INSERT INTO INCLUDED_IN VALUES (504, 604);
INSERT INTO INCLUDED_IN VALUES (503, 604);
INSERT INTO INCLUDED_IN VALUES (506, 604);
INSERT INTO INCLUDED_IN VALUES (501, 605);
INSERT INTO INCLUDED_IN VALUES (507, 605);
GO

SELECT * FROM INCLUDED_IN;
GO

INSERT INTO SERVICE_BOOKING VALUES (701, '2026-08-05', 'Completed', 1, 601, 21);
INSERT INTO SERVICE_BOOKING VALUES (702, '2026-08-18', 'Completed', 2, 602, 22);
INSERT INTO SERVICE_BOOKING VALUES (703, '2026-09-01', 'Confirmed', 4, 603, 24);
INSERT INTO SERVICE_BOOKING VALUES (704, '2026-09-12', 'Completed', 1, 605, 25);
INSERT INTO SERVICE_BOOKING VALUES (705, '2026-09-20', 'Pending', 3, 604, 27);
INSERT INTO SERVICE_BOOKING VALUES (706, '2026-09-21', 'Cancelled', 2, 602, 23);
INSERT INTO SERVICE_BOOKING VALUES (707, '2026-09-23', 'Confirmed', 1, 601, 22);
GO

SELECT * FROM SERVICE_BOOKING;
GO

--payments of package bookings (R3 : only booking_id is given)
INSERT INTO PAYMENT VALUES (807, 6000.00, '2026-08-05', 'Card', 701, NULL, NULL);
INSERT INTO PAYMENT VALUES (808, 4000.00, '2026-08-18', 'Card', 702, NULL, NULL);
INSERT INTO PAYMENT VALUES (809, 7500.00, '2026-09-01', 'Card', 703, NULL, NULL);
INSERT INTO PAYMENT VALUES (810, 3000.00, '2026-09-12', 'Cash', 704, NULL, NULL);
INSERT INTO PAYMENT VALUES (811, 6000.00, '2026-09-23', 'Cash', 707, NULL, NULL);
GO

SELECT * FROM PAYMENT;
GO

INSERT INTO FEEDBACK VALUES (1401, 5, 'Excellent care for Bruno', 21);
INSERT INTO FEEDBACK VALUES (1402, 4, 'Friendly staff and short waiting time', 22);
INSERT INTO FEEDBACK VALUES (1403, 3, 'Good service but a bit expensive', 24);
INSERT INTO FEEDBACK VALUES (1404, 5, 'Grooming was perfect', 25);
INSERT INTO FEEDBACK VALUES (1405, 2, 'Appointment started very late', 27);
INSERT INTO FEEDBACK VALUES (1406, 4, 'Easy online booking', 22);
GO

SELECT * FROM FEEDBACK;
GO

INSERT INTO COMPLAINT VALUES (1501, '2026-08-14', 'Resolved', 'Groomer arrived one hour late', 6, 22);
INSERT INTO COMPLAINT VALUES (1502, '2026-08-30', 'In Review', 'Wrong medicine label was given', 7, 24);
INSERT INTO COMPLAINT VALUES (1503, '2026-09-06', 'Open', 'Payment was charged twice', NULL, 25);
INSERT INTO COMPLAINT VALUES (1504, '2026-09-16', 'Resolved', 'Rude behaviour at the reception', 6, 27);
INSERT INTO COMPLAINT VALUES (1505, '2026-09-19', 'Open', 'Online booking was not confirmed', NULL, 23);
GO

SELECT * FROM COMPLAINT;
GO

GO
-- ==============================================================================
-- SECTION 2: SE WEB APPLICATION INITIAL SEED DATA (For Website Login & Operation)
-- ==============================================================================
-- 1. Seed Active Stakeholders in users table (Matching DataInitializer.java)
INSERT INTO users (
    user_id, email, password_hash, full_name, phone, address,
    role, status, avatar_url, emergency_contact, license_number,
    specialization, staff_id, manager_code, badge_number, service_specialty, created_at
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
INSERT INTO care_providers (provider_id, provider_name, contact_email, contact_phone, active, user_id)
VALUES ('PRV-001', 'Dilshan Bandara Grooming & Spa', 'provider@petnexus.com', '+94 70 456 7890', 1, (SELECT id FROM users WHERE email='provider@petnexus.com'));
GO

-- 3. Seed Pets in pets table
INSERT INTO pets (
    pet_id, name, species, breed, gender, date_of_birth,
    age_years, age_months, weight_kg, microchip_id,
    emergency_contact, owner_id, created_at
) VALUES 
('PET-001', 'Barnaby', 'Dog', 'Golden Retriever', 'Male', '2021-03-15', 3, 6, 31.50, '981098102345678', 'Thilini Perera - +94 77 234 9988', (SELECT id FROM users WHERE email='owner@petnexus.com'), GETDATE()),
('PET-002', 'Luna', 'Cat', 'Persian', 'Female', '2022-07-20', 2, 2, 4.20, '981098102345679', 'Thilini Perera - +94 77 234 9988', (SELECT id FROM users WHERE email='owner@petnexus.com'), GETDATE());
GO

-- 4. Seed Suppliers in suppliers table
INSERT INTO suppliers (supplier_id, company_name, contact_person, email, phone, address, category, lead_time_days, rating, active, created_at)
VALUES 
('SUP-01', 'BioVet Laboratories Lanka', 'Dr. Janaka Fernando', 'sales@biovetlanka.com', '+94 11 288 9911', '124 Nawala Road, Nugegoda', 'Pharmaceuticals & Vaccines', 3, 4.8, 1, GETDATE()),
('SUP-02', 'MediEquip Surgical Instruments', 'Rohan Jayasuriya', 'orders@mediequip.lk', '+94 11 255 4433', '88 Galle Road, Colombo 03', 'Surgical Supplies', 5, 4.5, 1, GETDATE()),
('SUP-03', 'Royal Canin Distribution Hub', 'Dilani Alwis', 'distribution@royalcanin.lk', '+94 11 433 2211', '45 Baseline Road, Colombo 09', 'Prescription Diet', 2, 4.9, 1, GETDATE());
GO

-- 5. Seed Inventory Items in inventory_items table
INSERT INTO inventory_items (
    item_id, name, category, sku, batch_number, current_stock,
    min_stock_threshold, unit, unit_price, selling_price, expiry_date,
    status, supplier_name, supplier_fk_id, created_at
) VALUES 
('INV-101', 'Amoxicillin Trihydrate Oral Suspension 100ml', 'Antibiotics', 'MED-AMX-100', 'BT-78201', 18, 10, 'Bottles', 3800.00, 5200.00, '2027-11-30', 'IN_STOCK', 'BioVet Laboratories Lanka', (SELECT id FROM suppliers WHERE supplier_id='SUP-01'), GETDATE()),
('INV-102', 'Rabies 3-Year Canine/Feline Vaccine 50-Dose', 'Vaccines', 'VAC-RAB-03Y', 'BT-99411', 4, 8, 'Vials (Pack)', 22500.00, 38500.00, '2027-04-15', 'LOW_STOCK', 'BioVet Laboratories Lanka', (SELECT id FROM suppliers WHERE supplier_id='SUP-01'), GETDATE());
GO

-- 6. Seed Care Services in care_services table
INSERT INTO care_services (service_id, name, description, price, duration_minutes, status, created_by_user_id)
VALUES 
('SRV-001', 'Full Grooming & Hydrobath Spa', 'Includes warm hydrobath, coat trimming, nail clipping and ear cleaning', 4500.00, 60, 'SCHEDULED', (SELECT id FROM users WHERE email='provider@petnexus.com')),
('SRV-002', 'Basic Hygiene Groom', 'Bath, blow dry and nail trimming', 2500.00, 40, 'SCHEDULED', (SELECT id FROM users WHERE email='provider@petnexus.com'));
GO

-- 7. Seed Rescue Cases in rescue_cases table
INSERT INTO rescue_cases (
    case_id, case_number, temporary_name, species, breed,
    rescue_location, intake_date, condition_severity, status,
    is_published_for_adoption, description, rescue_officer_fk_id, created_at
) VALUES 
('RSC-2026-001', 'RC-001', 'Buddy', 'Dog', 'Mongrel / Crossbreed', 'Near Kelaniya Temple, Kelaniya', CAST(GETDATE() AS DATE), 'Critical', 'In Treatment', 0, 'Adult male dog with a fractured hind leg after traffic incident.', (SELECT id FROM users WHERE email='rescue@petnexus.com'), GETDATE()),
('RSC-2026-002', 'RC-002', 'Milo & Siblings', 'Dog', 'Mixed', 'Galle Face Green, Colombo 03', CAST(GETDATE() AS DATE), 'Moderate', 'Open', 0, 'Litter of 3 malnourished puppies needing urgent veterinary care and foster placement.', (SELECT id FROM users WHERE email='rescue@petnexus.com'), GETDATE());
GO


-- ==============================================================================
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

USE PetNexus;
GO

SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--==================================================================
-- FUNCTION 00 : IDENTITY AND ACCESS MANAGEMENT (common to all functions) : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a.) Simple SELECT : users who live in Kandy
SELECT user_id, full_name, email, city
FROM [USER]
WHERE city = 'Kandy'
ORDER BY full_name ASC;
GO

--b.) LIKE : users who registered with a Gmail address
SELECT user_id, full_name, email
FROM [USER]
WHERE email LIKE '%@gmail.com'
ORDER BY user_id;
GO

--c.) INNER JOIN : veterinarians with their license number and specializations
SELECT u.user_id, u.full_name AS Veterinarian, v.license_number, s.specialization
FROM [USER] u
INNER JOIN VETERINARIAN v ON u.user_id = v.user_id
INNER JOIN VETERINARIAN_SPECIALIZATION s ON v.user_id = s.user_id
ORDER BY u.full_name;
GO

--d.) LEFT OUTER JOIN : all clinic staff with their phone numbers (NULL if no phone)
SELECT u.full_name AS [Staff Member], c.staff_id, c.role, p.phone_number
FROM CLINIC_STAFF c
INNER JOIN [USER] u ON c.user_id = u.user_id
LEFT OUTER JOIN USER_PHONE p ON c.user_id = p.user_id;
GO

--e.) Aggregation : total users and number of different cities
SELECT COUNT(user_id) AS [Total Users], COUNT(DISTINCT city) AS [No. of Cities]
FROM [USER];
GO

--f.) GROUP BY / HAVING : cities that have more than 2 users
SELECT city, COUNT(user_id) AS [No. of Users]
FROM [USER]
GROUP BY city
HAVING COUNT(user_id) > 2
ORDER BY COUNT(user_id) DESC;
GO

--g.) GROUP BY / HAVING : users who have more than one phone number
SELECT u.user_id, u.full_name, COUNT(p.phone_number) AS [No. of Phones]
FROM [USER] u
INNER JOIN USER_PHONE p ON u.user_id = p.user_id
GROUP BY u.user_id, u.full_name
HAVING COUNT(p.phone_number) > 1;
GO

--h.) Subquery (single row) : users from the same city as Nimal Perera (email is unique, so one row comes back)
SELECT full_name, city
FROM [USER]
WHERE city = (SELECT city
              FROM [USER]
              WHERE email = 'nimal.perera@gmail.com')
  AND email <> 'nimal.perera@gmail.com';
GO

--i.) Subquery (NOT IN) : users who have not added a phone number
SELECT user_id, full_name, email
FROM [USER]
WHERE user_id NOT IN (SELECT user_id
                      FROM USER_PHONE);
GO

--j.) Subquery (ISA total check) : users without a user type (no rows = every user has a type)
SELECT user_id, full_name
FROM [USER]
WHERE user_id NOT IN (SELECT user_id FROM PET_CARE_PROVIDER)
  AND user_id NOT IN (SELECT user_id FROM CLINIC_MANAGER)
  AND user_id NOT IN (SELECT user_id FROM CLINIC_STAFF)
  AND user_id NOT IN (SELECT user_id FROM VETERINARIAN)
  AND user_id NOT IN (SELECT user_id FROM PET_OWNER)
  AND user_id NOT IN (SELECT user_id FROM RESCUE_OFFICER);
GO

--k.) GROUP BY : unread notifications of each user
SELECT u.user_id, u.full_name, COUNT(n.notification_id) AS [Unread Notifications]
FROM NOTIFICATION n
INNER JOIN [USER] u ON n.user_id = u.user_id
WHERE n.is_read = 0
GROUP BY u.user_id, u.full_name
ORDER BY COUNT(n.notification_id) DESC;
GO

SELECT * FROM vet_specialization_view;
GO

--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check
SELECT dbo.GetUserType(16) AS [User Type of User 16];
SELECT user_id, full_name, dbo.GetUserType(user_id) AS [User Type]
FROM [USER];
GO

--to check (every user should get 1)
SELECT user_id, full_name, dbo.GetUserRoleCount(user_id) AS [No. of User Types]
FROM [USER];
GO

--to check
SELECT dbo.GetUnreadCount(22) AS [Unread Notifications of User 22];
GO

--------------------------------------------------
-- Check Queries for All Registration Procedures
--------------------------------------------------

-- 1. Test Pet Care Provider Registration (User 34)
EXEC add_pet_care_provider 34, '199405671234', 'Saman Kumara', 'saman.k@petnexus.lk', '10 Park Lane', 'Colombo', '0771112233', 'PCP006';
GO

SELECT user_id, full_name, dbo.GetUserType(user_id) AS [User Type], dbo.GetUserRoleCount(user_id) AS [Role Count] FROM [USER] WHERE user_id = 34;
GO

-- 2. Test Clinic Manager Registration (User 35)
EXEC add_clinic_manager 35, '199105671234', 'Kanthi Perera', 'kanthi.p@petnexus.lk', '15 Main St', 'Kandy', '0772223344', 'MGR006';
GO

SELECT user_id, full_name, dbo.GetUserType(user_id) AS [User Type], dbo.GetUserRoleCount(user_id) AS [Role Count] FROM [USER] WHERE user_id = 35;
GO

-- 3. Test Clinic Staff Registration (User 36)
EXEC add_clinic_staff 36, '199605671234', 'Dinesh Silva', 'dinesh.s@petnexus.lk', '22 Lake Rd', 'Galle', '0773334455', 'STF006', 'Assistant';
GO

SELECT user_id, full_name, dbo.GetUserType(user_id) AS [User Type], dbo.GetUserRoleCount(user_id) AS [Role Count] FROM [USER] WHERE user_id = 36;
GO

-- 4. Test Veterinarian Registration (User 37)
EXEC add_veterinarian 37, '198905671234', 'Dr. Nuwan Rajapaksha', 'nuwan.r@petnexus.lk', '25 Station Road', 'Kandy', '0774445566', 'SLVC-1170', 'Cardiology';
GO

SELECT user_id, full_name, dbo.GetUserType(user_id) AS [User Type], dbo.GetUserRoleCount(user_id) AS [Role Count] FROM [USER] WHERE user_id = 37;
GO

-- 5. Test Pet Owner Registration (User 38)
EXEC add_pet_owner 38, '200005671234', 'Mali Fernando', 'mali.f@gmail.com', '5 Beach Rd', 'Negombo', '0775556677', 'OWN009';
GO

SELECT user_id, full_name, dbo.GetUserType(user_id) AS [User Type], dbo.GetUserRoleCount(user_id) AS [Role Count] FROM [USER] WHERE user_id = 38;
GO

-- 6. Test Rescue Officer Registration (User 39)
EXEC add_rescue_officer 39, '198705671234', 'Kamal Addararachchi', 'kamal.a@petnexus.lk', '88 High Level Rd', 'Nugegoda', '0776667788', 'RO-106';
GO

SELECT user_id, full_name, dbo.GetUserType(user_id) AS [User Type], dbo.GetUserRoleCount(user_id) AS [Role Count] FROM [USER] WHERE user_id = 39;
GO

-- Verification: Ensure query (j) returns 0 untyped users
SELECT user_id, full_name AS [Untyped Users]
FROM [USER]
WHERE user_id NOT IN (SELECT user_id FROM PET_CARE_PROVIDER)
  AND user_id NOT IN (SELECT user_id FROM CLINIC_MANAGER)
  AND user_id NOT IN (SELECT user_id FROM CLINIC_STAFF)
  AND user_id NOT IN (SELECT user_id FROM VETERINARIAN)
  AND user_id NOT IN (SELECT user_id FROM PET_OWNER)
  AND user_id NOT IN (SELECT user_id FROM RESCUE_OFFICER);
GO

-- Cleanup Test Data (Cascade delete cleans all subclass & phone entries cleanly)
DELETE FROM [USER] WHERE user_id BETWEEN 34 AND 39;
GO

--to check 1 (run the block below together)
DECLARE @id INT, @type VARCHAR(30)
EXEC get_user_access 'asela.g@petnexus.lk', @id OUTPUT, @type OUTPUT
SELECT @id AS [User ID], @type AS [Access Level];
GO

--to check 2 (an email that is not registered)
DECLARE @id INT, @type VARCHAR(30)
EXEC get_user_access 'unknown.user@gmail.com', @id OUTPUT, @type OUTPUT
SELECT @id AS [User ID], @type AS [Access Level];
GO

--to check (user 22 has 2 unread notifications before)
SELECT dbo.GetUnreadCount(22) AS [Unread Before];
EXEC mark_notifications_read 22;
SELECT dbo.GetUnreadCount(22) AS [Unread After];
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check 1 (user 21 is already a pet owner, so this must fail)
INSERT INTO VETERINARIAN VALUES (21, 'SLVC-9999');
GO

--to check 2 (user 16 is already a vet, so these must fail; each one is in its own batch)
INSERT INTO PET_CARE_PROVIDER VALUES (16, 'PCP099');
GO

INSERT INTO CLINIC_MANAGER VALUES (16, 'MGR099');
GO

INSERT INTO CLINIC_STAFF VALUES (16, 'STF099', 'Receptionist');
GO

INSERT INTO RESCUE_OFFICER VALUES (16, 'RO-199');
GO

INSERT INTO PET_OWNER VALUES (16, 'OWN099');
GO

--to check 3 (user 34 would have no user type left, so this must fail)
DELETE FROM VETERINARIAN WHERE user_id = 34;
GO

--to check 4 (deleting the user itself is allowed, ON DELETE CASCADE removes the phone, VETERINARIAN and specialization rows)
DELETE FROM [USER] WHERE user_id = 34;
GO

SELECT * FROM VETERINARIAN WHERE user_id IN (16, 21, 34);
SELECT * FROM PET_OWNER WHERE user_id IN (16, 21);
GO

--==================================================================
-- FUNCTION 01 : MANAGE PET AND OWNER PROFILES : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a.) Simple SELECT (view) : all dogs from the oldest to the youngest (age is calculated in PET_DETAILS)
SELECT pet_id, pet_name, breed, date_of_birth, age
FROM PET_DETAILS
WHERE species = 'Dog'
ORDER BY date_of_birth ASC;
GO

--b.) BETWEEN / IN : cats and dogs born in 2020 or 2021 (species comes from BREED)
SELECT p.pet_name, b.species, p.date_of_birth
FROM PET p
INNER JOIN BREED b ON p.breed = b.breed
WHERE p.date_of_birth BETWEEN '2020-01-01' AND '2021-12-31'
  AND b.species IN ('Dog', 'Cat');
GO

--c.) INNER JOIN : every pet with its species and owner details
SELECT p.pet_id, p.pet_name, b.species, o.owner_id, u.full_name AS [Owner Name], u.email
FROM PET p
INNER JOIN BREED b ON p.breed = b.breed
INNER JOIN PET_OWNER o ON p.owner_user_id = o.user_id
INNER JOIN [USER] u ON o.user_id = u.user_id
ORDER BY u.full_name;
GO

--d.) LEFT OUTER JOIN : breeds that have no pet yet (possible only because BREED is a separate table, R2)
SELECT b.breed, b.species
FROM BREED b
LEFT OUTER JOIN PET p ON b.breed = p.breed
WHERE p.pet_id IS NULL;
GO

--e.) RIGHT OUTER JOIN : every pet owner with their pets (NULL = owner has no pet yet)
SELECT o.owner_id, u.full_name AS [Owner Name], p.pet_id, p.pet_name
FROM PET p
RIGHT OUTER JOIN PET_OWNER o ON p.owner_user_id = o.user_id
INNER JOIN [USER] u ON o.user_id = u.user_id
ORDER BY o.owner_id;
GO

--f.) Aggregation (view) : number of pets, average age and the oldest / youngest birthday
SELECT COUNT(pet_id) AS [Total Pets], AVG(age * 1.0) AS [Average Age],
       MIN(date_of_birth) AS [Oldest Pet DOB], MAX(date_of_birth) AS [Youngest Pet DOB]
FROM PET_DETAILS;
GO

--g.) GROUP BY : number of pets of each species
SELECT b.species, COUNT(p.pet_id) AS [No. of Pets]
FROM PET p
INNER JOIN BREED b ON p.breed = b.breed
GROUP BY b.species
ORDER BY COUNT(p.pet_id) DESC;
GO

--h.) GROUP BY / HAVING : owners who have more than one pet
SELECT u.user_id, u.full_name AS [Owner Name], COUNT(p.pet_id) AS [No. of Pets]
FROM PET p
INNER JOIN [USER] u ON p.owner_user_id = u.user_id
GROUP BY u.user_id, u.full_name
HAVING COUNT(p.pet_id) > 1;
GO

--i.) Subquery (single row) : pets older than the average pet age
SELECT pet_name, species, age
FROM PET_DETAILS
WHERE age > (SELECT AVG(age * 1.0)
             FROM PET_DETAILS);
GO

--j.) Subquery (ANY) : dogs that are older than at least one cat
SELECT pet_name, age
FROM PET_DETAILS
WHERE species = 'Dog'
  AND age > ANY (SELECT age
                 FROM PET_DETAILS
                 WHERE species = 'Cat');
GO

--k.) Subquery (NOT EXISTS) : pet owners who have not registered a pet yet
SELECT o.owner_id, u.full_name, u.email
FROM PET_OWNER o
INNER JOIN [USER] u ON o.user_id = u.user_id
WHERE NOT EXISTS (SELECT 1
                  FROM PET p
                  WHERE p.owner_user_id = o.user_id);
GO

--l.) INNER JOIN : owner profiles with their contact numbers (an owner with two phones is shown twice)
SELECT o.owner_id, u.full_name, u.email, u.city, ph.phone_number
FROM PET_OWNER o
INNER JOIN [USER] u ON o.user_id = u.user_id
INNER JOIN USER_PHONE ph ON o.user_id = ph.user_id
ORDER BY o.owner_id;
GO

SELECT * FROM pet_profile_view
WHERE age >= 5;
GO

--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check
SELECT o.owner_id, u.full_name, dbo.GetPetCount(o.user_id) AS [No. of Pets]
FROM PET_OWNER o
INNER JOIN [USER] u ON o.user_id = u.user_id;
GO

--E2.) Procedure : registers a new pet owner (USER + USER_PHONE + PET_OWNER together)
-- Located at line 676.

--to check
EXEC add_pet_owner 35, '200112345678', 'Ravindu Senarath', 'ravindu.s@gmail.com', '10 Lake View', 'Colombo', '0771122334', 'OWN009';
GO

SELECT u.user_id, u.full_name, u.email, p.phone_number, o.owner_id, dbo.GetUserType(u.user_id) AS [User Type]
FROM [USER] u
INNER JOIN USER_PHONE p ON u.user_id = p.user_id
INNER JOIN PET_OWNER o ON u.user_id = o.user_id
WHERE u.user_id = 35;
GO

--same email again, so this must fail
EXEC add_pet_owner 36, '200198765432', 'Test User', 'ravindu.s@gmail.com', '1 Test Road', 'Colombo', '0770000000', 'OWN010';
GO

--to check (Tharaka moved to Colombo and added his first phone number)
EXEC update_owner_profile 28, 'tharaka.ranasinghe@gmail.com', '12 Galle Road', 'Colombo', '0754455667';
GO

SELECT u.user_id, u.full_name, u.email, u.street, u.city, p.phone_number
FROM [USER] u
LEFT OUTER JOIN USER_PHONE p ON u.user_id = p.user_id
WHERE u.user_id = 28;
GO

--amaya.j@gmail.com is the email of user 21, so this must fail
EXEC update_owner_profile 23, 'amaya.j@gmail.com', NULL, NULL, NULL;
GO

--to check 1 (Dachshund is a new breed, so it is saved in BREED first)
--to check 2 (Persian is already in BREED, so no species is needed)
EXEC register_pet 111, 'Milo', 'Dachshund', 'Dog', '2024-08-10', '0771122334', 35;
EXEC register_pet 112, 'Nala', 'Persian', NULL, '2025-02-01', '0754455667', 28;
GO

SELECT * FROM BREED WHERE breed = 'Dachshund';
SELECT * FROM PET_DETAILS WHERE pet_id IN (111, 112);
GO

--Lovebird is a new breed but no species is given, so this must fail
EXEC register_pet 113, 'Kiwi', 'Lovebird', NULL, '2025-05-05', NULL, 26;
GO

--the birthday is in the future, so this must fail
EXEC register_pet 113, 'Rex', 'Beagle', NULL, '2030-01-01', NULL, 21;
GO

--to check (Tweety had no emergency contact)
EXEC update_pet_profile 107, 26, NULL, '0715678926';
GO

SELECT pet_id, pet_name, emergency_contact, owner_user_id FROM PET WHERE pet_id = 107;
GO

--Bruno (101) belongs to owner 21, not 22, so this must fail
EXEC update_pet_profile 101, 22, 'Bruno Jr', NULL;
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check (Amaya already has Bruno the Labrador Retriever, so this must fail)
INSERT INTO PET VALUES (113, 'Bruno', 'Labrador Retriever', '2021-01-01', NULL, 21);
GO

--to check (no emergency contact is given for Snowy, so the phone number of owner 23 is saved)
INSERT INTO PET VALUES (113, 'Snowy', 'Holland Lop', '2025-11-02', NULL, 23);
GO

SELECT * FROM PET_DETAILS WHERE pet_id = 113;
GO

--==================================================================
-- FUNCTION 02 : APPOINTMENT AND BOOKING MANAGEMENT : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a.) Simple SELECT : appointments that have not started yet (waiting or confirmed)
SELECT appointment_id, appointment_date, time_slot, status
FROM APPOINTMENT
WHERE status IN ('Scheduled', 'Pending', 'Confirmed')
ORDER BY appointment_date, time_slot;
GO

--b.) INNER JOIN : appointment details with pet, owner and vet (USER is joined twice)
SELECT a.appointment_id, a.appointment_date, a.time_slot, p.pet_name,
       o.full_name AS Owner, v.full_name AS Veterinarian, a.status
FROM APPOINTMENT a
INNER JOIN PET p ON a.pet_id = p.pet_id
INNER JOIN [USER] o ON a.owner_user_id = o.user_id
INNER JOIN [USER] v ON a.vet_user_id = v.user_id
ORDER BY a.appointment_date;
GO

--c.) LEFT OUTER JOIN : September appointments and the staff member who handled them (NULL = no staff yet)
SELECT a.appointment_id, a.appointment_date, a.status, u.full_name AS [Handled By]
FROM APPOINTMENT a
LEFT OUTER JOIN [USER] u ON a.staff_user_id = u.user_id
WHERE a.appointment_date BETWEEN '2026-09-01' AND '2026-09-30'
ORDER BY a.appointment_date;
GO

--d.) Aggregation : total appointments, first and last appointment date
SELECT COUNT(appointment_id) AS [Total Appointments],
       MIN(appointment_date) AS [First Appointment],
       MAX(appointment_date) AS [Last Appointment]
FROM APPOINTMENT;
GO

--e.) GROUP BY : number of appointments in each status
SELECT status, COUNT(appointment_id) AS [No. of Appointments]
FROM APPOINTMENT
GROUP BY status
ORDER BY COUNT(appointment_id) DESC;
GO

--f.) GROUP BY / HAVING : vets who have more than 2 appointments
SELECT u.user_id, u.full_name AS Veterinarian, COUNT(a.appointment_id) AS [No. of Appointments]
FROM APPOINTMENT a
INNER JOIN [USER] u ON a.vet_user_id = u.user_id
GROUP BY u.user_id, u.full_name
HAVING COUNT(a.appointment_id) > 2;
GO

--g.) Subquery (NOT IN) : pet owners who have never booked an appointment
SELECT user_id, full_name
FROM [USER]
WHERE user_id IN (SELECT user_id FROM PET_OWNER)
  AND user_id NOT IN (SELECT owner_user_id
                      FROM APPOINTMENT);
GO

--h.) Subquery (ALL) : the vet(s) with the highest number of appointments
SELECT u.user_id, u.full_name AS Veterinarian, COUNT(a.appointment_id) AS [No. of Appointments]
FROM APPOINTMENT a
INNER JOIN [USER] u ON a.vet_user_id = u.user_id
GROUP BY u.user_id, u.full_name
HAVING COUNT(a.appointment_id) >= ALL (SELECT COUNT(appointment_id)
                                       FROM APPOINTMENT
                                       GROUP BY vet_user_id);
GO

--i.) Subquery (EXISTS) : owners who have at least one cancelled or no-show appointment
SELECT u.full_name, u.email
FROM [USER] u
WHERE EXISTS (SELECT 1
              FROM APPOINTMENT a
              WHERE a.owner_user_id = u.user_id
                AND a.status IN ('Cancelled', 'NoShow'));
GO

--j.) INNER JOIN : payments of appointments with the pet and the owner
SELECT pay.payment_id, a.appointment_date, p.pet_name, u.full_name AS Owner, pay.amount, pay.payment_method
FROM PAYMENT pay
INNER JOIN APPOINTMENT a ON pay.appointment_id = a.appointment_id
INNER JOIN PET p ON a.pet_id = p.pet_id
INNER JOIN [USER] u ON a.owner_user_id = u.user_id
ORDER BY a.appointment_date;
GO

--k.) GROUP BY / HAVING : owners who paid more than Rs. 3000 in total for appointments
SELECT u.user_id, u.full_name AS Owner, COUNT(pay.payment_id) AS [No. of Payments], SUM(pay.amount) AS [Total Paid]
FROM PAYMENT pay
INNER JOIN APPOINTMENT a ON pay.appointment_id = a.appointment_id
INNER JOIN [USER] u ON a.owner_user_id = u.user_id
GROUP BY u.user_id, u.full_name
HAVING SUM(pay.amount) > 3000;
GO

SELECT * FROM vet_schedule_view
ORDER BY appointment_date, time_slot;
GO

--------------------------------------------------
-- Part C Negative Test Proofs (Must Fail Checks)
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a payment that is for nothing breaks check_payment_for, so this must fail
INSERT INTO PAYMENT VALUES (899, 500.00, '2026-09-24', 'Cash', NULL, NULL, NULL);
GO

--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check
SELECT dbo.GetVetAppointmentCount(18, '2026-09-24') AS [Dr. Ravindu on 2026-09-24];
SELECT user_id, dbo.GetVetAppointmentCount(user_id, '2026-09-24') AS [Appointments on 2026-09-24]
FROM VETERINARIAN;
GO

--to check (Dr. Asela has appointment 211 at 11:30 on 2026-09-28)
SELECT dbo.IsVetAvailable(16, '2026-09-28', '11:30') AS [Free at 11:30], dbo.IsVetAvailable(16, '2026-09-28', '14:00') AS [Free at 14:00];
GO

--to check 1 (the time slot is free, so the appointment is saved as Pending)
EXEC book_appointment 216, '2026-12-07', '09:00', 102, 17;
GO

SELECT * FROM APPOINTMENT WHERE appointment_id = 216;
GO

--to check 2 (Dr. Shanika already has appointment 216 at this time, so this must fail)
EXEC book_appointment 217, '2026-12-07', '09:00', 104, 17;
GO

--to check 3 (the date is over, so this must fail)
EXEC book_appointment 217, '2026-08-01', '10:00', 104, 20;
GO

--to check
EXEC confirm_appointment 216, 11;
GO

SELECT appointment_id, status, staff_user_id FROM APPOINTMENT WHERE appointment_id = 216;
GO

--appointment 201 is already Completed, so this must fail
EXEC confirm_appointment 201, 11;
GO

--to check (Bruno arrives for appointment 211)
EXEC check_in_appointment 211;
GO

SELECT appointment_id, appointment_date, status FROM APPOINTMENT WHERE appointment_id = 211;
GO

--appointment 212 is only Scheduled (not confirmed yet), so this must fail
EXEC check_in_appointment 212;
GO

--to check (Rocky's appointment 214 moves from 2026-10-05 to 2026-12-08)
EXEC reschedule_appointment 214, '2026-12-08', '16:00';
GO

SELECT * FROM APPOINTMENT WHERE appointment_id = 214;
GO

--Dr. Shanika is busy with appointment 216 at this time, so this must fail
EXEC reschedule_appointment 214, '2026-12-07', '09:00';
GO

--to check
EXEC cancel_appointment 213;
GO

SELECT appointment_id, appointment_date, status FROM APPOINTMENT WHERE appointment_id = 213;
GO

--appointment 209 has already started (InRoom), so this must fail
EXEC cancel_appointment 209;
GO

--to check (215 was a Pending request for 2026-09-18, 214 is Pending for a future date)
SELECT appointment_id, appointment_date, status FROM APPOINTMENT WHERE status = 'Pending';
EXEC expire_pending_appointments;
SELECT appointment_id, appointment_date, status FROM APPOINTMENT WHERE appointment_id IN (214, 215);
GO

--to check (run the block below together)
DECLARE @total INT, @completed INT
EXEC get_vet_appointment_stats 16, @total OUTPUT, @completed OUTPUT
SELECT @total AS [Total Appointments], @completed AS [Completed Appointments];
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check 1 (pet 101 belongs to owner 21, not 22, so this must fail)
INSERT INTO APPOINTMENT VALUES (217, '2026-12-09', '10:00', 'Scheduled', NULL, 101, 22, 18);
GO

--to check 2 (Dr. Ravindu already has appointment 209 at 10:00 on 2026-09-24, so this must fail)
INSERT INTO APPOINTMENT VALUES (217, '2026-09-24', '10:00', 'Scheduled', NULL, 106, 25, 18);
GO

--to check 3 (a correct appointment is accepted)
INSERT INTO APPOINTMENT VALUES (217, '2026-12-09', '10:00', 'Scheduled', 11, 101, 21, 18);
GO

SELECT * FROM APPOINTMENT WHERE appointment_id = 217;
GO

--to check (214 is confirmed and 216 is moved to another day, so owners 22 and 21 get notifications)
EXEC confirm_appointment 214, 15;
EXEC reschedule_appointment 216, '2026-12-10', '11:00';
GO

SELECT * FROM NOTIFICATION WHERE user_id IN (21, 22);
GO

--to check (appointment 211 is not Completed yet, so this must fail; a correct payment is shown in Function 04)
INSERT INTO PAYMENT VALUES (813, 3000.00, '2026-09-24', 'Card', NULL, 211, NULL);
GO

--==================================================================
-- FUNCTION 03 : PET RESCUE AND ADOPTION MANAGEMENT : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a.) Simple SELECT : rescued pets that are available for adoption
SELECT case_id, rescued_pet_no, rescue_status, foster_id
FROM RESCUED_PET
WHERE rescue_status = 'Available';
GO

--b.) IS NULL : rescue cases reported by the public (no pet owner linked)
SELECT case_id, location, date, animal_condition
FROM RESCUE_CASE
WHERE owner_user_id IS NULL;
GO

--c.) JOIN : rescue cases with the officer and the owner who reported it (LEFT JOIN keeps public reports)
SELECT rc.case_id, rc.location, rc.date, rc.status, o.full_name AS [Rescue Officer], r.full_name AS [Reported By]
FROM RESCUE_CASE rc
INNER JOIN [USER] o ON rc.officer_user_id = o.user_id
LEFT OUTER JOIN [USER] r ON rc.owner_user_id = r.user_id
ORDER BY rc.date;
GO

--d.) INNER JOIN (composite key) : adoption applications with applicant and rescue location
SELECT a.application_id, u.full_name AS Applicant, rc.location AS [Rescued From],
       rp.rescued_pet_no, a.status, a.adoption_fee
FROM ADOPTION_APPLICATION a
INNER JOIN [USER] u ON a.owner_user_id = u.user_id
INNER JOIN RESCUED_PET rp ON a.case_id = rp.case_id
                         AND a.rescued_pet_no = rp.rescued_pet_no
INNER JOIN RESCUE_CASE rc ON rp.case_id = rc.case_id
ORDER BY a.application_date;
GO

--e.) LEFT OUTER JOIN + GROUP BY : foster homes, the officer who arranged them and how many pets they care for now (0 if none)
SELECT f.foster_id, f.foster_name, u.full_name AS [Arranged By], COUNT(rp.rescued_pet_no) AS [Pets in Care]
FROM FOSTER_CARE f
INNER JOIN [USER] u ON f.officer_user_id = u.user_id
LEFT OUTER JOIN RESCUED_PET rp ON f.foster_id = rp.foster_id
                              AND rp.rescue_status <> 'Adopted'
GROUP BY f.foster_id, f.foster_name, u.full_name;
GO

--f.) Aggregation : number of rescue cases and the first / last rescue date
SELECT COUNT(case_id) AS [No. of Cases], MIN(date) AS [First Rescue], MAX(date) AS [Latest Rescue]
FROM RESCUE_CASE;
GO

--g.) GROUP BY : number of adoption applications and total fee in each status
SELECT status, COUNT(application_id) AS [No. of Applications], SUM(adoption_fee) AS [Total Fee]
FROM ADOPTION_APPLICATION
GROUP BY status;
GO

--h.) GROUP BY / HAVING : rescue officers who handle more than one case
SELECT u.user_id, u.full_name AS [Rescue Officer], COUNT(rc.case_id) AS [No. of Cases]
FROM RESCUE_CASE rc
INNER JOIN [USER] u ON rc.officer_user_id = u.user_id
GROUP BY u.user_id, u.full_name
HAVING COUNT(rc.case_id) > 1;
GO

--i.) GROUP BY : number of rescued pets in each rescue status
SELECT rescue_status, COUNT(*) AS [No. of Pets]
FROM RESCUED_PET
GROUP BY rescue_status
ORDER BY COUNT(*) DESC;
GO

--j.) Subquery (NOT EXISTS, composite key) : rescued pets that have no adoption application
SELECT rp.case_id, rp.rescued_pet_no, rp.rescue_status
FROM RESCUED_PET rp
WHERE NOT EXISTS (SELECT 1
                  FROM ADOPTION_APPLICATION a
                  WHERE a.case_id = rp.case_id
                    AND a.rescued_pet_no = rp.rescued_pet_no);
GO

--k.) Subquery (IN) : pet owners who reported a rescue case and also applied to adopt a pet
SELECT user_id, full_name, email
FROM [USER]
WHERE user_id IN (SELECT owner_user_id FROM RESCUE_CASE)
  AND user_id IN (SELECT owner_user_id FROM ADOPTION_APPLICATION);
GO

--l.) INNER JOIN : adoption fees that have been paid (R3 : payments that are for an adoption application)
SELECT p.payment_id, p.payment_date, a.application_id, u.full_name AS Adopter, a.adoption_fee, p.amount, p.payment_method
FROM PAYMENT p
INNER JOIN ADOPTION_APPLICATION a ON p.application_id = a.application_id
INNER JOIN [USER] u ON a.owner_user_id = u.user_id;
GO

SELECT * FROM adoption_status_view
WHERE application_status IN ('SUBMITTED', 'UNDER_REVIEW');
GO

--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check (the adoption listing with the number of people waiting for each pet)
SELECT case_id, rescued_pet_no, rescue_status, dbo.GetOpenApplicationCount(case_id, rescued_pet_no) AS [Open Applications]
FROM RESCUED_PET
WHERE rescue_status = 'Available';
GO

--to check (a public report with three puppies)
EXEC register_rescue_case 1107, 'Kollupitiya Junction', '2026-09-22', 'Three puppies found in a drain', NULL, 31, 3;
GO

SELECT * FROM RESCUE_CASE WHERE case_id = 1107;
SELECT * FROM RESCUED_PET WHERE case_id = 1107;
GO

--Negombo Beach on 2026-08-21 is already case 1104, so this must fail
EXEC register_rescue_case 1108, 'Negombo Beach', '2026-08-21', 'Abandoned kittens', 27, 31, 2;
GO

--to check
EXEC assign_foster_care 1107, 1, 1204;
EXEC assign_foster_care 1103, 1, 1201;
GO

SELECT * FROM RESCUED_PET WHERE case_id IN (1103, 1107);
GO

--pet 1 of case 1101 is already adopted, so this must fail
EXEC assign_foster_care 1101, 1, 1202;
GO

--to check
EXEC list_pet_for_adoption 1102, 3;
GO

SELECT * FROM RESCUED_PET WHERE case_id = 1102;
GO

--pet 1 of case 1105 is still in treatment, so this must fail
EXEC list_pet_for_adoption 1105, 1;
GO

--to check (pet 3 of case 1102 was listed in E4)
EXEC submit_adoption_application 1308, 23, 1102, 3, 1500.00, 'Has a large garden';
GO

SELECT * FROM ADOPTION_APPLICATION WHERE application_id = 1308;
GO

--owner 24 already has the open application 1303 for this pet, so this must fail
EXEC submit_adoption_application 1309, 24, 1102, 1, 1500.00, NULL;
GO

--==================================================================
-- CHECK QUERIES FOR E6
--==================================================================

-- to check 1: Normal approval (1303 and 1307 are both for pet 1 of case 1102)
-- 1303 should become APPROVED, 1307 should automatically become REJECTED, pet becomes 'Adopted'
EXEC approve_adoption 1303, 30;
GO

SELECT application_id, status, decision_date, officer_user_id 
FROM ADOPTION_APPLICATION 
WHERE application_id IN (1303, 1307);

SELECT * FROM RESCUED_PET WHERE case_id = 1102 AND rescued_pet_no = 1;
GO

-- to check 2: Application already decided (1301 is already APPROVED, so this must fail)
EXEC approve_adoption 1301, 29;
GO

-- to check 3: Double Adoption Prevention Test
-- Create a dummy pending application for an ALREADY ADOPTED pet (case 1102, pet 1)
-- Attempting to approve it MUST FAIL with: "This rescued pet is no longer available for adoption"
INSERT INTO ADOPTION_APPLICATION (application_id, application_date, status, adoption_fee, owner_user_id, case_id, rescued_pet_no)
VALUES (1399, GETDATE(), 'SUBMITTED', 1500.00, 21, 1102, 1);
GO

EXEC approve_adoption 1399, 30;
GO

-- Clean up test application
DELETE FROM ADOPTION_APPLICATION WHERE application_id = 1399;
GO

--to check
EXEC reject_adoption 1304, 30, 'Lives in a small flat, the dog needs a garden';
GO

SELECT application_id, status, decision_date, notes, officer_user_id FROM ADOPTION_APPLICATION WHERE application_id = 1304;
GO

--1302 was already rejected, so this must fail
EXEC reject_adoption 1302, 29, 'Test';
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check 1 (pet 1 of case 1102 was adopted in Part E, so this must fail)
INSERT INTO ADOPTION_APPLICATION VALUES (1309, '2026-09-20', 'SUBMITTED', NULL, 1500.00, NULL, 25, 1102, 1, NULL);
GO

--to check 2 (pet 1 of case 1105 is still in treatment, so this must fail)
INSERT INTO ADOPTION_APPLICATION VALUES (1309, '2026-09-20', 'SUBMITTED', NULL, 1500.00, NULL, 25, 1105, 1, NULL);
GO

--to check 3 (pet 1 of case 1104 is available, so a second application is accepted)
INSERT INTO ADOPTION_APPLICATION VALUES (1309, '2026-09-20', 'SUBMITTED', NULL, 1000.00, 'Has another cat', 25, 1104, 1, NULL);
GO

--to check (approving 1305 rejects 1309, and 1308 goes under review, so three applicants get a notification)
EXEC approve_adoption 1305, 31;
UPDATE ADOPTION_APPLICATION SET status = 'UNDER_REVIEW', officer_user_id = 30 WHERE application_id = 1308;
GO

SELECT * FROM NOTIFICATION WHERE user_id IN (21, 23, 25);
GO

--to check (case 1107 is Open, and case 1104 has one pet left to adopt)
SELECT case_id, location, status FROM RESCUE_CASE WHERE case_id IN (1104, 1107);
EXEC assign_foster_care 1107, 2, 1205;
EXEC submit_adoption_application 1310, 26, 1104, 2, 1000.00, 'Already has a cat at home';
EXEC approve_adoption 1310, 31;
GO

SELECT case_id, location, status FROM RESCUE_CASE WHERE case_id IN (1104, 1107);
SELECT * FROM RESCUED_PET WHERE case_id IN (1104, 1107);
GO

--to check 1 (1308 is only under review, so this must fail)
INSERT INTO PAYMENT VALUES (813, 1500.00, DEFAULT, 'Cash', NULL, NULL, 1308);
GO

--to check 2 (the fee of 1305 is Rs. 1000 but only Rs. 500 is paid, so this must fail)
INSERT INTO PAYMENT VALUES (813, 500.00, DEFAULT, 'Cash', NULL, NULL, 1305);
GO

--to check 3 (the full fee of the approved application 1305 is accepted, DEFAULT gives today's date)
INSERT INTO PAYMENT VALUES (813, 1000.00, DEFAULT, 'Cash', NULL, NULL, 1305);
GO

SELECT * FROM PAYMENT WHERE application_id IS NOT NULL;
SELECT * FROM adoption_status_view;
GO

--==================================================================
-- FUNCTION 04 : PET SERVICES AND HEALTH MANAGEMENT : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a.) Simple SELECT (LIKE) : records where the diagnosis is an infection
SELECT record_id, diagnosis, treatment_plan
FROM MEDICAL_RECORD
WHERE diagnosis LIKE '%infection%';
GO

--b.) IS NULL : records that were not made through an appointment (walk-in)
SELECT record_id, diagnosis, pet_id
FROM MEDICAL_RECORD
WHERE appointment_id IS NULL;
GO

--c.) DISTINCT : different medicines that have been prescribed (each name shown once)
SELECT DISTINCT medication
FROM PRESCRIPTION_MEDICATION
ORDER BY medication;
GO

--d.) INNER JOIN : consultation history with date, pet and vet
SELECT m.record_id, a.appointment_date, p.pet_name, u.full_name AS Veterinarian, m.diagnosis, m.treatment_plan
FROM MEDICAL_RECORD m
INNER JOIN APPOINTMENT a ON m.appointment_id = a.appointment_id
INNER JOIN PET p ON m.pet_id = p.pet_id
INNER JOIN [USER] u ON a.vet_user_id = u.user_id
ORDER BY a.appointment_date;
GO

--e.) INNER JOIN (4 tables, composite key) : medicines prescribed for each pet
SELECT p.pet_name, m.record_id, m.diagnosis, pr.prescription_id, pm.medication
FROM PET p
INNER JOIN MEDICAL_RECORD m ON p.pet_id = m.pet_id
INNER JOIN PRESCRIPTION pr ON m.record_id = pr.record_id
INNER JOIN PRESCRIPTION_MEDICATION pm ON pr.record_id = pm.record_id
                                    AND pr.prescription_id = pm.prescription_id
ORDER BY p.pet_name;
GO

--f.) JOIN + BETWEEN : vaccinations due in October 2026 (reminder list for owners)
SELECT p.pet_name, v.vaccine_name, v.next_due_date, u.full_name AS [Owner Name]
FROM VACCINATION v
INNER JOIN PET p ON v.pet_id = p.pet_id
INNER JOIN [USER] u ON p.owner_user_id = u.user_id
WHERE v.next_due_date BETWEEN '2026-10-01' AND '2026-10-31'
ORDER BY v.next_due_date;
GO

--g.) LEFT OUTER JOIN : medical records that have no prescription
SELECT m.record_id, m.diagnosis, pr.prescription_id
FROM MEDICAL_RECORD m
LEFT OUTER JOIN PRESCRIPTION pr ON m.record_id = pr.record_id
WHERE pr.prescription_id IS NULL;
GO

--h.) LEFT OUTER JOIN : pets that have no vaccination record yet
SELECT p.pet_id, p.pet_name, p.breed
FROM PET p
LEFT OUTER JOIN VACCINATION v ON p.pet_id = v.pet_id
WHERE v.pet_id IS NULL;
GO

--i.) Aggregation : records that have a prescription and the number of medicines
SELECT COUNT(DISTINCT record_id) AS [Records with a Prescription],
       COUNT(medication) AS [Medicines Prescribed],
       COUNT(DISTINCT medication) AS [Different Medicines]
FROM PRESCRIPTION_MEDICATION;
GO

--j.) GROUP BY / HAVING : prescriptions that have more than one medicine
SELECT pr.record_id, pr.prescription_id, pr.notes, COUNT(pm.medication) AS [No. of Medicines]
FROM PRESCRIPTION pr
INNER JOIN PRESCRIPTION_MEDICATION pm ON pr.record_id = pm.record_id
                                    AND pr.prescription_id = pm.prescription_id
GROUP BY pr.record_id, pr.prescription_id, pr.notes
HAVING COUNT(pm.medication) > 1;
GO

--k.) GROUP BY : number of consultations done by each vet
SELECT u.user_id, u.full_name AS Veterinarian, COUNT(m.record_id) AS Consultations
FROM MEDICAL_RECORD m
INNER JOIN APPOINTMENT a ON m.appointment_id = a.appointment_id
INNER JOIN [USER] u ON a.vet_user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY COUNT(m.record_id) DESC;
GO

--l.) Nested subquery (IN) : pets that were prescribed 'Amoxicillin 250mg'
SELECT pet_id, pet_name, breed
FROM PET
WHERE pet_id IN (SELECT pet_id
                 FROM MEDICAL_RECORD
                 WHERE record_id IN (SELECT record_id
                                     FROM PRESCRIPTION_MEDICATION
                                     WHERE medication = 'Amoxicillin 250mg'));
GO

--m.) Subquery (NOT EXISTS) : pets that have never been given a prescription
SELECT p.pet_id, p.pet_name
FROM PET p
WHERE NOT EXISTS (SELECT 1
                  FROM MEDICAL_RECORD m
                  INNER JOIN PRESCRIPTION pr ON m.record_id = pr.record_id
                  WHERE m.pet_id = p.pet_id);
GO

--n.) Nested subquery (IN) : owners who have a pet with an overdue vaccine (latest due date of that vaccine is over)
SELECT full_name, email
FROM [USER]
WHERE user_id IN (SELECT owner_user_id
                  FROM PET
                  WHERE pet_id IN (SELECT pet_id
                                   FROM VACCINATION
                                   GROUP BY pet_id, vaccine_name
                                   HAVING DATEDIFF(DAY, MAX(next_due_date), GETDATE()) > 0));
GO

--o.) BETWEEN : services that cost between Rs. 1000 and Rs. 3000
SELECT service_name, price
FROM SERVICE
WHERE price BETWEEN 1000 AND 3000
ORDER BY price DESC;
GO

--p.) Subquery (ALL) : services that cost more than every service of Nimal Perera
SELECT service_name, price
FROM SERVICE
WHERE price > ALL (SELECT price
                   FROM SERVICE
                   WHERE provider_user_id = (SELECT user_id
                                             FROM [USER]
                                             WHERE email = 'nimal.perera@gmail.com'));
GO

--q.) GROUP BY : number of services and the average price of each pet care provider
SELECT u.user_id, u.full_name AS [Pet Care Provider], COUNT(s.service_id) AS [No. of Services], AVG(s.price) AS [Average Price]
FROM SERVICE s
INNER JOIN [USER] u ON s.provider_user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY COUNT(s.service_id) DESC;
GO

SELECT * FROM prescription_details_view
WHERE pet_name = 'Simba';
GO

--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check
SELECT pet_id, pet_name, dbo.GetVaccinationStatus(pet_id) AS [Vaccination Status]
FROM PET;
GO

--to check
SELECT pet_id, pet_name, dbo.GetNextVaccinationDue(pet_id) AS [Next Vaccination Due]
FROM PET;
GO

--to check
SELECT pet_id, pet_name, dbo.GetMedicationCount(pet_id) AS [Medicines Prescribed]
FROM PET;
GO

--to check (Tweety has no vaccinations, so it gets no. 1 / Bruno already has 2, so he gets no. 3)
EXEC add_vaccination 107, 'Avian Polyomavirus', '2027-02-14';
EXEC add_vaccination 101, 'Leptospirosis', '2027-04-01';
GO

SELECT * FROM VACCINATION WHERE pet_id IN (101, 107);
GO

--pet 150 does not exist, so this must fail
EXEC add_vaccination 150, 'Rabies', '2027-01-01';
GO

--to check (a walk-in visit of Coco, no appointment)
EXEC add_medical_record 309, NULL, 104, 'Overgrown front teeth', 'Teeth trimming', 'Walk-in visit';
GO

SELECT * FROM MEDICAL_RECORD WHERE record_id = 309;
GO

--appointment 299 does not exist, so this must fail
EXEC add_medical_record 310, 299, NULL, 'General check-up', NULL, NULL;
GO

--to check 1 (record 303 has no prescription, so it gets no. 1 / record 302 already has 2, so it gets no. 3)
EXEC add_prescription 303, 'Deworming tablet once', 'Drontal Plus';
EXEC add_prescription 302, 'Apply on the dry skin', 'Aloe Vera Gel';
GO

SELECT * FROM prescription_details_view WHERE record_id IN (302, 303);
GO

--to check 2 (record 399 does not exist, so this must fail)
EXEC add_prescription 399, 'Test', 'Test Medicine';
GO

--to check
EXEC add_medication 306, 1, 'Glucosamine Chews';
GO

SELECT * FROM prescription_details_view WHERE record_id = 306;
GO

--Amoxicillin 250mg is already in prescription 1 of record 301, so this must fail
EXEC add_medication 301, 1, 'Amoxicillin 250mg';
GO

--to check (Bruno has one appointment record and one walk-in record)
EXEC get_pet_medical_history 101;
GO

--to check (boarding and daycare services are added)
EXEC add_service 509, 'Pet Boarding (per night)', 4000.00, 3;
EXEC add_service 510, 'Puppy Daycare (per day)', 2500.00, 2;
GO

SELECT * FROM SERVICE WHERE service_id IN (509, 510);
GO

--user 16 is a veterinarian, not a pet care provider, so this must fail
EXEC add_service 511, 'Dog Walking (30 minutes)', 1000.00, 16;
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check 1 (Oscar was born on 2025-06-20, so this must fail)
INSERT INTO VACCINATION VALUES (110, 3, 'Parvovirus', '2025-01-01');
GO

--to check 2 (a correct due date is accepted)
INSERT INTO VACCINATION VALUES (110, 3, 'Parvovirus', '2026-12-20');
GO

SELECT * FROM VACCINATION WHERE pet_id = 110;
GO

--to check 1 (appointment 205 was cancelled, so this must fail)
INSERT INTO MEDICAL_RECORD VALUES (310, 'General check-up', 'None', NULL, 205, 102);
GO

--to check 2 (appointment 209 is for Max (105), not Bella (109), so this must fail)
INSERT INTO MEDICAL_RECORD VALUES (310, 'General check-up', 'None', NULL, 209, 109);
GO

--to check 3 (correct record through the procedure, appointment 209 changes from InRoom to Completed)
SELECT appointment_id, status FROM APPOINTMENT WHERE appointment_id = 209;
EXEC add_medical_record 310, 209, NULL, 'Mild fever', 'Paracetamol syrup for 3 days', 'Drink plenty of water';
GO

SELECT appointment_id, status FROM APPOINTMENT WHERE appointment_id = 209;
SELECT * FROM MEDICAL_RECORD WHERE record_id = 310;
GO

--to check 4 (209 is Completed now, so trg_Payment_CheckAppointment of Function 02 accepts its payment)
INSERT INTO PAYMENT VALUES (814, 3500.00, '2026-09-24', 'Cash', NULL, 209, NULL);
GO

SELECT * FROM PAYMENT WHERE appointment_id = 209;
SELECT * FROM NOTIFICATION WHERE user_id = 24;
GO

--to check (Coco gets a new vaccination, so owner 23 gets a reminder)
EXEC add_vaccination 104, 'Myxomatosis', '2027-03-01';
GO

SELECT * FROM VACCINATION WHERE pet_id = 104;
SELECT * FROM NOTIFICATION WHERE user_id = 23;
GO

--==================================================================
-- FUNCTION 05 : INVENTORY MANAGEMENT : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a.) Simple SELECT : items that are below the minimum stock level (reorder list)
SELECT item_id, item_name, stock_qty, min_stock
FROM INVENTORY_ITEM
WHERE stock_qty < min_stock
ORDER BY stock_qty ASC;
GO

--b.) LIKE : vaccines in the store and their stock
SELECT item_id, item_name, stock_qty, unit_price
FROM INVENTORY_ITEM
WHERE item_name LIKE '%Vaccine%';
GO

--c.) INNER JOIN : inventory items with the supplier, the staff member who manages them and the manager who oversees them
SELECT i.item_name, s.supplier_name, st.full_name AS [Managed By], mg.full_name AS [Overseen By]
FROM INVENTORY_ITEM i
INNER JOIN SUPPLIER s ON i.supplier_id = s.supplier_id
INNER JOIN [USER] st ON i.staff_user_id = st.user_id
INNER JOIN [USER] mg ON i.manager_user_id = mg.user_id
ORDER BY i.item_name;
GO

--d.) LEFT OUTER JOIN : every supplier with the items it supplies (NULL = no item yet)
SELECT s.supplier_id, s.supplier_name, s.contact_phone, i.item_name
FROM SUPPLIER s
LEFT OUTER JOIN INVENTORY_ITEM i ON s.supplier_id = i.supplier_id
ORDER BY s.supplier_id;
GO

--e.) Aggregation : number of items, total units and the total value of the stock
SELECT COUNT(item_id) AS [No. of Items], SUM(stock_qty) AS [Total Units],
       SUM(stock_qty * unit_price) AS [Stock Value], AVG(unit_price) AS [Average Unit Price]
FROM INVENTORY_ITEM;
GO

--f.) GROUP BY : number of items and units each clinic staff member looks after
SELECT u.user_id, u.full_name AS [Staff Member], COUNT(i.item_id) AS [No. of Items], SUM(i.stock_qty) AS Units
FROM INVENTORY_ITEM i
INNER JOIN [USER] u ON i.staff_user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY COUNT(i.item_id) DESC;
GO

--g.) GROUP BY / HAVING : suppliers who supply more than one item, with the stock value and the manager who maintains them
SELECT s.supplier_id, s.supplier_name, u.full_name AS [Maintained By],
       COUNT(i.item_id) AS [No. of Items], SUM(i.stock_qty * i.unit_price) AS [Stock Value]
FROM SUPPLIER s
INNER JOIN [USER] u ON s.manager_user_id = u.user_id
INNER JOIN INVENTORY_ITEM i ON s.supplier_id = i.supplier_id
GROUP BY s.supplier_id, s.supplier_name, u.full_name
HAVING COUNT(i.item_id) > 1;
GO

--h.) Subquery (single row) : items that cost more than the average unit price
SELECT item_name, unit_price
FROM INVENTORY_ITEM
WHERE unit_price > (SELECT AVG(unit_price)
                    FROM INVENTORY_ITEM)
ORDER BY unit_price DESC;
GO

--i.) Subquery (IN) : suppliers to contact now (they supply an item that is below the minimum stock)
SELECT supplier_name, contact_email, contact_phone
FROM SUPPLIER
WHERE supplier_id IN (SELECT supplier_id
                      FROM INVENTORY_ITEM
                      WHERE stock_qty < min_stock);
GO

--j.) Subquery (ALL) : the item that has the highest stock value
SELECT item_name, stock_qty, unit_price, stock_qty * unit_price AS [Stock Value]
FROM INVENTORY_ITEM
WHERE stock_qty * unit_price >= ALL (SELECT stock_qty * unit_price
                                     FROM INVENTORY_ITEM);
GO

--k.) Subquery (NOT EXISTS) : suppliers who do not supply any item yet
SELECT s.supplier_id, s.supplier_name
FROM SUPPLIER s
WHERE NOT EXISTS (SELECT 1
                  FROM INVENTORY_ITEM i
                  WHERE i.supplier_id = s.supplier_id);
GO

SELECT * FROM inventory_view
WHERE managed_by = 'Chathura Weerasinghe';
GO

--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check
SELECT item_id, item_name, stock_qty, min_stock, dbo.GetStockStatus(item_id) AS [Stock Status]
FROM INVENTORY_ITEM;
GO

--to check (906 does not supply any item yet, so its value is 0)
SELECT supplier_id, supplier_name, dbo.GetSupplierStockValue(supplier_id) AS [Stock Value]
FROM SUPPLIER;
GO

--to check (Ceylon Aqua Pets 906 had no item before)
EXEC add_inventory_item 1010, 'Aquarium Fish Food 100g', 40, 10, 550.00, 906, 10, 14;
GO

SELECT * FROM inventory_view WHERE item_id = 1010;
GO

--Cat Litter 5kg is already in the inventory, so this must fail
EXEC add_inventory_item 1011, 'Cat Litter 5kg', 10, 5, 1800.00, 903, 7, 14;
GO

--to check 1 (DHPP Vaccine is below its minimum stock)
SELECT item_id, item_name, stock_qty, min_stock FROM INVENTORY_ITEM WHERE item_id = 1002;
EXEC restock_item 1002, 30;
SELECT item_id, item_name, stock_qty, min_stock FROM INVENTORY_ITEM WHERE item_id = 1002;
GO

--to check 2 (quantity 0 is not allowed, so this must fail)
EXEC restock_item 1002, 0;
GO

--to check (5 bags of dog food were damaged)
SELECT item_id, item_name, stock_qty FROM INVENTORY_ITEM WHERE item_id = 1003;
EXEC remove_stock 1003, 5;
SELECT item_id, item_name, stock_qty FROM INVENTORY_ITEM WHERE item_id = 1003;
GO

--Bird Seed Mix has no stock left, so this must fail
EXEC remove_stock 1009, 10;
GO

--to check
EXEC update_supplier_contact 903, 'orders@happypaws.lk', '0812234466';
GO

SELECT * FROM SUPPLIER WHERE supplier_id = 903;
GO

--12345 is not a valid phone number, check_supplier_phone stops it, so this must fail
EXEC update_supplier_contact 903, NULL, '12345';
GO

--to check
EXEC get_supplier_items 902;
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--------------------------------------------------
-- Checks for Solution 1: STOCK_AUDIT Foreign Key
--------------------------------------------------

-- Check 1: Verify Audit logs are created on stock changes
EXEC restock_item 1003, 10;
EXEC remove_stock 1003, 2;

SELECT * FROM STOCK_AUDIT WHERE item_id = 1003;
GO

-- Check 2: Attempt to insert audit record with invalid/non-existent item_id (MUST FAIL)
-- Expected Error: Foreign key constraint violation (stock_audit_item_fk)
INSERT INTO STOCK_AUDIT (item_id, old_qty, new_qty, changed_date)
VALUES (9999, 10, 20, GETDATE());
GO

-- Check 3: Attempt to delete an inventory item that has audit records (MUST FAIL)
-- Expected Error: DELETE statement conflicted with the REFERENCE constraint (stock_audit_item_fk)
DELETE FROM INVENTORY_ITEM WHERE item_id = 1003;
GO

--------------------------------------------------
-- Checks for Solution 2: INVENTORY_ARCHIVE Trigger
--------------------------------------------------

-- Step 1: Add a temporary item for testing deletion
EXEC add_inventory_item 9999, 'Temp Test Product', 10, 5, 1200.00, 901, 6, 12;
GO

-- Step 2: Verify item was added and linked to supplier
SELECT i.item_id, i.item_name, s.supplier_name, s.contact_email, s.contact_phone
FROM INVENTORY_ITEM i
JOIN SUPPLIER s ON i.supplier_id = s.supplier_id
WHERE i.item_id = 9999;
GO

-- Step 3: Delete the item from INVENTORY_ITEM (Simulate manager deleting obsolete item)
DELETE FROM INVENTORY_ITEM WHERE item_id = 9999;
GO

-- Step 4: Verify item was deleted from active inventory (MUST return 0 rows)
SELECT * FROM INVENTORY_ITEM WHERE item_id = 9999;
GO

-- Step 5: Verify full snapshot of item + supplier details was saved into INVENTORY_ARCHIVE
SELECT * FROM INVENTORY_ARCHIVE WHERE item_id = 9999;
GO

--to check (Rabies Vaccine goes from 35 to 15, below its minimum of 20, so manager 6 and staff member 13 get an alert;
--the second removal sends no new alert because the stock was already below the minimum)
EXEC remove_stock 1001, 20;
EXEC remove_stock 1001, 2;
GO

SELECT * FROM NOTIFICATION WHERE user_id IN (6, 13);
SELECT * FROM STOCK_AUDIT WHERE item_id = 1001;
GO

--==================================================================
-- FUNCTION 06 : CUSTOMER FEEDBACK AND PACKAGE MANAGEMENT : Queries & Test Checks
--==================================================================

--------------------------------------------------
-- Part D : Analytical Queries
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--a.) Simple SELECT : packages a customer can choose, from the cheapest
SELECT package_id, package_name, package_price
FROM SERVICE_PACKAGE
ORDER BY package_price ASC;
GO

--b.) INNER JOIN : services in each package with the provider name
SELECT sp.package_name, s.service_name, s.price, u.full_name AS Provider
FROM SERVICE_PACKAGE sp
INNER JOIN INCLUDED_IN i ON sp.package_id = i.package_id
INNER JOIN SERVICE s ON i.service_id = s.service_id
INNER JOIN [USER] u ON s.provider_user_id = u.user_id
ORDER BY sp.package_name;
GO

--c.) LEFT OUTER JOIN : bookings with owner, provider and payment (NULL = not paid yet)
SELECT b.booking_id, b.booking_date, u.full_name AS Owner, pr.full_name AS Provider,
       sp.package_name, b.status, pay.amount AS [Paid Amount]
FROM SERVICE_BOOKING b
INNER JOIN [USER] u ON b.owner_user_id = u.user_id
LEFT OUTER JOIN [USER] pr ON b.provider_user_id = pr.user_id
INNER JOIN SERVICE_PACKAGE sp ON b.package_id = sp.package_id
LEFT OUTER JOIN PAYMENT pay ON b.booking_id = pay.booking_id
ORDER BY b.booking_id;
GO

--d.) LEFT OUTER JOIN + GROUP BY : clinic managers and how many service packages they manage (0 if none)
SELECT cm.manager_code, u.full_name AS [Clinic Manager], COUNT(sp.package_id) AS [No. of Packages]
FROM CLINIC_MANAGER cm
INNER JOIN [USER] u ON cm.user_id = u.user_id
LEFT OUTER JOIN SERVICE_PACKAGE sp ON cm.user_id = sp.manager_user_id
GROUP BY cm.manager_code, u.full_name
ORDER BY cm.manager_code;
GO

--e.) Aggregation : summary of all payments (bookings, appointments and adoption fees)
SELECT COUNT(payment_id) AS [No. of Payments], SUM(amount) AS [Total Revenue],
       AVG(amount) AS [Average Payment], MAX(amount) AS [Highest Payment], MIN(amount) AS [Lowest Payment]
FROM PAYMENT;
GO

--f.) GROUP BY : revenue from each payment method
SELECT payment_method, COUNT(payment_id) AS [No. of Payments], SUM(amount) AS [Total Amount]
FROM PAYMENT
GROUP BY payment_method
ORDER BY SUM(amount) DESC;
GO

--g.) GROUP BY / HAVING : packages that save the customer at least Rs. 500
SELECT sp.package_id, sp.package_name, sp.package_price, SUM(s.price) AS [Separate Price],
       SUM(s.price) - sp.package_price AS Saving
FROM SERVICE_PACKAGE sp
INNER JOIN INCLUDED_IN i ON sp.package_id = i.package_id
INNER JOIN SERVICE s ON i.service_id = s.service_id
GROUP BY sp.package_id, sp.package_name, sp.package_price
HAVING SUM(s.price) - sp.package_price >= 500;
GO

--h.) Aggregation : feedback summary for the manager
SELECT COUNT(feedback_id) AS [No. of Feedback], ROUND(AVG(rating * 1.0), 2) AS [Average Rating],
       MAX(rating) AS [Highest Rating], MIN(rating) AS [Lowest Rating]
FROM FEEDBACK;
GO

--i.) Subquery (NOT IN) : services that are not included in any package
SELECT service_id, service_name, price
FROM SERVICE
WHERE service_id NOT IN (SELECT service_id
                         FROM INCLUDED_IN);
GO

--j.) Subquery (total participation check) : packages that do not include any service (no rows = every package has a service)
SELECT package_id, package_name
FROM SERVICE_PACKAGE
WHERE package_id NOT IN (SELECT package_id
                         FROM INCLUDED_IN);
GO

--k.) Subquery (single row) : payments that are higher than the average payment
SELECT payment_id, amount, payment_method
FROM PAYMENT
WHERE amount > (SELECT AVG(amount)
                FROM PAYMENT);
GO

--l.) Subquery (single row) : feedback with a rating below the average rating
SELECT u.full_name, f.rating, f.comments
FROM FEEDBACK f
INNER JOIN [USER] u ON f.owner_user_id = u.user_id
WHERE f.rating < (SELECT AVG(rating * 1.0)
                  FROM FEEDBACK);
GO

--m.) Subquery (IN) : owners who made a complaint and also gave feedback
SELECT user_id, full_name, email
FROM [USER]
WHERE user_id IN (SELECT owner_user_id FROM COMPLAINT)
  AND user_id IN (SELECT owner_user_id FROM FEEDBACK);
GO

--n.) LEFT OUTER JOIN : complaints that are not resolved yet, who filed them and the manager checking them
SELECT c.complaint_id, c.date_filed, c.details, c.status, o.full_name AS [Filed By], m.full_name AS [Reviewed By]
FROM COMPLAINT c
INNER JOIN [USER] o ON c.owner_user_id = o.user_id
LEFT OUTER JOIN [USER] m ON c.manager_user_id = m.user_id
WHERE c.status <> 'Resolved';
GO

--o.) LEFT OUTER JOIN + GROUP BY : how many times each package was booked (most popular first)
SELECT sp.package_id, sp.package_name, COUNT(b.booking_id) AS [No. of Bookings]
FROM SERVICE_PACKAGE sp
LEFT OUTER JOIN SERVICE_BOOKING b ON sp.package_id = b.package_id
GROUP BY sp.package_id, sp.package_name
ORDER BY COUNT(b.booking_id) DESC, sp.package_id;
GO

SELECT * FROM booking_payment_view
WHERE paid_amount IS NULL;
GO

--------------------------------------------------
-- Part C Negative Test Proofs (Must Fail Checks)
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--one payment for a booking and an appointment together breaks check_payment_for, so this must fail
INSERT INTO PAYMENT VALUES (815, 1500.00, '2026-09-24', 'Card', 706, 205, NULL);
GO

--------------------------------------------------
-- Part E : Stored Procedure / Function Test Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check
SELECT package_id, package_name, package_price,
       dbo.GetPackageServiceTotal(package_id) AS [Separate Price],
       dbo.GetPackageServiceTotal(package_id) - package_price AS [Customer Saving]
FROM SERVICE_PACKAGE;
GO

--to check
SELECT cm.user_id, u.full_name AS [Clinic Manager], dbo.GetOpenComplaintCount(cm.user_id) AS [Open Complaints]
FROM CLINIC_MANAGER cm
INNER JOIN [USER] u ON cm.user_id = u.user_id;
GO

--to check 1 (Pet Photography 508 and Pet Boarding 509 are in no package, so each one starts a new package)
EXEC add_service_package 606, 'Pet Memories Pack', 3000.00, 10, 508;
EXEC add_service_package 607, 'Boarding Saver Pack', 3500.00, 8, 509;
GO

SELECT sp.package_id, sp.package_name, sp.package_price, s.service_name
FROM SERVICE_PACKAGE sp
INNER JOIN INCLUDED_IN i ON sp.package_id = i.package_id
INNER JOIN SERVICE s ON i.service_id = s.service_id
WHERE sp.package_id IN (606, 607);
GO

--to check 2 (service 599 does not exist, so this must fail)
EXEC add_service_package 608, 'Test Pack', 1000.00, 10, 599;
GO

--to check (Pet Taxi is added to the Pet Memories Pack)
EXEC add_service_to_package 606, 506;
GO

SELECT package_id, package_name, package_price, dbo.GetPackageServiceTotal(package_id) AS [Separate Price]
FROM SERVICE_PACKAGE
WHERE package_id = 606;
GO

--Full Grooming 502 is already in the Grooming Care Pack 601, so this must fail
EXEC add_service_to_package 601, 502;
GO

--------------------------------------------------
-- Check Queries for E5
--------------------------------------------------

-- Initial check: Package 603 price starts at 7500.00
SELECT package_id, package_name, package_price, base_price 
FROM SERVICE_PACKAGE 
WHERE package_id = 603;

-- First run: 10% off 7500.00 reduces package_price to 6750.00
EXEC apply_package_discount 603, 10;

SELECT package_id, package_name, package_price, base_price 
FROM SERVICE_PACKAGE 
WHERE package_id = 603;

-- Proof check: Running 10% discount a SECOND time stays 6750.00 (Proves error is fixed)
EXEC apply_package_discount 603, 10;

SELECT package_id, package_name, package_price, base_price 
FROM SERVICE_PACKAGE 
WHERE package_id = 603;
GO

-- Validation check: A 60% discount is too high, so this must fail
EXEC apply_package_discount 603, 60;
GO

--to check (607 has never been booked)
EXEC remove_service_package 607;
GO

SELECT * FROM SERVICE_PACKAGE WHERE package_id = 607;
SELECT * FROM INCLUDED_IN WHERE package_id = 607;
GO

--the Grooming Care Pack 601 has bookings, so this must fail
EXEC remove_service_package 601;
GO

--to check
EXEC book_package 708, 26, 603, 4;
GO

SELECT * FROM SERVICE_BOOKING WHERE booking_id = 708;
GO

--user 16 is a veterinarian, not a pet owner, so this must fail
EXEC book_package 709, 16, 603, 4;
GO

--to check 1 (provider 4 finishes their own confirmed booking 703 - Success)
EXEC update_booking_status 703, 4, 'Completed';
GO

SELECT booking_id, provider_user_id, status FROM SERVICE_BOOKING WHERE booking_id = 703;
GO

--to check 2 (provider 2 tries to update booking 707 owned by provider 1 - Must fail due to authorization)
EXEC update_booking_status 707, 2, 'Completed';
GO

--to check 3 (provider 3 tries to complete booking 705 which is still Pending - Must fail due to invalid status flow)
EXEC update_booking_status 705, 3, 'Completed';
GO

--to check (Sahan has two bookings)
EXEC get_booking_history 22;
GO

--to check
EXEC resolve_complaint 1503, 9;
GO

SELECT * FROM COMPLAINT WHERE complaint_id = 1503;
SELECT * FROM NOTIFICATION WHERE user_id = 25;
GO

--1501 is already resolved, so this must fail
EXEC resolve_complaint 1501, 6;
GO

--to check (1407 is an advertisement, so manager 8 removes it)
INSERT INTO FEEDBACK VALUES (1407, 1, 'Cheap pet food at www.example-shop.lk, visit now', 26);
EXEC remove_feedback 1407, 8;
GO

SELECT * FROM FEEDBACK WHERE feedback_id = 1407;
GO

--user 21 is a pet owner, not a clinic manager, so this must fail
EXEC remove_feedback 1401, 21;
GO

--------------------------------------------------
-- Part F : Trigger Verification Checks
--------------------------------------------------
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO
--to check (booking 705 is Pending before the payment)
SELECT booking_id, status FROM SERVICE_BOOKING WHERE booking_id = 705;
INSERT INTO PAYMENT VALUES (815, 6000.00, '2026-09-24', 'Card', 705, NULL, NULL);
GO

SELECT booking_id, status FROM SERVICE_BOOKING WHERE booking_id = 705;
GO

--to check 1 (Basic Hygiene Pack 605 would have no service left, so this must fail)
DELETE FROM INCLUDED_IN WHERE package_id = 605;
GO

--to check 2 (removing the package itself is allowed, ON DELETE CASCADE removes its rows in INCLUDED_IN)
EXEC remove_service_package 606;
GO

SELECT * FROM INCLUDED_IN WHERE package_id IN (605, 606);
GO

--to check 1 (provider 2 offers no service of the Basic Hygiene Pack 605, so this must fail)
EXEC book_package 709, 28, 605, 2;
GO

--to check 2 (provider 1 offers the services of 605, so the booking is accepted)
EXEC book_package 709, 28, 605, 1;
GO

SELECT * FROM SERVICE_BOOKING WHERE booking_id = 709;
GO

--to check 1 (owner 23 has no completed appointment or service, so this must fail)
INSERT INTO FEEDBACK VALUES (1408, 4, 'Looks like a nice clinic', 23);
GO

--to check 2 (owner 24 has completed appointments, so the feedback is accepted)
INSERT INTO FEEDBACK VALUES (1408, 5, 'The vet explained everything clearly', 24);
GO

SELECT * FROM FEEDBACK WHERE feedback_id = 1408;
GO

--to check (two new complaints go to two different managers)
SELECT cm.user_id, dbo.GetOpenComplaintCount(cm.user_id) AS [Open Complaints] FROM CLINIC_MANAGER cm;
INSERT INTO COMPLAINT (complaint_id, date_filed, details, owner_user_id) VALUES (1506, '2026-09-24', 'The groomer forgot to trim the nails', 24);
INSERT INTO COMPLAINT (complaint_id, date_filed, details, owner_user_id) VALUES (1507, '2026-09-24', 'Waited 40 minutes after the appointment time', 21);
GO

SELECT c.complaint_id, c.status, c.details, u.full_name AS [Assigned Manager]
FROM COMPLAINT c
INNER JOIN [USER] u ON c.manager_user_id = u.user_id
WHERE c.complaint_id IN (1506, 1507);
GO

SELECT *
FROM users;