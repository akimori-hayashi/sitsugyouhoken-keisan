"use client";

interface Props {
  explanation: string;
  mode: "simple" | "detailed";
  onClose: () => void;
}

export default function ExplanationPanel({ explanation, mode, onClose }: Props) {
  const isSimple = mode === "simple";

  return (
    <div
      className={`rounded-xl p-5 border ${
        isSimple
          ? "bg-green-50 border-green-200"
          : "bg-purple-50 border-purple-200"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{isSimple ? "💬" : "📖"}</span>
          <h3
            className={`font-semibold text-sm ${
              isSimple ? "text-green-800" : "text-purple-800"
            }`}
          >
            {isSimple ? "簡単な解説（Claude Haiku）" : "詳細な解説（Claude Sonnet）"}
          </h3>
        </div>
        <button
          onClick={onClose}
          className={`text-sm font-medium transition ${
            isSimple
              ? "text-green-600 hover:text-green-800"
              : "text-purple-600 hover:text-purple-800"
          }`}
          aria-label="解説を閉じる"
        >
          ✕
        </button>
      </div>
      <div
        className={`text-sm leading-relaxed whitespace-pre-wrap ${
          isSimple ? "text-green-900" : "text-purple-900"
        }`}
      >
        {explanation}
      </div>
    </div>
  );
}
