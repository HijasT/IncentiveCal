'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Button, Alert } from '@/components/common';
import { configManager, tierManager, analyticsTracker, sanitizeNumber, formatCurrency, formatPercentage } from '@/lib';
import { TierResult } from '@/lib/tierManager';

export default function IndividualMode() {
  const [staffName, setStaffName] = useState('');
  const [sales, setSales] = useState('0');
  const [target, setTarget] = useState('0');
  const [splitEqual, setSplitEqual] = useState(60);
  const [result, setResult] = useState<TierResult | null>(null);
  const [copied, setCopied] = useState(false);

  const config = configManager.getConfig();

  // Calculate on input change
  useEffect(() => {
    const salesNum = sanitizeNumber(sales) || 0;
    const targetNum = sanitizeNumber(target) || 1;

    if (salesNum >= 0 && targetNum > 0) {
      const calcResult = tierManager.calculateIncentive(
        salesNum,
        targetNum,
        salesNum, // Team total = individual sales for single calc
        splitEqual,
        config.tiers
      );
      setResult(calcResult);
    }
  }, [sales, target, splitEqual, config.tiers]);

  const handleCopy = () => {
    if (!result || !staffName) {
      alert('Fill in staff name and sales data first');
      return;
    }

    const text = `
Staff: ${staffName}
Sales: ${formatCurrency(sanitizeNumber(sales) || 0)}
Target: ${formatCurrency(sanitizeNumber(target) || 0)}
Achievement: ${formatPercentage(result.achievementPercent)}
Tier: ${result.message}
Base Incentive: ${formatCurrency(result.baseIncentive)}
P1 Share (Equal): ${formatCurrency(result.p1Share)}
P2 Share (Personal): ${formatCurrency(result.p2Share)}
Total Incentive: ${formatCurrency(result.totalIncentive)}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track in analytics
    analyticsTracker.trackCalculation({
      type: 'individual',
      staffName: staffName || 'Unknown',
      sales: sanitizeNumber(sales) || 0,
      target: sanitizeNumber(target) || 0,
      achievementPercent: result.achievementPercent,
      tierName: result.tier?.name || 'No Incentive',
      incentiveAmount: result.totalIncentive,
      splitEqual,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card title="💼 Calculation Input" icon="📝">
        <div className="space-y-4">
          <Input
            label="Staff Name"
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="e.g., Lana Farhoude"
          />

          <Input
            label="Sales (AED)"
            type="number"
            value={sales}
            onChange={(e) => setSales(e.target.value)}
            placeholder="0"
            min="0"
          />

          <Input
            label="Target (AED)"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="0"
            min="1"
          />

          <div>
            <label className="label-text">
              P1 Split (Equal): {splitEqual}% / P2: {100 - splitEqual}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={splitEqual}
              onChange={(e) => setSplitEqual(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              P1 distributed equally. P2 by sales contribution.
            </p>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <Card title="📊 Results" icon="✅">
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">Achievement %</p>
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                {formatPercentage(result.achievementPercent)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">Tier</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{result.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-300">Base Incentive</p>
                <p className="font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(result.baseIncentive)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-300">P1 Share</p>
                <p className="font-bold text-green-900 dark:text-green-100">
                  {formatCurrency(result.p1Share)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-600 dark:text-purple-300">P2 Share</p>
                <p className="font-bold text-purple-900 dark:text-purple-100">
                  {formatCurrency(result.p2Share)}
                </p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-lg border border-teal-200 dark:border-teal-800">
                <p className="text-xs text-teal-600 dark:text-teal-300">Total Incentive</p>
                <p className="font-bold text-teal-900 dark:text-teal-100">
                  {formatCurrency(result.totalIncentive)}
                </p>
              </div>
            </div>

            {copied && <Alert type="success">Copied to clipboard!</Alert>}

            <Button
              onClick={handleCopy}
              variant="primary"
              icon="📋"
              className="w-full"
            >
              Copy Results
            </Button>
          </div>
        </Card>
      )}

      {/* Tier Info Section */}
      <Card title="📋 Current Tier Structure" icon="🎯" className="md:col-span-2">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-gray-700">
                <th className="text-left py-2 px-2 font-semibold">Tier</th>
                <th className="text-left py-2 px-2 font-semibold">Range</th>
                <th className="text-left py-2 px-2 font-semibold">Rate</th>
              </tr>
            </thead>
            <tbody>
              {config.tiers.map((tier) => (
                <tr
                  key={tier.id}
                  className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                >
                  <td className="py-2 px-2 font-semibold">{tier.name}</td>
                  <td className="py-2 px-2">
                    {tier.min}% - {tier.max ?? '∞'}%
                  </td>
                  <td className="py-2 px-2 font-bold text-teal-600 dark:text-teal-400">
                    {tier.rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
