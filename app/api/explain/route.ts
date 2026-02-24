import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { ExplainRequest } from "@/types";
import { AGE_GROUP_LABELS, RESIGNATION_TYPE_LABELS } from "@/lib/calculator";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: ExplainRequest = await request.json();
    const { input, result, mode } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY が設定されていません" },
        { status: 500 }
      );
    }

    const ageLabel = AGE_GROUP_LABELS[input.ageGroup];
    const resignLabel = RESIGNATION_TYPE_LABELS[input.resignationType];

    const prompt = `以下は失業手当（雇用保険の基本手当）の計算結果です。

【入力情報】
- 離職前の賃金日額: ${input.dailyWage.toLocaleString()}円
- 年齢区分: ${ageLabel}
- 雇用保険被保険者期間: ${input.insurancePeriodYears}年
- 離職理由: ${resignLabel}

【計算結果】
- 賃金日額（上限適用後）: ${result.cappedDailyWage.toLocaleString()}円
- 給付率: ${result.benefitRate}%
- 基本手当日額: ${result.basicDailyAllowance.toLocaleString()}円
- 給付日数: ${result.benefitDays}日
- 総受給額（概算）: ${result.totalBenefit.toLocaleString()}円

${
  mode === "simple"
    ? "この計算結果について、受給者にとってわかりやすく3〜4文で簡潔に説明してください。専門用語は避け、要点だけを伝えてください。"
    : `この計算結果について、400文字程度で詳しく説明してください。以下の点を含めてください：
1. 基本手当日額の計算方法と給付率の意味
2. 給付日数が決まる仕組み
3. 受給手続きの流れと注意点
4. ${resignLabel}の場合の特記事項（待機期間など）`
}`;

    const model = mode === "simple"
      ? "claude-haiku-4-5-20251001"
      : "claude-sonnet-4-5-20250929";

    const message = await client.messages.create({
      model,
      max_tokens: 700,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ explanation: text });
  } catch (error) {
    console.error("API error:", error);
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `API エラー: ${error.message}` },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "解説の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
