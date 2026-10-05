package com.petnexus.backend.patterns.strategy;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Strategy Pattern: Context Class.
 * Maintains a reference to the available FeeCalculationStrategy implementations
 * and dynamically delegates execution to the chosen or resolved strategy.
 */
@Component
public class FeeCalculationContext {

    private final Map<String, FeeCalculationStrategy> strategyRegistry = new HashMap<>();
    private final StandardConsultationStrategy defaultStrategy;

    public FeeCalculationContext(List<FeeCalculationStrategy> strategies, StandardConsultationStrategy defaultStrategy) {
        this.defaultStrategy = defaultStrategy;
        for (FeeCalculationStrategy s : strategies) {
            this.strategyRegistry.put(s.getStrategyName(), s);
        }
    }

    /**
     * Dynamically resolves the appropriate strategy based on appointment context:
     * 1. Rescue animal -> RescueAnimalWelfareStrategy
     * 2. Emergency triage -> EmergencyTriageStrategy
     * 3. Senior pet (age >= 8) -> SeniorPetDiscountStrategy
     * 4. Otherwise -> StandardConsultationStrategy
     */
    public FeeCalculationStrategy resolveStrategy(int petAgeYears, boolean isEmergency, boolean isRescueAnimal) {
        if (isRescueAnimal) {
            return strategyRegistry.getOrDefault("RESCUE_WELFARE", defaultStrategy);
        }
        if (isEmergency) {
            return strategyRegistry.getOrDefault("EMERGENCY_TRIAGE", defaultStrategy);
        }
        if (petAgeYears >= 8) {
            return strategyRegistry.getOrDefault("SENIOR_PET_DISCOUNT", defaultStrategy);
        }
        return defaultStrategy;
    }

    /**
     * Executes fee calculation using the dynamically resolved strategy.
     */
    public double computeFee(double baseFee, int petAgeYears, boolean isEmergency, boolean isRescueAnimal) {
        FeeCalculationStrategy strategy = resolveStrategy(petAgeYears, isEmergency, isRescueAnimal);
        return strategy.calculateFee(baseFee, petAgeYears, isEmergency, isRescueAnimal);
    }

    /**
     * Executes fee calculation using an explicitly requested strategy name.
     */
    public double computeFeeWithStrategy(String strategyName, double baseFee, int petAgeYears, boolean isEmergency, boolean isRescueAnimal) {
        FeeCalculationStrategy strategy = strategyRegistry.getOrDefault(strategyName, defaultStrategy);
        return strategy.calculateFee(baseFee, petAgeYears, isEmergency, isRescueAnimal);
    }

    public Map<String, FeeCalculationStrategy> getAllStrategies() {
        return strategyRegistry;
    }
}
