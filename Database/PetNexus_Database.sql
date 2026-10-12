-- ==============================================================================
-- PetNexus Centralized SQL Server Database Script
-- Automatically creates the database, schema, entities, and initial seed data.
-- Safe to re-run multiple times (Idempotent).
-- ==============================================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'PetNexus')
BEGIN
    CREATE DATABASE PetNexus;
END
GO

USE PetNexus;
GO

-- ==============================================================================
-- SECTION 0: Legacy Schema Reset
-- Older copies of this database (INT ids, or a USER table missing the current
-- columns) cannot be migrated in place by the backend. If one is detected, every
-- table is dropped so the sections below rebuild the schema from scratch.
-- WARNING: this deletes the local data.
-- ==============================================================================

IF OBJECT_ID(N'dbo.[USER]') IS NOT NULL
   AND (
        EXISTS (
            SELECT 1
            FROM sys.columns c
            JOIN sys.types t ON c.user_type_id = t.user_type_id
            WHERE c.object_id = OBJECT_ID(N'dbo.[USER]')
              AND c.name = 'id'
              AND t.name <> 'bigint'
        )
        OR COL_LENGTH(N'dbo.[USER]', 'id') IS NULL
        OR COL_LENGTH(N'dbo.[USER]', 'password_hash') IS NULL
        OR COL_LENGTH(N'dbo.[USER]', 'role') IS NULL
        OR COL_LENGTH(N'dbo.[USER]', 'created_at') IS NULL
        OR (OBJECT_ID(N'dbo.pet_care_provider') IS NOT NULL
            AND COL_LENGTH(N'dbo.pet_care_provider', 'service_specialty') IS NULL)
   )
BEGIN
    PRINT 'Legacy PetNexus schema detected. Dropping all tables for a clean rebuild...';

    DECLARE @sql NVARCHAR(MAX) = N'';

    SELECT @sql += N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id))
                 + N' DROP CONSTRAINT ' + QUOTENAME(name) + N';'
    FROM sys.foreign_keys;
    EXEC sp_executesql @sql;

    SET @sql = N'';
    SELECT @sql += N'DROP TABLE ' + QUOTENAME(SCHEMA_NAME(schema_id)) + N'.' + QUOTENAME(name) + N';'
    FROM sys.tables;
    EXEC sp_executesql @sql;
END
GO

-- ------------------------------------------------------------------------------
-- SECTION 0B: Tidy Reorganization for Existing Databases
-- If the database already contains tables from a previous version without the
-- tidy table layout, reorganize them into the tidy layout in-place WITHOUT
-- losing any existing data.
-- ------------------------------------------------------------------------------
IF OBJECT_ID(N'dbo.[USER]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'pk_users')
BEGIN
    DECLARE @tables TABLE (ord INT IDENTITY(1,1) PRIMARY KEY, name SYSNAME, ddl NVARCHAR(MAX));
    INSERT INTO @tables (name, ddl) VALUES (N'USER', N'CREATE TABLE [USER] (
id                    BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
user_id               VARCHAR(20)           NOT NULL,  -- unique
address               VARCHAR(300)          NULL,
approval_token        VARCHAR(100)          NULL,
avatar_url            VARCHAR(MAX)          NULL,
email                 VARCHAR(255)          NOT NULL,  -- unique
emergency_contact     VARCHAR(200)          NULL,
full_name             VARCHAR(150)          NOT NULL,
password_hash         VARCHAR(255)          NOT NULL,
password_reset_token  VARCHAR(100)          NULL,
phone                 VARCHAR(30)           NULL,
rejection_reason      VARCHAR(500)          NULL,
role                  VARCHAR(30)           NOT NULL,
status                VARCHAR(40)           NOT NULL,
suspension_reason     VARCHAR(500)          NULL,
created_at            DATETIME2(7)          NOT NULL,
updated_at            DATETIME2(7)          NULL,
CONSTRAINT pk_users PRIMARY KEY (id),
CONSTRAINT uk_users_email UNIQUE (email),
CONSTRAINT uk_users_user_id UNIQUE (user_id),
CONSTRAINT ck_users_role CHECK ([role]=''Admin'' OR [role]=''RescueOfficer'' OR [role]=''ClinicManager'' OR [role]=''PetCareProvider'' OR [role]=''ClinicStaff'' OR [role]=''Veterinarian'' OR [role]=''PetOwner''),
CONSTRAINT ck_users_status CHECK ([status]=''Suspended'' OR [status]=''Rejected'' OR [status]=''Active'' OR [status]=''PendingApproval'' OR [status]=''PendingEmailVerification'')
);');
    INSERT INTO @tables (name, ddl) VALUES (N'pet_owner', N'CREATE TABLE pet_owner (
user_id  BIGINT  NOT NULL,  -- PK, FK -> USER
CONSTRAINT pk_pet_owner PRIMARY KEY (user_id),
CONSTRAINT fk_pet_owner_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'veterinarian', N'CREATE TABLE veterinarian (
user_id         BIGINT        NOT NULL,  -- PK, FK -> USER
license_number  VARCHAR(50)   NULL,
specialization  VARCHAR(150)  NULL,
CONSTRAINT pk_veterinarian PRIMARY KEY (user_id),
CONSTRAINT fk_veterinarian_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'clinic_staff', N'CREATE TABLE clinic_staff (
user_id   BIGINT       NOT NULL,  -- PK, FK -> USER
staff_id  VARCHAR(30)  NULL,
CONSTRAINT pk_clinic_staff PRIMARY KEY (user_id),
CONSTRAINT fk_clinic_staff_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'clinic_manager', N'CREATE TABLE clinic_manager (
user_id       BIGINT       NOT NULL,  -- PK, FK -> USER
manager_code  VARCHAR(30)  NULL,
CONSTRAINT pk_clinic_manager PRIMARY KEY (user_id),
CONSTRAINT fk_clinic_manager_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'rescue_officer', N'CREATE TABLE rescue_officer (
user_id       BIGINT       NOT NULL,  -- PK, FK -> USER
badge_number  VARCHAR(30)  NULL,
CONSTRAINT pk_rescue_officer PRIMARY KEY (user_id),
CONSTRAINT fk_rescue_officer_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'pet_care_provider', N'CREATE TABLE pet_care_provider (
user_id            BIGINT        NOT NULL,  -- PK, FK -> USER
service_specialty  VARCHAR(150)  NULL,
CONSTRAINT pk_pet_care_provider PRIMARY KEY (user_id),
CONSTRAINT fk_pet_care_provider_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'approval_history', N'CREATE TABLE approval_history (
id              BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
action          VARCHAR(50)           NOT NULL,
admin_id        VARCHAR(20)           NOT NULL,
history_id      VARCHAR(30)           NOT NULL,
reason          VARCHAR(500)          NULL,
timestamp       DATETIME2(7)          NOT NULL,
user_full_name  VARCHAR(150)          NOT NULL,
user_id         VARCHAR(20)           NOT NULL,
CONSTRAINT pk_approval_history PRIMARY KEY (id)
);
CREATE INDEX idx_approval_history_user_id ON approval_history (user_id);');
    INSERT INTO @tables (name, ddl) VALUES (N'notifications', N'CREATE TABLE notifications (
id               BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
notification_id  VARCHAR(40)           NOT NULL,  -- unique
user_id          BIGINT                NOT NULL,  -- FK -> USER
is_read          BIT                   NOT NULL,
link             VARCHAR(300)          NULL,
message          VARCHAR(1000)         NOT NULL,
title            VARCHAR(200)          NOT NULL,
type             VARCHAR(30)           NOT NULL,
created_at       DATETIME2(7)          NOT NULL,
CONSTRAINT pk_notifications PRIMARY KEY (id),
CONSTRAINT uk_notifications_notification_id UNIQUE (notification_id),
CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES [USER] (id),
CONSTRAINT ck_notifications_type CHECK ([type]=''System'' OR [type]=''Health'' OR [type]=''Inventory'' OR [type]=''Approval'' OR [type]=''Adoption'' OR [type]=''Rescue'' OR [type]=''Appointment'')
);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);
CREATE INDEX idx_notifications_user ON notifications (user_id);');
    INSERT INTO @tables (name, ddl) VALUES (N'pets', N'CREATE TABLE pets (
id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
pet_id             VARCHAR(20)           NOT NULL,  -- unique
owner_id           BIGINT                NOT NULL,  -- FK -> USER
age_months         INT                   NULL,
age_years          INT                   NULL,
allergies          VARCHAR(500)          NULL,
breed              VARCHAR(100)          NOT NULL,
date_of_birth      DATE                  NULL,
emergency_contact  VARCHAR(300)          NULL,
gender             VARCHAR(30)           NULL,
image_url          VARCHAR(500)          NULL,
medical_notes      VARCHAR(2000)         NULL,
microchip_id       VARCHAR(20)           NULL,
name               VARCHAR(100)          NOT NULL,
species            VARCHAR(50)           NOT NULL,
weight_kg          NUMERIC(5,2)          NULL,
created_at         DATETIME2(7)          NOT NULL,
updated_at         DATETIME2(7)          NULL,
CONSTRAINT pk_pets PRIMARY KEY (id),
CONSTRAINT uk_pets_pet_id UNIQUE (pet_id),
CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES [USER] (id)
);
CREATE INDEX idx_pets_owner ON pets (owner_id);');
    INSERT INTO @tables (name, ddl) VALUES (N'pet_documents', N'CREATE TABLE pet_documents (
id             BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
document_id    VARCHAR(20)           NOT NULL,  -- unique
pet_id         BIGINT                NOT NULL,  -- FK -> pets
document_type  VARCHAR(100)          NOT NULL,
file_name      VARCHAR(255)          NOT NULL,
file_size      VARCHAR(50)           NULL,
file_url       VARCHAR(1000)         NULL,
notes          VARCHAR(2000)         NULL,
owner_id       VARCHAR(20)           NOT NULL,
pet_name       VARCHAR(100)          NULL,
uploaded_at    DATETIME2(7)          NOT NULL,
CONSTRAINT pk_pet_documents PRIMARY KEY (id),
CONSTRAINT uk_pet_documents_document_id UNIQUE (document_id),
CONSTRAINT fk_pet_documents_pet FOREIGN KEY (pet_id) REFERENCES pets (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'vaccinations', N'CREATE TABLE vaccinations (
id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
vaccine_id         VARCHAR(20)           NOT NULL,  -- unique
pet_id             BIGINT                NOT NULL,  -- FK -> pets
administered_by    VARCHAR(150)          NULL,
administered_date  DATE                  NULL,
batch_number       VARCHAR(50)           NULL,
next_due_date      DATE                  NULL,
pet_name           VARCHAR(100)          NULL,
status             VARCHAR(30)           NULL,
vaccine_name       VARCHAR(200)          NOT NULL,
CONSTRAINT pk_vaccinations PRIMARY KEY (id),
CONSTRAINT uk_vaccinations_vaccine_id UNIQUE (vaccine_id),
CONSTRAINT fk_vaccinations_pet FOREIGN KEY (pet_id) REFERENCES pets (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'appointments', N'CREATE TABLE appointments (
id                          BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
appointment_id              VARCHAR(20)           NOT NULL,  -- unique
owner_fk_id                 BIGINT                NULL,      -- FK -> USER
pet_fk_id                   BIGINT                NULL,      -- FK -> pets
vet_fk_id                   BIGINT                NULL,      -- FK -> USER
appointment_date            DATE                  NOT NULL,
breed                       VARCHAR(100)          NULL,
cancellation_reason         VARCHAR(500)          NULL,
cancelled_at                DATETIME2(7)          NULL,
notes                       VARCHAR(2000)         NULL,
owner_id                    VARCHAR(20)           NULL,
owner_name                  VARCHAR(150)          NOT NULL,
owner_phone                 VARCHAR(50)           NULL,
pet_id                      VARCHAR(20)           NULL,
pet_name                    VARCHAR(100)          NOT NULL,
reason                      VARCHAR(1000)         NULL,
reschedule_reason           VARCHAR(500)          NULL,
rescheduled_from_date       DATE                  NULL,
rescheduled_from_time_slot  VARCHAR(30)           NULL,
rescheduled_from_vet_name   VARCHAR(150)          NULL,
service_type                VARCHAR(100)          NOT NULL,
species                     VARCHAR(50)           NULL,
status                      VARCHAR(30)           NOT NULL,
symptoms                    VARCHAR(1000)         NULL,
time_slot                   VARCHAR(30)           NOT NULL,
token_number                VARCHAR(20)           NULL,
vet_id                      VARCHAR(20)           NULL,
vet_name                    VARCHAR(150)          NOT NULL,
created_at                  DATETIME2(7)          NOT NULL,
updated_at                  DATETIME2(7)          NULL,
CONSTRAINT pk_appointments PRIMARY KEY (id),
CONSTRAINT uk_appointments_appointment_id UNIQUE (appointment_id),
CONSTRAINT fk_appointments_owner FOREIGN KEY (owner_fk_id) REFERENCES [USER] (id),
CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_fk_id) REFERENCES pets (id),
CONSTRAINT fk_appointments_vet FOREIGN KEY (vet_fk_id) REFERENCES [USER] (id),
CONSTRAINT ck_appointments_status CHECK ([status]=''NoShow'' OR [status]=''Cancelled'' OR [status]=''Completed'' OR [status]=''InRoom'' OR [status]=''CheckedIn'' OR [status]=''Confirmed'' OR [status]=''Pending'' OR [status]=''Scheduled'')
);
CREATE INDEX idx_appointments_date_slot ON appointments (appointment_date, time_slot);
CREATE INDEX idx_appointments_owner ON appointments (owner_id);
CREATE INDEX idx_appointments_pet ON appointments (pet_id);
CREATE INDEX idx_appointments_vet_date ON appointments (vet_id, appointment_date);');
    INSERT INTO @tables (name, ddl) VALUES (N'consultations', N'CREATE TABLE consultations (
id                      BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
consultation_id         VARCHAR(30)           NOT NULL,  -- unique
appointment_fk_id       BIGINT                NULL,      -- FK -> appointments
pet_fk_id               BIGINT                NULL,      -- FK -> pets
vet_fk_id               BIGINT                NULL,      -- FK -> USER
appointment_id          VARCHAR(20)           NULL,
assessment_diagnosis    VARCHAR(2000)         NOT NULL,
case_id                 VARCHAR(30)           NULL,
consultation_date       DATETIME2(7)          NOT NULL,
follow_up_date          DATE                  NULL,
heart_rate_bpm          INT                   NULL,
objective_findings      VARCHAR(2000)         NULL,
pass_to_provider        BIT                   NULL,
pet_id                  VARCHAR(20)           NULL,
pet_name                VARCHAR(100)          NOT NULL,
rescue_medical_summary  VARCHAR(2000)         NULL,
respiratory_rate_bpm    INT                   NULL,
status                  VARCHAR(30)           NULL,
subjective_notes        VARCHAR(2000)         NULL,
temperaturec            NUMERIC(4,1)          NULL,
treatment_plan          VARCHAR(2000)         NOT NULL,
vet_id                  VARCHAR(20)           NULL,
vet_name                VARCHAR(150)          NOT NULL,
weight_kg               NUMERIC(5,2)          NULL,
created_at              DATETIME2(7)          NOT NULL,
updated_at              DATETIME2(7)          NULL,
CONSTRAINT pk_consultations PRIMARY KEY (id),
CONSTRAINT uk_consultations_consultation_id UNIQUE (consultation_id),
CONSTRAINT fk_consultations_appointment FOREIGN KEY (appointment_fk_id) REFERENCES appointments (id),
CONSTRAINT fk_consultations_pet FOREIGN KEY (pet_fk_id) REFERENCES pets (id),
CONSTRAINT fk_consultations_vet FOREIGN KEY (vet_fk_id) REFERENCES [USER] (id)
);
CREATE INDEX idx_consultations_appointment_id ON consultations (appointment_id);
CREATE INDEX idx_consultations_case_id ON consultations (case_id);
CREATE INDEX idx_consultations_pet_id ON consultations (pet_id);
CREATE INDEX idx_consultations_vet_id ON consultations (vet_id);');
    INSERT INTO @tables (name, ddl) VALUES (N'prescriptions', N'CREATE TABLE prescriptions (
id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
prescription_id     VARCHAR(30)           NOT NULL,  -- unique
consultation_fk_id  BIGINT                NULL,      -- FK -> consultations
pet_fk_id           BIGINT                NULL,      -- FK -> pets
vet_fk_id           BIGINT                NULL,      -- FK -> USER
consultation_id     VARCHAR(30)           NULL,
digital_signature   VARCHAR(300)          NULL,
instructions        VARCHAR(1000)         NULL,
issue_date          DATE                  NOT NULL,
owner_name          VARCHAR(150)          NULL,
pet_id              VARCHAR(20)           NULL,
pet_name            VARCHAR(100)          NOT NULL,
status              VARCHAR(30)           NOT NULL,
valid_until         DATE                  NULL,
vet_id              VARCHAR(20)           NULL,
vet_license         VARCHAR(50)           NULL,
vet_name            VARCHAR(150)          NOT NULL,
created_at          DATETIME2(7)          NOT NULL,
updated_at          DATETIME2(7)          NULL,
CONSTRAINT pk_prescriptions PRIMARY KEY (id),
CONSTRAINT uk_prescriptions_rx_id UNIQUE (prescription_id),
CONSTRAINT fk_prescriptions_consultation FOREIGN KEY (consultation_fk_id) REFERENCES consultations (id),
CONSTRAINT fk_prescriptions_pet FOREIGN KEY (pet_fk_id) REFERENCES pets (id),
CONSTRAINT fk_prescriptions_vet FOREIGN KEY (vet_fk_id) REFERENCES [USER] (id)
);
CREATE INDEX idx_prescriptions_consultation_id ON prescriptions (consultation_id);
CREATE INDEX idx_prescriptions_pet_id ON prescriptions (pet_id);
CREATE INDEX idx_prescriptions_vet_id ON prescriptions (vet_id);');
    INSERT INTO @tables (name, ddl) VALUES (N'prescription_items', N'CREATE TABLE prescription_items (
id                   BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
item_id              VARCHAR(50)           NOT NULL,  -- unique
prescription_fk_id   BIGINT                NOT NULL,  -- FK -> prescriptions
dosage               VARCHAR(100)          NULL,
duration_days        INT                   NULL,
frequency            VARCHAR(100)          NULL,
medication_name      VARCHAR(200)          NOT NULL,
prescription_id      VARCHAR(30)           NULL,
quantity_prescribed  INT                   NULL,
refills_allowed      INT                   NULL,
CONSTRAINT pk_prescription_items PRIMARY KEY (id),
CONSTRAINT uk_prescription_items_item_id UNIQUE (item_id),
CONSTRAINT fk_rx_items_prescription FOREIGN KEY (prescription_fk_id) REFERENCES prescriptions (id) ON DELETE CASCADE
);
CREATE INDEX idx_prescription_items_rx_id ON prescription_items (prescription_id);');
    INSERT INTO @tables (name, ddl) VALUES (N'rescue_cases', N'CREATE TABLE rescue_cases (
id                         BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
case_id                    VARCHAR(30)           NOT NULL,  -- unique
assigned_officer_id        VARCHAR(50)           NULL,
assigned_officer_name      VARCHAR(150)          NULL,
assigned_provider_id       VARCHAR(50)           NULL,
assigned_provider_name     VARCHAR(150)          NULL,
assigned_vet_id            VARCHAR(50)           NULL,
assigned_vet_name          VARCHAR(150)          NULL,
breed                      VARCHAR(100)          NULL,
case_number                VARCHAR(20)           NULL,
condition_severity         VARCHAR(50)           NULL,
cover_photo_url            NVARCHAR(MAX)         NULL,
description                VARCHAR(2000)         NULL,
estimated_age              VARCHAR(50)           NULL,
foster_parent_id           VARCHAR(30)           NULL,
foster_parent_name         VARCHAR(150)          NULL,
gender                     VARCHAR(20)           NULL,
intake_date                DATE                  NOT NULL,
intake_officer             VARCHAR(150)          NULL,
is_published_for_adoption  BIT                   NOT NULL,
medical_summary            VARCHAR(2000)         NULL,
microchip_id               VARCHAR(50)           NULL,
reported_by_user_id        VARCHAR(50)           NULL,
reported_by_user_name      VARCHAR(150)          NULL,
reported_by_user_phone     VARCHAR(50)           NULL,
rescue_location            VARCHAR(500)          NOT NULL,
species                    VARCHAR(50)           NULL,
status                     VARCHAR(30)           NOT NULL,
temporary_name             VARCHAR(100)          NOT NULL,
created_at                 DATETIME2(7)          NOT NULL,
updated_at                 DATETIME2(7)          NULL,
CONSTRAINT pk_rescue_cases PRIMARY KEY (id),
CONSTRAINT uk_rescue_cases_case_id UNIQUE (case_id)
);
CREATE INDEX idx_rescue_cases_published ON rescue_cases (is_published_for_adoption);
CREATE INDEX idx_rescue_cases_status ON rescue_cases (status);');
    INSERT INTO @tables (name, ddl) VALUES (N'rescue_photos', N'CREATE TABLE rescue_photos (
id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
photo_id           VARCHAR(30)           NOT NULL,  -- unique
rescue_case_fk_id  BIGINT                NOT NULL,  -- FK -> rescue_cases
caption            VARCHAR(300)          NULL,
case_id            VARCHAR(30)           NOT NULL,
photo_url          NVARCHAR(MAX)         NULL,
tag                VARCHAR(50)           NULL,
uploaded_at        DATETIME2(7)          NULL,
CONSTRAINT pk_rescue_photos PRIMARY KEY (id),
CONSTRAINT uk_rescue_photos_photo_id UNIQUE (photo_id),
CONSTRAINT fk_rescue_photos_case FOREIGN KEY (rescue_case_fk_id) REFERENCES rescue_cases (id)
);
CREATE INDEX idx_rescue_photos_case_id ON rescue_photos (case_id);');
    INSERT INTO @tables (name, ddl) VALUES (N'rescue_progress_logs', N'CREATE TABLE rescue_progress_logs (
id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
log_id             VARCHAR(30)           NOT NULL,  -- unique
rescue_case_fk_id  BIGINT                NOT NULL,  -- FK -> rescue_cases
case_id            VARCHAR(30)           NOT NULL,
log_date           DATETIME2(7)          NOT NULL,
log_type           VARCHAR(30)           NULL,
logged_by          VARCHAR(150)          NOT NULL,
notes              VARCHAR(2000)         NULL,
title              VARCHAR(200)          NOT NULL,
created_at         DATETIME2(7)          NOT NULL,
CONSTRAINT pk_rescue_progress_logs PRIMARY KEY (id),
CONSTRAINT uk_rescue_progress_logs_log_id UNIQUE (log_id),
CONSTRAINT fk_rescue_logs_case FOREIGN KEY (rescue_case_fk_id) REFERENCES rescue_cases (id)
);
CREATE INDEX idx_rescue_logs_case_id ON rescue_progress_logs (case_id);
CREATE INDEX idx_rescue_logs_log_date ON rescue_progress_logs (log_date);');
    INSERT INTO @tables (name, ddl) VALUES (N'foster_records', N'CREATE TABLE foster_records (
id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
foster_id          VARCHAR(30)           NOT NULL,  -- unique
active_placements  INT                   NULL,
address            VARCHAR(300)          NULL,
email              VARCHAR(150)          NULL,
full_name          VARCHAR(150)          NOT NULL,
home_type          VARCHAR(200)          NULL,
max_capacity       INT                   NULL,
phone              VARCHAR(30)           NULL,
rating             NUMERIC(3,1)          NULL,
status             VARCHAR(20)           NULL,
created_at         DATETIME2(7)          NOT NULL,
updated_at         DATETIME2(7)          NULL,
CONSTRAINT pk_foster_records PRIMARY KEY (id),
CONSTRAINT uk_foster_records_foster_id UNIQUE (foster_id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'adoption_listings', N'CREATE TABLE adoption_listings (
listing_id                 VARCHAR(255)  NOT NULL,  -- PK
case_id                    BIGINT        NOT NULL,  -- FK -> rescue_cases, unique
is_published_for_adoption  BIT           NOT NULL,
created_at                 DATETIME2(7)  NOT NULL,
updated_at                 DATETIME2(7)  NOT NULL,
CONSTRAINT pk_adoption_listings PRIMARY KEY (listing_id),
CONSTRAINT uk_adoption_listings_case_id UNIQUE (case_id),
CONSTRAINT fk_adoption_listings_case FOREIGN KEY (case_id) REFERENCES rescue_cases (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'adoption_applications', N'CREATE TABLE adoption_applications (
application_id    VARCHAR(255)  NOT NULL,  -- PK
applicant_id      BIGINT        NOT NULL,  -- FK -> USER
case_id           BIGINT        NOT NULL,  -- FK -> rescue_cases
reviewed_by       BIGINT        NULL,      -- FK -> USER
applicant_name    VARCHAR(255)  NOT NULL,
applicant_phone   VARCHAR(255)  NOT NULL,
application_type  VARCHAR(255)  NOT NULL,
pet_name          VARCHAR(255)  NOT NULL,
review_notes      VARCHAR(255)  NULL,
reviewed_at       DATETIME2(7)  NULL,
status            VARCHAR(255)  NOT NULL,
created_at        DATETIME2(7)  NOT NULL,
CONSTRAINT pk_adoption_applications PRIMARY KEY (application_id),
CONSTRAINT fk_adoption_applications_applicant FOREIGN KEY (applicant_id) REFERENCES [USER] (id),
CONSTRAINT fk_adoption_applications_case FOREIGN KEY (case_id) REFERENCES rescue_cases (id),
CONSTRAINT fk_adoption_applications_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES [USER] (id),
CONSTRAINT ck_adoption_applications_status CHECK ([status]=''CANCELLED'' OR [status]=''REJECTED'' OR [status]=''APPROVED'' OR [status]=''UNDER_REVIEW'' OR [status]=''SUBMITTED'')
);');
    INSERT INTO @tables (name, ddl) VALUES (N'adoption_application_documents', N'CREATE TABLE adoption_application_documents (
id              BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
application_id  VARCHAR(255)          NOT NULL,  -- FK -> adoption_applications
document_type   VARCHAR(255)          NOT NULL,
file_name       VARCHAR(255)          NOT NULL,
file_size       VARCHAR(255)          NULL,
file_url        VARCHAR(255)          NOT NULL,
status          VARCHAR(255)          NULL,
uploaded_at     DATETIME2(7)          NOT NULL,
CONSTRAINT pk_adoption_application_documents PRIMARY KEY (id),
CONSTRAINT fk_adoption_application_documents_application FOREIGN KEY (application_id) REFERENCES adoption_applications (application_id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'care_providers', N'CREATE TABLE care_providers (
id             BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
user_id        BIGINT                NOT NULL,  -- FK -> USER, unique
active         BIT                   NOT NULL,
contact_email  VARCHAR(100)          NULL,
contact_phone  VARCHAR(20)           NULL,
provider_id    VARCHAR(20)           NOT NULL,
provider_name  VARCHAR(100)          NOT NULL,
CONSTRAINT pk_care_providers PRIMARY KEY (id),
CONSTRAINT uk_care_provider_user UNIQUE (user_id),
CONSTRAINT fk_care_provider_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'care_services', N'CREATE TABLE care_services (
id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
created_by_user_id  BIGINT                NOT NULL,  -- FK -> USER
badge               VARCHAR(50)           NULL,
description         VARCHAR(2000)         NULL,
discount_percent    INT                   NULL,
duration_minutes    INT                   NOT NULL,
name                VARCHAR(100)          NOT NULL,  -- unique
original_value      NUMERIC(10,2)         NULL,
price               NUMERIC(10,2)         NOT NULL,
recommended_for     VARCHAR(100)          NULL,
service_id          VARCHAR(20)           NOT NULL,
status              VARCHAR(30)           NOT NULL,
tagline             VARCHAR(300)          NULL,
CONSTRAINT pk_care_services PRIMARY KEY (id),
CONSTRAINT uk_care_service_name UNIQUE (name),
CONSTRAINT fk_care_service_user FOREIGN KEY (created_by_user_id) REFERENCES [USER] (id),
CONSTRAINT ck_care_services_status CHECK ([status]=''COMPLETED'' OR [status]=''READY_FOR_PICKUP'' OR [status]=''IN_PROGRESS'' OR [status]=''CHECKED_IN'' OR [status]=''SCHEDULED'')
);');
    INSERT INTO @tables (name, ddl) VALUES (N'care_service_logs', N'CREATE TABLE care_service_logs (
id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
service_log_id      VARCHAR(20)           NOT NULL,  -- unique
case_id             VARCHAR(20)           NULL,
intake_condition    VARCHAR(500)          NULL,
notes               VARCHAR(1000)         NULL,
owner_id            VARCHAR(20)           NULL,
owner_name          VARCHAR(100)          NULL,
pet_id              VARCHAR(20)           NULL,
pet_name            VARCHAR(100)          NULL,
provider_id         VARCHAR(20)           NULL,
provider_name       VARCHAR(100)          NULL,
return_to_rescue    BIT                   NOT NULL,
service_date        DATE                  NOT NULL,
service_type        VARCHAR(100)          NOT NULL,
services_performed  VARCHAR(1000)         NULL,
status              VARCHAR(30)           NOT NULL,
created_at          DATE                  NOT NULL,
CONSTRAINT pk_care_service_logs PRIMARY KEY (id),
CONSTRAINT uk_care_service_log_id UNIQUE (service_log_id),
CONSTRAINT ck_care_service_logs_status CHECK ([status]=''COMPLETED'' OR [status]=''READY_FOR_PICKUP'' OR [status]=''IN_PROGRESS'' OR [status]=''CHECKED_IN'' OR [status]=''SCHEDULED'')
);');
    INSERT INTO @tables (name, ddl) VALUES (N'service_package_bookings', N'CREATE TABLE service_package_bookings (
id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
booking_id          VARCHAR(20)           NOT NULL,  -- unique
completed_sessions  INT                   NOT NULL,
expiry_date         DATE                  NOT NULL,
owner_id            VARCHAR(20)           NOT NULL,
owner_name          VARCHAR(100)          NULL,
package_id          VARCHAR(50)           NULL,
package_name        VARCHAR(100)          NOT NULL,
pet_id              VARCHAR(20)           NULL,
pet_name            VARCHAR(100)          NULL,
purchase_date       DATE                  NOT NULL,
remaining_sessions  INT                   NOT NULL,
status              VARCHAR(30)           NOT NULL,
total_sessions      INT                   NOT NULL,
created_at          DATE                  NOT NULL,
CONSTRAINT pk_service_package_bookings PRIMARY KEY (id),
CONSTRAINT uk_service_package_booking_id UNIQUE (booking_id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'suppliers', N'CREATE TABLE suppliers (
supplier_id     VARCHAR(20)           NOT NULL,  -- PK
active          BIT                   NOT NULL,
address         VARCHAR(300)          NULL,
category        VARCHAR(100)          NULL,
company_name    VARCHAR(150)          NOT NULL,
contact_person  VARCHAR(100)          NULL,
email           VARCHAR(100)          NOT NULL,
lead_time_days  INT                   NOT NULL,
phone           VARCHAR(30)           NULL,
rating          NUMERIC(3,1)          NOT NULL,
created_at      DATETIME2(7)          NOT NULL,
updated_at      DATETIME2(7)          NULL,
CONSTRAINT pk_suppliers PRIMARY KEY (supplier_id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'inventory_items', N'CREATE TABLE inventory_items (
item_id              VARCHAR(20)           NOT NULL,  -- PK
supplier_id          VARCHAR(20)           NULL,      -- FK -> suppliers
batch_number         VARCHAR(50)           NULL,
category             VARCHAR(100)          NOT NULL,
current_stock        INT                   NOT NULL,
expiry_date          DATE                  NULL,
min_stock_threshold  INT                   NOT NULL,
name                 VARCHAR(150)          NOT NULL,
selling_price        NUMERIC(10,2)         NOT NULL,
sku                  VARCHAR(50)           NOT NULL,  -- unique
status               VARCHAR(30)           NOT NULL,
supplier_name        VARCHAR(150)          NULL,
unit                 VARCHAR(50)           NOT NULL,
unit_price           NUMERIC(10,2)         NOT NULL,
created_at           DATETIME2(7)          NOT NULL,
updated_at           DATETIME2(7)          NULL,
CONSTRAINT pk_inventory_items PRIMARY KEY (item_id),
CONSTRAINT uk_inventory_items_sku UNIQUE (sku),
CONSTRAINT fk_inventory_items_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (supplier_id),
CONSTRAINT ck_inventory_items_status CHECK ([status]=''EXPIRED'' OR [status]=''OUT_OF_STOCK'' OR [status]=''LOW_STOCK'' OR [status]=''IN_STOCK'')
);
CREATE INDEX idx_inventory_items_category ON inventory_items (category);
CREATE INDEX idx_inventory_items_status ON inventory_items (status);');
    INSERT INTO @tables (name, ddl) VALUES (N'purchase_orders', N'CREATE TABLE purchase_orders (
id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
order_id           VARCHAR(30)           NOT NULL,  -- unique
items_description  VARCHAR(1000)         NULL,
notes              VARCHAR(500)          NULL,
status             VARCHAR(30)           NOT NULL,
supplier_id        VARCHAR(20)           NULL,
supplier_name      VARCHAR(150)          NOT NULL,
total_amount       NUMERIC(12,2)         NOT NULL,
created_at         DATETIME2(7)          NOT NULL,
updated_at         DATETIME2(7)          NULL,
CONSTRAINT pk_purchase_orders PRIMARY KEY (id),
CONSTRAINT uk_purchase_orders_order_id UNIQUE (order_id)
);');
    INSERT INTO @tables (name, ddl) VALUES (N'feedbacks', N'CREATE TABLE feedbacks (
id                    BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
feedback_id           VARCHAR(30)           NOT NULL,  -- unique
user_id               BIGINT                NOT NULL,  -- FK -> USER
comments              VARCHAR(2000)         NOT NULL,
manager_responded_at  DATETIME2(7)          NULL,
manager_response      VARCHAR(2000)         NULL,
rating                INT                   NOT NULL,
service_category      VARCHAR(100)          NOT NULL,
staff_mentioned       VARCHAR(150)          NULL,
title                 VARCHAR(200)          NOT NULL,
user_name             VARCHAR(150)          NOT NULL,
created_at            DATETIME2(7)          NOT NULL,
updated_at            DATETIME2(7)          NULL,
CONSTRAINT pk_feedbacks PRIMARY KEY (id),
CONSTRAINT uk_feedback_feedback_id UNIQUE (feedback_id),
CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
);
CREATE INDEX idx_feedback_category ON feedbacks (service_category);
CREATE INDEX idx_feedback_user ON feedbacks (user_id);');

    DECLARE @triggers TABLE (definition NVARCHAR(MAX));
    DECLARE @sql NVARCHAR(MAX), @name SYSNAME, @ddl NVARCHAR(MAX), @cols NVARCHAR(MAX);
    DECLARE @old BIGINT, @new BIGINT, @removed INT = 0, @msg NVARCHAR(400);

    BEGIN TRY
        IF EXISTS (SELECT 1 FROM @tables WHERE OBJECT_ID(N'dbo.' + QUOTENAME(name), N'U') IS NULL)
            THROW 50001, 'Some PetNexus tables are missing - run PetNexus_Database.sql first.', 1;

        BEGIN TRANSACTION;

        -- 1. Remember the triggers on these tables so they can be put back
        INSERT INTO @triggers (definition)
        SELECT OBJECT_DEFINITION(tr.object_id)
        FROM sys.triggers tr JOIN sys.tables t ON t.object_id = tr.parent_id
        WHERE t.name IN (SELECT name FROM @tables);

        -- 2. Keep a full copy of every table
        DECLARE c CURSOR LOCAL FAST_FORWARD FOR SELECT name FROM @tables ORDER BY ord;
        OPEN c; FETCH NEXT FROM c INTO @name;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @sql = N'SELECT * INTO dbo.' + QUOTENAME(N'tidy_old_' + @name) + N' FROM dbo.' + QUOTENAME(@name) + N';';
            EXEC sp_executesql @sql;
            FETCH NEXT FROM c INTO @name;
        END
        CLOSE c; DEALLOCATE c;

        -- 3. Drop the foreign keys, then the old tables
        SET @sql = N'';
        SELECT @sql += N'ALTER TABLE dbo.' + QUOTENAME(t.name) + N' DROP CONSTRAINT ' + QUOTENAME(fk.name) + N';'
        FROM sys.foreign_keys fk JOIN sys.tables t ON t.object_id = fk.parent_object_id
        WHERE t.name IN (SELECT name FROM @tables);
        EXEC sp_executesql @sql;

        SET @sql = N'';
        SELECT @sql += N'DROP TABLE dbo.' + QUOTENAME(name) + N';' FROM @tables;
        EXEC sp_executesql @sql;

        -- 4. Create the tidy tables (parents first) and copy the rows back
        DECLARE c2 CURSOR LOCAL FAST_FORWARD FOR SELECT name, ddl FROM @tables ORDER BY ord;
        OPEN c2; FETCH NEXT FROM c2 INTO @name, @ddl;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC sp_executesql @ddl;

            SET @cols = NULL;
            SELECT @cols = COALESCE(@cols + N', ', N'') + QUOTENAME(n.name)
            FROM sys.columns n
            WHERE n.object_id = OBJECT_ID(N'dbo.' + QUOTENAME(@name))
              AND EXISTS (SELECT 1 FROM sys.columns o
                          WHERE o.object_id = OBJECT_ID(N'dbo.' + QUOTENAME(N'tidy_old_' + @name)) AND o.name = n.name)
            ORDER BY n.column_id;

            SET @sql = N'INSERT INTO dbo.' + QUOTENAME(@name) + N' (' + @cols + N') SELECT ' + @cols
                     + N' FROM dbo.' + QUOTENAME(N'tidy_old_' + @name) + N';';
            IF EXISTS (SELECT 1 FROM sys.identity_columns WHERE object_id = OBJECT_ID(N'dbo.' + QUOTENAME(@name)))
                SET @sql = N'SET IDENTITY_INSERT dbo.' + QUOTENAME(@name) + N' ON; ' + @sql
                         + N' SET IDENTITY_INSERT dbo.' + QUOTENAME(@name) + N' OFF;';
            EXEC sp_executesql @sql;

            -- 5. Every row must have arrived
            SET @sql = N'SELECT @o = COUNT_BIG(*) FROM dbo.' + QUOTENAME(N'tidy_old_' + @name)
                     + N'; SELECT @n = COUNT_BIG(*) FROM dbo.' + QUOTENAME(@name) + N';';
            EXEC sp_executesql @sql, N'@o BIGINT OUTPUT, @n BIGINT OUTPUT', @o = @old OUTPUT, @n = @new OUTPUT;
            IF @old <> @new
            BEGIN
                SET @msg = N'Row count mismatch in ' + @name + N' - nothing was changed.';
                THROW 50002, @msg, 1;
            END
            PRINT '  ' + @name + ': ' + CAST(@new AS VARCHAR(20)) + ' rows';

            SET @sql = N'DROP TABLE dbo.' + QUOTENAME(N'tidy_old_' + @name) + N';';
            EXEC sp_executesql @sql;
            FETCH NEXT FROM c2 INTO @name, @ddl;
        END
        CLOSE c2; DEALLOCATE c2;

        -- 6. Put the triggers back
        DECLARE c3 CURSOR LOCAL FAST_FORWARD FOR SELECT definition FROM @triggers WHERE definition IS NOT NULL;
        OPEN c3; FETCH NEXT FROM c3 INTO @sql;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            EXEC sp_executesql @sql;
            FETCH NEXT FROM c3 INTO @sql;
        END
        CLOSE c3; DEALLOCATE c3;

        -- 7. Remove role rows that do not belong to the account's role
        DELETE s FROM dbo.pet_owner s JOIN dbo.[USER] u ON u.id = s.user_id WHERE u.role <> 'PetOwner';
        SET @removed += @@ROWCOUNT;
        DELETE s FROM dbo.veterinarian s JOIN dbo.[USER] u ON u.id = s.user_id WHERE u.role <> 'Veterinarian';
        SET @removed += @@ROWCOUNT;
        DELETE s FROM dbo.clinic_staff s JOIN dbo.[USER] u ON u.id = s.user_id WHERE u.role <> 'ClinicStaff';
        SET @removed += @@ROWCOUNT;
        DELETE s FROM dbo.clinic_manager s JOIN dbo.[USER] u ON u.id = s.user_id WHERE u.role <> 'ClinicManager';
        SET @removed += @@ROWCOUNT;
        DELETE s FROM dbo.rescue_officer s JOIN dbo.[USER] u ON u.id = s.user_id WHERE u.role <> 'RescueOfficer';
        SET @removed += @@ROWCOUNT;
        DELETE s FROM dbo.pet_care_provider s JOIN dbo.[USER] u ON u.id = s.user_id WHERE u.role <> 'PetCareProvider';
        SET @removed += @@ROWCOUNT;

        COMMIT TRANSACTION;
        PRINT 'Done: PetNexus now uses the tidy table layout. Mismatched role rows removed: ' + CAST(@removed AS VARCHAR(10));
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        PRINT 'Rearranging failed - the database was left exactly as it was.';
        THROW;
    END CATCH
END

GO


-- ==============================================================================
-- SECTION 1: Core PetNexus Application Schema (31 Tables & Relations)
--
-- Layout of every table: primary key first, then its business ID, then the
-- foreign key columns, then the remaining attributes, with created_at /
-- updated_at last. Tables are created parent-first so every foreign key is
-- declared inside its own table.
--
-- Constraint names: pk_<table>, uk_<table>_<column>, fk_<table>_<parent>,
--                   ck_<table>_<column>, idx_<table>_<column>
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- Accounts and Roles
-- ------------------------------------------------------------------------------

-- Table       : USER
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.USER', N'U') IS NULL
BEGIN
    CREATE TABLE [USER] (
        id                    BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        user_id               VARCHAR(20)           NOT NULL,  -- unique
        address               VARCHAR(300)          NULL,
        approval_token        VARCHAR(100)          NULL,
        avatar_url            VARCHAR(MAX)          NULL,
        email                 VARCHAR(255)          NOT NULL,  -- unique
        emergency_contact     VARCHAR(200)          NULL,
        full_name             VARCHAR(150)          NOT NULL,
        password_hash         VARCHAR(255)          NOT NULL,
        password_reset_token  VARCHAR(100)          NULL,
        phone                 VARCHAR(30)           NULL,
        rejection_reason      VARCHAR(500)          NULL,
        role                  VARCHAR(30)           NOT NULL,
        status                VARCHAR(40)           NOT NULL,
        suspension_reason     VARCHAR(500)          NULL,
        created_at            DATETIME2(7)          NOT NULL,
        updated_at            DATETIME2(7)          NULL,
        CONSTRAINT pk_users PRIMARY KEY (id),
        CONSTRAINT uk_users_email UNIQUE (email),
        CONSTRAINT uk_users_user_id UNIQUE (user_id),
        CONSTRAINT ck_users_role CHECK ([role]='Admin' OR [role]='RescueOfficer' OR [role]='ClinicManager' OR [role]='PetCareProvider' OR [role]='ClinicStaff' OR [role]='Veterinarian' OR [role]='PetOwner'),
        CONSTRAINT ck_users_status CHECK ([status]='Suspended' OR [status]='Rejected' OR [status]='Active' OR [status]='PendingApproval' OR [status]='PendingEmailVerification')
    );
END
GO

-- Table       : pet_owner
-- Primary key : user_id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.pet_owner', N'U') IS NULL
BEGIN
    CREATE TABLE pet_owner (
        user_id  BIGINT  NOT NULL,  -- PK, FK -> USER
        CONSTRAINT pk_pet_owner PRIMARY KEY (user_id),
        CONSTRAINT fk_pet_owner_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
END
GO

-- Table       : veterinarian
-- Primary key : user_id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.veterinarian', N'U') IS NULL
BEGIN
    CREATE TABLE veterinarian (
        user_id         BIGINT        NOT NULL,  -- PK, FK -> USER
        license_number  VARCHAR(50)   NULL,
        specialization  VARCHAR(150)  NULL,
        CONSTRAINT pk_veterinarian PRIMARY KEY (user_id),
        CONSTRAINT fk_veterinarian_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
END
GO

-- Table       : clinic_staff
-- Primary key : user_id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.clinic_staff', N'U') IS NULL
BEGIN
    CREATE TABLE clinic_staff (
        user_id   BIGINT       NOT NULL,  -- PK, FK -> USER
        staff_id  VARCHAR(30)  NULL,
        CONSTRAINT pk_clinic_staff PRIMARY KEY (user_id),
        CONSTRAINT fk_clinic_staff_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
END
GO

-- Table       : clinic_manager
-- Primary key : user_id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.clinic_manager', N'U') IS NULL
BEGIN
    CREATE TABLE clinic_manager (
        user_id       BIGINT       NOT NULL,  -- PK, FK -> USER
        manager_code  VARCHAR(30)  NULL,
        CONSTRAINT pk_clinic_manager PRIMARY KEY (user_id),
        CONSTRAINT fk_clinic_manager_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
END
GO

-- Table       : rescue_officer
-- Primary key : user_id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.rescue_officer', N'U') IS NULL
BEGIN
    CREATE TABLE rescue_officer (
        user_id       BIGINT       NOT NULL,  -- PK, FK -> USER
        badge_number  VARCHAR(30)  NULL,
        CONSTRAINT pk_rescue_officer PRIMARY KEY (user_id),
        CONSTRAINT fk_rescue_officer_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
END
GO

-- Table       : pet_care_provider
-- Primary key : user_id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.pet_care_provider', N'U') IS NULL
BEGIN
    CREATE TABLE pet_care_provider (
        user_id            BIGINT        NOT NULL,  -- PK, FK -> USER
        service_specialty  VARCHAR(150)  NULL,
        CONSTRAINT pk_pet_care_provider PRIMARY KEY (user_id),
        CONSTRAINT fk_pet_care_provider_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
END
GO

-- Table       : approval_history
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.approval_history', N'U') IS NULL
BEGIN
    CREATE TABLE approval_history (
        id              BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        action          VARCHAR(50)           NOT NULL,
        admin_id        VARCHAR(20)           NOT NULL,
        history_id      VARCHAR(30)           NOT NULL,
        reason          VARCHAR(500)          NULL,
        timestamp       DATETIME2(7)          NOT NULL,
        user_full_name  VARCHAR(150)          NOT NULL,
        user_id         VARCHAR(20)           NOT NULL,
        CONSTRAINT pk_approval_history PRIMARY KEY (id)
    );
    CREATE INDEX idx_approval_history_user_id ON approval_history (user_id);
END
GO

-- Table       : notifications
-- Primary key : id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.notifications', N'U') IS NULL
BEGIN
    CREATE TABLE notifications (
        id               BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        notification_id  VARCHAR(40)           NOT NULL,  -- unique
        user_id          BIGINT                NOT NULL,  -- FK -> USER
        is_read          BIT                   NOT NULL,
        link             VARCHAR(300)          NULL,
        message          VARCHAR(1000)         NOT NULL,
        title            VARCHAR(200)          NOT NULL,
        type             VARCHAR(30)           NOT NULL,
        created_at       DATETIME2(7)          NOT NULL,
        CONSTRAINT pk_notifications PRIMARY KEY (id),
        CONSTRAINT uk_notifications_notification_id UNIQUE (notification_id),
        CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES [USER] (id),
        CONSTRAINT ck_notifications_type CHECK ([type]='System' OR [type]='Health' OR [type]='Inventory' OR [type]='Approval' OR [type]='Adoption' OR [type]='Rescue' OR [type]='Appointment')
    );
    CREATE INDEX idx_notifications_is_read ON notifications (is_read);
    CREATE INDEX idx_notifications_user ON notifications (user_id);
END
GO

-- ------------------------------------------------------------------------------
-- Pets and Medical Records
-- ------------------------------------------------------------------------------

-- Table       : pets
-- Primary key : id
-- Foreign keys: owner_id -> USER(id)
IF OBJECT_ID(N'dbo.pets', N'U') IS NULL
BEGIN
    CREATE TABLE pets (
        id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        pet_id             VARCHAR(20)           NOT NULL,  -- unique
        owner_id           BIGINT                NOT NULL,  -- FK -> USER
        age_months         INT                   NULL,
        age_years          INT                   NULL,
        allergies          VARCHAR(500)          NULL,
        breed              VARCHAR(100)          NOT NULL,
        date_of_birth      DATE                  NULL,
        emergency_contact  VARCHAR(300)          NULL,
        gender             VARCHAR(30)           NULL,
        image_url          VARCHAR(500)          NULL,
        medical_notes      VARCHAR(2000)         NULL,
        microchip_id       VARCHAR(20)           NULL,
        name               VARCHAR(100)          NOT NULL,
        species            VARCHAR(50)           NOT NULL,
        weight_kg          NUMERIC(5,2)          NULL,
        created_at         DATETIME2(7)          NOT NULL,
        updated_at         DATETIME2(7)          NULL,
        CONSTRAINT pk_pets PRIMARY KEY (id),
        CONSTRAINT uk_pets_pet_id UNIQUE (pet_id),
        CONSTRAINT fk_pets_owner FOREIGN KEY (owner_id) REFERENCES [USER] (id)
    );
    CREATE INDEX idx_pets_owner ON pets (owner_id);
END
GO

-- Table       : pet_documents
-- Primary key : id
-- Foreign keys: pet_id -> pets(id)
IF OBJECT_ID(N'dbo.pet_documents', N'U') IS NULL
BEGIN
    CREATE TABLE pet_documents (
        id             BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        document_id    VARCHAR(20)           NOT NULL,  -- unique
        pet_id         BIGINT                NOT NULL,  -- FK -> pets
        document_type  VARCHAR(100)          NOT NULL,
        file_name      VARCHAR(255)          NOT NULL,
        file_size      VARCHAR(50)           NULL,
        file_url       VARCHAR(1000)         NULL,
        notes          VARCHAR(2000)         NULL,
        owner_id       VARCHAR(20)           NOT NULL,
        pet_name       VARCHAR(100)          NULL,
        uploaded_at    DATETIME2(7)          NOT NULL,
        CONSTRAINT pk_pet_documents PRIMARY KEY (id),
        CONSTRAINT uk_pet_documents_document_id UNIQUE (document_id),
        CONSTRAINT fk_pet_documents_pet FOREIGN KEY (pet_id) REFERENCES pets (id)
    );
END
GO

-- Table       : vaccinations
-- Primary key : id
-- Foreign keys: pet_id -> pets(id)
IF OBJECT_ID(N'dbo.vaccinations', N'U') IS NULL
BEGIN
    CREATE TABLE vaccinations (
        id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        vaccine_id         VARCHAR(20)           NOT NULL,  -- unique
        pet_id             BIGINT                NOT NULL,  -- FK -> pets
        administered_by    VARCHAR(150)          NULL,
        administered_date  DATE                  NULL,
        batch_number       VARCHAR(50)           NULL,
        next_due_date      DATE                  NULL,
        pet_name           VARCHAR(100)          NULL,
        status             VARCHAR(30)           NULL,
        vaccine_name       VARCHAR(200)          NOT NULL,
        CONSTRAINT pk_vaccinations PRIMARY KEY (id),
        CONSTRAINT uk_vaccinations_vaccine_id UNIQUE (vaccine_id),
        CONSTRAINT fk_vaccinations_pet FOREIGN KEY (pet_id) REFERENCES pets (id)
    );
END
GO

-- Table       : appointments
-- Primary key : id
-- Foreign keys: owner_fk_id -> USER(id)
--               pet_fk_id -> pets(id)
--               vet_fk_id -> USER(id)
IF OBJECT_ID(N'dbo.appointments', N'U') IS NULL
BEGIN
    CREATE TABLE appointments (
        id                          BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        appointment_id              VARCHAR(20)           NOT NULL,  -- unique
        owner_fk_id                 BIGINT                NULL,      -- FK -> USER
        pet_fk_id                   BIGINT                NULL,      -- FK -> pets
        vet_fk_id                   BIGINT                NULL,      -- FK -> USER
        appointment_date            DATE                  NOT NULL,
        breed                       VARCHAR(100)          NULL,
        cancellation_reason         VARCHAR(500)          NULL,
        cancelled_at                DATETIME2(7)          NULL,
        notes                       VARCHAR(2000)         NULL,
        owner_id                    VARCHAR(20)           NULL,
        owner_name                  VARCHAR(150)          NOT NULL,
        owner_phone                 VARCHAR(50)           NULL,
        pet_id                      VARCHAR(20)           NULL,
        pet_name                    VARCHAR(100)          NOT NULL,
        reason                      VARCHAR(1000)         NULL,
        reschedule_reason           VARCHAR(500)          NULL,
        rescheduled_from_date       DATE                  NULL,
        rescheduled_from_time_slot  VARCHAR(30)           NULL,
        rescheduled_from_vet_name   VARCHAR(150)          NULL,
        service_type                VARCHAR(100)          NOT NULL,
        species                     VARCHAR(50)           NULL,
        status                      VARCHAR(30)           NOT NULL,
        symptoms                    VARCHAR(1000)         NULL,
        time_slot                   VARCHAR(30)           NOT NULL,
        token_number                VARCHAR(20)           NULL,
        vet_id                      VARCHAR(20)           NULL,
        vet_name                    VARCHAR(150)          NOT NULL,
        created_at                  DATETIME2(7)          NOT NULL,
        updated_at                  DATETIME2(7)          NULL,
        CONSTRAINT pk_appointments PRIMARY KEY (id),
        CONSTRAINT uk_appointments_appointment_id UNIQUE (appointment_id),
        CONSTRAINT fk_appointments_owner FOREIGN KEY (owner_fk_id) REFERENCES [USER] (id),
        CONSTRAINT fk_appointments_pet FOREIGN KEY (pet_fk_id) REFERENCES pets (id),
        CONSTRAINT fk_appointments_vet FOREIGN KEY (vet_fk_id) REFERENCES [USER] (id),
        CONSTRAINT ck_appointments_status CHECK ([status]='NoShow' OR [status]='Cancelled' OR [status]='Completed' OR [status]='InRoom' OR [status]='CheckedIn' OR [status]='Confirmed' OR [status]='Pending' OR [status]='Scheduled')
    );
    CREATE INDEX idx_appointments_date_slot ON appointments (appointment_date, time_slot);
    CREATE INDEX idx_appointments_owner ON appointments (owner_id);
    CREATE INDEX idx_appointments_pet ON appointments (pet_id);
    CREATE INDEX idx_appointments_vet_date ON appointments (vet_id, appointment_date);
END
GO

-- Table       : consultations
-- Primary key : id
-- Foreign keys: appointment_fk_id -> appointments(id)
--               pet_fk_id -> pets(id)
--               vet_fk_id -> USER(id)
IF OBJECT_ID(N'dbo.consultations', N'U') IS NULL
BEGIN
    CREATE TABLE consultations (
        id                      BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        consultation_id         VARCHAR(30)           NOT NULL,  -- unique
        appointment_fk_id       BIGINT                NULL,      -- FK -> appointments
        pet_fk_id               BIGINT                NULL,      -- FK -> pets
        vet_fk_id               BIGINT                NULL,      -- FK -> USER
        appointment_id          VARCHAR(20)           NULL,
        assessment_diagnosis    VARCHAR(2000)         NOT NULL,
        case_id                 VARCHAR(30)           NULL,
        consultation_date       DATETIME2(7)          NOT NULL,
        follow_up_date          DATE                  NULL,
        heart_rate_bpm          INT                   NULL,
        objective_findings      VARCHAR(2000)         NULL,
        pass_to_provider        BIT                   NULL,
        pet_id                  VARCHAR(20)           NULL,
        pet_name                VARCHAR(100)          NOT NULL,
        rescue_medical_summary  VARCHAR(2000)         NULL,
        respiratory_rate_bpm    INT                   NULL,
        status                  VARCHAR(30)           NULL,
        subjective_notes        VARCHAR(2000)         NULL,
        temperaturec            NUMERIC(4,1)          NULL,
        treatment_plan          VARCHAR(2000)         NOT NULL,
        vet_id                  VARCHAR(20)           NULL,
        vet_name                VARCHAR(150)          NOT NULL,
        weight_kg               NUMERIC(5,2)          NULL,
        created_at              DATETIME2(7)          NOT NULL,
        updated_at              DATETIME2(7)          NULL,
        CONSTRAINT pk_consultations PRIMARY KEY (id),
        CONSTRAINT uk_consultations_consultation_id UNIQUE (consultation_id),
        CONSTRAINT fk_consultations_appointment FOREIGN KEY (appointment_fk_id) REFERENCES appointments (id),
        CONSTRAINT fk_consultations_pet FOREIGN KEY (pet_fk_id) REFERENCES pets (id),
        CONSTRAINT fk_consultations_vet FOREIGN KEY (vet_fk_id) REFERENCES [USER] (id)
    );
    CREATE INDEX idx_consultations_appointment_id ON consultations (appointment_id);
    CREATE INDEX idx_consultations_case_id ON consultations (case_id);
    CREATE INDEX idx_consultations_pet_id ON consultations (pet_id);
    CREATE INDEX idx_consultations_vet_id ON consultations (vet_id);
END
GO

-- Table       : prescriptions
-- Primary key : id
-- Foreign keys: consultation_fk_id -> consultations(id)
--               pet_fk_id -> pets(id)
--               vet_fk_id -> USER(id)
IF OBJECT_ID(N'dbo.prescriptions', N'U') IS NULL
BEGIN
    CREATE TABLE prescriptions (
        id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        prescription_id     VARCHAR(30)           NOT NULL,  -- unique
        consultation_fk_id  BIGINT                NULL,      -- FK -> consultations
        pet_fk_id           BIGINT                NULL,      -- FK -> pets
        vet_fk_id           BIGINT                NULL,      -- FK -> USER
        consultation_id     VARCHAR(30)           NULL,
        digital_signature   VARCHAR(300)          NULL,
        instructions        VARCHAR(1000)         NULL,
        issue_date          DATE                  NOT NULL,
        owner_name          VARCHAR(150)          NULL,
        pet_id              VARCHAR(20)           NULL,
        pet_name            VARCHAR(100)          NOT NULL,
        status              VARCHAR(30)           NOT NULL,
        valid_until         DATE                  NULL,
        vet_id              VARCHAR(20)           NULL,
        vet_license         VARCHAR(50)           NULL,
        vet_name            VARCHAR(150)          NOT NULL,
        created_at          DATETIME2(7)          NOT NULL,
        updated_at          DATETIME2(7)          NULL,
        CONSTRAINT pk_prescriptions PRIMARY KEY (id),
        CONSTRAINT uk_prescriptions_rx_id UNIQUE (prescription_id),
        CONSTRAINT fk_prescriptions_consultation FOREIGN KEY (consultation_fk_id) REFERENCES consultations (id),
        CONSTRAINT fk_prescriptions_pet FOREIGN KEY (pet_fk_id) REFERENCES pets (id),
        CONSTRAINT fk_prescriptions_vet FOREIGN KEY (vet_fk_id) REFERENCES [USER] (id)
    );
    CREATE INDEX idx_prescriptions_consultation_id ON prescriptions (consultation_id);
    CREATE INDEX idx_prescriptions_pet_id ON prescriptions (pet_id);
    CREATE INDEX idx_prescriptions_vet_id ON prescriptions (vet_id);
END
GO

-- Table       : prescription_items
-- Primary key : id
-- Foreign keys: prescription_fk_id -> prescriptions(id)
IF OBJECT_ID(N'dbo.prescription_items', N'U') IS NULL
BEGIN
    CREATE TABLE prescription_items (
        id                   BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        item_id              VARCHAR(50)           NOT NULL,  -- unique
        prescription_fk_id   BIGINT                NOT NULL,  -- FK -> prescriptions
        dosage               VARCHAR(100)          NULL,
        duration_days        INT                   NULL,
        frequency            VARCHAR(100)          NULL,
        medication_name      VARCHAR(200)          NOT NULL,
        prescription_id      VARCHAR(30)           NULL,
        quantity_prescribed  INT                   NULL,
        refills_allowed      INT                   NULL,
        CONSTRAINT pk_prescription_items PRIMARY KEY (id),
        CONSTRAINT uk_prescription_items_item_id UNIQUE (item_id),
        CONSTRAINT fk_rx_items_prescription FOREIGN KEY (prescription_fk_id) REFERENCES prescriptions (id) ON DELETE CASCADE
    );
    CREATE INDEX idx_prescription_items_rx_id ON prescription_items (prescription_id);
END
GO

-- ------------------------------------------------------------------------------
-- Rescue, Foster and Adoption
-- ------------------------------------------------------------------------------

-- Table       : rescue_cases
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.rescue_cases', N'U') IS NULL
BEGIN
    CREATE TABLE rescue_cases (
        id                         BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        case_id                    VARCHAR(30)           NOT NULL,  -- unique
        assigned_officer_id        VARCHAR(50)           NULL,
        assigned_officer_name      VARCHAR(150)          NULL,
        assigned_provider_id       VARCHAR(50)           NULL,
        assigned_provider_name     VARCHAR(150)          NULL,
        assigned_vet_id            VARCHAR(50)           NULL,
        assigned_vet_name          VARCHAR(150)          NULL,
        breed                      VARCHAR(100)          NULL,
        case_number                VARCHAR(20)           NULL,
        condition_severity         VARCHAR(50)           NULL,
        cover_photo_url            NVARCHAR(MAX)         NULL,
        description                VARCHAR(2000)         NULL,
        estimated_age              VARCHAR(50)           NULL,
        foster_parent_id           VARCHAR(30)           NULL,
        foster_parent_name         VARCHAR(150)          NULL,
        gender                     VARCHAR(20)           NULL,
        intake_date                DATE                  NOT NULL,
        intake_officer             VARCHAR(150)          NULL,
        is_published_for_adoption  BIT                   NOT NULL,
        medical_summary            VARCHAR(2000)         NULL,
        microchip_id               VARCHAR(50)           NULL,
        reported_by_user_id        VARCHAR(50)           NULL,
        reported_by_user_name      VARCHAR(150)          NULL,
        reported_by_user_phone     VARCHAR(50)           NULL,
        rescue_location            VARCHAR(500)          NOT NULL,
        species                    VARCHAR(50)           NULL,
        status                     VARCHAR(30)           NOT NULL,
        temporary_name             VARCHAR(100)          NOT NULL,
        created_at                 DATETIME2(7)          NOT NULL,
        updated_at                 DATETIME2(7)          NULL,
        CONSTRAINT pk_rescue_cases PRIMARY KEY (id),
        CONSTRAINT uk_rescue_cases_case_id UNIQUE (case_id)
    );
    CREATE INDEX idx_rescue_cases_published ON rescue_cases (is_published_for_adoption);
    CREATE INDEX idx_rescue_cases_status ON rescue_cases (status);
END
GO

-- Table       : rescue_photos
-- Primary key : id
-- Foreign keys: rescue_case_fk_id -> rescue_cases(id)
IF OBJECT_ID(N'dbo.rescue_photos', N'U') IS NULL
BEGIN
    CREATE TABLE rescue_photos (
        id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        photo_id           VARCHAR(30)           NOT NULL,  -- unique
        rescue_case_fk_id  BIGINT                NOT NULL,  -- FK -> rescue_cases
        caption            VARCHAR(300)          NULL,
        case_id            VARCHAR(30)           NOT NULL,
        photo_url          NVARCHAR(MAX)         NULL,
        tag                VARCHAR(50)           NULL,
        uploaded_at        DATETIME2(7)          NULL,
        CONSTRAINT pk_rescue_photos PRIMARY KEY (id),
        CONSTRAINT uk_rescue_photos_photo_id UNIQUE (photo_id),
        CONSTRAINT fk_rescue_photos_case FOREIGN KEY (rescue_case_fk_id) REFERENCES rescue_cases (id)
    );
    CREATE INDEX idx_rescue_photos_case_id ON rescue_photos (case_id);
END
GO

-- Table       : rescue_progress_logs
-- Primary key : id
-- Foreign keys: rescue_case_fk_id -> rescue_cases(id)
IF OBJECT_ID(N'dbo.rescue_progress_logs', N'U') IS NULL
BEGIN
    CREATE TABLE rescue_progress_logs (
        id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        log_id             VARCHAR(30)           NOT NULL,  -- unique
        rescue_case_fk_id  BIGINT                NOT NULL,  -- FK -> rescue_cases
        case_id            VARCHAR(30)           NOT NULL,
        log_date           DATETIME2(7)          NOT NULL,
        log_type           VARCHAR(30)           NULL,
        logged_by          VARCHAR(150)          NOT NULL,
        notes              VARCHAR(2000)         NULL,
        title              VARCHAR(200)          NOT NULL,
        created_at         DATETIME2(7)          NOT NULL,
        CONSTRAINT pk_rescue_progress_logs PRIMARY KEY (id),
        CONSTRAINT uk_rescue_progress_logs_log_id UNIQUE (log_id),
        CONSTRAINT fk_rescue_logs_case FOREIGN KEY (rescue_case_fk_id) REFERENCES rescue_cases (id)
    );
    CREATE INDEX idx_rescue_logs_case_id ON rescue_progress_logs (case_id);
    CREATE INDEX idx_rescue_logs_log_date ON rescue_progress_logs (log_date);
END
GO

-- Table       : foster_records
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.foster_records', N'U') IS NULL
BEGIN
    CREATE TABLE foster_records (
        id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        foster_id          VARCHAR(30)           NOT NULL,  -- unique
        active_placements  INT                   NULL,
        address            VARCHAR(300)          NULL,
        email              VARCHAR(150)          NULL,
        full_name          VARCHAR(150)          NOT NULL,
        home_type          VARCHAR(200)          NULL,
        max_capacity       INT                   NULL,
        phone              VARCHAR(30)           NULL,
        rating             NUMERIC(3,1)          NULL,
        status             VARCHAR(20)           NULL,
        created_at         DATETIME2(7)          NOT NULL,
        updated_at         DATETIME2(7)          NULL,
        CONSTRAINT pk_foster_records PRIMARY KEY (id),
        CONSTRAINT uk_foster_records_foster_id UNIQUE (foster_id)
    );
END
GO

-- Table       : adoption_listings
-- Primary key : listing_id
-- Foreign keys: case_id -> rescue_cases(id)
IF OBJECT_ID(N'dbo.adoption_listings', N'U') IS NULL
BEGIN
    CREATE TABLE adoption_listings (
        listing_id                 VARCHAR(255)  NOT NULL,  -- PK
        case_id                    BIGINT        NOT NULL,  -- FK -> rescue_cases, unique
        is_published_for_adoption  BIT           NOT NULL,
        created_at                 DATETIME2(7)  NOT NULL,
        updated_at                 DATETIME2(7)  NOT NULL,
        CONSTRAINT pk_adoption_listings PRIMARY KEY (listing_id),
        CONSTRAINT uk_adoption_listings_case_id UNIQUE (case_id),
        CONSTRAINT fk_adoption_listings_case FOREIGN KEY (case_id) REFERENCES rescue_cases (id)
    );
END
GO

-- Table       : adoption_applications
-- Primary key : application_id
-- Foreign keys: applicant_id -> USER(id)
--               case_id -> rescue_cases(id)
--               reviewed_by -> USER(id)
IF OBJECT_ID(N'dbo.adoption_applications', N'U') IS NULL
BEGIN
    CREATE TABLE adoption_applications (
        application_id    VARCHAR(255)  NOT NULL,  -- PK
        applicant_id      BIGINT        NOT NULL,  -- FK -> USER
        case_id           BIGINT        NOT NULL,  -- FK -> rescue_cases
        reviewed_by       BIGINT        NULL,      -- FK -> USER
        applicant_name    VARCHAR(255)  NOT NULL,
        applicant_phone   VARCHAR(255)  NOT NULL,
        application_type  VARCHAR(255)  NOT NULL,
        pet_name          VARCHAR(255)  NOT NULL,
        review_notes      VARCHAR(255)  NULL,
        reviewed_at       DATETIME2(7)  NULL,
        status            VARCHAR(255)  NOT NULL,
        created_at        DATETIME2(7)  NOT NULL,
        CONSTRAINT pk_adoption_applications PRIMARY KEY (application_id),
        CONSTRAINT fk_adoption_applications_applicant FOREIGN KEY (applicant_id) REFERENCES [USER] (id),
        CONSTRAINT fk_adoption_applications_case FOREIGN KEY (case_id) REFERENCES rescue_cases (id),
        CONSTRAINT fk_adoption_applications_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES [USER] (id),
        CONSTRAINT ck_adoption_applications_status CHECK ([status]='CANCELLED' OR [status]='REJECTED' OR [status]='APPROVED' OR [status]='UNDER_REVIEW' OR [status]='SUBMITTED')
    );
END
GO

-- Table       : adoption_application_documents
-- Primary key : id
-- Foreign keys: application_id -> adoption_applications(application_id)
IF OBJECT_ID(N'dbo.adoption_application_documents', N'U') IS NULL
BEGIN
    CREATE TABLE adoption_application_documents (
        id              BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        application_id  VARCHAR(255)          NOT NULL,  -- FK -> adoption_applications
        document_type   VARCHAR(255)          NOT NULL,
        file_name       VARCHAR(255)          NOT NULL,
        file_size       VARCHAR(255)          NULL,
        file_url        VARCHAR(255)          NOT NULL,
        status          VARCHAR(255)          NULL,
        uploaded_at     DATETIME2(7)          NOT NULL,
        CONSTRAINT pk_adoption_application_documents PRIMARY KEY (id),
        CONSTRAINT fk_adoption_application_documents_application FOREIGN KEY (application_id) REFERENCES adoption_applications (application_id)
    );
END
GO

-- ------------------------------------------------------------------------------
-- Pet Care Services
-- ------------------------------------------------------------------------------

-- Table       : care_providers
-- Primary key : id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.care_providers', N'U') IS NULL
BEGIN
    CREATE TABLE care_providers (
        id             BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        user_id        BIGINT                NOT NULL,  -- FK -> USER, unique
        active         BIT                   NOT NULL,
        contact_email  VARCHAR(100)          NULL,
        contact_phone  VARCHAR(20)           NULL,
        provider_id    VARCHAR(20)           NOT NULL,
        provider_name  VARCHAR(100)          NOT NULL,
        CONSTRAINT pk_care_providers PRIMARY KEY (id),
        CONSTRAINT uk_care_provider_user UNIQUE (user_id),
        CONSTRAINT fk_care_provider_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
END
GO

-- Table       : care_services
-- Primary key : id
-- Foreign keys: created_by_user_id -> USER(id)
IF OBJECT_ID(N'dbo.care_services', N'U') IS NULL
BEGIN
    CREATE TABLE care_services (
        id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        created_by_user_id  BIGINT                NOT NULL,  -- FK -> USER
        badge               VARCHAR(50)           NULL,
        description         VARCHAR(2000)         NULL,
        discount_percent    INT                   NULL,
        duration_minutes    INT                   NOT NULL,
        name                VARCHAR(100)          NOT NULL,  -- unique
        original_value      NUMERIC(10,2)         NULL,
        price               NUMERIC(10,2)         NOT NULL,
        recommended_for     VARCHAR(100)          NULL,
        service_id          VARCHAR(20)           NOT NULL,
        status              VARCHAR(30)           NOT NULL,
        tagline             VARCHAR(300)          NULL,
        CONSTRAINT pk_care_services PRIMARY KEY (id),
        CONSTRAINT uk_care_service_name UNIQUE (name),
        CONSTRAINT fk_care_service_user FOREIGN KEY (created_by_user_id) REFERENCES [USER] (id),
        CONSTRAINT ck_care_services_status CHECK ([status]='COMPLETED' OR [status]='READY_FOR_PICKUP' OR [status]='IN_PROGRESS' OR [status]='CHECKED_IN' OR [status]='SCHEDULED')
    );
END
GO

-- Table       : care_service_logs
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.care_service_logs', N'U') IS NULL
BEGIN
    CREATE TABLE care_service_logs (
        id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        service_log_id      VARCHAR(20)           NOT NULL,  -- unique
        case_id             VARCHAR(20)           NULL,
        intake_condition    VARCHAR(500)          NULL,
        notes               VARCHAR(1000)         NULL,
        owner_id            VARCHAR(20)           NULL,
        owner_name          VARCHAR(100)          NULL,
        pet_id              VARCHAR(20)           NULL,
        pet_name            VARCHAR(100)          NULL,
        provider_id         VARCHAR(20)           NULL,
        provider_name       VARCHAR(100)          NULL,
        return_to_rescue    BIT                   NOT NULL,
        service_date        DATE                  NOT NULL,
        service_type        VARCHAR(100)          NOT NULL,
        services_performed  VARCHAR(1000)         NULL,
        status              VARCHAR(30)           NOT NULL,
        created_at          DATE                  NOT NULL,
        CONSTRAINT pk_care_service_logs PRIMARY KEY (id),
        CONSTRAINT uk_care_service_log_id UNIQUE (service_log_id),
        CONSTRAINT ck_care_service_logs_status CHECK ([status]='COMPLETED' OR [status]='READY_FOR_PICKUP' OR [status]='IN_PROGRESS' OR [status]='CHECKED_IN' OR [status]='SCHEDULED')
    );
END
GO

-- Table       : service_package_bookings
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.service_package_bookings', N'U') IS NULL
BEGIN
    CREATE TABLE service_package_bookings (
        id                  BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        booking_id          VARCHAR(20)           NOT NULL,  -- unique
        completed_sessions  INT                   NOT NULL,
        expiry_date         DATE                  NOT NULL,
        owner_id            VARCHAR(20)           NOT NULL,
        owner_name          VARCHAR(100)          NULL,
        package_id          VARCHAR(50)           NULL,
        package_name        VARCHAR(100)          NOT NULL,
        pet_id              VARCHAR(20)           NULL,
        pet_name            VARCHAR(100)          NULL,
        purchase_date       DATE                  NOT NULL,
        remaining_sessions  INT                   NOT NULL,
        status              VARCHAR(30)           NOT NULL,
        total_sessions      INT                   NOT NULL,
        created_at          DATE                  NOT NULL,
        CONSTRAINT pk_service_package_bookings PRIMARY KEY (id),
        CONSTRAINT uk_service_package_booking_id UNIQUE (booking_id)
    );
END
GO

-- ------------------------------------------------------------------------------
-- Inventory, Suppliers and Feedback
-- ------------------------------------------------------------------------------

-- Table       : suppliers
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.suppliers', N'U') IS NULL
BEGIN
    CREATE TABLE suppliers (
        id              BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        supplier_id     VARCHAR(20)           NOT NULL,  -- unique
        active          BIT                   NOT NULL,
        address         VARCHAR(300)          NULL,
        category        VARCHAR(100)          NULL,
        company_name    VARCHAR(150)          NOT NULL,
        contact_person  VARCHAR(100)          NULL,
        email           VARCHAR(100)          NOT NULL,
        lead_time_days  INT                   NOT NULL,
        phone           VARCHAR(30)           NULL,
        rating          NUMERIC(3,1)          NOT NULL,
        created_at      DATETIME2(7)          NOT NULL,
        updated_at      DATETIME2(7)          NULL,
        CONSTRAINT pk_suppliers PRIMARY KEY (id),
        CONSTRAINT uk_suppliers_supplier_id UNIQUE (supplier_id)
    );
END
GO

-- Table       : inventory_items
-- Primary key : id
-- Foreign keys: supplier_fk_id -> suppliers(id)
IF OBJECT_ID(N'dbo.inventory_items', N'U') IS NULL
BEGIN
    CREATE TABLE inventory_items (
        id                   BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        item_id              VARCHAR(20)           NOT NULL,  -- unique
        supplier_fk_id       BIGINT                NULL,      -- FK -> suppliers
        batch_number         VARCHAR(50)           NULL,
        category             VARCHAR(100)          NOT NULL,
        current_stock        INT                   NOT NULL,
        expiry_date          DATE                  NULL,
        min_stock_threshold  INT                   NOT NULL,
        name                 VARCHAR(150)          NOT NULL,
        selling_price        NUMERIC(10,2)         NOT NULL,
        sku                  VARCHAR(50)           NOT NULL,  -- unique
        status               VARCHAR(30)           NOT NULL,
        supplier_name        VARCHAR(150)          NULL,
        unit                 VARCHAR(50)           NOT NULL,
        unit_price           NUMERIC(10,2)         NOT NULL,
        created_at           DATETIME2(7)          NOT NULL,
        updated_at           DATETIME2(7)          NULL,
        CONSTRAINT pk_inventory_items PRIMARY KEY (id),
        CONSTRAINT uk_inventory_items_item_id UNIQUE (item_id),
        CONSTRAINT uk_inventory_items_sku UNIQUE (sku),
        CONSTRAINT fk_inventory_items_supplier FOREIGN KEY (supplier_fk_id) REFERENCES suppliers (id),
        CONSTRAINT ck_inventory_items_status CHECK ([status]='EXPIRED' OR [status]='OUT_OF_STOCK' OR [status]='LOW_STOCK' OR [status]='IN_STOCK')
    );
    CREATE INDEX idx_inventory_items_category ON inventory_items (category);
    CREATE INDEX idx_inventory_items_status ON inventory_items (status);
END
GO

-- Table       : purchase_orders
-- Primary key : id
-- Foreign keys: none
IF OBJECT_ID(N'dbo.purchase_orders', N'U') IS NULL
BEGIN
    CREATE TABLE purchase_orders (
        id                 BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        order_id           VARCHAR(30)           NOT NULL,  -- unique
        items_description  VARCHAR(1000)         NULL,
        notes              VARCHAR(500)          NULL,
        status             VARCHAR(30)           NOT NULL,
        supplier_id        VARCHAR(20)           NULL,
        supplier_name      VARCHAR(150)          NOT NULL,
        total_amount       NUMERIC(12,2)         NOT NULL,
        created_at         DATETIME2(7)          NOT NULL,
        updated_at         DATETIME2(7)          NULL,
        CONSTRAINT pk_purchase_orders PRIMARY KEY (id),
        CONSTRAINT uk_purchase_orders_order_id UNIQUE (order_id)
    );
END
GO

-- Table       : feedbacks
-- Primary key : id
-- Foreign keys: user_id -> USER(id)
IF OBJECT_ID(N'dbo.feedbacks', N'U') IS NULL
BEGIN
    CREATE TABLE feedbacks (
        id                    BIGINT IDENTITY(1,1)  NOT NULL,  -- PK
        feedback_id           VARCHAR(30)           NOT NULL,  -- unique
        user_id               BIGINT                NOT NULL,  -- FK -> USER
        comments              VARCHAR(2000)         NOT NULL,
        manager_responded_at  DATETIME2(7)          NULL,
        manager_response      VARCHAR(2000)         NULL,
        rating                INT                   NOT NULL,
        service_category      VARCHAR(100)          NOT NULL,
        staff_mentioned       VARCHAR(150)          NULL,
        title                 VARCHAR(200)          NOT NULL,
        user_name             VARCHAR(150)          NOT NULL,
        created_at            DATETIME2(7)          NOT NULL,
        updated_at            DATETIME2(7)          NULL,
        CONSTRAINT pk_feedbacks PRIMARY KEY (id),
        CONSTRAINT uk_feedback_feedback_id UNIQUE (feedback_id),
        CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES [USER] (id)
    );
    CREATE INDEX idx_feedback_category ON feedbacks (service_category);
    CREATE INDEX idx_feedback_user ON feedbacks (user_id);
END
GO

-- ==============================================================================
-- SECTION 2: Initial Application Seed Data
-- ==============================================================================

-- ==============================================================================
-- Care Providers & Service Logs Initial Configuration
-- ==============================================================================
-- Ensure Eshani (USR-016) is registered as active care provider
IF NOT EXISTS (SELECT 1 FROM care_providers WHERE user_id = 11)
BEGIN
    INSERT INTO care_providers (active, contact_email, contact_phone, provider_id, provider_name, user_id)
    VALUES (1, 'eshani@petnexus.com', '0704564985', 'USR-016', 'Eshani', 11);
END;
GO

-- Ensure Loki's care service log is assigned to Eshani
IF NOT EXISTS (SELECT 1 FROM care_service_logs WHERE service_log_id = 'CSL-0008')
BEGIN
    INSERT INTO care_service_logs (
        service_log_id, case_id, pet_name, provider_id, provider_name,
        service_type, service_date, status, intake_condition, services_performed,
        notes, return_to_rescue, created_at
    ) VALUES (
        'CSL-0008', 'RSC-2026-005', 'Loki', 'USR-016', 'Eshani',
        'Rehabilitation & Foster Care Intake', CAST(GETDATE() AS DATE), 'IN_PROGRESS',
        'Examined bruise near right eye', 'Foster intake grooming and health evaluation',
        '[Transferred to Rescue Officer] Care & grooming rehabilitation completed by Pet Care Provider (Eshani). Companion groomed, calm, and ready for handoff.',
        0, CAST(GETDATE() AS DATE)
    );
END
ELSE
BEGIN
    UPDATE care_service_logs
    SET provider_id = 'USR-016', provider_name = 'Eshani'
    WHERE case_id = 'RSC-2026-005' OR pet_name LIKE '%Loki%';
END;
GO

-- ==============================================================================
-- Clinical Inventory: Prescription Medications & Pet Care Grooming Supplies
-- ==============================================================================
IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE item_id = 'INV-106')
BEGIN
    INSERT INTO inventory_items (
        item_id, name, category, sku, batch_number, current_stock, min_stock_threshold,
        unit, unit_price, selling_price, status, expiry_date, supplier_name, created_at
    ) VALUES
    ('INV-106', 'Amoxicillin Clavulanate 250mg', 'Pharmaceuticals', 'MED-AMX-250', 'BT-77201', 48, 10, 'Bottles', 2800.00, 3950.00, 'IN_STOCK', '2027-08-31', 'PetPharma Lanka Ltd', SYSDATETIME()),
    ('INV-107', 'Metacam 1.5mg/ml Oral Suspension', 'Pharmaceuticals', 'MED-MTC-015', 'BT-77202', 35, 8, 'Bottles', 3400.00, 4850.00, 'IN_STOCK', '2027-11-30', 'PetPharma Lanka Ltd', SYSDATETIME()),
    ('INV-108', 'Apoquel 16mg (Oclacitinib)', 'Pharmaceuticals', 'MED-APQ-016', 'BT-77203', 60, 15, 'Boxes', 5200.00, 7500.00, 'IN_STOCK', '2028-03-31', 'PetPharma Lanka Ltd', SYSDATETIME()),
    ('INV-109', 'Prednisolone 5mg Tablets', 'Pharmaceuticals', 'MED-PRD-005', 'BT-77204', 75, 20, 'Bottles', 1200.00, 1950.00, 'IN_STOCK', '2027-09-30', 'PetPharma Lanka Ltd', SYSDATETIME()),
    ('INV-110', 'Cephalexin 500mg Capsules', 'Pharmaceuticals', 'MED-CPH-500', 'BT-77205', 40, 10, 'Bottles', 2600.00, 3800.00, 'IN_STOCK', '2027-12-31', 'PetPharma Lanka Ltd', SYSDATETIME()),
    ('INV-111', 'Surolan Otic Ear Drops 15ml', 'Pharmaceuticals', 'MED-SRL-015', 'BT-77206', 30, 8, 'Bottles', 2100.00, 3200.00, 'IN_STOCK', '2027-10-31', 'VetCare Supplies Colombo', SYSDATETIME()),
    ('INV-112', 'Vetericyn Plus Wound Spray 250ml', 'Pharmaceuticals', 'MED-VTC-250', 'BT-77207', 25, 6, 'Bottles', 3100.00, 4500.00, 'IN_STOCK', '2028-01-31', 'VetCare Supplies Colombo', SYSDATETIME()),
    ('INV-113', 'Chlorhexidine Medicated Antiseptic Shampoo 500ml', 'Care & Grooming Supplies', 'GRM-SHP-CHX', 'BT-88301', 32, 8, 'Bottles', 1850.00, 2750.00, 'IN_STOCK', '2028-06-30', 'CarePet Lanka Products', SYSDATETIME()),
    ('INV-114', 'Soothing Colloidal Oatmeal Pet Shampoo 500ml', 'Care & Grooming Supplies', 'GRM-SHP-OTM', 'BT-88302', 45, 10, 'Bottles', 1450.00, 2200.00, 'IN_STOCK', '2028-06-30', 'CarePet Lanka Products', SYSDATETIME()),
    ('INV-115', 'Silk Protein De-Shedding Conditioner 500ml', 'Care & Grooming Supplies', 'GRM-CND-DSH', 'BT-88303', 28, 8, 'Bottles', 1650.00, 2450.00, 'IN_STOCK', '2028-05-31', 'CarePet Lanka Products', SYSDATETIME()),
    ('INV-116', 'Gentle Aloe Vera Ear Cleansing Flush 200ml', 'Care & Grooming Supplies', 'GRM-EAR-ALV', 'BT-88304', 38, 10, 'Bottles', 1250.00, 1950.00, 'IN_STOCK', '2028-04-30', 'CarePet Lanka Products', SYSDATETIME()),
    ('INV-117', 'Organic Shea Butter Paw & Nose Healing Balm 60g', 'Care & Grooming Supplies', 'GRM-BLM-SHA', 'BT-88305', 50, 12, 'Tins', 950.00, 1550.00, 'IN_STOCK', '2028-07-31', 'CarePet Lanka Products', SYSDATETIME());
END;
GO

-- ==============================================================================
-- Demonstration Data: Pets, Vaccinations, Appointments, Cases, Care Logs, Feedback
-- ==============================================================================

-- 1. Demonstration Pets
IF NOT EXISTS (SELECT 1 FROM pets WHERE pet_id = 'PET-005')
BEGIN
    INSERT INTO pets (pet_id, name, species, breed, gender, date_of_birth, age_years, age_months, weight_kg, allergies, medical_notes, microchip_id, emergency_contact, image_url, owner_id, created_at)
    VALUES (
        'PET-005', 'Simba', 'Dog', 'English Cocker Spaniel', 'Male', '2023-04-12', 3, 4, 13.80,
        'None known', 'Healthy and active. Periodic ear cleaning recommended due to long pendulous ears.',
        '985141004567891', '0779876543 (Ifaza Dilshad)',
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=500&auto=format&fit=crop&q=80',
        (SELECT id FROM [USER] WHERE email = 'ifaza@petnexus.com'),
        SYSDATETIME()
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM pets WHERE pet_id = 'PET-006')
BEGIN
    INSERT INTO pets (pet_id, name, species, breed, gender, date_of_birth, age_years, age_months, weight_kg, allergies, medical_notes, microchip_id, emergency_contact, image_url, owner_id, created_at)
    VALUES (
        'PET-006', 'Rocky', 'Dog', 'German Shepherd', 'Male', '2022-09-18', 3, 11, 32.50,
        'Chicken protein sensitivity', 'Athletic working line dog. On glucosamine joint supplements.',
        '985141006789123', '0771234567 (Kavindu Perera)',
        'https://images.unsplash.com/photo-1589941013453-ec89f33b5455?w=500&auto=format&fit=crop&q=80',
        (SELECT id FROM [USER] WHERE email = 'owner@petnexus.com'),
        SYSDATETIME()
    );
END;
GO

-- 2. Vaccinations
IF NOT EXISTS (SELECT 1 FROM vaccinations WHERE vaccine_id = 'VAC-006')
BEGIN
    INSERT INTO vaccinations (vaccine_id, pet_id, pet_name, vaccine_name, administered_date, next_due_date, administered_by, batch_number, status)
    VALUES (
        'VAC-006', (SELECT id FROM pets WHERE pet_id = 'PET-005'), 'Simba',
        'Rabies Annual Booster', '2026-05-10', '2027-05-10', 'Dr. Oshada', 'RAB-2026-904', 'Up to Date'
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM vaccinations WHERE vaccine_id = 'VAC-007')
BEGIN
    INSERT INTO vaccinations (vaccine_id, pet_id, pet_name, vaccine_name, administered_date, next_due_date, administered_by, batch_number, status)
    VALUES (
        'VAC-007', (SELECT id FROM pets WHERE pet_id = 'PET-005'), 'Simba',
        'DHPP 5-in-1 Vaccine', '2026-04-15', '2027-04-15', 'Dr. Oshada', 'DHP-2026-112', 'Up to Date'
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM vaccinations WHERE vaccine_id = 'VAC-008')
BEGIN
    INSERT INTO vaccinations (vaccine_id, pet_id, pet_name, vaccine_name, administered_date, next_due_date, administered_by, batch_number, status)
    VALUES (
        'VAC-008', (SELECT id FROM pets WHERE pet_id = 'PET-006'), 'Rocky',
        'Canine Parvovirus & Distemper', '2026-06-01', '2027-06-01', 'Dr. Oshada', 'PVD-2026-304', 'Up to Date'
    );
END;
GO

-- 3. Appointments
IF NOT EXISTS (SELECT 1 FROM appointments WHERE appointment_id = 'APT-1005')
BEGIN
    INSERT INTO appointments (
        appointment_id, owner_id, owner_name, owner_phone, pet_id, pet_name,
        species, breed, service_type, appointment_date, time_slot, vet_id,
        vet_name, status, reason, symptoms, notes, token_number, created_at,
        owner_fk_id, pet_fk_id, vet_fk_id
    ) VALUES (
        'APT-1005', 'USR-013', 'Ifaza Dilshad', '0779876543', 'PET-005', 'Simba',
        'Dog', 'English Cocker Spaniel', 'Veterinary Care', '2026-08-22', '09:30 AM', 'USR-014',
        'Dr. Oshada', 'Completed', 'Routine checkup and slight head shaking after lake swimming.',
        'Mild scratching around the right ear.', 'Treated with ear flush and antibiotic drops. Excellent recovery.',
        'TK-105', SYSDATETIME(),
        (SELECT id FROM [USER] WHERE email = 'ifaza@petnexus.com'),
        (SELECT id FROM pets WHERE pet_id = 'PET-005'),
        (SELECT id FROM [USER] WHERE email = 'oshada@petnexus.com')
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM appointments WHERE appointment_id = 'APT-1006')
BEGIN
    INSERT INTO appointments (
        appointment_id, owner_id, owner_name, owner_phone, pet_id, pet_name,
        species, breed, service_type, appointment_date, time_slot, vet_id,
        vet_name, status, reason, symptoms, notes, token_number, created_at,
        owner_fk_id, pet_fk_id, vet_fk_id
    ) VALUES (
        'APT-1006', 'USR-013', 'Ifaza Dilshad', '0779876543', 'PET-004', 'Jimmy',
        'Dog', 'Golden Retriever', 'Veterinary Care', '2026-08-25', '11:00 AM', 'USR-014',
        'Dr. Oshada', 'CheckedIn', 'Persian coat assessment and annual wellness evaluation.',
        'None. Preventative wellness visit.', 'Patient waiting in examination room 2.',
        'TK-106', SYSDATETIME(),
        (SELECT id FROM [USER] WHERE email = 'ifaza@petnexus.com'),
        (SELECT id FROM pets WHERE pet_id = 'PET-004'),
        (SELECT id FROM [USER] WHERE email = 'oshada@petnexus.com')
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM appointments WHERE appointment_id = 'APT-1007')
BEGIN
    INSERT INTO appointments (
        appointment_id, owner_id, owner_name, owner_phone, pet_id, pet_name,
        species, breed, service_type, appointment_date, time_slot, vet_id,
        vet_name, status, reason, symptoms, notes, token_number, created_at,
        owner_fk_id, pet_fk_id, vet_fk_id
    ) VALUES (
        'APT-1007', 'USR-001', 'Kavindu Perera', '0771234567', 'PET-006', 'Rocky',
        'Dog', 'German Shepherd', 'Veterinary Care', '2026-08-28', '02:30 PM', 'USR-014',
        'Dr. Oshada', 'Confirmed', 'Routine mobility assessment and joint supplement consultation.',
        'Stiff gait after intense agility exercises.', 'Requested hip screening and dietary joint advice.',
        'TK-107', SYSDATETIME(),
        (SELECT id FROM [USER] WHERE email = 'owner@petnexus.com'),
        (SELECT id FROM pets WHERE pet_id = 'PET-006'),
        (SELECT id FROM [USER] WHERE email = 'oshada@petnexus.com')
    );
END;
GO

-- 4. Rescue Cases
IF NOT EXISTS (SELECT 1 FROM rescue_cases WHERE case_id = 'RSC-2026-006')
BEGIN
    INSERT INTO rescue_cases (
        case_id, case_number, temporary_name, species, breed, estimated_age,
        gender, rescue_location, intake_date, condition_severity, status,
        is_published_for_adoption, microchip_id, intake_officer, description,
        medical_summary, cover_photo_url, created_at
    ) VALUES (
        'RSC-2026-006', 'RC-2026-06', 'Koko & Bella (Calico Kittens)', 'Cat', 'Domestic Short Hair Pair',
        '4 months', 'Female Pair', 'Found sheltering in crate near Colombo Port, Fort',
        '2026-08-05', 'Low', 'ReadyForAdoption', 1, '985141009918223',
        'Avinash (Rescue Officer)', 'Energetic, purring bonded sisters who love feather wands and napping together.',
        'Vaccinated, dewormed, negative for FIV/FeLV, spayed.',
        'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
        SYSDATETIME()
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM rescue_cases WHERE case_id = 'RSC-2026-007')
BEGIN
    INSERT INTO rescue_cases (
        case_id, case_number, temporary_name, species, breed, estimated_age,
        gender, rescue_location, intake_date, condition_severity, status,
        is_published_for_adoption, microchip_id, intake_officer, description,
        medical_summary, cover_photo_url, foster_parent_id, foster_parent_name, created_at
    ) VALUES (
        'RSC-2026-007', 'RC-2026-07', 'Cooper', 'Dog', 'Labrador Retriever Mix',
        '2 years', 'Male', 'Rescued from canal embankment during flash flood, Wellawatte',
        '2026-08-08', 'Moderate', 'InFoster', 1, '985141003344556',
        'Avinash (Rescue Officer)', 'Gentle, house-trained golden-brown mix who loves tennis balls and children.',
        'Fully vaccinated, treated for ear infection, neutered.',
        'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80',
        'FST-001', 'Piumi Senanayake', SYSDATETIME()
    );
END;
GO

-- 5. Care Service Logs for Eshani
IF NOT EXISTS (SELECT 1 FROM care_service_logs WHERE service_log_id = 'CSL-0009')
BEGIN
    INSERT INTO care_service_logs (
        service_log_id, pet_id, pet_name, owner_id, owner_name, provider_id,
        provider_name, service_type, service_date, status, intake_condition,
        services_performed, notes, return_to_rescue, created_at
    ) VALUES (
        'CSL-0009', 'PET-005', 'Simba (English Cocker Spaniel)', 'USR-013', 'Ifaza Dilshad',
        'USR-016', 'Eshani', 'Full Breed Haircut & Style', '2026-08-18', 'COMPLETED',
        'Cocker spaniel coat wavy and healthy. Playful, wagging tail.',
        'Warm colloidal oatmeal bath, ear feathering trim, sanitary clip, paw balm.',
        'Simba stood patiently throughout styling. Coat is super soft and feathering is styled perfectly.',
        0, '2026-08-18'
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM care_service_logs WHERE service_log_id = 'CSL-0010')
BEGIN
    INSERT INTO care_service_logs (
        service_log_id, pet_id, pet_name, owner_id, owner_name, provider_id,
        provider_name, service_type, service_date, status, intake_condition,
        services_performed, notes, return_to_rescue, created_at
    ) VALUES (
        'CSL-0010', 'PET-004', 'Luna (Persian Cat)', 'USR-013', 'Ifaza Dilshad',
        'USR-016', 'Eshani', 'Deluxe Spa & Grooming Session', '2026-08-21', 'IN_PROGRESS',
        'Persian coat in good condition, slight undercoat knots around collar.',
        'Gentle undercoat rake, tear-stain cleansing, currently relaxing in warm drying cabin.',
        'Very gentle and purring. Finished grooming planned with hypoallergenic leave-in mist.',
        0, '2026-08-21'
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM care_service_logs WHERE service_log_id = 'CSL-0011')
BEGIN
    INSERT INTO care_service_logs (
        service_log_id, case_id, pet_name, provider_id, provider_name,
        service_type, service_date, status, intake_condition, services_performed,
        notes, return_to_rescue, created_at
    ) VALUES (
        'CSL-0011', 'RSC-2026-005', 'Brownie (Injured Stray)', 'USR-016', 'Eshani',
        'Rehabilitation & Foster Care Intake', '2026-08-20', 'READY_FOR_PICKUP',
        'Post-treatment clean wound, calm and trusting with caregiver.',
        'Antiseptic chlorhexidine bath, soft towel dry, tick dip treatment.',
        'Companion is completely clean and happy. Ready for Rescue Officer Avinash handoff to foster care.',
        1, '2026-08-20'
    );
END;
GO

-- 6. Clinic Feedbacks
IF NOT EXISTS (SELECT 1 FROM feedbacks WHERE feedback_id = 'FDB-003')
BEGIN
    INSERT INTO feedbacks (
        feedback_id, user_id, user_name, service_category, rating, title,
        comments, staff_mentioned, manager_response, manager_responded_at,
        created_at
    ) VALUES (
        'FDB-003', (SELECT id FROM [USER] WHERE email = 'ifaza@petnexus.com'), 'Ifaza Dilshad',
        'Veterinary Consultation', 5, 'Dr. Oshada was so gentle and attentive with Simba',
        'Simba''s ear irritation cleared up within 2 days after Dr. Oshada prescribed the ear flush and Surolan drops. Dr. Oshada explained everything with great care!',
        'Dr. Oshada', 'Thank you Ifaza! Dr. Oshada is dedicated to compassionate clinical care.',
        '2026-08-23 09:00:00', '2026-08-22 15:00:00'
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM feedbacks WHERE feedback_id = 'FDB-004')
BEGIN
    INSERT INTO feedbacks (
        feedback_id, user_id, user_name, service_category, rating, title,
        comments, staff_mentioned, manager_response, manager_responded_at,
        created_at
    ) VALUES (
        'FDB-004', (SELECT id FROM [USER] WHERE email = 'ifaza@petnexus.com'), 'Ifaza Dilshad',
        'Grooming & Spa', 5, 'Eshani does magic with Persian cats!',
        'Grooming Persian cats is always stressful, but Eshani made Luna so comfortable and relaxed. Her coat looks silky and magnificent!',
        'Eshani', 'We are delighted to hear Luna loved her spa day with Eshani! Thank you for your wonderful review.',
        '2026-08-24 10:15:00', '2026-08-23 16:45:00'
    );
END;
GO

-- ==============================================================================
-- SECTION 3: Academic Assignment Modules (Queries, Procedures & Triggers)
-- ==============================================================================

-- ==============================================================================
-- PetNexus Full Integrated Database Script
-- Matches ER Diagram strictly, plus includes website-required columns (password, avatar, etc.)
-- ==============================================================================

-- IT25102486 - Pet and Owner management

-- Part 1: EER Diagram & Database Design
-- ISA Mapping: USER (Superclass) -> PET_OWNER (Subclass)
-- Primary Keys: user_id, pet_id, notification_id
-- Foreign Keys: owner_user_id in PET references PET_OWNER(user_id)

-- Part 2: Table Creation (DDL)
-- Table [USER] schema is defined in Section 1 (Core Schema)
GO

-- Table [PET_OWNER] schema is defined in Section 1 (Core Schema)
GO

-- Table [PET] schema is defined in Section 1 (Core Schema)
GO

-- Table [NOTIFICATION] schema is defined in Section 1 (Core Schema)
GO

-- Part 3: Sample Data
INSERT INTO [USER] (id, user_id, full_name, email, street, city) VALUES
(1, 'USR-001', 'John Doe', 'john@example.com', '123 Main St', 'Colombo'),
(2, 'USR-002', 'Jane Smith', 'jane@example.com', '456 Park Ave', 'Kandy');
GO

INSERT INTO USER_PHONE (user_id, phone_number) VALUES
(1, '0771234567'), (2, '0719876543');
GO

INSERT INTO PET_OWNER (user_id, owner_id) VALUES
(1, 'OWN-001'), (2, 'OWN-002');
GO

INSERT INTO PET (pet_id, pet_name, breed, date_of_birth, emergency_contact, owner_user_id, species) VALUES
(101, 'Rex', 'German Shepherd', '2020-05-10', '0771234567', 1, 'Dog'),
(102, 'Luna', 'Persian', '2021-08-15', '0719876543', 2, 'Cat');
GO

INSERT INTO NOTIFICATION (notification_id, message, date_sent, is_read, user_id) VALUES
(1001, 'Welcome to PetNexus!', '2023-10-01', 0, 1);
GO

-- Part 4: SQL Queries
-- 1. SELECT Query
SELECT pet_name, breed, species FROM PET WHERE species = 'Dog';

-- 2. JOIN Query
SELECT u.full_name, p.pet_name, p.species
FROM [USER] u
JOIN PET_OWNER po ON u.id = po.user_id
JOIN PET p ON po.user_id = p.owner_user_id;

-- 3. Aggregation Query
SELECT species, COUNT(*) AS TotalPets FROM PET GROUP BY species;

-- 4. GROUP BY / HAVING Query
SELECT owner_user_id, COUNT(*) AS PetCount
FROM PET
GROUP BY owner_user_id
HAVING COUNT(*) > 0;

-- 5. Subquery
SELECT full_name, email FROM [USER] 
WHERE user_id = (SELECT TOP 1 owner_user_id FROM PET WHERE pet_name = 'Luna');
GO

-- Part 5: Stored Procedure
CREATE OR ALTER PROCEDURE AddNewPet
    @pet_id INT,
    @pet_name VARCHAR(100),
    @breed VARCHAR(50),
    @dob DATE,
    @contact VARCHAR(20),
    @owner_id INT,
    @species VARCHAR(50)
AS
BEGIN
    INSERT INTO PET (pet_id, pet_name, breed, date_of_birth, emergency_contact, owner_user_id, species)
    VALUES (@pet_id, @pet_name, @breed, @dob, @contact, @owner_id, @species);
END;
GO

-- Part 6: Trigger
CREATE OR ALTER TRIGGER trg_CheckPetDOB
ON PET
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE date_of_birth > GETDATE())
    BEGIN
        RAISERROR('Pet date of birth cannot be in the future.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- IT25102378 - Pet Rescue and Adoption management

-- Part 1: EER Diagram & Database Design
-- ISA Mapping: USER (Superclass) -> RESCUE_OFFICER (Subclass)
-- Primary Keys: case_id, application_id, foster_id
-- Part 2: Table Creation (DDL)
-- Table [RESCUE_OFFICER] schema is defined in Section 1 (Core Schema)
GO

-- Table [RESCUE_CASE] schema is defined in Section 1 (Core Schema)
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FOSTER_CARE')
BEGIN
CREATE TABLE FOSTER_CARE (
    foster_id INT PRIMARY KEY,
    foster_name VARCHAR(100) NOT NULL,
    officer_user_id INT,
    FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id)
);
END
GO

-- Table [ADOPTION_APPLICATION] schema is defined in Section 1 (Core Schema)
GO

-- Part 3: Sample Data
INSERT INTO [USER] (id, user_id, full_name, email) VALUES (3, 'USR-003', 'Officer Jenny', 'jenny@rescue.com');
-- Only when account 3 really has this role, so no account ends up with a second role row
INSERT INTO RESCUE_OFFICER (user_id, badge_number)
SELECT id, 'BADGE-999' FROM [USER]
WHERE id = 3 AND role = 'RescueOfficer' AND NOT EXISTS (SELECT 1 FROM RESCUE_OFFICER WHERE user_id = 3);
GO

INSERT INTO RESCUE_CASE (case_id, location, date, status, animal_condition) VALUES
(201, 'Central Park', '2023-10-15', 'Resolved', 'Injured leg');
GO

INSERT INTO FOSTER_CARE (foster_id, foster_name, officer_user_id) VALUES
(301, 'Happy Tails Foster Home', 3);
GO

INSERT INTO RESCUED_PET (case_id, rescued_pet_no, rescue_status, foster_id) VALUES
(201, 1, 'Recovering', 301);
GO

INSERT INTO ADOPTION_APPLICATION (application_id, application_date, status, adoption_fee, owner_user_id, case_id, rescued_pet_no) VALUES
(401, '2023-11-01', 'Approved', 50.00, 1, 201, 1);
GO

-- Part 4: SQL Queries
-- 1. SELECT Query
SELECT location, date, status FROM RESCUE_CASE WHERE status = 'Resolved';

-- 2. JOIN Query
SELECT rc.location, rp.rescue_status, fc.foster_name
FROM RESCUE_CASE rc
JOIN RESCUED_PET rp ON rc.case_id = rp.case_id
LEFT JOIN FOSTER_CARE fc ON rp.foster_id = fc.foster_id;

-- 3. Aggregation Query
SELECT SUM(adoption_fee) AS TotalAdoptionFees, COUNT(*) AS TotalApps FROM ADOPTION_APPLICATION;

-- 4. GROUP BY / HAVING Query
SELECT status, COUNT(*) AS AppCount
FROM ADOPTION_APPLICATION
GROUP BY status
HAVING COUNT(*) > 0;

-- 5. Subquery
SELECT badge_number FROM RESCUE_OFFICER
WHERE user_id = 3;
GO

-- Part 5: Stored Procedure
CREATE OR ALTER PROCEDURE ApproveAdoption
    @application_id INT,
    @decision_date DATE
AS
BEGIN
    UPDATE ADOPTION_APPLICATION 
    SET status = 'Approved', decision_date = @decision_date
    WHERE application_id = @application_id;
END;
GO

-- Part 6: Trigger
CREATE OR ALTER TRIGGER trg_RescueCaseDateCheck
ON RESCUE_CASE
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE date > GETDATE())
    BEGIN
        RAISERROR('Rescue case date cannot be in the future.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- IT25102138 - Pet Health and service management

-- Part 1: EER Diagram & Database Design
-- ISA Mapping: USER -> VETERINARIAN, PET_CARE_PROVIDER
-- Primary Keys: record_id, service_id, vaccination_no
-- Foreign Keys: pet_id in MEDICAL_RECORD references PET(pet_id)

-- Part 2: Table Creation (DDL)
-- Table [VETERINARIAN] schema is defined in Section 1 (Core Schema)
GO

-- Table [PET_CARE_PROVIDER] schema is defined in Section 1 (Core Schema)
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MEDICAL_RECORD')
BEGIN
CREATE TABLE MEDICAL_RECORD (
    record_id INT PRIMARY KEY,
    diagnosis VARCHAR(255),
    treatment_plan VARCHAR(MAX),
    notes VARCHAR(MAX),
    appointment_id INT,
    pet_id INT,
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id),
    FOREIGN KEY (pet_id) REFERENCES PET(pet_id)
);
END
GO

-- Table [PRESCRIPTION] schema is defined in Section 1 (Core Schema)
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PRESCRIPTION_MEDICATION')
BEGIN
CREATE TABLE PRESCRIPTION_MEDICATION (
    record_id INT,
    prescription_id INT,
    medication VARCHAR(100),
    PRIMARY KEY (record_id, prescription_id, medication),
    FOREIGN KEY (record_id, prescription_id) REFERENCES PRESCRIPTION(record_id, prescription_id) 
);
END
GO

-- Table [VACCINATION] schema is defined in Section 1 (Core Schema)
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SERVICE')
BEGIN
CREATE TABLE SERVICE (
    service_id INT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    provider_user_id INT,
    FOREIGN KEY (provider_user_id) REFERENCES PET_CARE_PROVIDER(user_id)
);
END
GO

-- Part 3: Sample Data
INSERT INTO [USER] (id, user_id, full_name, email) VALUES (4, 'USR-004', 'Dr. Adams', 'adams@vet.com');
-- Only when account 4 really has this role, so no account ends up with a second role row
INSERT INTO VETERINARIAN (user_id, license_number)
SELECT id, 'VET-001' FROM [USER]
WHERE id = 4 AND role = 'Veterinarian' AND NOT EXISTS (SELECT 1 FROM VETERINARIAN WHERE user_id = 4);
INSERT INTO VETERINARIAN_SPECIALIZATION (user_id, specialization) VALUES (4, 'Surgery');
GO

INSERT INTO MEDICAL_RECORD (record_id, diagnosis, treatment_plan, pet_id) VALUES
(801, 'Fever', 'Rest and hydration', 101);
GO

INSERT INTO PRESCRIPTION (record_id, prescription_id, notes) VALUES
(801, 1, 'Take with food');
GO

INSERT INTO PRESCRIPTION_MEDICATION (record_id, prescription_id, medication) VALUES
(801, 1, 'Amoxicillin');
GO

INSERT INTO VACCINATION (pet_id, vaccination_no, vaccine_name, next_due_date) VALUES
(101, 1, 'Rabies', '2024-10-01');
GO

-- Part 4: SQL Queries
-- 1. SELECT Query
SELECT diagnosis, treatment_plan FROM MEDICAL_RECORD WHERE record_id = 801;

-- 2. JOIN Query
SELECT mr.diagnosis, p.notes, pm.medication
FROM MEDICAL_RECORD mr
JOIN PRESCRIPTION p ON mr.record_id = p.record_id
JOIN PRESCRIPTION_MEDICATION pm ON p.record_id = pm.record_id AND p.prescription_id = pm.prescription_id;

-- 3. Aggregation Query
SELECT COUNT(*) AS TotalVaccinations FROM VACCINATION;

-- 4. GROUP BY / HAVING Query
SELECT pet_id, COUNT(*) AS VaccineCount
FROM VACCINATION
GROUP BY pet_id
HAVING COUNT(*) > 0;

-- 5. Subquery
SELECT vaccine_name FROM VACCINATION 
WHERE pet_id = (SELECT TOP 1 pet_id FROM PET WHERE pet_name = 'Rex');
GO

-- Part 5: Stored Procedure
CREATE OR ALTER PROCEDURE AddVaccination
    @pet_id INT,
    @vac_no INT,
    @name VARCHAR(100),
    @next_due DATE
AS
BEGIN
    INSERT INTO VACCINATION (pet_id, vaccination_no, vaccine_name, next_due_date)
    VALUES (@pet_id, @vac_no, @name, @next_due);
END;
GO

-- Part 6: Trigger
CREATE OR ALTER TRIGGER trg_CheckServicePrice
ON SERVICE
AFTER INSERT, UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE price < 0)
    BEGIN
        RAISERROR('Service price cannot be negative.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- IT25102344 - Inventory Management

-- Part 1: EER Diagram & Database Design
-- ISA Mapping: USER -> CLINIC_MANAGER, CLINIC_STAFF
-- Primary Keys: supplier_id, item_id
-- Foreign Keys: supplier_id in INVENTORY_ITEM references SUPPLIER(supplier_id)

-- Part 2: Table Creation (DDL)
-- Table [CLINIC_MANAGER] schema is defined in Section 1 (Core Schema)
GO

-- Table [CLINIC_STAFF] schema is defined in Section 1 (Core Schema)
GO

-- Table [SUPPLIER] schema is defined in Section 1 (Core Schema)
GO

-- Table [INVENTORY_ITEM] schema is defined in Section 1 (Core Schema)
GO

-- Part 3: Sample Data
INSERT INTO [USER] (id, user_id, full_name, email) VALUES (5, 'USR-005', 'Manager Mike', 'mike@clinic.com');
-- Only when account 5 really has this role, so no account ends up with a second role row
INSERT INTO CLINIC_MANAGER (user_id, manager_code)
SELECT id, 'MGR-001' FROM [USER]
WHERE id = 5 AND role = 'ClinicManager' AND NOT EXISTS (SELECT 1 FROM CLINIC_MANAGER WHERE user_id = 5);
GO

INSERT INTO SUPPLIER (supplier_id, supplier_name, contact_email, manager_user_id) VALUES
(901, 'Vet Supplies Co.', 'sales@vetsupplies.com', 5);
GO

INSERT INTO INVENTORY_ITEM (item_id, item_name, stock_qty, min_stock, unit_price, supplier_id) VALUES
(1001, 'Dog Food 5kg', 50, 10, 25.00, 901),
(1002, 'Cat Litter 10kg', 5, 20, 15.00, 901);
GO

-- Part 4: SQL Queries
-- 1. SELECT Query
SELECT item_name, stock_qty FROM INVENTORY_ITEM WHERE stock_qty < min_stock;

-- 2. JOIN Query
SELECT i.item_name, s.supplier_name, i.unit_price
FROM INVENTORY_ITEM i
JOIN SUPPLIER s ON i.supplier_id = s.supplier_id;

-- 3. Aggregation Query
SELECT SUM(stock_qty * unit_price) AS TotalInventoryValue, AVG(unit_price) AS AvgPrice 
FROM INVENTORY_ITEM;

-- 4. GROUP BY / HAVING Query
SELECT supplier_id, COUNT(*) AS ItemCount
FROM INVENTORY_ITEM
GROUP BY supplier_id
HAVING COUNT(*) > 0;

-- 5. Subquery
SELECT item_name FROM INVENTORY_ITEM 
WHERE supplier_id = (SELECT TOP 1 supplier_id FROM SUPPLIER WHERE supplier_name = 'Vet Supplies Co.');
GO

-- Part 5: Stored Procedure
CREATE OR ALTER PROCEDURE UpdateStock
    @item_id INT,
    @qty_added INT
AS
BEGIN
    UPDATE INVENTORY_ITEM 
    SET stock_qty = stock_qty + @qty_added
    WHERE item_id = @item_id;
END;
GO

-- Part 6: Trigger
CREATE OR ALTER TRIGGER trg_CheckNegativeInventory
ON INVENTORY_ITEM
AFTER UPDATE
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE stock_qty < 0)
    BEGIN
        RAISERROR('Stock quantity cannot be less than zero.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- IT25102135 - Appointment and Booking management

-- Part 1: EER Diagram & Database Design
-- ISA Mapping: USER -> CLINIC_STAFF, VETERINARIAN, PET_CARE_PROVIDER
-- Primary Keys: appointment_id, booking_id, payment_id
-- Foreign Keys: pet_id in APPOINTMENT references PET(pet_id)

-- Part 2: Table Creation (DDL)
-- Table [APPOINTMENT] schema is defined in Section 1 (Core Schema)
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SERVICE_BOOKING')
BEGIN
CREATE TABLE SERVICE_BOOKING (
    booking_id INT PRIMARY KEY,
    booking_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    provider_user_id INT,
    package_id INT,
    owner_user_id INT,
    FOREIGN KEY (provider_user_id) REFERENCES PET_CARE_PROVIDER(user_id),
    FOREIGN KEY (package_id) REFERENCES SERVICE_PACKAGE(package_id),
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id)
);
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PAYMENT')
BEGIN
CREATE TABLE PAYMENT (
    payment_id INT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),
    booking_id INT,
    appointment_id INT,
    application_id INT,
    FOREIGN KEY (booking_id) REFERENCES SERVICE_BOOKING(booking_id),
    FOREIGN KEY (appointment_id) REFERENCES APPOINTMENT(appointment_id),
    FOREIGN KEY (application_id) REFERENCES ADOPTION_APPLICATION(application_id)
);
END
GO

-- Part 3: Sample Data
INSERT INTO APPOINTMENT (appointment_id, appointment_date, time_slot, status, pet_id, owner_user_id) VALUES
(501, '2023-10-25', '10:00 AM', 'Completed', 101, 1),
(502, '2023-10-26', '02:00 PM', 'Scheduled', 102, 2);
GO

INSERT INTO SERVICE_BOOKING (booking_id, booking_date, status, owner_user_id) VALUES
(601, '2023-11-05', 'Confirmed', 1);
GO

INSERT INTO PAYMENT (payment_id, amount, payment_date, payment_method, appointment_id) VALUES
(701, 150.00, '2023-10-25', 'Credit Card', 501);
GO

-- Part 4: SQL Queries
-- 1. SELECT Query
SELECT appointment_date, time_slot, status FROM APPOINTMENT WHERE status = 'Scheduled';

-- 2. JOIN Query
SELECT a.appointment_date, p.pet_name, pay.amount
FROM APPOINTMENT a
JOIN PET p ON a.pet_id = p.pet_id
LEFT JOIN PAYMENT pay ON a.appointment_id = pay.appointment_id;

-- 3. Aggregation Query
SELECT SUM(amount) AS TotalRevenue, AVG(amount) AS AveragePayment FROM PAYMENT;

-- 4. GROUP BY / HAVING Query
SELECT status, COUNT(*) AS AppointmentCount
FROM APPOINTMENT
GROUP BY status
HAVING COUNT(*) > 0;

-- 5. Subquery
SELECT payment_method FROM PAYMENT 
WHERE payment_id = (SELECT TOP 1 payment_id FROM PAYMENT ORDER BY amount DESC);
GO

-- Part 5: Stored Procedure
CREATE OR ALTER PROCEDURE ScheduleAppointment
    @appointment_id INT,
    @date DATE,
    @time VARCHAR(50),
    @pet_id INT,
    @owner_id INT
AS
BEGIN
    INSERT INTO APPOINTMENT (appointment_id, appointment_date, time_slot, status, pet_id, owner_user_id)
    VALUES (@appointment_id, @date, @time, 'Scheduled', @pet_id, @owner_id);
END;
GO

-- Part 6: Trigger
CREATE OR ALTER TRIGGER trg_PaymentAmountCheck
ON PAYMENT
AFTER INSERT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE amount < 0)
    BEGIN
        RAISERROR('Payment amount cannot be negative.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO

-- IT25102140 - Feedback and Package management

-- Part 1: EER Diagram & Database Design
-- ISA Mapping: Connections to subclasses like CLINIC_MANAGER and PET_OWNER
-- Primary Keys: feedback_id, package_id, complaint_id
-- Foreign Keys: manager_user_id in SERVICE_PACKAGE references CLINIC_MANAGER(user_id)

-- Part 2: Table Creation (DDL)
-- Table [FEEDBACK] schema is defined in Section 1 (Core Schema)
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SERVICE_PACKAGE')
BEGIN
CREATE TABLE SERVICE_PACKAGE (
    package_id INT PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    package_price DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2),
    manager_user_id INT,
    FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id)
);
END
GO

-- Part 3: Sample Data
INSERT INTO FEEDBACK (feedback_id, rating, comments, owner_user_id) VALUES
(2001, 5, 'Great service!', 1),
(2002, 4, 'Very friendly staff', 2);
GO

INSERT INTO SERVICE_PACKAGE (package_id, package_name, package_price, base_price, manager_user_id) VALUES
(3001, 'Full Grooming Package', 100.00, 120.00, 5);
GO

INSERT INTO COMPLAINT (complaint_id, date_filed, status, details, owner_user_id) VALUES
(4001, '2023-11-01', 'Pending', 'Waiting time was too long.', 2);
GO

-- Part 4: SQL Queries
-- 1. SELECT Query
SELECT rating, comments FROM FEEDBACK WHERE rating >= 4;

-- 2. JOIN Query
SELECT c.date_filed, c.details, po.owner_id
FROM COMPLAINT c
JOIN PET_OWNER po ON c.owner_user_id = po.user_id;

-- 3. Aggregation Query
SELECT AVG(rating) AS AverageRating, COUNT(*) AS TotalFeedbacks FROM FEEDBACK;

-- 4. GROUP BY / HAVING Query
SELECT owner_user_id, COUNT(*) AS FeedbackCount
FROM FEEDBACK
GROUP BY owner_user_id
HAVING COUNT(*) > 1;

-- 5. Subquery
SELECT details FROM COMPLAINT 
WHERE owner_user_id = (SELECT TOP 1 user_id FROM PET_OWNER WHERE owner_id = 'OWN-002');
GO

-- Part 5: Stored Procedure
CREATE OR ALTER PROCEDURE ResolveComplaint
    @complaint_id INT,
    @manager_id INT
AS
BEGIN
    UPDATE COMPLAINT 
    SET status = 'Resolved', manager_user_id = @manager_id
    WHERE complaint_id = @complaint_id;
END;
GO

-- Part 6: Trigger
CREATE OR ALTER TRIGGER trg_CheckFeedbackRating
ON FEEDBACK
AFTER INSERT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM inserted WHERE rating < 1 OR rating > 5)
    BEGIN
        RAISERROR('Feedback rating must be between 1 and 5.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END;
GO