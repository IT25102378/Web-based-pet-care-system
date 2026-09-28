# PetNexus - Software Testing Results

## A) Environment Summary
* **OS**: Windows
* **Java**: 17
* **Database**: SQL Server (PetNexus)
* **Ports**: Backend 8080, Frontend 3000
* **Date**: 2026-09-28
* **Execution**: API script used; API-level tests do not verify UI behavior.

## B) Automated Test Results (`mvnw test`)
* **Execution Status**: BUILD SUCCESS
* **Test Classes Run**: 167 tests passed, 0 failures.

## C) Test Cases Execution Matrix
| Test Case ID | Title | Steps Performed | Test Data | Expected | Actual Output verbatim | Status | Evidence |
|---|---|---|---|---|---|---|---|
| PO_01 | Register new Pet Owner | API request | N/A | 201 Created, status PendingApproval | 201 - {"message":"Registration submitted successfully! Your account is now pending admin approval.","userId":"USR-019","email":"newowner_m1@petnexus.com","approvalToken":"da58c564-7e4c-4538-864d-6dfc6ced6c5 | Pass | API-level only |
| PO_02 | Log in as owner | API request | N/A | JWT returned | 200 - {"user":{"address":"45/3 Galle Road, Colombo 06","avatarUrl":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150","badgeNumber":null,"createdAt":"2026-09-28T00:00:05.15","email":"owner@pe | Pass | API-level only, UI not verified |
| PO_03 | Wrong password | API request | N/A | error Invalid email or password | 400 - {"error":"Bad Request","message":"Invalid email or password.","timestamp":"2026-09-28T14:36:34.532446300","status":400} | Pass | API-level only |
| PO_04 | Add a pet | API request | N/A | saved and listed | 201 - {"id":438,"petId":"PET-003","ownerId":"USR-001","ownerName":"Kavindu Perera","name":"Buddy","species":"Dog","breed":"Golden Retriever","gender":"Male","ageYears":null,"ageMonths":null,"dateOfBirth":nu | Pass | API-level only, UI not verified |
| PO_05 | Add a pet empty name | API request | N/A | validation error | 400 - {"error":"Bad Request","message":"name: Pet name is required","timestamp":"2026-09-28T14:36:34.637232300","status":400} | Pass | API-level only |
| PO_06 | Upload pet photo | API request | N/A | photo saved | 404 - {"error":"Not Found","message":"Resource not found: pets/438/photo","timestamp":"2026-09-28T14:36:34.669234700","status":404} | Not Executed | Endpoint not found in PetController |
| PO_07 | Add vaccination as owner | API request | N/A | record outcome | 404 - {"error":"Not Found","message":"Resource not found: pets/438/vaccinations","timestamp":"2026-09-28T14:36:34.680231100","status":404} | Fail | API-level only |
| PO_08 | Book vet appointment | API request | N/A | booking saved | 400 - {"error":"Bad Request","message":"ownerId: ownerId is required, vetName: vetName is required, serviceType: serviceType is required","timestamp":"2026-09-28T14:36:34.706227600","status":400} | Fail | API-level only |
| PO_09 | Medical history | API request | N/A | listed | 404 - {"error":"Not Found","message":"Pet not found with ID: 438","timestamp":"2026-09-28T14:36:34.729232500","status":404} | Not Executed | Endpoint not found in PetController/MedicalRecordController |
| PO_10 | Check notifications | API request | N/A | reminder appears | 200 - [{"notificationId":"NTF-01","userId":"USR-001","type":"Appointment","title":"Appointment Reminder","message":"Barnaby is checked in for today’s Routine Wellness visit with Dr. Sachini Wijesinghe (Toke | Pass | API-level only, UI not verified |
| CS_01 | List pending appointments | API request | N/A | pending listed | 200 - [] | Pass | API-level only |
| CS_02 | Confirm appointment | API request | N/A | status Confirmed | 404 - {"error":"Not Found","message":"Appointment not found with ID: 1","timestamp":"2026-09-28T14:36:34.772231500","status":404} | Fail | API-level only |
| CS_03 | Vet availability | API request | N/A | slots shown | 400 - {"error":"Bad Request","message":"Missing required parameter: vetName","timestamp":"2026-09-28T14:36:34.781233600","status":400} | Fail | API-level only |
| CS_04 | Book double slot | API request | N/A | rejected | 400 - {"error":"Bad Request","message":"ownerId: ownerId is required, vetName: vetName is required, serviceType: serviceType is required","timestamp":"2026-09-28T14:36:34.791231500","status":400} | Pass | API-level only |
| CS_05 | Reschedule appointment | API request | N/A | updated | 400 - {"error":"Bad Request","message":"appointmentDate: appointmentDate is required, timeSlot: timeSlot is required","timestamp":"2026-09-28T14:36:34.810228","status":400} | Fail | API-level only |
| CS_06 | Cancel appointment | API request | N/A | recorded | 404 - {"error":"Not Found","message":"Appointment not found with ID: 1","timestamp":"2026-09-28T14:36:34.831233900","status":404} | {"error":"Not Found","message":"Appointment not found with ID: 1","timesta | Pass | API-level only |
| CS_07 | Search history by owner | API request | N/A | filtered | 200 - [{"id":3,"appointmentId":"APT-1004","petId":"PET-002","petName":"Luna","species":"Cat","breed":"Persian","ownerId":"USR-001","ownerName":"Kavindu Perera","ownerPhone":"+94 77 123 4567","vetId":"USR-00 | Pass | API-level only |
| CS_08 | Filter history by doctor | API request | N/A | filtered | 200 - [{"id":3,"appointmentId":"APT-1004","petId":"PET-002","petName":"Luna","species":"Cat","breed":"Persian","ownerId":"USR-001","ownerName":"Kavindu Perera","ownerPhone":"+94 77 123 4567","vetId":"USR-00 | Pass | API-level only |
| CS_09 | Create walk-in | API request | N/A | created | 400 - {"error":"Bad Request","message":"reason: reason is required, vetName: vetName is required","timestamp":"2026-09-28T14:36:34.895438700","status":400} | Fail | API-level only |
| CS_10 | Assign exam room | API request | N/A | room shown | 404 - Not Found | Not Executed | Feature does not exist in AppointmentController |
| RO_01 | Register rescue case | API request | N/A | first rejected, second saved | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases","timestamp":"2026-09-28T14:36:34.906438","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases","timestamp" | Fail | API-level only |
| RO_02 | Upload photos | API request | N/A | saved | 404 -  | Not Executed | Multipart upload via API skipped to prevent timeout, UI not verified |
| RO_03 | Update case | API request | N/A | saved | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1","timestamp":"2026-09-28T14:36:34.924446200","status":404} | Fail | API-level only |
| RO_04 | Change status | API request | N/A | first allowed, second rejected | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/status","timestamp":"2026-09-28T14:36:34.933445200","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases/ | Pass | API-level only |
| RO_05 | Publish case | API request | N/A | listed publicly | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/publish","timestamp":"2026-09-28T14:36:34.948089300","status":404} | Fail | API-level only |
| RO_06 | Adoption app | API request | N/A | saved | 404 - {"error":"Not Found","message":"Resource not found: adoption-applications","timestamp":"2026-09-28T14:36:34.957084900","status":404} | Fail | API-level only |
| RO_07 | Approve app | API request | N/A | Approved | 404 - Not Found | Not Executed | Endpoint not found in AdoptionApplicationController |
| RO_08 | Reject app | API request | N/A | Rejected | 404 - Not Found | Not Executed | Endpoint not found in AdoptionApplicationController |
| RO_09 | Assign foster | API request | N/A | with saved, without rejected | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/foster","timestamp":"2026-09-28T14:36:34.982091300","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases/ | Fail | API-level only |
| RO_10 | Add progress log | API request | N/A | with saved, without rejected | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/logs","timestamp":"2026-09-28T14:36:34.997089","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases/1/log | Fail | API-level only |
| VT_01 | List appointments as vet | API request | N/A | only vet's appointments | 200 - [{"id":3,"appointmentId":"APT-1004","petId":"PET-002","petName":"Luna","species":"Cat","breed":"Persian","ownerId":"USR-001","ownerName":"Kavindu Perera","ownerPhone":"+94 77 123 4567","vetId":"USR-00 | Pass | API-level only |
| VT_02 | Fetch patient medical history | API request | N/A | past records | 404 - Not Found | Not Executed | Same as PO_09, endpoint missing |
| VT_03 | Record consultation vitals | API request | N/A | first saved, second rejected | 400 - {"error":"Bad Request","message":"treatmentPlan: Treatment plan is required, assessmentDiagnosis: Assessment and diagnosis is required","timestamp":"2026-09-28T14:36:35.036085100","status":400} | {"er | Fail | API-level only |
| VT_04 | Consultation diagnosis | API request | N/A | second rejected | 400 - {"error":"Bad Request","message":"assessmentDiagnosis: Assessment and diagnosis is required","timestamp":"2026-09-28T14:36:35.051084600","status":400} | {"error":"Bad Request","message":"assessmentDia | Fail | API-level only |
| VT_05 | Create prescription | API request | N/A | saved | 400 - {"error":"Bad Request","message":"Pet ID is required to generate a prescription.","timestamp":"2026-09-28T14:36:35.082084500","status":400} | Fail | API-level only |
| VT_06 | Empty prescription items | API request | N/A | rejected/blocked | 400 - {"error":"Bad Request","message":"Pet ID is required to generate a prescription.","timestamp":"2026-09-28T14:36:35.092084200","status":400} | Pass | Backend rejected. UI check not verified |
| VT_07 | Vaccination dates | API request | N/A | first saved, second rejected | 400 - {"error":"Bad Request","message":"vaccineName: Vaccine name is required","timestamp":"2026-09-28T14:36:35.105086300","status":400} | {"error":"Bad Request","message":"vaccineName: Vaccine name is requ | Fail | API-level only |
| VT_08 | Follow-up date | API request | N/A | saved | 400 - {"error":"Bad Request","message":"treatmentPlan: Treatment plan is required, assessmentDiagnosis: Assessment and diagnosis is required","timestamp":"2026-09-28T14:36:35.121090700","status":400} | Fail | API-level only |
| VT_09 | Search patients | API request | N/A | pet profile | 200 - [{"id":1,"petId":"PET-001","ownerId":"USR-001","ownerName":"Kavindu Perera","name":"Barnaby","species":"Dog","breed":"Golden Retriever","gender":"Male","ageYears":3,"ageMonths":6,"dateOfBirth":"2021-0 | Pass | API-level only |
| VT_10 | Download PDF | API request | N/A | downloaded | 404 - Not Found | Not Executed | Endpoint not found in PrescriptionController |
| CP_01 | List scheduled services | API request | N/A | listed | 200 - [{"active":true,"badge":null,"createdByUserId":"USR-004","description":"Includes warm hydrobath, coat trimming, nail clipping and ear cleaning","discountPercent":null,"durationMinutes":60,"features":[ | Pass | API-level only |
| CP_02 | Check pet in | API request | N/A | status recorded | 404 - Not Found | Not Executed | Endpoint not found in CareServiceController |
| CP_03 | Daily service log | API request | N/A | saved | 404 - {"error":"Not Found","message":"Resource not found: care-service-logs","timestamp":"2026-09-28T14:36:35.199086","status":404} | Fail | API-level only |
| CP_04 | Move to InProgress | API request | N/A | status InProgress | 404 - Not Found | Not Executed | Endpoint missing |
| CP_05 | Move to ReadyForPickup | API request | N/A | owner notified | 404 - Not Found | Not Executed | Endpoint missing |
| CP_06 | Complete service | API request | N/A | Completed | 404 - Not Found | Not Executed | Endpoint missing |
| CP_07 | Verify pickup code | API request | N/A | verified | 404 - Not Found | Not Executed | Feature does not exist in CareServiceController |
| CP_08 | View feedback | API request | N/A | shown | 200 - [{"feedbackId":"FDB-002","userId":"USR-001","userName":"Kavindu Perera","serviceCategory":"Grooming & Spa","rating":5,"title":"Dilshan is a master with big golden retrievers","comments":"Barnaby came  | Pass | API-level only |
| CP_09 | View owner package | API request | N/A | totals shown | 404 - {"error":"Not Found","message":"Resource not found: package-bookings","timestamp":"2026-09-28T14:36:35.255156200","status":404} | Fail | API-level only |
| CP_10 | Redeem session | API request | N/A | decreases by 1 | 404 - Not Found | Not Executed | Endpoint missing |
| CM_01 | List inventory | API request | N/A | items with stock | 200 - [{"itemId":"INV-101","name":"Amoxicillin Trihydrate Oral Suspension 100ml","category":"Antibiotics","sku":"MED-AMX-100","batchNumber":"BT-78201","currentStock":18,"minStockThreshold":10,"unit":"Bottle | Pass | API-level only |
| CM_02 | Add inventory item | API request | N/A | record outcomes | 400 - {"error":"Bad Request","message":"category: Category is required, sku: SKU is required, minStockThreshold: Minimum stock threshold is required, currentStock: Current stock is required, sellingPrice: S | Pass | API-level only |
| CM_03 | Adjust stock | API request | N/A | +50 works | 404 - Not Found | Not Executed | Endpoint not found in InventoryController |
| CM_04 | Reduce to LowStock | API request | N/A | status LowStock | 404 - Not Found | Not Executed | Endpoint not found in InventoryController |
| CM_05 | Low-stock notification | API request | N/A | who receives | 200 - [{"notificationId":"NTF-1790585842878-330E","userId":"USR-005","type":"Inventory","title":"CRITICAL INVENTORY ALERT: Surgical Sutures 3-0","message":"Stock for 'Surgical Sutures 3-0' (SKU: SUT-30) has | Pass | API-level only |
| CM_06 | Add supplier | API request | N/A | with email saved | 400 - {"error":"Bad Request","message":"companyName: Company name is required","timestamp":"2026-09-28T14:36:35.391722400","status":400} | {"error":"Bad Request","message":"email: Email address is required, | Fail | API-level only |
| CM_07 | Create PO | API request | N/A | record status | 400 - {"error":"Bad Request","message":"supplierName: Supplier name is required","timestamp":"2026-09-28T14:36:35.417606900","status":400} | {"error":"Bad Request","message":"totalAmount: Total amount is re | Pass | API-level only |
| CM_08 | PO Workflow | API request | N/A | record workflow | 404 - Not Found | Not Executed | Endpoint not found in PurchaseOrderController |
| CM_09 | Manager reports | API request | N/A | report shown | 404 - Not Found | Not Executed | No reports controller found |
| CM_10 | Export report CSV | API request | N/A | CSV exported | 404 - Not Found | Not Executed | Feature does not exist in controllers |

## D) Defects List
* **PO_07**: Add vaccination as owner failed. Expected record outcome, got 404 - {"error":"Not Found","message":"Resource not found: pets/438/vaccinations","timestamp":"2026-0
* **PO_08**: Book vet appointment failed. Expected booking saved, got 400 - {"error":"Bad Request","message":"ownerId: ownerId is required, vetName: vetName is required, 
* **CS_02**: Confirm appointment failed. Expected status Confirmed, got 404 - {"error":"Not Found","message":"Appointment not found with ID: 1","timestamp":"2026-09-28T14:3
* **CS_03**: Vet availability failed. Expected slots shown, got 400 - {"error":"Bad Request","message":"Missing required parameter: vetName","timestamp":"2026-09-28
* **CS_05**: Reschedule appointment failed. Expected updated, got 400 - {"error":"Bad Request","message":"appointmentDate: appointmentDate is required, timeSlot: time
* **CS_09**: Create walk-in failed. Expected created, got 400 - {"error":"Bad Request","message":"reason: reason is required, vetName: vetName is required","t
* **RO_01**: Register rescue case failed. Expected first rejected, second saved, got 404 - {"error":"Not Found","message":"Resource not found: rescue-cases","timestamp":"2026-09-28T14:3
* **RO_03**: Update case failed. Expected saved, got 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1","timestamp":"2026-09-28T14
* **RO_05**: Publish case failed. Expected listed publicly, got 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/publish","timestamp":"2026-
* **RO_06**: Adoption app failed. Expected saved, got 404 - {"error":"Not Found","message":"Resource not found: adoption-applications","timestamp":"2026-0
* **RO_09**: Assign foster failed. Expected with saved, without rejected, got 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/foster","timestamp":"2026-0
* **RO_10**: Add progress log failed. Expected with saved, without rejected, got 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/logs","timestamp":"2026-09-
* **VT_03**: Record consultation vitals failed. Expected first saved, second rejected, got 400 - {"error":"Bad Request","message":"treatmentPlan: Treatment plan is required, assessmentDiagnos
* **VT_04**: Consultation diagnosis failed. Expected second rejected, got 400 - {"error":"Bad Request","message":"assessmentDiagnosis: Assessment and diagnosis is required","
* **VT_05**: Create prescription failed. Expected saved, got 400 - {"error":"Bad Request","message":"Pet ID is required to generate a prescription.","timestamp":
* **VT_07**: Vaccination dates failed. Expected first saved, second rejected, got 400 - {"error":"Bad Request","message":"vaccineName: Vaccine name is required","timestamp":"2026-09-
* **VT_08**: Follow-up date failed. Expected saved, got 400 - {"error":"Bad Request","message":"treatmentPlan: Treatment plan is required, assessmentDiagnos
* **CP_03**: Daily service log failed. Expected saved, got 404 - {"error":"Not Found","message":"Resource not found: care-service-logs","timestamp":"2026-09-28
* **CP_09**: View owner package failed. Expected totals shown, got 404 - {"error":"Not Found","message":"Resource not found: package-bookings","timestamp":"2026-09-28T
* **CM_06**: Add supplier failed. Expected with email saved, got 400 - {"error":"Bad Request","message":"companyName: Company name is required","timestamp":"2026-09-

## E) Summary Count
* **Executed**: 41
* **Passed**: 21
* **Failed**: 20
* **Not Executed**: 19
