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
    avatar_url VARCHAR(MAX),
    created_at DATETIME2,
    street VARCHAR(100),
    city VARCHAR(100)
);
GO

CREATE TABLE USER_PHONE (
    user_id INT,
    phone_number VARCHAR(20),
    PRIMARY KEY (user_id, phone_number),
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE PET_OWNER (
    user_id INT PRIMARY KEY,
    owner_id VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
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
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id) ON DELETE CASCADE
);
GO

CREATE TABLE NOTIFICATION (
    notification_id INT PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    date_sent DATE NOT NULL,
    is_read BIT DEFAULT 0,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
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
-- Foreign Keys: officer_user_id in RESCUE_CASE references RESCUE_OFFICER(user_id)

-- Part 2: Table Creation (DDL)
CREATE TABLE RESCUE_OFFICER (
    user_id INT PRIMARY KEY,
    badge_number VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE RESCUE_CASE (
    case_id INT PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Reported',
    animal_condition VARCHAR(100),
    owner_user_id INT,
    officer_user_id INT,
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id),
    FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id)
);
GO

CREATE TABLE FOSTER_CARE (
    foster_id INT PRIMARY KEY,
    foster_name VARCHAR(100) NOT NULL,
    officer_user_id INT,
    FOREIGN KEY (officer_user_id) REFERENCES RESCUE_OFFICER(user_id)
);
GO

CREATE TABLE RESCUED_PET (
    case_id INT,
    rescued_pet_no INT,
    rescue_status VARCHAR(50),
    foster_id INT,
    PRIMARY KEY (case_id, rescued_pet_no),
    FOREIGN KEY (case_id) REFERENCES RESCUE_CASE(case_id) ON DELETE CASCADE,
    FOREIGN KEY (foster_id) REFERENCES FOSTER_CARE(foster_id)
);
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

INSERT INTO RESCUE_CASE (case_id, location, date, status, animal_condition, officer_user_id) VALUES
(201, 'Central Park', '2023-10-15', 'Resolved', 'Injured leg', 3);
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
WHERE user_id = (SELECT TOP 1 officer_user_id FROM RESCUE_CASE WHERE case_id = 201);
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
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE VETERINARIAN_SPECIALIZATION (
    user_id INT,
    specialization VARCHAR(100),
    PRIMARY KEY (user_id, specialization),
    FOREIGN KEY (user_id) REFERENCES VETERINARIAN(user_id) ON DELETE CASCADE
);
GO

CREATE TABLE PET_CARE_PROVIDER (
    user_id INT PRIMARY KEY,
    provider_id VARCHAR(20) UNIQUE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
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
    FOREIGN KEY (record_id) REFERENCES MEDICAL_RECORD(record_id) ON DELETE CASCADE
);
GO

CREATE TABLE PRESCRIPTION_MEDICATION (
    record_id INT,
    prescription_id INT,
    medication VARCHAR(100),
    PRIMARY KEY (record_id, prescription_id, medication),
    FOREIGN KEY (record_id, prescription_id) REFERENCES PRESCRIPTION(record_id, prescription_id) ON DELETE CASCADE
);
GO

CREATE TABLE VACCINATION (
    pet_id INT,
    vaccination_no INT,
    vaccine_name VARCHAR(100) NOT NULL,
    next_due_date DATE,
    PRIMARY KEY (pet_id, vaccination_no),
    FOREIGN KEY (pet_id) REFERENCES PET(pet_id) ON DELETE CASCADE
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
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
);
GO

CREATE TABLE CLINIC_STAFF (
    user_id INT PRIMARY KEY,
    staff_id VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES [USER](user_id) ON DELETE CASCADE
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
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id) ON DELETE CASCADE
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

CREATE TABLE INCLUDED_IN (
    service_id INT,
    package_id INT,
    PRIMARY KEY (service_id, package_id),
    FOREIGN KEY (service_id) REFERENCES SERVICE(service_id) ON DELETE CASCADE,
    FOREIGN KEY (package_id) REFERENCES SERVICE_PACKAGE(package_id) ON DELETE CASCADE
);
GO

CREATE TABLE COMPLAINT (
    complaint_id INT PRIMARY KEY,
    date_filed DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending',
    details VARCHAR(MAX),
    manager_user_id INT,
    owner_user_id INT,
    FOREIGN KEY (manager_user_id) REFERENCES CLINIC_MANAGER(user_id),
    FOREIGN KEY (owner_user_id) REFERENCES PET_OWNER(user_id)
);
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


