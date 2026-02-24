"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import CalculatorForm from "@/components/CalculatorForm";
import ResultDisplay from "@/components/ResultDisplay";
import ExplanationPanel from "@/components/ExplanationPanel";
import { calculateBenefit } from "@/lib/calculator";
import type { CalculatorInput, CalculationResult } from "@/types";

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [currentInput, setCurrentInput] = useState<CalculatorInput | null>(null);
  const [simpleExplanation, setSimpleExplanation] = useState<string>("");
  const [detailedExplanation, setDetailedExplanation] = useState<string>("");
  const [isLoadingSimple, setIsLoadingSimple] = useState(false);
  const [isLoadingDetailed, setIsLoadingDetailed] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  // URLパラメータから初期値を復元
  const getInitialValues = useCallback((): Partial<CalculatorInput> => {
    const dw = searchParams.get("dw");
    const ag = searchParams.get("ag");
    const ip = searchParams.get("ip");
    const rt = searchParams.get("rt");

    const partial: Partial<CalculatorInput> = {};
    if (dw) partial.dailyWage = Number(dw);
    if (ag && ["under30", "30to44", "45to59", "60to64"].includes(ag)) {
      partial.ageGroup = ag as CalculatorInput["ageGroup"];
    }
    if (ip) partial.insurancePeriodYears = Number(ip);
    if (rt && ["voluntary", "company"].includes(rt)) {
      partial.resignationType = rt as CalculatorInput["resignationType"];
    }
    return partial;
  }, [searchParams]);

  // URLパラメータがあれば自動計算
  useEffect(() => {
    const initial = getInitialValues();
    if (
      initial.dailyWage &&
      initial.ageGroup &&
      initial.insurancePeriodYears !== undefined &&
      initial.resignationType
    ) {
      const input = initial as CalculatorInput;
      setCurrentInput(input);
      setResult(calculateBenefit(input));
    }
  }, [getInitialValues]);

  const handleCalculate = (input: CalculatorInput) => {
    setCurrentInput(input);
    setResult(calculateBenefit(input));
    setSimpleExplanation("");
    setDetailedExplanation("");
    setApiError("");

    // URLパラメータを更新
    const params = new URLSearchParams();
    params.set("dw", input.dailyWage.toString());
    params.set("ag", input.ageGroup);
    params.set("ip", input.insurancePeriodYears.toString());
    params.set("rt", input.resignationType);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const fetchExplanation = async (mode: "simple" | "detailed") => {
    if (!currentInput || !result) return;

    const setLoading = mode === "simple" ? setIsLoadingSimple : setIsLoadingDetailed;
    const setExplanation = mode === "simple" ? setSimpleExplanation : setDetailedExplanation;

    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: currentInput, result, mode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(data.error || "エラーが発生しました");
      } else {
        setExplanation(data.explanation);
      }
    } catch {
      setApiError("ネットワークエラーが発生しました。しばらくしてから再試行してください。");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      // フォールバック: 手動コピー用のプロンプト
      const dummy = document.createElement("textarea");
      dummy.value = window.location.href;
      document.body.appendChild(dummy);
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                失業手当受給額計算ツール
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                雇用保険の基本手当を簡単計算・2024年8月時点の法令に基づく
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左カラム: 入力フォーム */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
              入力情報
            </h2>
            <CalculatorForm
              onCalculate={handleCalculate}
              initialValues={getInitialValues()}
            />
          </div>

          {/* 右カラム: 結果表示 */}
          <div className="space-y-5">
            {result && currentInput ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-5 pb-3 border-b border-gray-100">
                    計算結果
                  </h2>
                  <ResultDisplay
                    result={result}
                    input={currentInput}
                    onSimpleExplain={() => fetchExplanation("simple")}
                    onDetailedExplain={() => fetchExplanation("detailed")}
                    onCopyUrl={handleCopyUrl}
                    copiedUrl={copiedUrl}
                    isLoadingSimple={isLoadingSimple}
                    isLoadingDetailed={isLoadingDetailed}
                  />
                </div>

                {/* エラー表示 */}
                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                    <strong>エラー:</strong> {apiError}
                  </div>
                )}

                {/* 解説パネル（簡単） */}
                {simpleExplanation && (
                  <ExplanationPanel
                    explanation={simpleExplanation}
                    mode="simple"
                    onClose={() => setSimpleExplanation("")}
                  />
                )}

                {/* 解説パネル（詳細） */}
                {detailedExplanation && (
                  <ExplanationPanel
                    explanation={detailedExplanation}
                    mode="detailed"
                    onClose={() => setDetailedExplanation("")}
                  />
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center text-center min-h-64">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-700 font-semibold mb-2">
                  計算結果がここに表示されます
                </h3>
                <p className="text-gray-400 text-sm">
                  左の入力フォームに必要事項を入力し、
                  <br />「受給額を計算する」ボタンを押してください
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="text-amber-800 font-semibold text-sm mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            ご注意ください
          </h3>
          <ul className="text-amber-700 text-xs space-y-1 list-disc list-inside">
            <li>本ツールの計算結果はあくまで概算です。実際の受給額はハローワークの審査により決定されます。</li>
            <li>自己都合退職の場合、2024年の法改正により給付制限期間（待機期間）が変更になっています。</li>
            <li>特定理由離職者（やむを得ない事情での離職）は会社都合と同等の扱いになる場合があります。</li>
            <li>賃金日額は離職前6ヶ月間の賃金総額（賞与を除く）÷ 180 で算出します。</li>
          </ul>
        </div>
      </main>

      {/* フッター */}
      <footer className="mt-8 border-t border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 py-5 text-center text-xs text-gray-400">
          <p>失業手当受給額計算ツール — 2024年8月時点の雇用保険法に基づく</p>
          <p className="mt-1">本ツールは情報提供を目的としており、法的アドバイスではありません。詳細はお近くのハローワークにお問い合わせください。</p>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">読み込み中...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
