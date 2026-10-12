# PetNexus – Black-box & White-box Test Report

Group 2026-Y2-S1-MTR-20 · run on 2026-10-12 · Backend: Spring Boot / SQL Server · Frontend: React (Vite)

Scope = the six major functions (FR-01 … FR-10) and six minor functions of the proposal, plus the
non-functional requirement NFR-02 (security / role-based access).

## 1. Summary

| | Result |
|---|---|
| Automated tests | **379** run: 139 black-box, 72 white-box, 6 pattern-wiring and the project's existing `Phase*` / design-pattern suites (re-run as a regression check) |
| Passed | **379** |
| Failed | **0**. Initial run (before fixes): 6 failures, all genuine defects, now resolved (section 4). |
| UI smoke test | 55 pages across 7 roles loaded: **0 error screens, 0 failed API calls**, route guards correct |
| Coverage (JaCoCo) | services 80.8 % line / 53.4 % branch · security 98.9 % / 78.8 % · design patterns 100 % / 100 % · whole backend 60.4 % / 50.1 % |

Every automated test is `@Transactional` (rolled back) so the shared `PetNexus` database is left unchanged.
This was verified after the run (no leftover test users, items or suppliers; seeded passwords intact).

How to run:

```bash
cd Backend
./mvnw test -Dtest="BB*,WB*,PatternWiringUnitTest"                                  # everything new
./mvnw test -Dtest="BB*,WB*,PatternWiringUnitTest" -DexcludedGroups=known-defect    # same, minus the open D6 test
./mvnw org.jacoco:jacoco-maven-plugin:0.8.14:prepare-agent test org.jacoco:jacoco-maven-plugin:0.8.14:report
```

A test that demonstrates an open defect should carry `@Tag("known-defect")`; it is written against the
*requirement*, so it turns green as soon as the defect is fixed. No defect is open at the moment.

## 2. Black-box testing

Method: tests know only the public HTTP contract. Requests go through the real security filter chain
(JWT filter, `@PreAuthorize`, bean validation, exception handler) via MockMvc. Techniques: equivalence
partitioning (EP), boundary-value analysis (BVA), state-transition, access-control matrix, error guessing.

| Requirement | Suite | Tests | Failed | Highlights |
|---|---|---|---|---|
| FR-01 Pet & owner profiles | `BB1_PetOwnerManagementTest` | 27 | 0 | password 7/8 chars, phone 9/10/11 digits, weight 0/0.01, age 11/12 months, DOB vs age, owner isolation |
| FR-02, FR-03 Appointments | `BB2_AppointmentBookingTest` | 20 | 0 | past/today date, vet & pet double-booking, cancelled slot reuse, reschedule audit trail, walk-in, available slots, fee strategies |
| FR-05, FR-06 Rescue & adoption | `BB3_RescueAdoptionTest` | 17 | 0 | full state machine, publish rule, public gallery, apply → approve → case Adopted, role matrix |
| FR-04, FR-07 Health & grooming | `BB4_PetServicesHealthTest` | 17 | 0 | temperature 29.9/30/45/45.1, heart rate 19/20/400/401, prescription lifecycle, medical history, care-log lifecycle |
| FR-08, FR-09 Inventory & suppliers | `BB5_InventorySupplierTest` | 16 | 0 | stock status boundaries, restock/deduct, low-stock alert + manager notification (Observer), PO workflow |
| FR-10 Feedback & packages | `BB6_FeedbackPackagesTest` | 16 | 0 | rating 0/1/5/6, text lengths, manager reply + notification, package sessions 0/1/100/101 |
| Minor functions + NFR-02 | `BB7_MinorFunctionsAndSecurityTest` | 21 | 0 | login, approval workflow, password recovery, change password, document upload, notifications, forged/expired/tampered tokens, suspended token revoked |
| Provider directory | `BB8_CareProviderDirectoryTest` | 5 | 0 | role/user validation, uniqueness, deactivated provider blocked from new care sessions |

### UI smoke test (live site, read-only)

Logged in as each of the 7 roles and loaded every route of that role in a hidden frame:
owner 9, staff 7, vet 7, provider 7, rescue officer 9, manager 8, admin 5 = **55 pages**.
For each page: landed on the requested route, no error boundary, every `/api` call returned < 400,
no `$` left (currency now Rs.). Route guards: an owner opening admin / manager / vet / rescue / staff
URLs is redirected to `/owner/overview`; an anonymous visitor is redirected to `/login`.

Not covered by this smoke test: typing into forms and clicking through multi-step wizards (the API suites
cover the same rules), and cross-browser / mobile layout (NFR-06).

## 3. White-box testing

Method: unit tests with mocked repositories (no database) written from the source; each decision is driven
down its true and false branch. Coverage measured with JaCoCo.

| Suite | Tests | Structure covered |
|---|---|---|
| `WB1_AppointmentServicePathsTest` | 29 | book (role switch, 6 validations, optional-field defaults), fee quoting (age from DOB, boundary 7/8, price list, rescue/emergency), walk-in, confirm, status, reschedule (all 8 statuses), cancel, filters, slots |
| `WB2_WorkflowStateMachinesTest` | 12 | **all 64** rescue (from,to) pairs and **all 36** purchase-order pairs, publish rule, accept-report guard, dispatch idempotence, cancel from each state |
| `WB3_AuthAndSecurityPathsTest` | 16 | register per role, login (every status), approve / reject / suspend / reactivate, reset & change password, profile field rules, JWT (expiry, tamper, secret padding), filter (6 anonymous paths + authenticated), ownership util (5 outcomes) |
| `WB4_InventoryPatternsPetRulesTest` | 15 | stock status boundaries, add/update/restock rules, supplier link, refill alerts, Observer manager and low-stock observer, Strategy priority and maths, Factory methods, pet validation and ownership rules |

Per-class coverage (white-box + black-box together):

| Class | Line | Branch |
|---|---|---|
| AppointmentService | 97.5 % | 78.6 % |
| InventoryService | 96.2 % | 79.6 % |
| PurchaseOrderService | 90.9 % | 93.2 % |
| RescueCaseService | 86.9 % | 61.9 % |
| UserService | 82.8 % | 51.9 % |
| NotificationService | 81.0 % | 52.1 % |
| JwtService / JwtAuthenticationFilter / SecurityUtils | 100 % / 100 % / 93 % | 64 % / 79 % / 100 % |
| FeeCalculationContext, strategies, NotificationFactory, Observer classes | 100 % | 100 % |

Lower-covered, not yet exercised in depth: `SupplierService` (60 %), `AdoptionListingService` (53 %),
`EmailServiceImpl` (58 %) and `DataInitializer` (seed data, 10 %).

## 4. Defects found

| ID | Sev. | Requirement | Defect | Evidence | Status |
|---|---|---|---|---|---|
| D1 | **High** | FR-03 | Clinic staff could not confirm a newly booked appointment. Booking creates `Scheduled`, but confirm only accepted `Pending`. | `AP-11`: confirm → 400 "…status "Scheduled" cannot be confirmed." | **Fixed** – `confirmAppointment` accepts `Scheduled` and `Pending`; other statuses still rejected (WB1 checks all 6). |
| D2 | **High** | NFR-02 | An owner could create a package booking in another owner's name (`ownerId` came from the request body). | `PK-09`: USR-013 posted a booking for USR-001 → 201 | **Fixed** – `ServicePackageBookingService.createBooking` forces the caller's id for `PetOwner`. |
| D3 | **High** | NFR-02 | Any logged-in user could list every owner's package bookings. | `PK-10`: USR-013 saw a booking of USR-001 | **Fixed** – list is scoped to the caller for `PetOwner` (`?ownerId=` is ignored); staff roles still see all. |
| D4 | – | FR-09 | *Re-assessed, not a defect.* New purchase orders are created as `Dispatched` by design: the manager UI has a single "place order" action and no approve step, and the existing integration tests assert it. The `Pending → Approved` states are reachable only through the API. The real issue was the second creation path (`POST /suppliers/purchase-orders`) using a time-based id that could collide. | `SU-05` now documents Dispatched → Shipped → Delivered; `SU-07` checks unique ids | **Fixed (id part)** – ids are now sequential and skip taken numbers. Status left unchanged on purpose. |
| D5 | Medium | Constraint "clinic working hours" | Any time-slot text was accepted (e.g. "03:17 AM"). | `AP-20`: slot "03:17 AM" → 201 | **Fixed** – book and reschedule accept only the 11 published slots. Booking form now also lists 03:30 PM and 04:00 PM, which it was missing. |
| D6 | Low | FR-01 | Pet owners could not record vaccinations (vet / staff / manager only), although FR-01 says owners manage "vaccination … details". Related: update and delete of a vaccination had **no authorization check**, so any logged-in user could edit or delete any pet's record. | `PO-23`: owner `POST /vaccinations` → 403 | **Fixed** – an owner can add, edit and delete vaccinations of their own pets; vet, clinic staff, clinic manager and admin can for any pet; other owners and care providers get 403 (`PO-26`, `PO-27`). Backend only: the owner screens do not yet have an "add vaccination" form (vets still use the vet page). |

## 5. Gaps against the proposal (no failing test – feature not present)

| Proposal item | Finding |
|---|---|
| Minor: Email & SMS confirmation | Only the password-reset e-mail exists. Booking / update confirmations are in-app notifications; there is no SMS code. |
| Minor: Notification & alerts – vaccination, grooming-completion, boarding-pickup reminders | No scheduler (`@Scheduled` = 0). `createVaccinationReminderNotification` exists in the factory but nothing calls it. |
| Minor: Calendar view | No calendar component; "Vet availability" is a date picker with a slot list. |
| Minor: Logout | Client-side only (token discarded). Tokens stay valid until expiry (24 h) – acceptable for stateless JWT, but worth stating. |
| Document upload | Files are stored as base64 data-URLs in the database (no multipart endpoint, no size limit). Works; heavy for large files. |
| NFR-01 performance (2–3 s) | Not measured with a load tool. Evidence: all 55 pages finished rendering inside the 3 s harness wait. |
| Frontend vet list | `VetAvailabilityPage` hard-codes three vet names (one is not a seeded user). |

## 6. Conclusion

All six major functions work end-to-end for their main flows and every page loads for every role.
The first run found six problems; D1, D2, D3 and D5 are fixed, D4 turned out to be intended behaviour
(only its id-collision risk was real and is fixed), and D6 is fixed together with a missing authorization
check on vaccination edit / delete. After the fixes the full suite, including the project's existing
integration tests, runs 379 tests with 0 failures. The remaining proposal gaps in section 5 are features
that were never built, not bugs.
