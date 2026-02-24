export type AgeGroup = "under30" | "30to44" | "45to59" | "60to64";
export type ResignationType = "voluntary" | "company";

export interface CalculatorInput {
  dailyWage: number;
  ageGroup: AgeGroup;
  insurancePeriodYears: number;
  resignationType: ResignationType;
}

export interface CalculationResult {
  basicDailyAllowance: number;
  benefitDays: number;
  totalBenefit: number;
  benefitRate: number;
  cappedDailyWage: number;
}

export interface ExplainRequest {
  input: CalculatorInput;
  result: CalculationResult;
  mode: "simple" | "detailed";
}
