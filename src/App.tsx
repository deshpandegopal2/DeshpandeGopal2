import React, { useMemo, useState } from "react";

const PROVIDED_BRACKETS = [
  { upTo: 11925, rate: 0.10 },
  { upTo: 48475, rate: 0.12 },
  { upTo: 103350, rate: 0.22 },
  { upTo: 197300, rate: 0.24 },
  { upTo: 250525, rate: 0.32 },
  { upTo: 626350, rate: 0.35 },
  { upTo: Infinity, rate: 0.37 },
] as const;

function formatCurrency(n: number) {
  if (!isFinite(n)) return "";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function clamp(n: number, min = 0, max = Number.MAX_SAFE_INTEGER) {return Math.min(Math.max(n, min), max)}

function calcTaxFromProvidedBrackets(income: number) {
  let remaining = Math.max(income, 0);
  let lastCap = 0;
  let tax = 0;
  let marginalRate = 0;

  for (const b of PROVIDED_BRACKETS) {
    const span = Math.max(Math.min(remaining, (b.upTo as number) - lastCap), 0);
    if (span <= 0) { lastCap = b.upTo as number; continue; }
    tax += span * b.rate;
    remaining -= span;
    marginalRate = b.rate;
    lastCap = b.upTo as number;
    if (remaining <= 0) break;
  }

  const net = income - tax;
  const effective = income > 0 ? tax / income : 0;
  return { tax, net, effective, marginalRate };
}

export default function App() {
  const [incomeInput, setIncomeInput] = useState<string>("");
  const income = useMemo(() => {
    const n = Number(incomeInput.replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? clamp(n) : 0;
  }, [incomeInput]);

  const { tax, net, effective, marginalRate } = useMemo(() => calcTaxFromProvidedBrackets(income), [income]);

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Disposable Income Tax Calculator</h1>
          <span className="text-xs sm:text-sm text-gray-500">mirrors your Python snippet</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <section className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium mb-4">Enter your annual salary</h2>
            <div className="flex items-center gap-3">
              <div className="relative w-full">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">$</span>
                <input
                  inputMode="decimal"
                  placeholder="e.g., 150000"
                  className="w-full pl-7 pr-3 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                />
              </div>
              <button
                className="whitespace-nowrap rounded-xl px-4 py-3 bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 active:scale-[.99]"
                onClick={() => setIncomeInput("")}
                aria-label="Clear"
              >
                Clear
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3">This demo uses the exact marginal brackets & rates. It’s for illustration only and not tax advice.</p>

            <div className="mt-8 grid gap-4">
              <div className="flex items-center justify-between border rounded-xl p-4">
                <span className="text-gray-600">Federal tax</span>
                <span className="text-xl font-semibold">{formatCurrency(tax)}</span>
              </div>
              <div className="flex items-center justify-between border rounded-xl p-4">
                <span className="text-gray-600">Net (after federal tax)</span>
                <span className="text-xl font-semibold">{formatCurrency(net)}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4">
                  <div className="text-gray-600">Effective tax rate</div>
                  <div className="text-lg font-semibold">{(effective * 100).toFixed(2)}%</div>
                </div>
                <div className="border rounded-xl p-4">
                  <div className="text-gray-600">Marginal tax rate</div>
                  <div className="text-lg font-semibold">{(marginalRate * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>
          </div>

          <aside className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
            <h3 className="text-base font-semibold mb-3">How it works</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>We parse your annual salary and compute federal income tax using the marginal brackets embedded in your original Python program.</li>
              <li>For each bracket, we tax only the portion of income that falls within that band.</li>
              <li>Your net income is <em>salary − federal tax</em>.</li>
              <li>We also show your effective rate (<em>tax ÷ salary</em>) and the marginal rate for your last dollar of income.</li>
            </ol>

            <div className="mt-6">
              <h4 className="font-medium mb-2">Brackets (from your snippet)</h4>
              <table className="w-full text-sm border rounded-xl overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border-b">Up to</th>
                    <th className="text-left p-2 border-b">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {PROVIDED_BRACKETS.map((b, idx) => (
                    <tr key={idx} className="odd:bg-white even:bg-gray-50">
                      <td className="p-2 border-b">{b.upTo === Infinity ? "∞ (and above)" : formatCurrency(b.upTo)}</td>
                      <td className="p-2 border-b">{(b.rate * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-gray-500 mt-3">Tip: These thresholds/rates were copied from the code you shared and may not match current IRS tables.</p>
            </div>
          </aside>
        </section>

        <section className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-semibold mb-3">Original Python vs this web app</h3>
          <p className="text-sm text-gray-700">
            Your loop had several early <code>break</code>s and a final branch that overtaxed incomes below the top bracket. This app keeps your exact brackets but fixes the
            marginal math so results reflect standard progressive taxation for those thresholds.
          </p>
        </section>
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-10 text-sm text-gray-500">
        Built for you — update brackets anytime in <code>PROVIDED_BRACKETS</code>.
      </footer>
    </div>
  );
}
