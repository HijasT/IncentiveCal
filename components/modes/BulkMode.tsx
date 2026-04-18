'use client';

import { useState, useRef } from 'react';
import { Card, Button, Alert, Spinner, Modal } from '@/components/common';
import {
  configManager,
  excelParser,
  tierManager,
  analyticsTracker,
  formatCurrency,
  formatPercentage,
} from '@/lib';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IncentiveCalculation } from '@/lib/tierManager';

export default function BulkMode() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<IncentiveCalculation[]>([]);
  const [error, setError] = useState('');
  const [splitEqual, setSplitEqual] = useState(60);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [sheetData, setSheetData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = configManager.getConfig();
  const COLORS = ['#0D9488', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B'];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parseResult = excelParser.parseFile(arrayBuffer);

      if (!parseResult.success) {
        setError(parseResult.error || 'Failed to parse Excel file');
        setIsLoading(false);
        return;
      }

      setSheetData(parseResult.sheets);
      if (parseResult.sheets.length > 0) {
        setSelectedSheet(parseResult.sheets[0].month);
      }
    } catch (err) {
      setError(`Error reading file: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = () => {
    if (!selectedSheet || sheetData.length === 0) {
      setError('No data to process');
      return;
    }

    const selected = sheetData.find((s) => s.month === selectedSheet);
    if (!selected || selected.staffRecords.length === 0) {
      setError('No staff records found in selected sheet');
      return;
    }

    // Convert to calculation format
    const staffData = selected.staffRecords.map((record: any) => ({
      name: record.name,
      sales: record.sales,
      target: selected.target || 100000, // Default target if not found
    }));

    // Calculate incentives
    const calculations = tierManager.calculateBulkIncentives(staffData, splitEqual, config.tiers);

    // Sort by total incentive descending
    calculations.sort((a, b) => b.totalIncentive - a.totalIncentive);

    setResults(calculations);

    // Track each calculation
    calculations.forEach((calc) => {
      analyticsTracker.trackCalculation({
        type: 'bulk',
        staffName: calc.staffName,
        sales: calc.sales,
        target: calc.target,
        achievementPercent: calc.achievementPercent,
        tierName: calc.tier?.name || null,
        incentiveAmount: calc.totalIncentive,
        splitEqual,
      });
    });
  };

  // Analytics data
  const tierDistribution = results.length > 0
    ? Array.from(
        new Map(
          results
            .map((r) => [
              r.tier?.name || 'No Incentive',
              (
                results.filter((x) => (x.tier?.name || 'No Incentive') === (r.tier?.name || 'No Incentive'))
                  .length
              ),
            ])
            .entries()
        )
      ).map(([name, count]) => ({ name, value: count }))
    : [];

  const achievementData = results.length > 0
    ? [
        {
          name: 'Min',
          value: Math.min(...results.map((r) => r.achievementPercent)).toFixed(1),
        },
        {
          name: 'Avg',
          value: (results.reduce((sum, r) => sum + r.achievementPercent, 0) / results.length).toFixed(1),
        },
        {
          name: 'Max',
          value: Math.max(...results.map((r) => r.achievementPercent)).toFixed(1),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card title="📤 Upload Excel File" icon="📁">
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            icon="📂"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Select Excel File'}
          </Button>

          {error && <Alert type="error" title="Error" onClose={() => setError('')}>{error}</Alert>}

          {sheetData.length > 0 && (
            <>
              <Alert type="success" title="Success">
                Loaded {sheetData.length} sheet(s). Click "Process" to calculate incentives.
              </Alert>

              {sheetData.length > 1 && (
                <div>
                  <label className="label-text">Select Sheet to Process</label>
                  <select
                    value={selectedSheet}
                    onChange={(e) => setSelectedSheet(e.target.value)}
                    className="input-field"
                  >
                    {sheetData.map((sheet) => (
                      <option key={sheet.month} value={sheet.month}>
                        {sheet.month} {sheet.year} ({sheet.staffRecords.length} staff)
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg"
                />
              </div>

              <Button
                onClick={handleProcess}
                variant="success"
                icon="⚡"
                className="w-full"
              >
                Process & Calculate
              </Button>
            </>
          )}
        </div>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <>
          {/* Summary Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Staff</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{results.length}</p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Sales</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(results.reduce((sum, r) => sum + r.sales, 0))}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Incentive</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(results.reduce((sum, r) => sum + r.totalIncentive, 0))}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Achievement</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatPercentage(results.reduce((sum, r) => sum + r.achievementPercent, 0) / results.length)}
              </p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tier Distribution */}
            {tierDistribution.length > 0 && (
              <Card title="Tier Distribution" icon="📊">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Achievement Stats */}
            {achievementData.length > 0 && (
              <Card title="Achievement Range" icon="📈">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={achievementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0D9488" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Results Table */}
          <Card title="📋 Detailed Results" icon="👥">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
                    <th className="text-left py-3 px-3 font-semibold">Rank</th>
                    <th className="text-left py-3 px-3 font-semibold">Staff</th>
                    <th className="text-right py-3 px-3 font-semibold">Sales</th>
                    <th className="text-right py-3 px-3 font-semibold">Ach %</th>
                    <th className="text-left py-3 px-3 font-semibold">Tier</th>
                    <th className="text-right py-3 px-3 font-semibold">P1</th>
                    <th className="text-right py-3 px-3 font-semibold">P2</th>
                    <th className="text-right py-3 px-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="py-2 px-3 font-bold">#{idx + 1}</td>
                      <td className="py-2 px-3">{result.staffName}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(result.sales)}</td>
                      <td className="py-2 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                        {formatPercentage(result.achievementPercent)}
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 px-2 py-1 rounded text-xs font-semibold">
                          {result.tier?.name || 'None'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right">{formatCurrency(result.p1Share)}</td>
                      <td className="py-2 px-3 text-right">{formatCurrency(result.p2Share)}</td>
                      <td className="py-2 px-3 text-right font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(result.totalIncentive)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {isLoading && <Spinner size="lg" message="Processing Excel file..." fullScreen />}
    </div>
  );
}
