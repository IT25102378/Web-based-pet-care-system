package com.petnexus.backend.patterns.strategy;

import org.springframework.stereotype.Component;

/**
 * Concrete Strategy: Standard Consultation Fee Calculation.
 * Regular consultation rate with zero surcharges or special discounts.
 */
@Component
public class StandardConsultationStrategy implements FeeCalculationStrategy {

    @Override
    public String getStrategyName() {
        return "STANDARD";
    }

    @Override
    public String getDescription() {
        return "Standard outpatient consultation with base clinical examination fee (1.0x multiplier).";
    }

    @Override
    public double calculateFee(double baseFee, int petAgeYears, boolean isEmergency, boolean isRescueAnimal) {
        return Math.max(0.0, Math.round(baseFee * 100.0) / 100.0);
    }
}
