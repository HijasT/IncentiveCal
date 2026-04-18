'use client';

import { useState } from 'react';
import { Card, Button, Alert, Spinner } from '@/components/common';
import { excelParser, tierManager, formatCurrency, formatPercentage } from '@/lib';
import { Upload, Download } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StaffResult {
  staffName: string;
  sales: number;
  target: number;
  achievementPercent: number;
  tier: { name: string; rate: number } | null;
  baseIncentive: number;
  p1Share: number;
  p2Share: number;
  totalIncentive: number;
}

interface SummaryStats {
  totalStaff: number;
  totalSales: number;
  totalTarget: number;
  totalIncentive: number;
  avgAchievement: number;
  avgIncentive: number;
}

export default function BulkMode() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<StaffResult[]>([]);
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setError('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  const handleCalculate = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const parseResult = excelParser.parseFile(arrayBuffer);

      if (!parseResult.success || !parseResult.sheets || parseResult.sheets.length === 0) {
        setError('No valid data found in Excel file');
        setIsLoading(false);
        return;
      }

      const sheet = parseResult.sheets[0];

      if (!sheet || !sheet.staffRecords || sheet.staffRecords.length === 0) {
        setError('No staff records found in the selected sheet');
        setIsLoading(false);
        return;
      }

      // Prepare data for calculation
      const staffData = sheet.staffRecords.map(record => ({
        name: record.name,
        sales: record.sales,
        target: sheet.target || 10000,
      }));

      // Get current config
      const { configManager } = await import('@/lib');
      const config = configManager.getConfig();
      const splitEqual = config.defaultSplit.equal;

      // Calculate incentives
      const calculations = tierManager.calculateBulkIncentives(
        staffData,
        splitEqual,
        config.tiers
      );

      // Convert to StaffResult format
      const formattedResults: StaffResult[] = calculations.map(calc => ({
        staffName: calc.staffName,
        sales: calc.sales,
        target: calc.target,
        achievementPercent: calc.achievementPercent,
        tier: calc.tier || null,
        baseIncentive: calc.baseIncentive || 0,
        p1Share: calc.p1Share || 0,
        p2Share: calc.p2Share || 0,
        totalIncentive: calc.totalIncentive,
      }));

      setResults(formattedResults);

      // Calculate summary
      const totalSales = formattedResults.reduce((sum, c) => sum + c.sales, 0);
      const totalTarget = formattedResults.reduce((sum, c) => sum + c.target, 0);
      const totalIncentive = formattedResults.reduce((sum, c) => sum + c.totalIncentive, 0);
      const avgAchievement = formattedResults.reduce((sum, c) => sum + c.achievementPercent, 0) / formattedResults.length;
      const avgIncentive = totalIncentive / formattedResults.length;

      setSummary({
        totalStaff: formattedResults.length,
        totalSales,
        totalTarget,
        totalIncentive,
        avgAchievement,
        avgIncentive,
      });
    } catch (err) {
      setError(`Error processing file: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (results.length === 0) {
      setError('No results to export');
      return;
    }

    try {
      const csvHeader = ['Staff Name', 'Sales', 'Target', 'Achievement %', 'Tier', 'Base Incentive', 'P1 Share', 'P2 Share', 'Total Incentive'];
      
      const csvRows = results.map(r => [
        r.staffName,
        r.sales.toString(),
        r.target.toString(),
        r.achievementPercent.toFixed(2),
        r.tier?.name || 'N/A',
        r.baseIncentive.toFixed(2),
        r.p1Share.toFixed(2),
        r.p2Share.toFixed(2),
        r.totalIncentive.toFixed(2),
      ]);

      const csvContent = [csvHeader, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sic-results-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export results');
    }
  };

  // Chart data
  const tierDistribution = results.reduce((acc: any[], result) => {
    const tierLabel = result.tier?.name || 'No Incentive';
    const existing = acc.find(item => item.name === tierLabel);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: tierLabel, value: 1 });
    }
    return acc;
  }, []);

  const achievementRanges = [
    { range: '0-50%', count: results.filter(r => r.achievementPercent < 50).length },
    { range: '50-75%', count: results.filter(r => r.achievementPercent >= 50 && r.achievementPercent < 75).length },
    { range: '75-100%', count: results.filter(r => r.achievementPercent >= 75 && r.achievementPercent <= 100).length },
    { range: '100-110%', count: results.filter(r => r.achievementPercent > 100 && r.achievementPercent <= 110).length },
    { range: '110%+', count: results.filter(r => r.achievementPercent > 110).length },
  ];

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6'];

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card title="📤 Upload Excel File" icon="📊">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer block">
              <Upload className="mx-auto mb-2 text-slate-400" size={32} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Excel files (.xlsx, .xls) up to 5MB
              </p>
            </label>
          </div>

          {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

          <Button
            onClick={handleCalculate}
            variant="primary"
            icon="⚡"
            isLoading={isLoading}
            className="w-full"
          >
            Calculate Incentives
          </Button>
        </div>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-1">Total Staff</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{summary.totalStaff}</p>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(summary.totalSales)}</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Total Incentive</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(summary.totalIncentive)}</p>
          </Card>
        </div>
      )}

      {/* Charts */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Tier Distribution */}
          {tierDistribution.length > 0 && (
            <Card title="🎯 Tier Distribution" icon="📊">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tierDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
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

          {/* Achievement Distribution */}
          {achievementRanges.some(r => r.count > 0) && (
            <Card title="📈 Achievement Distribution" icon="📊">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={achievementRanges}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <Card title="📋 Detailed Results" icon="📊">
          <div className="space-y-4">
            <Button
              onClick={handleExport}
              variant="secondary"
              icon="⬇️"
              className="w-full"
            >
              Export as CSV
            </Button>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 px-2">Name</th>
                    <th className="text-right py-2 px-2">Sales</th>
                    <th className="text-right py-2 px-2">Target</th>
                    <th className="text-right py-2 px-2">Achievement</th>
                    <th className="text-left py-2 px-2">Tier</th>
                    <th className="text-right py-2 px-2">Incentive</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    >
                      <td className="py-3 px-2">{result.staffName}</td>
                      <td className="py-3 px-2 text-right">{formatCurrency(result.sales)}</td>
                      <td className="py-3 px-2 text-right">{formatCurrency(result.target)}</td>
                      <td className="py-3 px-2 text-right font-semibold">{formatPercentage(result.achievementPercent)}</td>
                      <td className="py-3 px-2">{result.tier?.name || '—'}</td>
                      <td className="py-3 px-2 text-right font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(result.totalIncentive)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && <Spinner fullScreen message="Calculating incentives..." />}
    </div>
  );
}
