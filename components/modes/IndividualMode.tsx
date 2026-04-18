'use client';

import { useState, useEffect } from 'react';
import { Card, Input, Button, Alert } from '@/components/common';
import { configManager, tierManager, analyticsTracker, sanitizeNumber, formatCurrency, formatPercentage } from '@/lib';
import { TierResult } from '@/lib/tierManager';

export default function IndividualMode() {
  const [staffName, setStaffName] = useState('');
  const [staffSales, setStaffSales] = useState('0');
  const [totalSales, setTotalSales] = useState('0');
  const [target, setTarget] = useState('0');
  const [numStaff, setNumStaff] = useState(29);
  const [splitEqual, setSplitEqual] = useState(60);
  const [result, setResult] = useState<TierResult | null>(null);
  const [copied, setCopied] = useState(false);

  const config = configManager.getConfig();

  // Calculate on input change
  useEffect(() => {
    const staffSalesNum = sanitizeNumber(staffSales) || 0;
    const totalSalesNum = sanitizeNumber(totalSales) || 0;
    const targetNum = sanitizeNumber(target) || 1;
    const staffCount = numStaff || 1;

    if (staffSalesNum >= 0 && totalSalesNum >= 0 && targetNum > 0) {
      // Calculate pool incentive based on total sales vs target
      const calcResult = tierManager.calculateIncentive(
        totalSalesNum,
        targetNum,
        totalSalesNum,
        splitEqual,
        config.tiers
      );
      setResult(calcResult);
    }
  }, [staffSales, totalSales, target, numStaff, splitEqual, config.tiers]);

  const handleCopy = () => {
    if (!result || !staffName) {
      alert('Fill in staff name and all sales data first');
      return;
    }

    const staffSalesNum = sanitizeNumber(staffSales) || 0;
    const totalSalesNum = sanitizeNumber(totalSales) || 0;
    const staffCount = numStaff || 1;
    const p1Equal = result.p1Share / staffCount;
    const p2Personal = (staffSalesNum / Math.max(totalSalesNum, 1)) * result.p2Share;

    const text = `
Staff: ${staffName}
Staff Sales: ${formatCurrency(staffSalesNum)}
Total Pool Sales: ${formatCurrency(totalSalesNum)}
Target: ${formatCurrency(sanitizeNumber(target) || 0)}
Pool Achievement: ${formatPercentage(result.achievementPercent)}
Tier: ${result.message}

Pool Incentive Distribution:
P1 Share (Equal): ${formatCurrency(result.p1Share)} ÷ ${staffCount} staff = ${formatCurrency(p1Equal)}
P2 Share (Personal): ${formatCurrency(result.p2Share)} × ${formatPercentage(staffSalesNum / Math.max(totalSalesNum, 1))} = ${formatCurrency(p2Personal)}

Individual Total: ${formatCurrency(p1Equal + p2Personal)}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track in analytics
    analyticsTracker.trackCalculation({
      type: 'individual',
      staffName: staffName || 'Unknown',
      sales: staffSalesNum,
      target: sanitizeNumber(target) || 0,
      achievementPercent: result.achievementPercent,
      tierName: result.tier?.name || 'No Incentive',
      incentiveAmount: p1Equal + p2Personal,
      splitEqual,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Input Section */}
      <Card title="💼 Calculation Input" icon="📝">
        <div className="space-y-4">
          <Input
            label="Staff Name *"
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="e.g., Lana Farhoude"
          />

          <Input
            label="Staff's Sales (AED) *"
            type="number"
            value={staffSales}
            onChange={(e) => setStaffSales(e.target.value)}
            placeholder="0"
            min="0"
          />

          <Input
            label="Total Pool Sales (AED) *"
            type="number"
            value={totalSales}
            onChange={(e) => setTotalSales(e.target.value)}
            placeholder="0"
            min="0"
          />

          <Input
            label="Pool Target (AED) *"
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="0"
            min="1"
          />

          <Input
            label="Number of Staff *"
            type="number"
            value={numStaff}
            onChange={(e) => setNumStaff(parseInt(e.target.value) || 29)}
            placeholder="29"
            min="1"
          />

          <div>
            <label className="label-text">
              Pool Split: P1 (Equal): {splitEqual}% / P2 (Personal): {100 - splitEqual}%
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
              P1 distributed equally among all staff. P2 based on individual sales contribution.
            </p>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {result && (
        <Card title="📊 Individual Share" icon="✅">
          <div className="space-y-3">
            <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">Pool Achievement %</p>
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                {formatPercentage(result.achievementPercent)}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-gray-900 p-4 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400">Tier</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{result.message}</p>
            </div>

            {(() => {
              const staffSalesNum = sanitizeNumber(staffSales) || 0;
              const totalSalesNum = sanitizeNumber(totalSales) || 0;
              const staffCount = numStaff || 1;
              const p1Equal = result.p1Share / staffCount;
              const salesRatio = totalSalesNum > 0 ? staffSalesNum / totalSalesNum : 0;
              const p2Personal = salesRatio * result.p2Share;
              const totalIndividual = p1Equal + p2Personal;

              return (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-300">P1 (Equal Share)</p>
                    <p className="font-bold text-blue-900 dark:text-blue-100">
                      {formatCurrency(p1Equal)}
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      ÷ {staffCount} staff
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-300">P2 (Sales %)</p>
                    <p className="font-bold text-green-900 dark:text-green-100">
                      {formatCurrency(p2Personal)}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                      {formatPercentage(salesRatio)}
                    </p>
                  </div>
                  <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-lg border border-teal-200 dark:border-teal-800 col-span-2">
                    <p className="text-xs text-teal-600 dark:text-teal-300">Total Individual Incentive</p>
                    <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                      {formatCurrency(totalIndividual)}
                    </p>
                  </div>
                </div>
              );
            })()}

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
