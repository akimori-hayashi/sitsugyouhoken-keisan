"use client";

import { useState } from "react";
import type { CalculatorInput, AgeGroup, ResignationType } from "@/types";

interface Props {
  onCalculate: (input: CalculatorInput) => void;
  initialValues?: Partial<CalculatorInput>;
}

export default function CalculatorForm({ onCalculate, initialValues }: Props) {
  const [dailyWage, setDailyWage] = useState<string>(
    initialValues?.dailyWage?.toString() ?? ""
  );
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(
    initialValues?.ageGroup ?? "30to44"
  );
  const [insurancePeriodYears, setInsurancePeriodYears] = useState<string>(
    initialValues?.insurancePeriodYears?.toString() ?? ""
  );
  const [resignationType, setResignationType] = useState<ResignationType>(
    initialValues?.resignationType ?? "voluntary"
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const wage = Number(dailyWage);
    const period = Number(insurancePeriodYears);

    if (!dailyWage || isNaN(wage) || wage <= 0) {
      newErrors.dailyWage = "正の数値を入力してください";
    } else if (wage > 100000) {
      newErrors.dailyWage = "賃金日額が高すぎます（上限: 100,000円）";
    }

    if (!insurancePeriodYears || isNaN(period) || period < 0) {
      newErrors.insurancePeriodYears = "0以上の数値を入力してください";
    } else if (period > 50) {
      newErrors.insurancePeriodYears = "被保険者期間が長すぎます（上限: 50年）";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onCalculate({
      dailyWage: Number(dailyWage),
      ageGroup,
      insurancePeriodYears: Number(insurancePeriodYears),
      resignationType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 賃金日額 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          離職前の賃金日額
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={dailyWage}
            onChange={(e) => setDailyWage(e.target.value)}
            placeholder="例: 10000"
            min="1"
            max="100000"
            className={`w-full border rounded-lg px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.dailyWage ? "border-red-400 bg-red-50" : "border-gray-300"
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            円/日
          </span>
        </div>
        {errors.dailyWage && (
          <p className="mt-1 text-sm text-red-600">{errors.dailyWage}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          直近6ヶ月の賃金総額 ÷ 180 で算出します
        </p>
      </div>

      {/* 年齢区分 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          年齢区分
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              { value: "under30", label: "30歳未満" },
              { value: "30to44", label: "30〜44歳" },
              { value: "45to59", label: "45〜59歳" },
              { value: "60to64", label: "60〜64歳" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className={`flex items-center justify-center px-3 py-3 border-2 rounded-lg cursor-pointer text-sm font-medium transition ${
                ageGroup === value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <input
                type="radio"
                name="ageGroup"
                value={value}
                checked={ageGroup === value}
                onChange={() => setAgeGroup(value)}
                className="sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* 被保険者期間 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          雇用保険の被保険者期間
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={insurancePeriodYears}
            onChange={(e) => setInsurancePeriodYears(e.target.value)}
            placeholder="例: 5"
            min="0"
            max="50"
            step="0.5"
            className={`w-full border rounded-lg px-4 py-3 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
              errors.insurancePeriodYears
                ? "border-red-400 bg-red-50"
                : "border-gray-300"
            }`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
            年
          </span>
        </div>
        {errors.insurancePeriodYears && (
          <p className="mt-1 text-sm text-red-600">
            {errors.insurancePeriodYears}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          同じ会社でなくても、通算の雇用保険加入期間を入力してください
        </p>
      </div>

      {/* 離職理由 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          離職理由
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              {
                value: "voluntary",
                label: "自己都合",
                desc: "転職・一身上の都合など",
              },
              {
                value: "company",
                label: "会社都合",
                desc: "解雇・倒産・希望退職など",
              },
            ] as const
          ).map(({ value, label, desc }) => (
            <label
              key={value}
              className={`flex flex-col px-4 py-3 border-2 rounded-lg cursor-pointer transition ${
                resignationType === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <input
                type="radio"
                name="resignationType"
                value={value}
                checked={resignationType === value}
                onChange={() => setResignationType(value)}
                className="sr-only"
              />
              <span
                className={`font-semibold text-sm ${
                  resignationType === value ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {label}
              </span>
              <span className="text-xs text-gray-500 mt-0.5">{desc}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-lg transition text-base shadow-sm"
      >
        受給額を計算する
      </button>
    </form>
  );
}
