# Actual Test Execution Results

| Test Case ID | Actual Output | Status |
|---|---|---|
| PO_01 | 201 - {"message":"Registration submitted successfully! Your account is now pending admin approval.","userId":"USR-019","email":"newowner_m1@petnexus.com","approvalToken":"da58c564-7e4c-4538-864d-6dfc6ced6c5 | Pass |
| PO_02 | 200 - {"user":{"address":"45/3 Galle Road, Colombo 06","avatarUrl":"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150","badgeNumber":null,"createdAt":"2026-09-28T00:00:05.15","email":"owner@pe | Pass |
| PO_03 | 400 - {"error":"Bad Request","message":"Invalid email or password.","timestamp":"2026-09-28T14:36:34.532446300","status":400} | Pass |
| PO_04 | 201 - {"id":438,"petId":"PET-003","ownerId":"USR-001","ownerName":"Kavindu Perera","name":"Buddy","species":"Dog","breed":"Golden Retriever","gender":"Male","ageYears":null,"ageMonths":null,"dateOfBirth":nu | Pass |
| PO_05 | 400 - {"error":"Bad Request","message":"name: Pet name is required","timestamp":"2026-09-28T14:36:34.637232300","status":400} | Pass |
| PO_06 | 404 - {"error":"Not Found","message":"Resource not found: pets/438/photo","timestamp":"2026-09-28T14:36:34.669234700","status":404} | Not Executed |
| PO_07 | 404 - {"error":"Not Found","message":"Resource not found: pets/438/vaccinations","timestamp":"2026-09-28T14:36:34.680231100","status":404} | Fail |
| PO_08 | 400 - {"error":"Bad Request","message":"ownerId: ownerId is required, vetName: vetName is required, serviceType: serviceType is required","timestamp":"2026-09-28T14:36:34.706227600","status":400} | Fail |
| PO_09 | 404 - {"error":"Not Found","message":"Pet not found with ID: 438","timestamp":"2026-09-28T14:36:34.729232500","status":404} | Not Executed |
| PO_10 | 200 - [{"notificationId":"NTF-01","userId":"USR-001","type":"Appointment","title":"Appointment Reminder","message":"Barnaby is checked in for todays Routine Wellness visit with Dr. Sachini Wijesinghe (Toke | Pass |
| CS_01 | 200 - [] | Pass |
| CS_02 | 404 - {"error":"Not Found","message":"Appointment not found with ID: 1","timestamp":"2026-09-28T14:36:34.772231500","status":404} | Fail |
| CS_03 | 400 - {"error":"Bad Request","message":"Missing required parameter: vetName","timestamp":"2026-09-28T14:36:34.781233600","status":400} | Fail |
| CS_04 | 400 - {"error":"Bad Request","message":"ownerId: ownerId is required, vetName: vetName is required, serviceType: serviceType is required","timestamp":"2026-09-28T14:36:34.791231500","status":400} | Pass |
| CS_05 | 400 - {"error":"Bad Request","message":"appointmentDate: appointmentDate is required, timeSlot: timeSlot is required","timestamp":"2026-09-28T14:36:34.810228","status":400} | Fail |
| CS_06 | 404 - {"error":"Not Found","message":"Appointment not found with ID: 1","timestamp":"2026-09-28T14:36:34.831233900","status":404} | {"error":"Not Found","message":"Appointment not found with ID: 1","timesta |
| CS_07 | 200 - [{"id":3,"appointmentId":"APT-1004","petId":"PET-002","petName":"Luna","species":"Cat","breed":"Persian","ownerId":"USR-001","ownerName":"Kavindu Perera","ownerPhone":"+94 77 123 4567","vetId":"USR-00 | Pass |
| CS_08 | 200 - [{"id":3,"appointmentId":"APT-1004","petId":"PET-002","petName":"Luna","species":"Cat","breed":"Persian","ownerId":"USR-001","ownerName":"Kavindu Perera","ownerPhone":"+94 77 123 4567","vetId":"USR-00 | Pass |
| CS_09 | 400 - {"error":"Bad Request","message":"reason: reason is required, vetName: vetName is required","timestamp":"2026-09-28T14:36:34.895438700","status":400} | Fail |
| CS_10 | 404 - Not Found | Not Executed |
| RO_01 | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases","timestamp":"2026-09-28T14:36:34.906438","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases","timestamp" |
| RO_02 | 404 - | Not Executed |
| RO_03 | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1","timestamp":"2026-09-28T14:36:34.924446200","status":404} | Fail |
| RO_04 | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/status","timestamp":"2026-09-28T14:36:34.933445200","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases/ |
| RO_05 | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/publish","timestamp":"2026-09-28T14:36:34.948089300","status":404} | Fail |
| RO_06 | 404 - {"error":"Not Found","message":"Resource not found: adoption-applications","timestamp":"2026-09-28T14:36:34.957084900","status":404} | Fail |
| RO_07 | 404 - Not Found | Not Executed |
| RO_08 | 404 - Not Found | Not Executed |
| RO_09 | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/foster","timestamp":"2026-09-28T14:36:34.982091300","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases/ |
| RO_10 | 404 - {"error":"Not Found","message":"Resource not found: rescue-cases/1/logs","timestamp":"2026-09-28T14:36:34.997089","status":404} | {"error":"Not Found","message":"Resource not found: rescue-cases/1/log |
| VT_01 | 200 - [{"id":3,"appointmentId":"APT-1004","petId":"PET-002","petName":"Luna","species":"Cat","breed":"Persian","ownerId":"USR-001","ownerName":"Kavindu Perera","ownerPhone":"+94 77 123 4567","vetId":"USR-00 | Pass |
| VT_02 | 404 - Not Found | Not Executed |
| VT_03 | 400 - {"error":"Bad Request","message":"treatmentPlan: Treatment plan is required, assessmentDiagnosis: Assessment and diagnosis is required","timestamp":"2026-09-28T14:36:35.036085100","status":400} | {"er |
| VT_04 | 400 - {"error":"Bad Request","message":"assessmentDiagnosis: Assessment and diagnosis is required","timestamp":"2026-09-28T14:36:35.051084600","status":400} | {"error":"Bad Request","message":"assessmentDia |
| VT_05 | 400 - {"error":"Bad Request","message":"Pet ID is required to generate a prescription.","timestamp":"2026-09-28T14:36:35.082084500","status":400} | Fail |
| VT_06 | 400 - {"error":"Bad Request","message":"Pet ID is required to generate a prescription.","timestamp":"2026-09-28T14:36:35.092084200","status":400} | Pass |
| VT_07 | 400 - {"error":"Bad Request","message":"vaccineName: Vaccine name is required","timestamp":"2026-09-28T14:36:35.105086300","status":400} | {"error":"Bad Request","message":"vaccineName: Vaccine name is requ |
| VT_08 | 400 - {"error":"Bad Request","message":"treatmentPlan: Treatment plan is required, assessmentDiagnosis: Assessment and diagnosis is required","timestamp":"2026-09-28T14:36:35.121090700","status":400} | Fail |
| VT_09 | 200 - [{"id":1,"petId":"PET-001","ownerId":"USR-001","ownerName":"Kavindu Perera","name":"Barnaby","species":"Dog","breed":"Golden Retriever","gender":"Male","ageYears":3,"ageMonths":6,"dateOfBirth":"2021-0 | Pass |
| VT_10 | 404 - Not Found | Not Executed |
| CP_01 | 200 - [{"active":true,"badge":null,"createdByUserId":"USR-004","description":"Includes warm hydrobath, coat trimming, nail clipping and ear cleaning","discountPercent":null,"durationMinutes":60,"features":[ | Pass |
| CP_02 | 404 - Not Found | Not Executed |
| CP_03 | 404 - {"error":"Not Found","message":"Resource not found: care-service-logs","timestamp":"2026-09-28T14:36:35.199086","status":404} | Fail |
| CP_04 | 404 - Not Found | Not Executed |
| CP_05 | 404 - Not Found | Not Executed |
| CP_06 | 404 - Not Found | Not Executed |
| CP_07 | 404 - Not Found | Not Executed |
| CP_08 | 200 - [{"feedbackId":"FDB-002","userId":"USR-001","userName":"Kavindu Perera","serviceCategory":"Grooming & Spa","rating":5,"title":"Dilshan is a master with big golden retrievers","comments":"Barnaby came | Pass |
| CP_09 | 404 - {"error":"Not Found","message":"Resource not found: package-bookings","timestamp":"2026-09-28T14:36:35.255156200","status":404} | Fail |
| CP_10 | 404 - Not Found | Not Executed |
| CM_01 | 200 - [{"itemId":"INV-101","name":"Amoxicillin Trihydrate Oral Suspension 100ml","category":"Antibiotics","sku":"MED-AMX-100","batchNumber":"BT-78201","currentStock":18,"minStockThreshold":10,"unit":"Bottle | Pass |
| CM_02 | 400 - {"error":"Bad Request","message":"category: Category is required, sku: SKU is required, minStockThreshold: Minimum stock threshold is required, currentStock: Current stock is required, sellingPrice: S | Pass |
| CM_03 | 404 - Not Found | Not Executed |
| CM_04 | 404 - Not Found | Not Executed |
| CM_05 | 200 - [{"notificationId":"NTF-1790585842878-330E","userId":"USR-005","type":"Inventory","title":"CRITICAL INVENTORY ALERT: Surgical Sutures 3-0","message":"Stock for 'Surgical Sutures 3-0' (SKU: SUT-30) has | Pass |
| CM_06 | 400 - {"error":"Bad Request","message":"companyName: Company name is required","timestamp":"2026-09-28T14:36:35.391722400","status":400} | {"error":"Bad Request","message":"email: Email address is required, |
| CM_07 | 400 - {"error":"Bad Request","message":"supplierName: Supplier name is required","timestamp":"2026-09-28T14:36:35.417606900","status":400} | {"error":"Bad Request","message":"totalAmount: Total amount is re |
| CM_08 | 404 - Not Found | Not Executed |
| CM_09 | 404 - Not Found | Not Executed |
| CM_10 | 404 - Not Found | Not Executed |
