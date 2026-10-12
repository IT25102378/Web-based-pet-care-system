-- ==============================================================================
-- PetNexus: Rearrange an EXISTING database into the tidy table layout
--
-- PetNexus_Database.sql only creates tables that do not exist yet, so a database
-- built before the tidy layout keeps its old column order and auto-generated
-- constraint names (PK__pets__3213E83F..., FKb5etb1yh4x...). Run this script once
-- to rebuild those tables in the tidy layout WITHOUT losing any data:
--
--   * primary key first, then the business ID, then the foreign key columns,
--     then the other attributes, with created_at / updated_at last
--   * constraints named pk_<table>, uk_<table>_<column>, fk_<table>_<parent>,
--     ck_<table>_<column>
--   * the unused, always-empty column rescue_cases.rescue_officer_fk_id is removed
--   * role rows that do not match the account's role are removed
--     (e.g. a veterinarian row attached to a clinic staff account)
--
-- Every row is copied across and the row counts are checked. Everything runs in
-- one transaction: if any step fails, nothing is changed.
--
-- Stop the backend before running. A fresh database does not need this script.
-- ==============================================================================
USE PetNexus;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID(N'dbo.[USER]', N'U') IS NULL
    PRINT 'PetNexus has no tables yet - run PetNexus_Database.sql instead.';
ELSE IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'pk_users')
    PRINT 'PetNexus already uses the tidy table layout - nothing to do.';
ELSE
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
CONSTRAINT fk_rx_items_prescription FOREIGN KEY (prescription_fk_id) REFERENCES prescriptions (id)
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
);');
    INSERT INTO @tables (name, ddl) VALUES (N'inventory_items', N'CREATE TABLE inventory_items (
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
