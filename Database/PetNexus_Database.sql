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
-- SECTION 1: Core PetNexus Application Schema (31 Tables & Relations)
-- ==============================================================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'USER')
BEGIN
    create table [USER](
        created_at datetime2(7) not null,
        updated_at datetime2(7),
        id bigint identity not null,
        user_id varchar(20) not null,
        phone varchar(30),
        role varchar(30) not null check ((role in ('PetOwner','Veterinarian','ClinicStaff','PetCareProvider','ClinicManager','RescueOfficer','Admin'))),
        status varchar(40) not null check ((status in ('PendingApproval','Active','Rejected','Suspended'))),
        approval_token varchar(100),
        password_reset_token varchar(100),
        full_name varchar(150) not null,
        emergency_contact varchar(200),
        address varchar(300),
        rejection_reason varchar(500),
        suspension_reason varchar(500),
        avatar_url VARCHAR(MAX),
        email varchar(255) not null,
        password_hash varchar(255) not null,
        primary key (id),
        constraint uk_users_user_id unique (user_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'adoption_application_documents')
BEGIN
    create table adoption_application_documents (
        id bigint identity not null,
        uploaded_at datetime2(7) not null,
        application_id varchar(255) not null,
        document_type varchar(255) not null,
        file_name varchar(255) not null,
        file_size varchar(255),
        file_url varchar(255) not null,
        status varchar(255),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'adoption_applications')
BEGIN
    create table adoption_applications (
        applicant_id bigint not null,
        case_id bigint not null,
        created_at datetime2(7) not null,
        reviewed_at datetime2(7),
        reviewed_by bigint,
        applicant_name varchar(255) not null,
        applicant_phone varchar(255) not null,
        application_id varchar(255) not null,
        pet_name varchar(255) not null,
        review_notes varchar(255),
        status varchar(255) not null check ((status in ('SUBMITTED','UNDER_REVIEW','APPROVED','REJECTED','CANCELLED'))),
        primary key (application_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'adoption_listings')
BEGIN
    create table adoption_listings (
        is_published_for_adoption bit not null,
        case_id bigint not null,
        created_at datetime2(7) not null,
        updated_at datetime2(7) not null,
        listing_id varchar(255) not null,
        primary key (listing_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'appointments')
BEGIN
    create table appointments (
        appointment_date date not null,
        rescheduled_from_date date,
        cancelled_at datetime2(7),
        created_at datetime2(7) not null,
        id bigint identity not null,
        owner_fk_id bigint,
        pet_fk_id bigint,
        updated_at datetime2(7),
        vet_fk_id bigint,
        appointment_id varchar(20) not null,
        owner_id varchar(20),
        pet_id varchar(20),
        token_number varchar(20),
        vet_id varchar(20),
        rescheduled_from_time_slot varchar(30),
        status varchar(30) not null check ((status in ('Scheduled','Pending','Confirmed','CheckedIn','InRoom','Completed','Cancelled','NoShow'))),
        time_slot varchar(30) not null,
        owner_phone varchar(50),
        species varchar(50),
        breed varchar(100),
        pet_name varchar(100) not null,
        service_type varchar(100) not null,
        owner_name varchar(150) not null,
        rescheduled_from_vet_name varchar(150),
        vet_name varchar(150) not null,
        cancellation_reason varchar(500),
        reschedule_reason varchar(500),
        reason varchar(1000),
        symptoms varchar(1000),
        notes varchar(2000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'approval_history')
BEGIN
    create table approval_history (
        id bigint identity not null,
        timestamp datetime2(7) not null,
        admin_id varchar(20) not null,
        user_id varchar(20) not null,
        history_id varchar(30) not null,
        action varchar(50) not null,
        user_full_name varchar(150) not null,
        reason varchar(500),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'care_providers')
BEGIN
    create table care_providers (
        active bit not null,
        id bigint identity not null,
        user_id bigint not null,
        contact_phone varchar(20),
        provider_id varchar(20) not null,
        contact_email varchar(100),
        provider_name varchar(100) not null,
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'care_service_logs')
BEGIN
    create table care_service_logs (
        created_at date not null,
        return_to_rescue bit not null,
        service_date date not null,
        id bigint identity not null,
        case_id varchar(20),
        owner_id varchar(20),
        pet_id varchar(20),
        provider_id varchar(20),
        service_log_id varchar(20) not null,
        status varchar(30) not null check ((status in ('SCHEDULED','CHECKED_IN','IN_PROGRESS','READY_FOR_PICKUP','COMPLETED'))),
        owner_name varchar(100),
        pet_name varchar(100),
        provider_name varchar(100),
        service_type varchar(100) not null,
        intake_condition varchar(500),
        notes varchar(1000),
        services_performed varchar(1000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'care_services')
BEGIN
    create table care_services (
        discount_percent int,
        duration_minutes int not null,
        original_value numeric(10,2),
        price numeric(10,2) not null,
        created_by_user_id bigint not null,
        id bigint identity not null,
        service_id varchar(20) not null,
        status varchar(30) not null check ((status in ('SCHEDULED','CHECKED_IN','IN_PROGRESS','READY_FOR_PICKUP','COMPLETED'))),
        badge varchar(50),
        name varchar(100) not null,
        recommended_for varchar(100),
        tagline varchar(300),
        description varchar(2000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'clinic_manager')
BEGIN
    create table clinic_manager (
        [user_id] bigint not null,
        manager_code varchar(30),
        primary key ([user_id])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'clinic_staff')
BEGIN
    create table clinic_staff (
        [user_id] bigint not null,
        staff_id varchar(30),
        primary key ([user_id])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'consultations')
BEGIN
    create table consultations (
        follow_up_date date,
        heart_rate_bpm int,
        pass_to_provider bit,
        respiratory_rate_bpm int,
        temperaturec numeric(4,1),
        weight_kg numeric(5,2),
        appointment_fk_id bigint,
        consultation_date datetime2(7) not null,
        created_at datetime2(7) not null,
        id bigint identity not null,
        pet_fk_id bigint,
        updated_at datetime2(7),
        vet_fk_id bigint,
        appointment_id varchar(20),
        pet_id varchar(20),
        vet_id varchar(20),
        case_id varchar(30),
        consultation_id varchar(30) not null,
        status varchar(30),
        pet_name varchar(100) not null,
        vet_name varchar(150) not null,
        assessment_diagnosis varchar(2000) not null,
        objective_findings varchar(2000),
        rescue_medical_summary varchar(2000),
        subjective_notes varchar(2000),
        treatment_plan varchar(2000) not null,
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'feedbacks')
BEGIN
    create table feedbacks (
        rating int not null,
        created_at datetime2(7) not null,
        id bigint identity not null,
        manager_responded_at datetime2(7),
        updated_at datetime2(7),
        user_id bigint not null,
        feedback_id varchar(30) not null,
        service_category varchar(100) not null,
        staff_mentioned varchar(150),
        user_name varchar(150) not null,
        title varchar(200) not null,
        comments varchar(2000) not null,
        manager_response varchar(2000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'foster_records')
BEGIN
    create table foster_records (
        active_placements int,
        max_capacity int,
        rating numeric(3,1),
        created_at datetime2(7) not null,
        id bigint identity not null,
        updated_at datetime2(7),
        status varchar(20),
        foster_id varchar(30) not null,
        phone varchar(30),
        email varchar(150),
        full_name varchar(150) not null,
        home_type varchar(200),
        address varchar(300),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'inventory_items')
BEGIN
    create table inventory_items (
        current_stock int not null,
        expiry_date date,
        min_stock_threshold int not null,
        selling_price numeric(10,2) not null,
        unit_price numeric(10,2) not null,
        created_at datetime2(7) not null,
        id bigint identity not null,
        supplier_fk_id bigint,
        updated_at datetime2(7),
        item_id varchar(20) not null,
        status varchar(30) not null check ((status in ('IN_STOCK','LOW_STOCK','OUT_OF_STOCK','EXPIRED'))),
        batch_number varchar(50),
        sku varchar(50) not null,
        unit varchar(50) not null,
        category varchar(100) not null,
        name varchar(150) not null,
        supplier_name varchar(150),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'notifications')
BEGIN
    create table notifications (
        is_read bit not null,
        created_at datetime2(7) not null,
        id bigint identity not null,
        user_id bigint not null,
        type varchar(30) not null check ((type in ('Appointment','Rescue','Adoption','Approval','Inventory','Health','System'))),
        notification_id varchar(40) not null,
        title varchar(200) not null,
        link varchar(300),
        message varchar(1000) not null,
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pet_care_provider')
BEGIN
    create table pet_care_provider (
        [user_id] bigint not null,
        service_specialty varchar(150),
        primary key ([user_id])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pet_documents')
BEGIN
    create table pet_documents (
        id bigint identity not null,
        pet_id bigint not null,
        uploaded_at datetime2(7) not null,
        document_id varchar(20) not null,
        owner_id varchar(20) not null,
        file_size varchar(50),
        document_type varchar(100) not null,
        pet_name varchar(100),
        file_url varchar(1000),
        notes varchar(2000),
        file_name varchar(255) not null,
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pet_owner')
BEGIN
    create table pet_owner (
        [user_id] bigint not null,
        primary key ([user_id])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'pets')
BEGIN
    create table pets (
        age_months int,
        age_years int,
        date_of_birth date,
        weight_kg numeric(5,2),
        created_at datetime2(7) not null,
        id bigint identity not null,
        owner_id bigint not null,
        updated_at datetime2(7),
        microchip_id varchar(20),
        pet_id varchar(20) not null,
        gender varchar(30),
        species varchar(50) not null,
        breed varchar(100) not null,
        name varchar(100) not null,
        emergency_contact varchar(300),
        allergies varchar(500),
        image_url varchar(500),
        medical_notes varchar(2000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'prescription_items')
BEGIN
    create table prescription_items (
        duration_days int,
        quantity_prescribed int,
        refills_allowed int,
        id bigint identity not null,
        prescription_fk_id bigint not null,
        prescription_id varchar(30),
        item_id varchar(50) not null,
        dosage varchar(100),
        frequency varchar(100),
        medication_name varchar(200) not null,
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'prescriptions')
BEGIN
    create table prescriptions (
        issue_date date not null,
        valid_until date,
        consultation_fk_id bigint,
        created_at datetime2(7) not null,
        id bigint identity not null,
        pet_fk_id bigint,
        updated_at datetime2(7),
        vet_fk_id bigint,
        pet_id varchar(20),
        vet_id varchar(20),
        consultation_id varchar(30),
        prescription_id varchar(30) not null,
        status varchar(30) not null,
        vet_license varchar(50),
        pet_name varchar(100) not null,
        owner_name varchar(150),
        vet_name varchar(150) not null,
        digital_signature varchar(300),
        instructions varchar(1000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'purchase_orders')
BEGIN
    create table purchase_orders (
        total_amount numeric(12,2) not null,
        created_at datetime2(7) not null,
        id bigint identity not null,
        updated_at datetime2(7),
        supplier_id varchar(20),
        order_id varchar(30) not null,
        status varchar(30) not null,
        supplier_name varchar(150) not null,
        notes varchar(500),
        items_description varchar(1000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rescue_cases')
BEGIN
    create table rescue_cases (
        intake_date date not null,
        is_published_for_adoption bit not null,
        created_at datetime2(7) not null,
        id bigint identity not null,
        updated_at datetime2(7),
        case_number varchar(20),
        gender varchar(20),
        case_id varchar(30) not null,
        foster_parent_id varchar(30),
        status varchar(30) not null,
        condition_severity varchar(50),
        estimated_age varchar(50),
        microchip_id varchar(50),
        reported_by_user_id varchar(50),
        reported_by_user_phone varchar(50),
        species varchar(50),
        breed varchar(100),
        temporary_name varchar(100) not null,
        foster_parent_name varchar(150),
        intake_officer varchar(150),
        reported_by_user_name varchar(150),
        rescue_location varchar(500) not null,
        description varchar(2000),
        medical_summary varchar(2000),
        cover_photo_url NVARCHAR(MAX),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rescue_officer')
BEGIN
    create table rescue_officer (
        [user_id] bigint not null,
        badge_number varchar(30),
        primary key ([user_id])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rescue_photos')
BEGIN
    create table rescue_photos (
        id bigint identity not null,
        rescue_case_fk_id bigint not null,
        uploaded_at datetime2(7),
        case_id varchar(30) not null,
        photo_id varchar(30) not null,
        tag varchar(50),
        caption varchar(300),
        photo_url NVARCHAR(MAX) not null,
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rescue_progress_logs')
BEGIN
    create table rescue_progress_logs (
        created_at datetime2(7) not null,
        id bigint identity not null,
        log_date datetime2(7) not null,
        rescue_case_fk_id bigint not null,
        case_id varchar(30) not null,
        log_id varchar(30) not null,
        log_type varchar(30),
        logged_by varchar(150) not null,
        title varchar(200) not null,
        notes varchar(2000),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'service_package_bookings')
BEGIN
    create table service_package_bookings (
        completed_sessions int not null,
        created_at date not null,
        expiry_date date not null,
        purchase_date date not null,
        remaining_sessions int not null,
        total_sessions int not null,
        id bigint identity not null,
        booking_id varchar(20) not null,
        owner_id varchar(20) not null,
        pet_id varchar(20),
        status varchar(30) not null,
        package_id varchar(50),
        owner_name varchar(100),
        package_name varchar(100) not null,
        pet_name varchar(100),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'suppliers')
BEGIN
    create table suppliers (
        active bit not null,
        lead_time_days int not null,
        rating numeric(3,1) not null,
        created_at datetime2(7) not null,
        id bigint identity not null,
        updated_at datetime2(7),
        supplier_id varchar(20) not null,
        phone varchar(30),
        category varchar(100),
        contact_person varchar(100),
        email varchar(100) not null,
        company_name varchar(150) not null,
        address varchar(300),
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'vaccinations')
BEGIN
    create table vaccinations (
        administered_date date,
        next_due_date date,
        id bigint identity not null,
        pet_id bigint not null,
        vaccine_id varchar(20) not null,
        status varchar(30),
        batch_number varchar(50),
        pet_name varchar(100),
        administered_by varchar(150),
        vaccine_name varchar(200) not null,
        primary key (id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'veterinarian')
BEGIN
    create table veterinarian (
        [user_id] bigint not null,
        license_number varchar(50),
        specialization varchar(150),
        primary key ([user_id])
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_users_email')
BEGIN
    alter table [USER] 
       add constraint uk_users_email unique (email);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'UKs3837mck1g3sg5akv9orth206')
BEGIN
    alter table adoption_listings 
       add constraint UKs3837mck1g3sg5akv9orth206 unique (case_id);

    create index idx_appointments_date_slot 
       on appointments (appointment_date, time_slot);

    create index idx_appointments_vet_date 
       on appointments (vet_id, appointment_date);

    create index idx_appointments_owner 
       on appointments (owner_id);

    create index idx_appointments_pet 
       on appointments (pet_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_appointments_appointment_id')
BEGIN
    alter table appointments 
       add constraint uk_appointments_appointment_id unique (appointment_id);

    create index idx_approval_history_user_id 
       on approval_history (user_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_care_provider_user')
BEGIN
    alter table care_providers 
       add constraint uk_care_provider_user unique (user_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_care_service_log_id')
BEGIN
    alter table care_service_logs 
       add constraint uk_care_service_log_id unique (service_log_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_care_service_name')
BEGIN
    alter table care_services 
       add constraint uk_care_service_name unique (name);

    create index idx_consultations_pet_id 
       on consultations (pet_id);

    create index idx_consultations_case_id 
       on consultations (case_id);

    create index idx_consultations_vet_id 
       on consultations (vet_id);

    create index idx_consultations_appointment_id 
       on consultations (appointment_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_consultations_consultation_id')
BEGIN
    alter table consultations 
       add constraint uk_consultations_consultation_id unique (consultation_id);

    create index idx_feedback_user 
       on feedbacks (user_id);

    create index idx_feedback_category 
       on feedbacks (service_category);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_feedback_feedback_id')
BEGIN
    alter table feedbacks 
       add constraint uk_feedback_feedback_id unique (feedback_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_foster_records_foster_id')
BEGIN
    alter table foster_records 
       add constraint uk_foster_records_foster_id unique (foster_id);

    create index idx_inventory_items_category 
       on inventory_items (category);

    create index idx_inventory_items_status 
       on inventory_items (status);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_inventory_items_item_id')
BEGIN
    alter table inventory_items 
       add constraint uk_inventory_items_item_id unique (item_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_inventory_items_sku')
BEGIN
    alter table inventory_items 
       add constraint uk_inventory_items_sku unique (sku);

    create index idx_notifications_user 
       on notifications (user_id);

    create index idx_notifications_is_read 
       on notifications (is_read);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_notifications_notification_id')
BEGIN
    alter table notifications 
       add constraint uk_notifications_notification_id unique (notification_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_pet_documents_document_id')
BEGIN
    alter table pet_documents 
       add constraint uk_pet_documents_document_id unique (document_id);

    create index idx_pets_owner 
       on pets (owner_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_pets_pet_id')
BEGIN
    alter table pets 
       add constraint uk_pets_pet_id unique (pet_id);

    create index idx_prescription_items_rx_id 
       on prescription_items (prescription_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_prescription_items_item_id')
BEGIN
    alter table prescription_items 
       add constraint uk_prescription_items_item_id unique (item_id);

    create index idx_prescriptions_pet_id 
       on prescriptions (pet_id);

    create index idx_prescriptions_vet_id 
       on prescriptions (vet_id);

    create index idx_prescriptions_consultation_id 
       on prescriptions (consultation_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_prescriptions_rx_id')
BEGIN
    alter table prescriptions 
       add constraint uk_prescriptions_rx_id unique (prescription_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_purchase_orders_order_id')
BEGIN
    alter table purchase_orders 
       add constraint uk_purchase_orders_order_id unique (order_id);

    create index idx_rescue_cases_status 
       on rescue_cases (status);

    create index idx_rescue_cases_published 
       on rescue_cases (is_published_for_adoption);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_rescue_cases_case_id')
BEGIN
    alter table rescue_cases 
       add constraint uk_rescue_cases_case_id unique (case_id);

    create index idx_rescue_photos_case_id 
       on rescue_photos (case_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_rescue_photos_photo_id')
BEGIN
    alter table rescue_photos 
       add constraint uk_rescue_photos_photo_id unique (photo_id);

    create index idx_rescue_logs_case_id 
       on rescue_progress_logs (case_id);

    create index idx_rescue_logs_log_date 
       on rescue_progress_logs (log_date);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_rescue_progress_logs_log_id')
BEGIN
    alter table rescue_progress_logs 
       add constraint uk_rescue_progress_logs_log_id unique (log_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_service_package_booking_id')
BEGIN
    alter table service_package_bookings 
       add constraint uk_service_package_booking_id unique (booking_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_suppliers_supplier_id')
BEGIN
    alter table suppliers 
       add constraint uk_suppliers_supplier_id unique (supplier_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'uk_vaccinations_vaccine_id')
BEGIN
    alter table vaccinations 
       add constraint uk_vaccinations_vaccine_id unique (vaccine_id);
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK3jo8h5ahulhqt4d6x5ixcn5i3')
BEGIN
    alter table adoption_application_documents 
       add constraint FK3jo8h5ahulhqt4d6x5ixcn5i3 
       foreign key (application_id) 
       references adoption_applications;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKb5etb1yh4xuroa6vjxcf74gcy')
BEGIN
    alter table adoption_applications 
       add constraint FKb5etb1yh4xuroa6vjxcf74gcy 
       foreign key (applicant_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKpssmak6donrlh7l463qtlkxx4')
BEGIN
    alter table adoption_applications 
       add constraint FKpssmak6donrlh7l463qtlkxx4 
       foreign key (case_id) 
       references rescue_cases;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKcnot1ki3bb5ctfyqdkj0193j')
BEGIN
    alter table adoption_applications 
       add constraint FKcnot1ki3bb5ctfyqdkj0193j 
       foreign key (reviewed_by) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKcdr2kc9eruujmg8y53jjuub2g')
BEGIN
    alter table adoption_listings 
       add constraint FKcdr2kc9eruujmg8y53jjuub2g 
       foreign key (case_id) 
       references rescue_cases;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_appointments_owner')
BEGIN
    alter table appointments 
       add constraint fk_appointments_owner 
       foreign key (owner_fk_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_appointments_pet')
BEGIN
    alter table appointments 
       add constraint fk_appointments_pet 
       foreign key (pet_fk_id) 
       references pets;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_appointments_vet')
BEGIN
    alter table appointments 
       add constraint fk_appointments_vet 
       foreign key (vet_fk_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_care_provider_user')
BEGIN
    alter table care_providers 
       add constraint fk_care_provider_user 
       foreign key (user_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_care_service_user')
BEGIN
    alter table care_services 
       add constraint fk_care_service_user 
       foreign key (created_by_user_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKl58g8y53c6g2epjlwt8myg0py')
BEGIN
    alter table clinic_manager 
       add constraint FKl58g8y53c6g2epjlwt8myg0py 
       foreign key ([user_id]) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKjfj0whfl4fiaigow2v9d8ytag')
BEGIN
    alter table clinic_staff 
       add constraint FKjfj0whfl4fiaigow2v9d8ytag 
       foreign key ([user_id]) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_consultations_appointment')
BEGIN
    alter table consultations 
       add constraint fk_consultations_appointment 
       foreign key (appointment_fk_id) 
       references appointments;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_consultations_pet')
BEGIN
    alter table consultations 
       add constraint fk_consultations_pet 
       foreign key (pet_fk_id) 
       references pets;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_consultations_vet')
BEGIN
    alter table consultations 
       add constraint fk_consultations_vet 
       foreign key (vet_fk_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_feedback_user')
BEGIN
    alter table feedbacks 
       add constraint fk_feedback_user 
       foreign key (user_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_inventory_items_supplier')
BEGIN
    alter table inventory_items 
       add constraint fk_inventory_items_supplier 
       foreign key (supplier_fk_id) 
       references suppliers;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_notifications_user')
BEGIN
    alter table notifications 
       add constraint fk_notifications_user 
       foreign key (user_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKgjgihcuus0ff732cogsl3qxmn')
BEGIN
    alter table pet_care_provider 
       add constraint FKgjgihcuus0ff732cogsl3qxmn 
       foreign key ([user_id]) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_pet_documents_pet')
BEGIN
    alter table pet_documents 
       add constraint fk_pet_documents_pet 
       foreign key (pet_id) 
       references pets;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKnkltcsoswsbtcj6bxvrqthera')
BEGIN
    alter table pet_owner 
       add constraint FKnkltcsoswsbtcj6bxvrqthera 
       foreign key ([user_id]) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_pets_owner')
BEGIN
    alter table pets 
       add constraint fk_pets_owner 
       foreign key (owner_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_rx_items_prescription')
BEGIN
    alter table prescription_items 
       add constraint fk_rx_items_prescription 
       foreign key (prescription_fk_id) 
       references prescriptions;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_prescriptions_consultation')
BEGIN
    alter table prescriptions 
       add constraint fk_prescriptions_consultation 
       foreign key (consultation_fk_id) 
       references consultations;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_prescriptions_pet')
BEGIN
    alter table prescriptions 
       add constraint fk_prescriptions_pet 
       foreign key (pet_fk_id) 
       references pets;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_prescriptions_vet')
BEGIN
    alter table prescriptions 
       add constraint fk_prescriptions_vet 
       foreign key (vet_fk_id) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKlxgd2xvqhjbmy46pg99dbnxh2')
BEGIN
    alter table rescue_officer 
       add constraint FKlxgd2xvqhjbmy46pg99dbnxh2 
       foreign key ([user_id]) 
       references [USER];
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_rescue_photos_case')
BEGIN
    alter table rescue_photos 
       add constraint fk_rescue_photos_case 
       foreign key (rescue_case_fk_id) 
       references rescue_cases;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_rescue_logs_case')
BEGIN
    alter table rescue_progress_logs 
       add constraint fk_rescue_logs_case 
       foreign key (rescue_case_fk_id) 
       references rescue_cases;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'fk_vaccinations_pet')
BEGIN
    alter table vaccinations 
       add constraint fk_vaccinations_pet 
       foreign key (pet_id) 
       references pets;
END
GO

IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FKraaddf3y5vfvqd8xr2g899omb')
BEGIN
    alter table veterinarian 
       add constraint FKraaddf3y5vfvqd8xr2g899omb 
       foreign key ([user_id]) 
       references [USER];
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
INSERT INTO RESCUE_OFFICER (user_id, badge_number) VALUES (3, 'BADGE-999');
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
INSERT INTO VETERINARIAN (user_id, license_number) VALUES (4, 'VET-001');
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
INSERT INTO CLINIC_MANAGER (user_id, manager_code) VALUES (5, 'MGR-001');
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