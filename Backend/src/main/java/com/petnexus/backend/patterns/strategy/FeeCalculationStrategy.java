package com.petnexus.backend.patterns.strategy;

/**
 * ==============================================================================
 * DESIGN PATTERN: STRATEGY PATTERN (GoF Behavioral Pattern)
 * ==============================================================================
 * WHERE USED:
 *   - com.petnexus.backend.service.AppointmentService
 *   - com.petnexus.backend.service.ConsultationService
 *   - com.petnexus.backend.controller.DesignPatternController
 *
 * WHY USED:
 *   In veterinary clinical practice and pet care operations, pricing and fee
 *   calculations vary dynamically based on clinical urgency (regular vs. emergency
 *   triage), patient demographics (senior pet care compassion rate), and welfare
 *   status (shelter rescue animals vs. private pets).
 *
 *   Instead of hardcoding complex conditional if-else or switch ladders inside
 *   business services, the Strategy Pattern encapsulates each pricing algorithm
 *   into dedicated, interchangeable strategy classes conforming to this interface.
 *
 * BENEFITS:
 *   1. Open/Closed Principle (OCP): New discount or pricing algorithms (e.g.,
 *      Seasonal Promotions, Insurance Provider Tiers) can be introduced without
 *      modifying existing service logic.
 *   2. Single Responsibility Principle (SRP): Each pricing algorithm isolates
 *      its specific calculation formula and discount constraints.
 *   3. Testability: Strategies can be tested independently with focused unit tests.
 * ==============================================================================
 */
public interface FeeCalculationStrategy {

    /**
     * Unique identifier of the strategy (e.g., "STANDARD", "EMERGENCY", "SENIOR_PET", "RESCUE_WELFARE").
     */
    String getStrategyName();

    /**
     * Human-readable description of how this strategy calculates fees.
     */
    String getDescription();

    /**
     * Calculates the final consultation or procedure fee.
     *
     * @param baseFee         Standard scheduled service fee in currency units
     * @param petAgeYears     Age of the pet in years (used for pediatric/geriatric tiers)
     * @param isEmergency     Whether this is an expedited urgent triage
     * @param isRescueAnimal  Whether the patient is an admitted rescue or foster companion
     * @return Final computed fee after applying multipliers and compassionate discounts
     */
    double calculateFee(double baseFee, int petAgeYears, boolean isEmergency, boolean isRescueAnimal);
}
