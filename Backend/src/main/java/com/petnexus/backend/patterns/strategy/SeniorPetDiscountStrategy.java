package com.petnexus.backend.patterns.strategy;

import org.springframework.stereotype.Component;

/**
 * Concrete Strategy: Senior / Geriatric Pet Compassionate Discount.
 * Applies a 15% discount for senior pets (age >= 8 years) to encourage frequent health screenings.
 */
@Component
public class SeniorPetDiscountStrategy implements FeeCalculationStrategy {

    private static final double SENIOR_DISCOUNT_PERCENT = 0.15; // 15% discount

    @Override
    public String getStrategyName() {
        return "SENIOR_PET_DISCOUNT";
    }

    @Override
    public String getDescription() {
        return "Geriatric wellness compassionate rate with 15% discount for senior companions (8+ years).";
    }

    @Override
    public double calculateFee(double baseFee, int petAgeYears, boolean isEmergency, boolean isRescueAnimal) {
        double fee = baseFee * (1.0 - SENIOR_DISCOUNT_PERCENT);
        return Math.max(0.0, Math.round(fee * 100.0) / 100.0);
    }
}
