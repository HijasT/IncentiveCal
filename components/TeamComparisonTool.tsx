'use client';

import { useState } from 'react';
import { Card, Button, Alert } from '@/components/common';
import { teamComparison } from '@/lib';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface IncentiveCalculation {
  staffName: string;
  sales: number;
  target: number;
  achievementPercent: number;
  tierName: string | null;
  baseIncentive: number;
  p1Share: number;
  p2Share: number;
  totalIncentive: number;
}

interface TeamComparisonToolProps {
  calculationsA?: IncentiveCalculation[];
  calculationsB?: IncentiveCalculation[];
  onClose?: () => void;
}

export default function TeamComparisonTool({
  calculationsA,
  calculationsB,
  onClose,
}: TeamComparisonToolProps) {
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = () => {
    if (
      !calculationsA ||
      !calculationsB ||
      calculationsA.length === 0 ||
      calculationsB.length === 0
    ) {
      setError('Both teams must have at least one calculation');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const comparison = teamComparison.compareTeams(
        { name: teamAName, calculations: calculationsA },
        { name: teamBName, calculations: calculationsB }
      );

      setResults(comparison);
    } catch (err) {
      setError(`Comparison error: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!calculationsA || !calculationsB) {
    return (
      <Alert type="info" title="No Data">
        Load two different periods or teams in Bulk Mode to compare them.
      </Alert>
    );
  }

  const comparisonChartData = results
    ? [
        {
          metric: 'Total Sales',
          [teamAName]: results.metricA.totalSales / 100000,
          [teamBName]: results.metricB.totalSales / 100000,
        },
        {
          metric: 'Avg Achievement',
          [teamAName]: results.metricA.averageAchievement,
          [teamBName]: results.metricB.averageAchievement,
        },
        {
          metric: 'Avg Incentive',
          [teamAName]: results.metricA.averageIncentive / 1000,
          [teamBName]: results.metricB.averageIncentive / 1000,
        },
        {
          metric: 'Staff Count',
          [teamAName]: results.metricA.staffCount,
          [teamBName]: results.metricB.staffCount,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Setup Section */}
      <Card title="⚔️ Team Comparison Setup" icon="🔄">
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Team A Name</label>
              <input
                type="text"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
                className="input-field"
                placeholder="e.g., June Sales"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Staff: {calculationsA?.length || 0}
              </p>
            </div>
            <div>
              <label className="label-text">Team B Name</label>
              <input
                type="text"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
                className="input-field"
                placeholder="e.g., July Sales"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Staff: {calculationsB?.length || 0}
              </p>
            </div>
          </div>

          {error && <Alert type="error">{error}</Alert>}

          <Button
            onClick={handleCompare}
            variant="primary"
            icon="⚡"
            isLoading={isLoading}
            className="w-full"
          >
            Compare Teams
          </Button>
        </div>
      </Card>

      {/* Results */}
      {results && (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200 dark:border-blue-900">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
                {teamAName}
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  AED {(results.metricA.totalSales || 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {results.metricA.staffCount} staff
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {(results.metricA.averageAchievement || 0).toFixed(2)}% avg
                </p>
              </div>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-900 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  Difference
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {(results.differences.totalSalesDiff || 0) > 0 ? '+' : ''}
                  AED{(results.differences.totalSalesDiff || 0).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {results.metricA.totalSales > 0
                    ? (
                        ((results.differences.totalSalesDiff || 0) /
                          results.metricA.totalSales) *
                        100
                      ).toFixed(1)
                    : 0}
                  %
                </p>
              </div>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-900">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                {teamBName}
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  AED {(results.metricB.totalSales || 0).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {results.metricB.staffCount} staff
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {(results.metricB.averageAchievement || 0).toFixed(2)}% avg
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          {comparisonChartData.length > 0 && (
            <Card title="📊 Metrics Comparison" icon="📈">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={teamAName} fill="#3B82F6" />
                  <Bar dataKey={teamBName} fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Insights */}
          {results.differences && (
            <Card title="💡 Key Insights" icon="🎯">
              <div className="space-y-2">
                {[
                  `${results.metricA.teamName}: ${results.metricA.staffCount} staff, AED ${(results.metricA.totalSales || 0).toLocaleString()} sales, ${(results.metricA.averageAchievement || 0).toFixed(2)}% avg achievement`,
                  `${results.metricB.teamName}: ${results.metricB.staffCount} staff, AED ${(results.metricB.totalSales || 0).toLocaleString()} sales, ${(results.metricB.averageAchievement || 0).toFixed(2)}% avg achievement`,
                  `Sales Difference: AED ${Math.abs(results.differences.totalSalesDiff || 0).toLocaleString()}`,
                  `Incentive Difference: AED ${Math.abs(results.differences.totalIncentiveDiff || 0).toLocaleString()}`,
                  `Achievement Gap: ${(results.differences.avgAchievementDiff || 0).toFixed(2)}%`,
                ].map((insight, idx) => (
                  <div
                    key={idx}
                    className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800"
                  >
                    <span className="text-lg">💬</span>
                    <span className="text-sm text-amber-900 dark:text-amber-100">
                      {insight}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
