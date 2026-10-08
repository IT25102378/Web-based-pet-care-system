# Lab 06 – Design Patterns: Group Project Task Submission

## 1. Group Details
**Project Topic**: PetNexus - Web-based Pet Care System
**Module**: IT2020 - Software Engineering (Year 2 Semester 1, 2025/2026)

**Members**:
1. Avinash (ITXXXXXXXX)
2. Chandrasekara B.P.G.I.L (ITXXXXXXXX)
3. Ediriweera D.L (ITXXXXXXXX)
4. Ifaza M.D.U (ITXXXXXXXX)
5. Wickramasinghe N.G.E.D (ITXXXXXXXX)
6. Wijesinghe W.A.O.S (ITXXXXXXXX)

*(Please fill in your respective IT numbers before submission).*

---

## 2. Design Pattern(s) Used
Our team integrated the **Strategy Pattern (Behavioral Design Pattern)** into the core clinical appointment and financial modules of the PetNexus system. 

Additionally, our system also incorporates the **Factory Pattern (Creational)** for notification processing and the **Observer Pattern (Behavioral)** for inventory stock monitoring. However, the Strategy Pattern is the primary focus of this submission.

---

## 3. Justification for Each Pattern

### Strategy Pattern (Fee Calculation Engine)
In a veterinary clinical practice and pet care operation, pricing and fee calculations vary dynamically based on clinical urgency, patient demographics, and welfare status. For example:
- **Emergency Triage**: Requires a 1.5x trauma priority multiplier and a base surcharge.
- **Senior Pets (Geriatric Wellness)**: Eligible for a compassionate 15% discount.
- **Rescue Animal Welfare**: Receives a full 100% subsidized (free) examination.
- **Standard**: Standard outpatient consultation fee.

**Why the Strategy Pattern is suitable:**
Instead of hardcoding complex conditional `if-else` or `switch` ladders inside our core business services (e.g., `AppointmentService` or `ConsultationService`), the Strategy Pattern allows us to encapsulate each pricing algorithm into a dedicated, interchangeable strategy class conforming to a common interface (`FeeCalculationStrategy`).

**How it improves our design:**
1. **Open/Closed Principle (OCP)**: New discount or pricing algorithms (e.g., Seasonal Promotions, Partner Insurance Tiers) can be introduced by simply creating a new concrete strategy class without modifying existing service logic.
2. **Single Responsibility Principle (SRP)**: Each pricing algorithm isolates its specific calculation formula and discount constraints.
3. **Runtime Polymorphism**: The `FeeCalculationContext` object can dynamically switch strategies at runtime based on the patient's parameters (e.g., age, emergency flag, rescue status).

---

## 4. Code Structure Alignment (Lab Requirements)

We have adhered to the Lab 06 architectural requirements with clear naming conventions and inline documentation denoting their respective roles:

* **Strategy Interface**: `FeeCalculationStrategy.java`
* **Context Class**: `FeeCalculationContext.java`
* **Concrete Strategies**: 
  - `StandardConsultationStrategy.java`
  - `EmergencyTriageStrategy.java`
  - `SeniorPetDiscountStrategy.java`
  - `RescueAnimalWelfareStrategy.java`
* **Main Class (Client)**: `DesignPatternController.java` (Demonstrates the dynamic strategy execution in a REST API).

---

## 5. Screenshots of Implementation
*(Please attach screenshots of your Java code, particularly `FeeCalculationContext.java` and `FeeCalculationStrategy.java`, and the output of the API or console demonstrating the execution here).*
