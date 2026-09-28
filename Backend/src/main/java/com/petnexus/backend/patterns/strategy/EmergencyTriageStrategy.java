package com.petnexus.backend.patterns.strategy;

import org.springframework.stereotype.Component;

/**
 * Concrete Strategy: Emergency Urgent Care / Critical Triage Fee Calculation.
 * Implements a 1.5x urgent care multiplier plus a standardized trauma triage surcharge ($20 / LKR 2000).
 */
@Component
public class EmergencyTriageStrategy implements FeeCalculationStrategy {

    private static final double EMERGENCY_MULTIPLIER = 1.50;
    private static final double TRIAGE_SURCHARGE = 20.00;

    @Override
    public String getStrategyName() {
        return "EMERGENCY_TRIAGE";
    }

    @Override
    public String getDescription() {
        return "Urgent triage consultation with 1.5x priority diagnostic multiplier + $20.00 emergency facility fee.";
    }

    @Override
    public double calculateFee(double baseFee, int petAgeYears, boolean isEmergency, boolean isRescueAnimal) {
        double fee = (baseFee * EMERGENCY_MULTIPLIER) + TRIAGE_SURCHARGE;
        return Math.round(fee * 100.0) / 100.0;
    }
}
