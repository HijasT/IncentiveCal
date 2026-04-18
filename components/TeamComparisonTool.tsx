'use client';

import { useState } from 'react';
import { Card, Button, Modal, Alert } from '@/components/common';
import { teamComparison, formatCurrency, formatPercentage } from '@/lib';
import { IncentiveCalculation } from '@/lib/tierManager';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface TeamComparisonProps {
  calculationsA?: IncentiveCalculation[];
  calculationsB?: InCalculiveCalculation[];
  onClose?: () => void;
}

export default function TeamComparisonTool({ calculationsA, calculationsB, onClose }: TeamComparisonProps) {
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = () => {
    if (!calculationsA || !calculationsB || calculationsA.length === 0 || calculationsB.length === 0) {
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

  // Comparison data for charts
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
                  {formatCurrency(results.metricA.totalSales)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {results.metricA.staffCount} staff
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatPercentage(results.metricA.averageAchievement)} avg
                </p>
              </div>
            </Card>

            <Card className="border-2 border-purple-200 dark:border-purple-900 flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  Difference
                </p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {results.differences.totalSalesDiff > 0 ? '+' : ''}
                  {formatCurrency(results.differences.totalSalesDiff)}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {((results.differences.totalSalesDiff / results.metricA.totalSales) * 100).toFixed(1)}%
                </p>
              </div>
            </Card>

            <Card className="border-2 border-green-200 dark:border-green-900">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
                {teamBName}
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(results.metricB.totalSales)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {results.metricB.staffCount} staff
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatPercentage(results.metricB.averageAchievement)} avg
                </p>
              </div>
            </Card>
          </div>

          {/* Charts */}
          {comparisonChartData.length > 0 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Bar Chart Comparison */}
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

              {/* Detailed Metrics */}
              <Card title="📋 Detailed Metrics" icon="📊">
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Total Incentive</p>
                      <p className="font-bold text-blue-600">{formatCurrency(results.metricA.totalIncentive)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Difference</p>
                      <p className="font-bold text-purple-600">
                        {results.differences.totalIncentiveDiff > 0 ? '+' : ''}
                        {formatCurrency(results.differences.totalIncentiveDiff)}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Total Incentive</p>
                      <p className="font-bold text-green-600">{formatCurrency(results.metricB.totalIncentive)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Avg Achievement</p>
                      <p className="font-bold text-blue-600">
                        {formatPercentage(results.metricA.averageAchievement)}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Difference</p>
                      <p className="font-bold text-purple-600">
                        {results.differences.avgAchievementDiff > 0 ? '+' : ''}
                        {results.differences.avgAchievementDiff.toFixed(2)}%
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-gray-900 p-3 rounded">
                      <p className="text-xs text-slate-600 dark:text-slate-400">Avg Achievement</p>
                      <p className="font-bold text-green-600">
                        {formatPercentage(results.metricB.averageAchievement)}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Insights */}
          {results.differences && (
            <Card title="💡 Key Insights" icon="🎯">
              <div className="space-y-2">
                {[
                  `${results.metricA.teamName}: ${results.metricA.staffCount} staff, ${formatCurrency(results.metricA.totalSales)} sales, ${formatPercentage(results.metricA.averageAchievement)} avg achievement`,
                  `${results.metricB.teamName}: ${results.metricB.staffCount} staff, ${formatCurrency(results.metricB.totalSales)} sales, ${formatPercentage(results.metricB.averageAchievement)} avg achievement`,
                  `Sales Difference: ${formatCurrency(Math.abs(results.differences.totalSalesDiff))} (${Math.abs(((results.differences.totalSalesDiff / results.metricA.totalSales) * 100).toFixed(1))}%)`,
                  `Incentive Difference: ${formatCurrency(Math.abs(results.differences.totalIncentiveDiff))}`,
                  `Achievement Gap: ${results.differences.avgAchievementDiff.toFixed(2)}%`,
                ].map((insight, idx) => (
                  <div key={idx} className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
                    <span className="text-lg">💬</span>
                    <span className="text-sm text-amber-900 dark:text-amber-100">{insight}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Top Performers Comparison */}
          <div className="grid md:grid-cols-2 gap-6">
            {results.metricA.topPerformer && (
              <Card title="🏆 Top Performer" icon="⭐">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-200 dark:border-blue-800">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">{results.metricA.teamName}</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                    {results.metricA.topPerformer.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {formatPercentage(results.metricA.topPerformer.achievement)} achievement
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrency(results.metricA.topPerformer.incentive)} incentive
                  </p>
                </div>
              </Card>
            )}

            {results.metricB.topPerformer && (
              <Card title="🏆 Top Performer" icon="⭐">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
                  <p className="font-semibold text-green-900 dark:text-green-100">{results.metricB.teamName}</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-2">
                    {results.metricB.topPerformer.name}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {formatPercentage(results.metricB.topPerformer.achievement)} achievement
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrency(results.metricB.topPerformer.incentive)} incentive
                  </p>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}
