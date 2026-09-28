package com.petnexus.backend.patterns.strategy;

import org.springframework.stereotype.Component;

/**
 * Concrete Strategy: Community Rescue / Shelter Welfare Pricing.
 * Full 100% subsidy (free clinical examination) for rescued street animals
 * and foster companions under the clinic's non-profit rescue partnership.
 */
@Component
public class RescueAnimalWelfareStrategy implements FeeCalculationStrategy {

    @Override
    public String getStrategyName() {
        return "RESCUE_WELFARE";
    }

    @Override
    public String getDescription() {
        return "100% subsidized welfare rate ($0.00) for admitted street rescues and foster companions.";
    }

    @Override
    public double calculateFee(double baseFee, int petAgeYears, boolean isEmergency, boolean isRescueAnimal) {
        // Subsidized under the PetNexus Non-Profit Rescue Program
        return 0.00;
    }
}
