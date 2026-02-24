"use client";

import type { CalculationResult, CalculatorInput } from "@/types";
import { AGE_GROUP_LABELS, RESIGNATION_TYPE_LABELS } from "@/lib/calculator";

interface Props {
  result: CalculationResult;
  input: CalculatorInput;
  onSimpleExplain: () => void;
  onDetailedExplain: () => void;
  onCopyUrl: () => void;
  copiedUrl: boolean;
  isLoadingSimple: boolean;
  isLoadingDetailed: boolean;
}

export default function ResultDisplay({
  result,
  input,
  onSimpleExplain,
  onDetailedExplain,
  onCopyUrl,
  copiedUrl,
  isLoadingSimple,
  isLoadingDetailed,
}: Props) {
  return (
    <div className="space-y-5">
      {/* 入力サマリ */}
      <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
        <span>賃金日額: <strong className="text-gray-800">{input.dailyWage.toLocaleString()}円</strong></span>
        <span>年齢: <strong className="text-gray-800">{AGE_GROUP_LABELS[input.ageGroup]}</strong></span>
        <span>期間: <strong className="text-gray-800">{input.insurancePeriodYears}年</strong></span>
        <span>理由: <strong className="text-gray-800">{RESIGNATION_TYPE_LABELS[input.resignationType]}</strong></span>
      </div>

      {/* メイン結果カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-600 rounded-xl p-5 text-white">
          <p className="text-blue-200 text-sm font-medium">基本手当日額</p>
          <p className="text-3xl font-bold mt-1">
            {result.basicDailyAllowance.toLocaleString()}
            <span className="text-lg font-normal ml-1">円/日</span>
          </p>
          <p className="text-blue-200 text-xs mt-2">
            給付率 {result.benefitRate}%（賃金日額 {result.cappedDailyWage.toLocaleString()}円に適用）
          </p>
        </div>

        <div className="bg-indigo-600 rounded-xl p-5 text-white">
          <p className="text-indigo-200 text-sm font-medium">給付日数</p>
          <p className="text-3xl font-bold mt-1">
            {result.benefitDays}
            <span className="text-lg font-normal ml-1">日間</span>
          </p>
          <p className="text-indigo-200 text-xs mt-2">
            {RESIGNATION_TYPE_LABELS[input.resignationType]}・{AGE_GROUP_LABELS[input.ageGroup]}・{input.insurancePeriodYears}年加入
          </p>
        </div>
      </div>

      {/* 総受給額 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <p className="text-gray-600 text-sm font-medium">総受給額（概算）</p>
        <p className="text-4xl font-bold text-blue-700 mt-1">
          {result.totalBenefit.toLocaleString()}
          <span className="text-xl font-normal ml-1 text-blue-500">円</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          ※ 実際の受給額は、就職活動の状況・認定日・収入等により変動します
        </p>
      </div>

      {/* 計算詳細 */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">計算内訳</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>賃金日額（入力値）</span>
            <span className="font-medium">{input.dailyWage.toLocaleString()} 円</span>
          </div>
          {input.dailyWage !== result.cappedDailyWage && (
            <div className="flex justify-between text-amber-600">
              <span>上限適用後の賃金日額</span>
              <span className="font-medium">{result.cappedDailyWage.toLocaleString()} 円</span>
            </div>
          )}
          <div className="flex justify-between text-gray-600">
            <span>給付率</span>
            <span className="font-medium">{result.benefitRate} %</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between text-gray-800 font-semibold">
            <span>基本手当日額</span>
            <span>{result.basicDailyAllowance.toLocaleString()} 円</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>給付日数</span>
            <span className="font-medium">{result.benefitDays} 日</span>
          </div>
          <div className="border-t border-gray-100 pt-2 flex justify-between text-blue-700 font-bold">
            <span>総受給額（概算）</span>
            <span>{result.totalBenefit.toLocaleString()} 円</span>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onSimpleExplain}
          disabled={isLoadingSimple || isLoadingDetailed}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition text-sm"
        >
          {isLoadingSimple ? (
            <>
              <Spinner />
              生成中...
            </>
          ) : (
            <>
              <span>💬</span>
              簡単に解説
            </>
          )}
        </button>

        <button
          onClick={onDetailedExplain}
          disabled={isLoadingSimple || isLoadingDetailed}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition text-sm"
        >
          {isLoadingDetailed ? (
            <>
              <Spinner />
              生成中...
            </>
          ) : (
            <>
              <span>📖</span>
              詳しく解説
            </>
          )}
        </button>

        <button
          onClick={onCopyUrl}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 active:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition text-sm"
        >
          {copiedUrl ? (
            <>
              <span>✓</span>
              コピーしました
            </>
          ) : (
            <>
              <span>🔗</span>
              URLをコピー
            </>
          )}
        </button>
      </div>

      {/* 注意書き */}
      <p className="text-xs text-gray-400 text-center">
        2024年8月時点の雇用保険法に基づく計算です。詳細はハローワークにご確認ください。
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
