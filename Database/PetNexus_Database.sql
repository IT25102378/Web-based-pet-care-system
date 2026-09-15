-- ===========================================================================
-- PetNexus - database schema
--
-- Generated from the live PetNexus database on 2026-09-15.
-- This file is the schema of record for the project. It is a structure-only
-- script: it creates the database, every table, and every key, constraint
-- and index on them. It inserts no rows, because the application seeds its own
-- demo data on first start.
--
-- To build a clean database, run this whole file against a SQL Server instance.
-- ===========================================================================

IF DB_ID('PetNexus') IS NULL
    CREATE DATABASE [PetNexus];
GO

USE [PetNexus];
GO

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE [dbo].[adoption_applications] (
    [application_id] varchar(255) NOT NULL,
    [applicant_name] varchar(255) NOT NULL,
    [applicant_phone] varchar(255) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [pet_name] varchar(255) NOT NULL,
    [review_notes] varchar(255) NULL,
    [reviewed_at] datetime2(7) NULL,
    [status] varchar(255) NOT NULL,
    [applicant_id] bigint NOT NULL,
    [case_id] bigint NOT NULL,
    [reviewed_by] bigint NULL,
    [applicant_address] varchar(500) NULL,
    [applicant_email] varchar(255) NULL,
    [daily_alone_hours] varchar(50) NULL,
    [has_fenced_yard] bit NULL,
    [has_other_pets] bit NULL,
    [housing_type] varchar(100) NULL,
    [occupation] varchar(150) NULL,
    [other_pets_details] varchar(1000) NULL,
    [pet_experience_years] int NULL,
    [reason_for_adoption] varchar(2000) NULL,
    [signature_data_url] varchar(MAX) NULL,
    [signed_at] datetime2(7) NULL,
    [terms_accepted] bit NULL,
    CONSTRAINT [PK__adoption__3BCBDCF25A028E88] PRIMARY KEY ([application_id]),
    CONSTRAINT [CK__adoption___statu__49C3F6B7] CHECK ([status]='CANCELLED' OR [status]='REJECTED' OR [status]='APPROVED' OR [status]='UNDER_REVIEW' OR [status]='SUBMITTED')
);
GO

CREATE TABLE [dbo].[adoption_listings] (
    [listing_id] varchar(255) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [is_published_for_adoption] bit NOT NULL,
    [updated_at] datetime2(7) NOT NULL,
    [case_id] bigint NOT NULL,
    CONSTRAINT [PK__adoption__89D817749CF6DF96] PRIMARY KEY ([listing_id]),
    CONSTRAINT [UKs3837mck1g3sg5akv9orth206] UNIQUE ([case_id])
);
GO

CREATE TABLE [dbo].[appointments] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [appointment_date] date NOT NULL,
    [appointment_id] varchar(20) NOT NULL,
    [breed] varchar(100) NULL,
    [cancellation_reason] varchar(500) NULL,
    [cancelled_at] datetime2(7) NULL,
    [created_at] datetime2(7) NOT NULL,
    [notes] varchar(2000) NULL,
    [owner_id] varchar(20) NULL,
    [owner_name] varchar(150) NOT NULL,
    [owner_phone] varchar(50) NULL,
    [pet_id] varchar(20) NULL,
    [pet_name] varchar(100) NOT NULL,
    [reason] varchar(1000) NULL,
    [reschedule_reason] varchar(500) NULL,
    [rescheduled_from_date] date NULL,
    [rescheduled_from_time_slot] varchar(30) NULL,
    [rescheduled_from_vet_name] varchar(150) NULL,
    [service_type] varchar(100) NOT NULL,
    [species] varchar(50) NULL,
    [status] varchar(30) NOT NULL,
    [symptoms] varchar(1000) NULL,
    [time_slot] varchar(30) NOT NULL,
    [token_number] varchar(20) NULL,
    [updated_at] datetime2(7) NULL,
    [vet_id] varchar(20) NULL,
    [vet_name] varchar(150) NOT NULL,
    [owner_fk_id] bigint NULL,
    [pet_fk_id] bigint NULL,
    [vet_fk_id] bigint NULL,
    CONSTRAINT [PK__appointm__3213E83F038E7360] PRIMARY KEY ([id]),
    CONSTRAINT [uk_appointments_appointment_id] UNIQUE ([appointment_id]),
    CONSTRAINT [CK__appointme__statu__4E88ABD4] CHECK ([status]='NoShow' OR [status]='Cancelled' OR [status]='Completed' OR [status]='InRoom' OR [status]='CheckedIn' OR [status]='Confirmed' OR [status]='Pending' OR [status]='Scheduled')
);
GO

CREATE TABLE [dbo].[approval_history] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [action] varchar(50) NOT NULL,
    [admin_id] varchar(20) NOT NULL,
    [history_id] varchar(30) NOT NULL,
    [reason] varchar(500) NULL,
    [timestamp] datetime2(7) NOT NULL,
    [user_full_name] varchar(150) NOT NULL,
    [user_id] varchar(20) NOT NULL,
    CONSTRAINT [PK__approval__3213E83FA6A2457E] PRIMARY KEY ([id])
);
GO

CREATE TABLE [dbo].[care_providers] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [active] bit NOT NULL,
    [contact_email] varchar(100) NULL,
    [contact_phone] varchar(20) NULL,
    [provider_id] varchar(20) NOT NULL,
    [provider_name] varchar(100) NOT NULL,
    [user_id] bigint NOT NULL,
    CONSTRAINT [PK__care_pro__3213E83FED4AD577] PRIMARY KEY ([id]),
    CONSTRAINT [uk_care_provider_user] UNIQUE ([user_id])
);
GO

CREATE TABLE [dbo].[care_service_logs] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [case_id] varchar(20) NULL,
    [created_at] date NOT NULL,
    [intake_condition] varchar(500) NULL,
    [notes] varchar(1000) NULL,
    [owner_id] varchar(20) NULL,
    [owner_name] varchar(100) NULL,
    [pet_id] varchar(20) NULL,
    [pet_name] varchar(100) NULL,
    [provider_id] varchar(20) NULL,
    [provider_name] varchar(100) NULL,
    [return_to_rescue] bit NOT NULL,
    [service_date] date NOT NULL,
    [service_log_id] varchar(20) NOT NULL,
    [service_type] varchar(100) NOT NULL,
    [services_performed] varchar(1000) NULL,
    [status] varchar(30) NOT NULL,
    CONSTRAINT [PK__care_ser__3213E83F361761E0] PRIMARY KEY ([id]),
    CONSTRAINT [uk_care_service_log_id] UNIQUE ([service_log_id]),
    CONSTRAINT [CK__care_serv__statu__5535A963] CHECK ([status]='COMPLETED' OR [status]='READY_FOR_PICKUP' OR [status]='IN_PROGRESS' OR [status]='CHECKED_IN' OR [status]='SCHEDULED')
);
GO

CREATE TABLE [dbo].[care_services] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [description] varchar(500) NULL,
    [duration_minutes] int NOT NULL,
    [name] varchar(100) NOT NULL,
    [price] numeric(10,2) NOT NULL,
    [service_id] varchar(20) NOT NULL,
    [status] varchar(30) NOT NULL,
    [created_by_user_id] bigint NOT NULL,
    CONSTRAINT [PK__care_ser__3213E83F66132A59] PRIMARY KEY ([id]),
    CONSTRAINT [uk_care_service_name] UNIQUE ([name]),
    CONSTRAINT [CK__care_serv__statu__5812160E] CHECK ([status]='COMPLETED' OR [status]='READY_FOR_PICKUP' OR [status]='IN_PROGRESS' OR [status]='CHECKED_IN' OR [status]='SCHEDULED')
);
GO

CREATE TABLE [dbo].[consultations] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [appointment_id] varchar(20) NULL,
    [assessment_diagnosis] varchar(2000) NOT NULL,
    [case_id] varchar(30) NULL,
    [consultation_date] datetime2(7) NOT NULL,
    [consultation_id] varchar(30) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [follow_up_date] date NULL,
    [heart_rate_bpm] int NULL,
    [objective_findings] varchar(2000) NULL,
    [pass_to_provider] bit NULL,
    [pet_id] varchar(20) NULL,
    [pet_name] varchar(100) NOT NULL,
    [rescue_medical_summary] varchar(2000) NULL,
    [respiratory_rate_bpm] int NULL,
    [status] varchar(30) NULL,
    [subjective_notes] varchar(2000) NULL,
    [temperaturec] numeric(4,1) NULL,
    [treatment_plan] varchar(2000) NOT NULL,
    [updated_at] datetime2(7) NULL,
    [vet_id] varchar(20) NULL,
    [vet_name] varchar(150) NOT NULL,
    [weight_kg] numeric(5,2) NULL,
    [appointment_fk_id] bigint NULL,
    [pet_fk_id] bigint NULL,
    [vet_fk_id] bigint NULL,
    CONSTRAINT [PK__consulta__3213E83FAF9F433B] PRIMARY KEY ([id]),
    CONSTRAINT [uk_consultations_consultation_id] UNIQUE ([consultation_id])
);
GO

CREATE TABLE [dbo].[feedback] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [comments] varchar(2000) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [feedback_id] varchar(30) NOT NULL,
    [manager_responded_at] datetime2(7) NULL,
    [manager_response] varchar(2000) NULL,
    [rating] int NOT NULL,
    [service_category] varchar(100) NOT NULL,
    [staff_mentioned] varchar(150) NULL,
    [title] varchar(200) NOT NULL,
    [updated_at] datetime2(7) NULL,
    [user_name] varchar(150) NOT NULL,
    [user_id] bigint NOT NULL,
    CONSTRAINT [PK__feedback__3213E83F09A1171D] PRIMARY KEY ([id]),
    CONSTRAINT [uk_feedback_feedback_id] UNIQUE ([feedback_id])
);
GO

CREATE TABLE [dbo].[foster_records] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [active_placements] int NULL,
    [address] varchar(300) NULL,
    [created_at] datetime2(7) NOT NULL,
    [email] varchar(150) NULL,
    [foster_id] varchar(30) NOT NULL,
    [full_name] varchar(150) NOT NULL,
    [home_type] varchar(200) NULL,
    [max_capacity] int NULL,
    [phone] varchar(30) NULL,
    [rating] numeric(3,1) NULL,
    [status] varchar(20) NULL,
    [updated_at] datetime2(7) NULL,
    CONSTRAINT [PK__foster_r__3213E83FDD3BE146] PRIMARY KEY ([id]),
    CONSTRAINT [uk_foster_records_foster_id] UNIQUE ([foster_id])
);
GO

CREATE TABLE [dbo].[inventory_items] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [batch_number] varchar(50) NULL,
    [category] varchar(100) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [current_stock] int NOT NULL,
    [expiry_date] date NULL,
    [item_id] varchar(20) NOT NULL,
    [min_stock_threshold] int NOT NULL,
    [name] varchar(150) NOT NULL,
    [selling_price] numeric(10,2) NOT NULL,
    [sku] varchar(50) NOT NULL,
    [status] varchar(30) NOT NULL,
    [supplier_name] varchar(150) NULL,
    [unit] varchar(50) NOT NULL,
    [unit_price] numeric(10,2) NOT NULL,
    [updated_at] datetime2(7) NULL,
    [supplier_fk_id] bigint NULL,
    CONSTRAINT [PK__inventor__3213E83FABBB9362] PRIMARY KEY ([id]),
    CONSTRAINT [uk_inventory_items_item_id] UNIQUE ([item_id]),
    CONSTRAINT [uk_inventory_items_sku] UNIQUE ([sku]),
    CONSTRAINT [CK__inventory__statu__60A75C0F] CHECK ([status]='EXPIRED' OR [status]='OUT_OF_STOCK' OR [status]='LOW_STOCK' OR [status]='IN_STOCK')
);
GO

CREATE TABLE [dbo].[notifications] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [is_read] bit NOT NULL,
    [link] varchar(300) NULL,
    [message] varchar(1000) NOT NULL,
    [notification_id] varchar(40) NOT NULL,
    [title] varchar(200) NOT NULL,
    [type] varchar(30) NOT NULL,
    [user_id] bigint NOT NULL,
    CONSTRAINT [PK__notifica__3213E83F2E0662B1] PRIMARY KEY ([id]),
    CONSTRAINT [uk_notifications_notification_id] UNIQUE ([notification_id]),
    CONSTRAINT [CK__notificati__type__6383C8BA] CHECK ([type]='System' OR [type]='Health' OR [type]='Inventory' OR [type]='Approval' OR [type]='Adoption' OR [type]='Rescue' OR [type]='Appointment')
);
GO

CREATE TABLE [dbo].[pet_documents] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [document_id] varchar(20) NOT NULL,
    [document_type] varchar(100) NOT NULL,
    [file_name] varchar(255) NOT NULL,
    [file_size] varchar(50) NULL,
    [file_url] varchar(1000) NULL,
    [notes] varchar(2000) NULL,
    [owner_id] varchar(20) NOT NULL,
    [pet_name] varchar(100) NULL,
    [uploaded_at] datetime2(7) NOT NULL,
    [pet_id] bigint NOT NULL,
    CONSTRAINT [PK__pet_docu__3213E83FB74DC136] PRIMARY KEY ([id]),
    CONSTRAINT [uk_pet_documents_document_id] UNIQUE ([document_id])
);
GO

CREATE TABLE [dbo].[pets] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [age_months] int NULL,
    [age_years] int NULL,
    [allergies] varchar(500) NULL,
    [breed] varchar(100) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [date_of_birth] date NULL,
    [emergency_contact] varchar(300) NULL,
    [gender] varchar(30) NULL,
    [image_url] varchar(500) NULL,
    [medical_notes] varchar(2000) NULL,
    [microchip_id] varchar(20) NULL,
    [name] varchar(100) NOT NULL,
    [pet_id] varchar(20) NOT NULL,
    [species] varchar(50) NOT NULL,
    [updated_at] datetime2(7) NULL,
    [weight_kg] numeric(5,2) NULL,
    [owner_id] bigint NOT NULL,
    CONSTRAINT [PK__pets__3213E83FD552D11D] PRIMARY KEY ([id]),
    CONSTRAINT [uk_pets_pet_id] UNIQUE ([pet_id])
);
GO

CREATE TABLE [dbo].[prescription_items] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [dosage] varchar(100) NULL,
    [duration_days] int NULL,
    [frequency] varchar(100) NULL,
    [item_id] varchar(50) NOT NULL,
    [medication_name] varchar(200) NOT NULL,
    [prescription_id] varchar(30) NULL,
    [quantity_prescribed] int NULL,
    [refills_allowed] int NULL,
    [prescription_fk_id] bigint NOT NULL,
    CONSTRAINT [PK__prescrip__3213E83F7B620A02] PRIMARY KEY ([id]),
    CONSTRAINT [uk_prescription_items_item_id] UNIQUE ([item_id])
);
GO

CREATE TABLE [dbo].[prescriptions] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [consultation_id] varchar(30) NULL,
    [created_at] datetime2(7) NOT NULL,
    [digital_signature] varchar(300) NULL,
    [instructions] varchar(1000) NULL,
    [issue_date] date NOT NULL,
    [owner_name] varchar(150) NULL,
    [pet_id] varchar(20) NULL,
    [pet_name] varchar(100) NOT NULL,
    [prescription_id] varchar(30) NOT NULL,
    [status] varchar(30) NOT NULL,
    [updated_at] datetime2(7) NULL,
    [valid_until] date NULL,
    [vet_id] varchar(20) NULL,
    [vet_license] varchar(50) NULL,
    [vet_name] varchar(150) NOT NULL,
    [consultation_fk_id] bigint NULL,
    [pet_fk_id] bigint NULL,
    [vet_fk_id] bigint NULL,
    CONSTRAINT [PK__prescrip__3213E83F96CD1CD6] PRIMARY KEY ([id]),
    CONSTRAINT [uk_prescriptions_rx_id] UNIQUE ([prescription_id])
);
GO

CREATE TABLE [dbo].[purchase_orders] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [items_description] varchar(1000) NULL,
    [notes] varchar(500) NULL,
    [order_id] varchar(30) NOT NULL,
    [status] varchar(30) NOT NULL,
    [supplier_id] varchar(20) NULL,
    [supplier_name] varchar(150) NOT NULL,
    [total_amount] numeric(12,2) NOT NULL,
    [updated_at] datetime2(7) NULL,
    CONSTRAINT [PK__purchase__3213E83FAED8DAF1] PRIMARY KEY ([id]),
    CONSTRAINT [uk_purchase_orders_order_id] UNIQUE ([order_id])
);
GO

CREATE TABLE [dbo].[rescue_cases] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [breed] varchar(100) NULL,
    [case_id] varchar(30) NOT NULL,
    [case_number] varchar(20) NULL,
    [condition_severity] varchar(20) NULL,
    [cover_photo_url] varchar(500) NULL,
    [created_at] datetime2(7) NOT NULL,
    [description] varchar(2000) NULL,
    [estimated_age] varchar(50) NULL,
    [foster_parent_id] varchar(30) NULL,
    [foster_parent_name] varchar(150) NULL,
    [gender] varchar(20) NULL,
    [intake_date] date NOT NULL,
    [intake_officer] varchar(150) NULL,
    [is_published_for_adoption] bit NOT NULL,
    [medical_summary] varchar(2000) NULL,
    [microchip_id] varchar(50) NULL,
    [rescue_location] varchar(500) NOT NULL,
    [species] varchar(50) NULL,
    [status] varchar(30) NOT NULL,
    [temporary_name] varchar(100) NOT NULL,
    [updated_at] datetime2(7) NULL,
    [rescue_officer_fk_id] bigint NULL,
    CONSTRAINT [PK__rescue_c__3213E83FFA5FA57E] PRIMARY KEY ([id]),
    CONSTRAINT [uk_rescue_cases_case_id] UNIQUE ([case_id])
);
GO

CREATE TABLE [dbo].[rescue_photos] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [caption] varchar(300) NULL,
    [case_id] varchar(30) NOT NULL,
    [photo_id] varchar(30) NOT NULL,
    [photo_url] varchar(500) NOT NULL,
    [tag] varchar(50) NULL,
    [uploaded_at] datetime2(7) NULL,
    [rescue_case_fk_id] bigint NOT NULL,
    CONSTRAINT [PK__rescue_p__3213E83F950C6A83] PRIMARY KEY ([id]),
    CONSTRAINT [uk_rescue_photos_photo_id] UNIQUE ([photo_id])
);
GO

CREATE TABLE [dbo].[rescue_progress_logs] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [case_id] varchar(30) NOT NULL,
    [created_at] datetime2(7) NOT NULL,
    [log_date] datetime2(7) NOT NULL,
    [log_id] varchar(30) NOT NULL,
    [log_type] varchar(30) NULL,
    [logged_by] varchar(150) NOT NULL,
    [notes] varchar(2000) NULL,
    [title] varchar(200) NOT NULL,
    [rescue_case_fk_id] bigint NOT NULL,
    CONSTRAINT [PK__rescue_p__3213E83F7F6F7FE0] PRIMARY KEY ([id]),
    CONSTRAINT [uk_rescue_progress_logs_log_id] UNIQUE ([log_id])
);
GO

CREATE TABLE [dbo].[service_package_bookings] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [booking_id] varchar(20) NOT NULL,
    [completed_sessions] int NOT NULL,
    [created_at] date NOT NULL,
    [expiry_date] date NOT NULL,
    [owner_id] varchar(20) NOT NULL,
    [package_name] varchar(100) NOT NULL,
    [purchase_date] date NOT NULL,
    [remaining_sessions] int NOT NULL,
    [status] varchar(30) NOT NULL,
    [total_sessions] int NOT NULL,
    CONSTRAINT [PK__service___3213E83FAC6ADD8E] PRIMARY KEY ([id]),
    CONSTRAINT [uk_service_package_booking_id] UNIQUE ([booking_id])
);
GO

CREATE TABLE [dbo].[suppliers] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [active] bit NOT NULL,
    [address] varchar(300) NULL,
    [category] varchar(100) NULL,
    [company_name] varchar(150) NOT NULL,
    [contact_person] varchar(100) NULL,
    [created_at] datetime2(7) NOT NULL,
    [email] varchar(100) NOT NULL,
    [lead_time_days] int NOT NULL,
    [phone] varchar(30) NULL,
    [rating] numeric(3,1) NOT NULL,
    [supplier_id] varchar(20) NOT NULL,
    [updated_at] datetime2(7) NULL,
    CONSTRAINT [PK__supplier__3213E83FC0E7E4D8] PRIMARY KEY ([id]),
    CONSTRAINT [uk_suppliers_supplier_id] UNIQUE ([supplier_id])
);
GO

CREATE TABLE [dbo].[user_verification_documents] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [document_id] varchar(30) NOT NULL,
    [document_type] varchar(100) NULL,
    [file_name] varchar(255) NULL,
    [file_size] varchar(40) NULL,
    [file_url] varchar(MAX) NULL,
    [uploaded_at] datetime2(7) NOT NULL,
    [user_id] bigint NOT NULL,
    CONSTRAINT [PK__user_ver__3213E83F3970C517] PRIMARY KEY ([id]),
    CONSTRAINT [UKnb2yfc2ykncuxxnf1f2aomgc5] UNIQUE ([document_id])
);
GO

CREATE TABLE [dbo].[users] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [address] varchar(300) NULL,
    [approval_token] varchar(100) NULL,
    [avatar_url] varchar(500) NULL,
    [badge_number] varchar(30) NULL,
    [created_at] datetime2(7) NOT NULL,
    [email] varchar(255) NOT NULL,
    [emergency_contact] varchar(200) NULL,
    [full_name] varchar(150) NOT NULL,
    [license_number] varchar(50) NULL,
    [manager_code] varchar(30) NULL,
    [password_hash] varchar(255) NOT NULL,
    [password_reset_token] varchar(100) NULL,
    [phone] varchar(30) NULL,
    [rejection_reason] varchar(500) NULL,
    [role] varchar(30) NOT NULL,
    [service_specialty] varchar(150) NULL,
    [specialization] varchar(150) NULL,
    [staff_id] varchar(30) NULL,
    [status] varchar(40) NOT NULL,
    [suspension_reason] varchar(500) NULL,
    [updated_at] datetime2(7) NULL,
    [user_id] varchar(20) NOT NULL,
    [is_seed_data] bit NOT NULL DEFAULT ((0)),
    CONSTRAINT [PK__users__3213E83FC6FD11FD] PRIMARY KEY ([id]),
    CONSTRAINT [uk_users_email] UNIQUE ([email]),
    CONSTRAINT [uk_users_user_id] UNIQUE ([user_id]),
    CONSTRAINT [CK__users__role__797309D9] CHECK ([role]='Admin' OR [role]='RescueOfficer' OR [role]='ClinicManager' OR [role]='PetCareProvider' OR [role]='ClinicStaff' OR [role]='Veterinarian' OR [role]='PetOwner'),
    CONSTRAINT [CK_users_status] CHECK ([status]='Suspended' OR [status]='Rejected' OR [status]='PendingApproval' OR [status]='Active')
);
GO

CREATE TABLE [dbo].[vaccinations] (
    [id] bigint IDENTITY(1,1) NOT NULL,
    [administered_by] varchar(150) NULL,
    [administered_date] date NULL,
    [batch_number] varchar(50) NULL,
    [next_due_date] date NULL,
    [pet_name] varchar(100) NULL,
    [status] varchar(30) NULL,
    [vaccine_id] varchar(20) NOT NULL,
    [vaccine_name] varchar(200) NOT NULL,
    [pet_id] bigint NOT NULL,
    CONSTRAINT [PK__vaccinat__3213E83F51D9A65F] PRIMARY KEY ([id]),
    CONSTRAINT [uk_vaccinations_vaccine_id] UNIQUE ([vaccine_id])
);
GO

-- ---------------------------------------------------------------------------
-- Foreign keys
--
-- Every one is ON DELETE NO ACTION on purpose. Clinical and rescue records are
-- history: deleting a pet must not silently erase its appointments,
-- consultations or prescriptions. The API turns the resulting violation into a
-- 409 Conflict that names the problem.
-- ---------------------------------------------------------------------------

ALTER TABLE [dbo].[adoption_applications] ADD CONSTRAINT [FKpssmak6donrlh7l463qtlkxx4]
    FOREIGN KEY ([case_id]) REFERENCES [dbo].[rescue_cases] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[adoption_applications] ADD CONSTRAINT [FKrlnujyyfb9sbrtjw3y7ph3kvv]
    FOREIGN KEY ([reviewed_by]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[adoption_applications] ADD CONSTRAINT [FKvw031wcwn8gl97r8pmu63ntk]
    FOREIGN KEY ([applicant_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[adoption_listings] ADD CONSTRAINT [FKcdr2kc9eruujmg8y53jjuub2g]
    FOREIGN KEY ([case_id]) REFERENCES [dbo].[rescue_cases] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[appointments] ADD CONSTRAINT [fk_appointments_owner]
    FOREIGN KEY ([owner_fk_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[appointments] ADD CONSTRAINT [fk_appointments_pet]
    FOREIGN KEY ([pet_fk_id]) REFERENCES [dbo].[pets] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[appointments] ADD CONSTRAINT [fk_appointments_vet]
    FOREIGN KEY ([vet_fk_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[care_providers] ADD CONSTRAINT [fk_care_provider_user]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[care_services] ADD CONSTRAINT [fk_care_service_user]
    FOREIGN KEY ([created_by_user_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[consultations] ADD CONSTRAINT [fk_consultations_appointment]
    FOREIGN KEY ([appointment_fk_id]) REFERENCES [dbo].[appointments] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[consultations] ADD CONSTRAINT [fk_consultations_pet]
    FOREIGN KEY ([pet_fk_id]) REFERENCES [dbo].[pets] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[consultations] ADD CONSTRAINT [fk_consultations_vet]
    FOREIGN KEY ([vet_fk_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[feedback] ADD CONSTRAINT [fk_feedback_user]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[inventory_items] ADD CONSTRAINT [fk_inventory_items_supplier]
    FOREIGN KEY ([supplier_fk_id]) REFERENCES [dbo].[suppliers] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[notifications] ADD CONSTRAINT [fk_notifications_user]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[pet_documents] ADD CONSTRAINT [fk_pet_documents_pet]
    FOREIGN KEY ([pet_id]) REFERENCES [dbo].[pets] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[pets] ADD CONSTRAINT [fk_pets_owner]
    FOREIGN KEY ([owner_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[prescription_items] ADD CONSTRAINT [fk_rx_items_prescription]
    FOREIGN KEY ([prescription_fk_id]) REFERENCES [dbo].[prescriptions] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[prescriptions] ADD CONSTRAINT [fk_prescriptions_consultation]
    FOREIGN KEY ([consultation_fk_id]) REFERENCES [dbo].[consultations] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[prescriptions] ADD CONSTRAINT [fk_prescriptions_pet]
    FOREIGN KEY ([pet_fk_id]) REFERENCES [dbo].[pets] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[prescriptions] ADD CONSTRAINT [fk_prescriptions_vet]
    FOREIGN KEY ([vet_fk_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[rescue_cases] ADD CONSTRAINT [fk_rescue_cases_officer]
    FOREIGN KEY ([rescue_officer_fk_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[rescue_photos] ADD CONSTRAINT [fk_rescue_photos_case]
    FOREIGN KEY ([rescue_case_fk_id]) REFERENCES [dbo].[rescue_cases] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[rescue_progress_logs] ADD CONSTRAINT [fk_rescue_logs_case]
    FOREIGN KEY ([rescue_case_fk_id]) REFERENCES [dbo].[rescue_cases] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[user_verification_documents] ADD CONSTRAINT [FK2b9uhvotnexoj0jqw6o68meu3]
    FOREIGN KEY ([user_id]) REFERENCES [dbo].[users] ([id])
    ON DELETE NO ACTION;
GO

ALTER TABLE [dbo].[vaccinations] ADD CONSTRAINT [fk_vaccinations_pet]
    FOREIGN KEY ([pet_id]) REFERENCES [dbo].[pets] ([id])
    ON DELETE NO ACTION;
GO

-- ---------------------------------------------------------------------------
-- Indexes on foreign key columns
--
-- SQL Server indexes a primary key automatically but not the columns that point
-- at one, so every list screen that filters by owner, pet or case was scanning
-- the whole table.
-- ---------------------------------------------------------------------------

CREATE INDEX [ix_adoption_applications_applicant_id] ON [dbo].[adoption_applications] ([applicant_id]);
CREATE INDEX [ix_adoption_applications_case_id] ON [dbo].[adoption_applications] ([case_id]);
CREATE INDEX [ix_adoption_applications_reviewed_by] ON [dbo].[adoption_applications] ([reviewed_by]);
CREATE INDEX [idx_appointments_date_slot] ON [dbo].[appointments] ([appointment_date], [time_slot]);
CREATE INDEX [idx_appointments_owner] ON [dbo].[appointments] ([owner_id]);
CREATE INDEX [idx_appointments_pet] ON [dbo].[appointments] ([pet_id]);
CREATE INDEX [idx_appointments_vet_date] ON [dbo].[appointments] ([vet_id], [appointment_date]);
CREATE INDEX [ix_appointments_owner_fk_id] ON [dbo].[appointments] ([owner_fk_id]);
CREATE INDEX [ix_appointments_pet_fk_id] ON [dbo].[appointments] ([pet_fk_id]);
CREATE INDEX [ix_appointments_vet_fk_id] ON [dbo].[appointments] ([vet_fk_id]);
CREATE INDEX [idx_approval_history_user_id] ON [dbo].[approval_history] ([user_id]);
CREATE INDEX [ix_care_services_created_by_user_id] ON [dbo].[care_services] ([created_by_user_id]);
CREATE INDEX [idx_consultations_appointment_id] ON [dbo].[consultations] ([appointment_id]);
CREATE INDEX [idx_consultations_case_id] ON [dbo].[consultations] ([case_id]);
CREATE INDEX [idx_consultations_pet_id] ON [dbo].[consultations] ([pet_id]);
CREATE INDEX [idx_consultations_vet_id] ON [dbo].[consultations] ([vet_id]);
CREATE INDEX [ix_consultations_appointment_fk_id] ON [dbo].[consultations] ([appointment_fk_id]);
CREATE INDEX [ix_consultations_pet_fk_id] ON [dbo].[consultations] ([pet_fk_id]);
CREATE INDEX [ix_consultations_vet_fk_id] ON [dbo].[consultations] ([vet_fk_id]);
CREATE INDEX [idx_feedback_category] ON [dbo].[feedback] ([service_category]);
CREATE INDEX [idx_feedback_user] ON [dbo].[feedback] ([user_id]);
CREATE INDEX [idx_inventory_items_category] ON [dbo].[inventory_items] ([category]);
CREATE INDEX [idx_inventory_items_status] ON [dbo].[inventory_items] ([status]);
CREATE INDEX [ix_inventory_items_supplier_fk_id] ON [dbo].[inventory_items] ([supplier_fk_id]);
CREATE INDEX [idx_notifications_is_read] ON [dbo].[notifications] ([is_read]);
CREATE INDEX [idx_notifications_user] ON [dbo].[notifications] ([user_id]);
CREATE INDEX [ix_pet_documents_pet_id] ON [dbo].[pet_documents] ([pet_id]);
CREATE INDEX [ix_pets_owner_id] ON [dbo].[pets] ([owner_id]);
CREATE INDEX [idx_prescription_items_rx_id] ON [dbo].[prescription_items] ([prescription_id]);
CREATE INDEX [ix_prescription_items_prescription_fk_id] ON [dbo].[prescription_items] ([prescription_fk_id]);
CREATE INDEX [idx_prescriptions_consultation_id] ON [dbo].[prescriptions] ([consultation_id]);
CREATE INDEX [idx_prescriptions_pet_id] ON [dbo].[prescriptions] ([pet_id]);
CREATE INDEX [idx_prescriptions_vet_id] ON [dbo].[prescriptions] ([vet_id]);
CREATE INDEX [ix_prescriptions_consultation_fk_id] ON [dbo].[prescriptions] ([consultation_fk_id]);
CREATE INDEX [ix_prescriptions_pet_fk_id] ON [dbo].[prescriptions] ([pet_fk_id]);
CREATE INDEX [ix_prescriptions_vet_fk_id] ON [dbo].[prescriptions] ([vet_fk_id]);
CREATE INDEX [idx_rescue_cases_published] ON [dbo].[rescue_cases] ([is_published_for_adoption]);
CREATE INDEX [idx_rescue_cases_status] ON [dbo].[rescue_cases] ([status]);
CREATE INDEX [ix_rescue_cases_rescue_officer_fk_id] ON [dbo].[rescue_cases] ([rescue_officer_fk_id]);
CREATE INDEX [idx_rescue_photos_case_id] ON [dbo].[rescue_photos] ([case_id]);
CREATE INDEX [ix_rescue_photos_rescue_case_fk_id] ON [dbo].[rescue_photos] ([rescue_case_fk_id]);
CREATE INDEX [idx_rescue_logs_case_id] ON [dbo].[rescue_progress_logs] ([case_id]);
CREATE INDEX [idx_rescue_logs_log_date] ON [dbo].[rescue_progress_logs] ([log_date]);
CREATE INDEX [ix_rescue_progress_logs_rescue_case_fk_id] ON [dbo].[rescue_progress_logs] ([rescue_case_fk_id]);
CREATE INDEX [ix_user_verification_documents_user_id] ON [dbo].[user_verification_documents] ([user_id]);
CREATE INDEX [ix_vaccinations_pet_id] ON [dbo].[vaccinations] ([pet_id]);
GO
