import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "失業手当受給額計算ツール",
  description:
    "雇用保険の基本手当（失業手当）の受給額を簡単に計算できます。基本手当日額・給付日数・総受給額を2024年8月時点の雇用保険法に基づいて算出します。",
  keywords: "失業手当, 雇用保険, 失業給付, 基本手当, 給付日数, 計算",
  openGraph: {
    title: "失業手当受給額計算ツール",
    description:
      "雇用保険の基本手当（失業手当）の受給額を簡単に計算できます。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-slate-50">
        {children}
      </body>
    </html>
  );
}
