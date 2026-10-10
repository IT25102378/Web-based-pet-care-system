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
CREATE TABLE [USER] (
    user_id INT PRIMARY KEY,
    nic_no VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(30),
    status VARCHAR(40),
    is_deleted BIT DEFAULT 0,
    avatar_url VARCHAR(MAX),
    created_at DATETIME2,
    street VARCHAR(100),
    city VARCHAR(100)
);
GO

GO

CREATE TABLE PET_OWNER (
    user_id INT PRIMARY KEY,
    owner_id VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) 
);
GO

CREATE TABLE PET (
    pet_id INT PRIMARY KEY,
    pet_name VARCHAR(100) NOT NULL,
    breed VARCHAR(50),
    date_of_birth DATE,
    emergency_contact VARCHAR(20),
    owner_user_id INT,
    species VARCHAR(50) NOT NULL,
    is_deleted BIT DEFAULT 0,
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id) 
);
GO

CREATE TABLE NOTIFICATION (
    notification_id INT PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    date_sent DATE NOT NULL,
    is_read BIT DEFAULT 0,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) 
);
GO

-- Part 3: Sample Data
INSERT INTO [USER] (user_id, nic_no, full_name, email, street, city) VALUES
(1, '982345678V', 'John Doe', 'john@example.com', '123 Main St', 'Colombo'),
(2, '951234567V', 'Jane Smith', 'jane@example.com', '456 Park Ave', 'Kandy');
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
JOIN PET_OWNER po ON u.user_id = po.user_id
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
CREATE TABLE RESCUE_OFFICER (
    user_id INT PRIMARY KEY,
    badge_number VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) 
);
GO

CREATE TABLE RESCUE_CASE (
    case_id INT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Reported',
    animal_condition VARCHAR(100),
    owner_user_id INT,
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id)
);
GO

CREATE TABLE FOSTER_CARE (
    foster_id INT PRIMARY KEY,
    foster_name VARCHAR(100) NOT NULL,
    officer_user_id INT,
    FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id)
);
GO

GO

CREATE TABLE ADOPTION_APPLICATION (
    application_id INT PRIMARY KEY,
    application_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    decision_date DATE,
    adoption_fee DECIMAL(10,2),
    notes VARCHAR(MAX),
    owner_user_id INT,
    case_id INT,
    rescued_pet_no INT,
    officer_user_id INT,
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
    FOREIGN KEY (case_id, rescued_pet_no) REFERENCES RESCUED_PET(case_id, rescued_pet_no),
    FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id)
);
GO

-- Part 3: Sample Data
INSERT INTO [USER] (user_id, nic_no, full_name, email) VALUES (3, '891234567V', 'Officer Jenny', 'jenny@rescue.com');
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
CREATE TABLE VETERINARIAN (
    user_id INT PRIMARY KEY,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) 
);
GO

GO

CREATE TABLE PET_CARE_PROVIDER (
    user_id INT PRIMARY KEY,
    provider_id VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) 
);
GO

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
GO

CREATE TABLE PRESCRIPTION (
    record_id INT,
    prescription_id INT,
    notes VARCHAR(MAX),
    PRIMARY KEY (record_id, prescription_id),
    FOREIGN KEY (record_id) REFERENCES MEDICAL_RECORD(record_id) 
);
GO

CREATE TABLE PRESCRIPTION_MEDICATION (
    record_id INT,
    prescription_id INT,
    medication VARCHAR(100),
    PRIMARY KEY (record_id, prescription_id, medication),
    FOREIGN KEY (record_id, prescription_id) REFERENCES PRESCRIPTION(record_id, prescription_id) 
);
GO

CREATE TABLE VACCINATION (
    pet_id INT,
    vaccination_no INT,
    vaccine_name VARCHAR(100) NOT NULL,
    next_due_date DATE,
    PRIMARY KEY (pet_id, vaccination_no),
    FOREIGN KEY (pet_id) REFERENCES PET(pet_id) 
);
GO

CREATE TABLE SERVICE (
    service_id INT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    provider_user_id INT,
    FOREIGN KEY (provider_user_id) REFERENCES PET_CARE_PROVIDER(user_id)
);
GO

-- Part 3: Sample Data
INSERT INTO [USER] (user_id, nic_no, full_name, email) VALUES (4, '781234567V', 'Dr. Adams', 'adams@vet.com');
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
CREATE TABLE CLINIC_MANAGER (
    user_id INT PRIMARY KEY,
    manager_code VARCHAR(50) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) 
);
GO

CREATE TABLE CLINIC_STAFF (
    user_id INT PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) 
);
GO

CREATE TABLE SUPPLIER (
    supplier_id INT PRIMARY KEY,
    supplier_name VARCHAR(100) NOT NULL,
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    manager_user_id INT,
    FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id)
);
GO

CREATE TABLE INVENTORY_ITEM (
    item_id INT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    stock_qty INT DEFAULT 0,
    min_stock INT DEFAULT 10,
    unit_price DECIMAL(10,2),
    supplier_id INT,
    manager_user_id INT,
    staff_user_id INT,
    FOREIGN KEY (supplier_id) REFERENCES SUPPLIER(supplier_id),
    FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id),
    FOREIGN KEY (staff_user_id) REFERENCES CLINIC_STAFF(user_id)
);
GO

-- Part 3: Sample Data
INSERT INTO [USER] (user_id, nic_no, full_name, email) VALUES (5, '651234567V', 'Manager Mike', 'mike@clinic.com');
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
CREATE TABLE APPOINTMENT (
    appointment_id INT PRIMARY KEY,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Scheduled',
    staff_user_id INT,
    pet_id INT,
    owner_user_id INT,
    vet_user_id INT,
    FOREIGN KEY (staff_user_id) REFERENCES CLINIC_STAFF(user_id),
    FOREIGN KEY (pet_id) REFERENCES PET(pet_id),
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
    FOREIGN KEY (vet_user_id) REFERENCES VETERINARIAN(user_id)
);
GO

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
GO

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
CREATE TABLE FEEDBACK (
    feedback_id INT PRIMARY KEY,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments VARCHAR(MAX),
    owner_user_id INT,
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id) 
);
GO

CREATE TABLE SERVICE_PACKAGE (
    package_id INT PRIMARY KEY,
    package_name VARCHAR(100) NOT NULL,
    package_price DECIMAL(10,2) NOT NULL,
    base_price DECIMAL(10,2),
    manager_user_id INT,
    FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id)
);
GO

GO

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



    create table [USER] (
        is_deleted bit default 0 not null,
        created_at datetime2(7) not null,
        updated_at datetime2(7),
        user_id bigint identity not null,
        nic_no varchar(20) not null,
        phone varchar(30),
        role varchar(30) not null check ((role in ('PetOwner','Veterinarian','ClinicStaff','PetCareProvider','ClinicManager','RescueOfficer','Admin'))),
        status varchar(40) not null check ((status in ('PendingApproval','Active','Rejected','Suspended'))),
        password_reset_token varchar(100),
        full_name varchar(150) not null,
        emergency_contact varchar(200),
        address varchar(300),
        rejection_reason varchar(500),
        suspension_reason varchar(500),
        avatar_url VARCHAR(MAX),
        email varchar(255) not null,
        password_hash varchar(255) not null,
        constraint uk_users_user_id primary key (user_id)
    );

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

    create table adoption_listings (
        is_published_for_adoption bit not null,
        case_id bigint not null,
        created_at datetime2(7) not null,
        updated_at datetime2(7) not null,
        listing_id varchar(255) not null,
        primary key (listing_id)
    );

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

    create table clinic_manager (
        [user_id] bigint not null,
        manager_code varchar(30),
        primary key ([user_id])
    );

    create table clinic_staff (
        [user_id] bigint not null,
        staff_id varchar(30),
        primary key ([user_id])
    );

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

    create table pet_care_provider (
        [user_id] bigint not null,
        service_specialty varchar(150),
        primary key ([user_id])
    );

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

    create table pet_owner (
        [user_id] bigint not null,
        primary key ([user_id])
    );

    create table pets (
        age_months int,
        age_years int,
        date_of_birth date,
        is_deleted bit default 0 not null,
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

    create table rescue_officer (
        [user_id] bigint not null,
        badge_number varchar(30),
        primary key ([user_id])
    );

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

    create table veterinarian (
        [user_id] bigint not null,
        license_number varchar(50),
        specialization varchar(150),
        primary key ([user_id])
    );

    alter table [USER] 
       add constraint uk_users_email unique (email);

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

    alter table appointments 
       add constraint uk_appointments_appointment_id unique (appointment_id);

    create index idx_approval_history_user_id 
       on approval_history (user_id);

    alter table care_providers 
       add constraint uk_care_provider_user unique (user_id);

    alter table care_service_logs 
       add constraint uk_care_service_log_id unique (service_log_id);

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

    alter table consultations 
       add constraint uk_consultations_consultation_id unique (consultation_id);

    create index idx_feedback_user 
       on feedbacks (user_id);

    create index idx_feedback_category 
       on feedbacks (service_category);

    alter table feedbacks 
       add constraint uk_feedback_feedback_id unique (feedback_id);

    alter table foster_records 
       add constraint uk_foster_records_foster_id unique (foster_id);

    create index idx_inventory_items_category 
       on inventory_items (category);

    create index idx_inventory_items_status 
       on inventory_items (status);

    alter table inventory_items 
       add constraint uk_inventory_items_item_id unique (item_id);

    alter table inventory_items 
       add constraint uk_inventory_items_sku unique (sku);

    create index idx_notifications_user 
       on notifications (user_id);

    create index idx_notifications_is_read 
       on notifications (is_read);

    alter table notifications 
       add constraint uk_notifications_notification_id unique (notification_id);

    alter table pet_documents 
       add constraint uk_pet_documents_document_id unique (document_id);

    create index idx_pets_owner 
       on pets (owner_id);

    alter table pets 
       add constraint uk_pets_pet_id unique (pet_id);

    create index idx_prescription_items_rx_id 
       on prescription_items (prescription_id);

    alter table prescription_items 
       add constraint uk_prescription_items_item_id unique (item_id);

    create index idx_prescriptions_pet_id 
       on prescriptions (pet_id);

    create index idx_prescriptions_vet_id 
       on prescriptions (vet_id);

    create index idx_prescriptions_consultation_id 
       on prescriptions (consultation_id);

    alter table prescriptions 
       add constraint uk_prescriptions_rx_id unique (prescription_id);

    alter table purchase_orders 
       add constraint uk_purchase_orders_order_id unique (order_id);

    create index idx_rescue_cases_status 
       on rescue_cases (status);

    create index idx_rescue_cases_published 
       on rescue_cases (is_published_for_adoption);

    alter table rescue_cases 
       add constraint uk_rescue_cases_case_id unique (case_id);

    create index idx_rescue_photos_case_id 
       on rescue_photos (case_id);

    alter table rescue_photos 
       add constraint uk_rescue_photos_photo_id unique (photo_id);

    create index idx_rescue_logs_case_id 
       on rescue_progress_logs (case_id);

    create index idx_rescue_logs_log_date 
       on rescue_progress_logs (log_date);

    alter table rescue_progress_logs 
       add constraint uk_rescue_progress_logs_log_id unique (log_id);

    alter table service_package_bookings 
       add constraint uk_service_package_booking_id unique (booking_id);

    alter table suppliers 
       add constraint uk_suppliers_supplier_id unique (supplier_id);

    alter table vaccinations 
       add constraint uk_vaccinations_vaccine_id unique (vaccine_id);

    alter table adoption_application_documents 
       add constraint FK3jo8h5ahulhqt4d6x5ixcn5i3 
       foreign key (application_id) 
       references adoption_applications;

    alter table adoption_applications 
       add constraint FKb5etb1yh4xuroa6vjxcf74gcy 
       foreign key (applicant_id) 
       references [USER];

    alter table adoption_applications 
       add constraint FKpssmak6donrlh7l463qtlkxx4 
       foreign key (case_id) 
       references rescue_cases;

    alter table adoption_applications 
       add constraint FKcnot1ki3bb5ctfyqdkj0193j 
       foreign key (reviewed_by) 
       references [USER];

    alter table adoption_listings 
       add constraint FKcdr2kc9eruujmg8y53jjuub2g 
       foreign key (case_id) 
       references rescue_cases;

    alter table appointments 
       add constraint fk_appointments_owner 
       foreign key (owner_fk_id) 
       references [USER];

    alter table appointments 
       add constraint fk_appointments_pet 
       foreign key (pet_fk_id) 
       references pets;

    alter table appointments 
       add constraint fk_appointments_vet 
       foreign key (vet_fk_id) 
       references [USER];

    alter table care_providers 
       add constraint fk_care_provider_user 
       foreign key (user_id) 
       references [USER];

    alter table care_services 
       add constraint fk_care_service_user 
       foreign key (created_by_user_id) 
       references [USER];

    alter table clinic_manager 
       add constraint FKl58g8y53c6g2epjlwt8myg0py 
       foreign key ([user_id]) 
       references [USER];

    alter table clinic_staff 
       add constraint FKjfj0whfl4fiaigow2v9d8ytag 
       foreign key ([user_id]) 
       references [USER];

    alter table consultations 
       add constraint fk_consultations_appointment 
       foreign key (appointment_fk_id) 
       references appointments;

    alter table consultations 
       add constraint fk_consultations_pet 
       foreign key (pet_fk_id) 
       references pets;

    alter table consultations 
       add constraint fk_consultations_vet 
       foreign key (vet_fk_id) 
       references [USER];

    alter table feedbacks 
       add constraint fk_feedback_user 
       foreign key (user_id) 
       references [USER];

    alter table inventory_items 
       add constraint fk_inventory_items_supplier 
       foreign key (supplier_fk_id) 
       references suppliers;

    alter table notifications 
       add constraint fk_notifications_user 
       foreign key (user_id) 
       references [USER];

    alter table pet_care_provider 
       add constraint FKgjgihcuus0ff732cogsl3qxmn 
       foreign key ([user_id]) 
       references [USER];

    alter table pet_documents 
       add constraint fk_pet_documents_pet 
       foreign key (pet_id) 
       references pets;

    alter table pet_owner 
       add constraint FKnkltcsoswsbtcj6bxvrqthera 
       foreign key ([user_id]) 
       references [USER];

    alter table pets 
       add constraint fk_pets_owner 
       foreign key (owner_id) 
       references [USER];

    alter table prescription_items 
       add constraint fk_rx_items_prescription 
       foreign key (prescription_fk_id) 
       references prescriptions;

    alter table prescriptions 
       add constraint fk_prescriptions_consultation 
       foreign key (consultation_fk_id) 
       references consultations;

    alter table prescriptions 
       add constraint fk_prescriptions_pet 
       foreign key (pet_fk_id) 
       references pets;

    alter table prescriptions 
       add constraint fk_prescriptions_vet 
       foreign key (vet_fk_id) 
       references [USER];

    alter table rescue_officer 
       add constraint FKlxgd2xvqhjbmy46pg99dbnxh2 
       foreign key ([user_id]) 
       references [USER];

    alter table rescue_photos 
       add constraint fk_rescue_photos_case 
       foreign key (rescue_case_fk_id) 
       references rescue_cases;

    alter table rescue_progress_logs 
       add constraint fk_rescue_logs_case 
       foreign key (rescue_case_fk_id) 
       references rescue_cases;

    alter table vaccinations 
       add constraint fk_vaccinations_pet 
       foreign key (pet_id) 
       references pets;

    alter table veterinarian 
       add constraint FKraaddf3y5vfvqd8xr2g899omb 
       foreign key ([user_id]) 
       references [USER];

    create table [USER] (
        is_deleted bit default 0 not null,
        created_at datetime2(7) not null,
        updated_at datetime2(7),
        user_id bigint identity not null,
        nic_no varchar(20) not null,
        phone varchar(30),
        role varchar(30) not null check ((role in ('PetOwner','Veterinarian','ClinicStaff','PetCareProvider','ClinicManager','RescueOfficer','Admin'))),
        status varchar(40) not null check ((status in ('PendingApproval','Active','Rejected','Suspended'))),
        password_reset_token varchar(100),
        full_name varchar(150) not null,
        emergency_contact varchar(200),
        address varchar(300),
        rejection_reason varchar(500),
        suspension_reason varchar(500),
        avatar_url VARCHAR(MAX),
        email varchar(255) not null,
        password_hash varchar(255) not null,
        constraint uk_users_user_id primary key (user_id)
    );

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

    create table adoption_listings (
        is_published_for_adoption bit not null,
        case_id bigint not null,
        created_at datetime2(7) not null,
        updated_at datetime2(7) not null,
        listing_id varchar(255) not null,
        primary key (listing_id)
    );

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

    create table clinic_manager (
        [user_id] bigint not null,
        manager_code varchar(30),
        primary key ([user_id])
    );

    create table clinic_staff (
        [user_id] bigint not null,
        staff_id varchar(30),
        primary key ([user_id])
    );

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

    create table pet_care_provider (
        [user_id] bigint not null,
        service_specialty varchar(150),
        primary key ([user_id])
    );

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

    create table pet_owner (
        [user_id] bigint not null,
        primary key ([user_id])
    );

    create table pets (
        age_months int,
        age_years int,
        date_of_birth date,
        is_deleted bit default 0 not null,
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

    create table rescue_officer (
        [user_id] bigint not null,
        badge_number varchar(30),
        primary key ([user_id])
    );

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

    create table veterinarian (
        [user_id] bigint not null,
        license_number varchar(50),
        specialization varchar(150),
        primary key ([user_id])
    );

    alter table [USER] 
       add constraint uk_users_email unique (email);

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

    alter table appointments 
       add constraint uk_appointments_appointment_id unique (appointment_id);

    create index idx_approval_history_user_id 
       on approval_history (user_id);

    alter table care_providers 
       add constraint uk_care_provider_user unique (user_id);

    alter table care_service_logs 
       add constraint uk_care_service_log_id unique (service_log_id);

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

    alter table consultations 
       add constraint uk_consultations_consultation_id unique (consultation_id);

    create index idx_feedback_user 
       on feedbacks (user_id);

    create index idx_feedback_category 
       on feedbacks (service_category);

    alter table feedbacks 
       add constraint uk_feedback_feedback_id unique (feedback_id);

    alter table foster_records 
       add constraint uk_foster_records_foster_id unique (foster_id);

    create index idx_inventory_items_category 
       on inventory_items (category);

    create index idx_inventory_items_status 
       on inventory_items (status);

    alter table inventory_items 
       add constraint uk_inventory_items_item_id unique (item_id);

    alter table inventory_items 
       add constraint uk_inventory_items_sku unique (sku);

    create index idx_notifications_user 
       on notifications (user_id);

    create index idx_notifications_is_read 
       on notifications (is_read);

    alter table notifications 
       add constraint uk_notifications_notification_id unique (notification_id);

    alter table pet_documents 
       add constraint uk_pet_documents_document_id unique (document_id);

    create index idx_pets_owner 
       on pets (owner_id);

    alter table pets 
       add constraint uk_pets_pet_id unique (pet_id);

    create index idx_prescription_items_rx_id 
       on prescription_items (prescription_id);

    alter table prescription_items 
       add constraint uk_prescription_items_item_id unique (item_id);

    create index idx_prescriptions_pet_id 
       on prescriptions (pet_id);

    create index idx_prescriptions_vet_id 
       on prescriptions (vet_id);

    create index idx_prescriptions_consultation_id 
       on prescriptions (consultation_id);

    alter table prescriptions 
       add constraint uk_prescriptions_rx_id unique (prescription_id);

    alter table purchase_orders 
       add constraint uk_purchase_orders_order_id unique (order_id);

    create index idx_rescue_cases_status 
       on rescue_cases (status);

    create index idx_rescue_cases_published 
       on rescue_cases (is_published_for_adoption);

    alter table rescue_cases 
       add constraint uk_rescue_cases_case_id unique (case_id);

    create index idx_rescue_photos_case_id 
       on rescue_photos (case_id);

    alter table rescue_photos 
       add constraint uk_rescue_photos_photo_id unique (photo_id);

    create index idx_rescue_logs_case_id 
       on rescue_progress_logs (case_id);

    create index idx_rescue_logs_log_date 
       on rescue_progress_logs (log_date);

    alter table rescue_progress_logs 
       add constraint uk_rescue_progress_logs_log_id unique (log_id);

    alter table service_package_bookings 
       add constraint uk_service_package_booking_id unique (booking_id);

    alter table suppliers 
       add constraint uk_suppliers_supplier_id unique (supplier_id);

    alter table vaccinations 
       add constraint uk_vaccinations_vaccine_id unique (vaccine_id);

    alter table adoption_application_documents 
       add constraint FK3jo8h5ahulhqt4d6x5ixcn5i3 
       foreign key (application_id) 
       references adoption_applications;

    alter table adoption_applications 
       add constraint FKb5etb1yh4xuroa6vjxcf74gcy 
       foreign key (applicant_id) 
       references [USER];

    alter table adoption_applications 
       add constraint FKpssmak6donrlh7l463qtlkxx4 
       foreign key (case_id) 
       references rescue_cases;

    alter table adoption_applications 
       add constraint FKcnot1ki3bb5ctfyqdkj0193j 
       foreign key (reviewed_by) 
       references [USER];

    alter table adoption_listings 
       add constraint FKcdr2kc9eruujmg8y53jjuub2g 
       foreign key (case_id) 
       references rescue_cases;

    alter table appointments 
       add constraint fk_appointments_owner 
       foreign key (owner_fk_id) 
       references [USER];

    alter table appointments 
       add constraint fk_appointments_pet 
       foreign key (pet_fk_id) 
       references pets;

    alter table appointments 
       add constraint fk_appointments_vet 
       foreign key (vet_fk_id) 
       references [USER];

    alter table care_providers 
       add constraint fk_care_provider_user 
       foreign key (user_id) 
       references [USER];

    alter table care_services 
       add constraint fk_care_service_user 
       foreign key (created_by_user_id) 
       references [USER];

    alter table clinic_manager 
       add constraint FKl58g8y53c6g2epjlwt8myg0py 
       foreign key ([user_id]) 
       references [USER];

    alter table clinic_staff 
       add constraint FKjfj0whfl4fiaigow2v9d8ytag 
       foreign key ([user_id]) 
       references [USER];

    alter table consultations 
       add constraint fk_consultations_appointment 
       foreign key (appointment_fk_id) 
       references appointments;

    alter table consultations 
       add constraint fk_consultations_pet 
       foreign key (pet_fk_id) 
       references pets;

    alter table consultations 
       add constraint fk_consultations_vet 
       foreign key (vet_fk_id) 
       references [USER];

    alter table feedbacks 
       add constraint fk_feedback_user 
       foreign key (user_id) 
       references [USER];

    alter table inventory_items 
       add constraint fk_inventory_items_supplier 
       foreign key (supplier_fk_id) 
       references suppliers;

    alter table notifications 
       add constraint fk_notifications_user 
       foreign key (user_id) 
       references [USER];

    alter table pet_care_provider 
       add constraint FKgjgihcuus0ff732cogsl3qxmn 
       foreign key ([user_id]) 
       references [USER];

    alter table pet_documents 
       add constraint fk_pet_documents_pet 
       foreign key (pet_id) 
       references pets;

    alter table pet_owner 
       add constraint FKnkltcsoswsbtcj6bxvrqthera 
       foreign key ([user_id]) 
       references [USER];

    alter table pets 
       add constraint fk_pets_owner 
       foreign key (owner_id) 
       references [USER];

    alter table prescription_items 
       add constraint fk_rx_items_prescription 
       foreign key (prescription_fk_id) 
       references prescriptions;

    alter table prescriptions 
       add constraint fk_prescriptions_consultation 
       foreign key (consultation_fk_id) 
       references consultations;

    alter table prescriptions 
       add constraint fk_prescriptions_pet 
       foreign key (pet_fk_id) 
       references pets;

    alter table prescriptions 
       add constraint fk_prescriptions_vet 
       foreign key (vet_fk_id) 
       references [USER];

    alter table rescue_officer 
       add constraint FKlxgd2xvqhjbmy46pg99dbnxh2 
       foreign key ([user_id]) 
       references [USER];

    alter table rescue_photos 
       add constraint fk_rescue_photos_case 
       foreign key (rescue_case_fk_id) 
       references rescue_cases;

    alter table rescue_progress_logs 
       add constraint fk_rescue_logs_case 
       foreign key (rescue_case_fk_id) 
       references rescue_cases;

    alter table vaccinations 
       add constraint fk_vaccinations_pet 
       foreign key (pet_id) 
       references pets;

    alter table veterinarian 
       add constraint FKraaddf3y5vfvqd8xr2g899omb 
       foreign key ([user_id]) 
       references [USER];
