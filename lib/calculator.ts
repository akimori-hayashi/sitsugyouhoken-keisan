import type { AgeGroup, CalculatorInput, CalculationResult, ResignationType } from "@/types";

// 2024年8月時点の雇用保険法に基づく計算
// https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000139518.html

// 賃金日額の上限（令和6年度）
const DAILY_WAGE_CEILING: Record<AgeGroup, number> = {
  under30: 14250,
  "30to44": 15890,
  "45to59": 17530,
  "60to64": 15010,
};

// 基本手当日額の上限（令和6年度）
const BASIC_DAILY_ALLOWANCE_CEILING: Record<AgeGroup, number> = {
  under30: 6945,
  "30to44": 7715,
  "45to59": 8490,
  "60to64": 7294,
};

// 給付率計算の閾値（令和6年度）
const LOWER_THRESHOLD = 5110; // 円（低賃金区分の上限）
const UPPER_THRESHOLD = 12580; // 円（高賃金区分の下限）
const HIGH_RATE = 0.8; // 低賃金時の給付率
const LOW_RATE = 0.5; // 高賃金時の給付率

/**
 * 給付率を計算する
 * 賃金日額に応じて50〜80%の範囲で変動
 */
export function calculateBenefitRate(dailyWage: number): number {
  if (dailyWage <= LOWER_THRESHOLD) {
    return HIGH_RATE;
  }
  if (dailyWage >= UPPER_THRESHOLD) {
    return LOW_RATE;
  }
  // 中間域：線形補間
  return HIGH_RATE - (HIGH_RATE - LOW_RATE) * (dailyWage - LOWER_THRESHOLD) / (UPPER_THRESHOLD - LOWER_THRESHOLD);
}

/**
 * 給付日数を取得する
 * 離職理由・年齢・被保険者期間により決定
 */
export function getBenefitDays(
  ageGroup: AgeGroup,
  insurancePeriodYears: number,
  resignationType: ResignationType
): number {
  if (resignationType === "voluntary") {
    // 一般離職者（自己都合等）：年齢に関わらず被保険者期間のみで決定
    if (insurancePeriodYears < 1) return 90;  // 実際は受給資格なし（簡易表示）
    if (insurancePeriodYears < 10) return 90;
    if (insurancePeriodYears < 20) return 120;
    return 150;
  }

  // 特定受給資格者（会社都合等）：年齢と被保険者期間で決定
  switch (ageGroup) {
    case "under30":
      if (insurancePeriodYears < 1) return 90;
      if (insurancePeriodYears < 5) return 90;
      if (insurancePeriodYears < 10) return 120;
      return 180;

    case "30to44":
      if (insurancePeriodYears < 1) return 90;
      if (insurancePeriodYears < 5) return 120;
      if (insurancePeriodYears < 10) return 180;
      if (insurancePeriodYears < 20) return 240;
      return 270;

    case "45to59":
      if (insurancePeriodYears < 1) return 90;
      if (insurancePeriodYears < 5) return 180;
      if (insurancePeriodYears < 10) return 240;
      if (insurancePeriodYears < 20) return 270;
      return 330;

    case "60to64":
      if (insurancePeriodYears < 1) return 90;
      if (insurancePeriodYears < 5) return 150;
      if (insurancePeriodYears < 10) return 180;
      if (insurancePeriodYears < 20) return 210;
      return 240;
  }
}

/**
 * 失業手当を計算する
 */
export function calculateBenefit(input: CalculatorInput): CalculationResult {
  const { dailyWage, ageGroup, insurancePeriodYears, resignationType } = input;

  // 賃金日額の上限適用
  const cappedDailyWage = Math.min(dailyWage, DAILY_WAGE_CEILING[ageGroup]);

  // 給付率計算
  const benefitRate = calculateBenefitRate(cappedDailyWage);

  // 基本手当日額（上限を超えたらカット）
  const rawDailyAllowance = Math.floor(cappedDailyWage * benefitRate);
  const basicDailyAllowance = Math.min(rawDailyAllowance, BASIC_DAILY_ALLOWANCE_CEILING[ageGroup]);

  // 給付日数
  const benefitDays = getBenefitDays(ageGroup, insurancePeriodYears, resignationType);

  // 総受給額（概算）
  const totalBenefit = basicDailyAllowance * benefitDays;

  return {
    basicDailyAllowance,
    benefitDays,
    totalBenefit,
    benefitRate: Math.round(benefitRate * 1000) / 10, // 小数点1桁の%表記
    cappedDailyWage,
  };
}

// 表示用ラベル
export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  under30: "30歳未満",
  "30to44": "30〜44歳",
  "45to59": "45〜59歳",
  "60to64": "60〜64歳",
};

export const RESIGNATION_TYPE_LABELS: Record<ResignationType, string> = {
  voluntary: "自己都合",
  company: "会社都合",
};
