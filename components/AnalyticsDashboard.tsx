'use client';

import { useEffect, useState } from 'react';
import { Card, Button, Alert } from '@/components/common';
import { analyticsTracker, tierManager, formatCurrency } from '@/lib';
import { IncentiveCalculation } from '@/lib/tierManager';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(analyticsTracker.getMetrics());
  const [tierDist, setTierDist] = useState(analyticsTracker.getTierDistribution());
  const [insights, setInsights] = useState(analyticsTracker.getPerformanceInsights());
  const [histogramData, setHistogramData] = useState(analyticsTracker.getAchievementHistogram());
  const [records, setRecords] = useState(analyticsTracker.getRecords());

  useEffect(() => {
    setMetrics(analyticsTracker.getMetrics());
    setTierDist(analyticsTracker.getTierDistribution());
    setInsights(analyticsTracker.getPerformanceInsights());
    setHistogramData(analyticsTracker.getAchievementHistogram());
    setRecords(analyticsTracker.getRecords());
  }, []);

  const handleClear = () => {
    if (confirm('Clear all analytics data? This cannot be undone.')) {
      analyticsTracker.clearAnalytics();
      setMetrics(analyticsTracker.getMetrics());
      setTierDist(analyticsTracker.getTierDistribution());
      setInsights(analyticsTracker.getPerformanceInsights());
      setRecords([]);
    }
  };

  const handleExport = () => {
    const json = analyticsTracker.exportAsJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sic-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const COLORS = ['#0D9488', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleExport} variant="secondary" icon="📥">
          Export Analytics
        </Button>
        <Button onClick={handleClear} variant="danger" icon="🗑️">
          Clear Data
        </Button>
      </div>

      {/* Summary Metrics */}
      {metrics.totalCalculations > 0 ? (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Calculations</p>
              <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">{metrics.totalCalculations}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {metrics.individualCalculations} individual • {metrics.bulkCalculations} bulk
              </p>
            </Card>

            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Most Common Tier</p>
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                {metrics.mostCommonTier?.name || 'N/A'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {metrics.mostCommonTier?.count || 0} occurrences
              </p>
            </Card>

            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Achievement</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.averageAchievement.toFixed(1)}%
              </p>
            </Card>

            <Card>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Incentive</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(metrics.totalIncentiveDistributed)}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Avg: {formatCurrency(metrics.averageIncentive)}
              </p>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tier Distribution */}
            {tierDist.length > 0 && (
              <Card title="📊 Tier Distribution" icon="🎯">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierDist}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ tierName, count }) => `${tierName}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {tierDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {tierDist.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-gray-900 rounded">
                      <span className="font-semibold">{item.tierName}</span>
                      <div className="text-right">
                        <p className="text-sm font-bold">{item.count}</p>
                        <p className="text-xs text-slate-500">{item.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Achievement Histogram */}
            {histogramData.length > 0 && (
              <Card title="📈 Achievement Distribution" icon="📊">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0D9488" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Performance Insights */}
          <Card title="💡 Performance Insights" icon="🎯">
            <div className="space-y-4">
              {insights.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, idx) => (
                      <Alert key={idx} type="info">
                        {rec}
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {/* Top Performers */}
                {insights.topPerformers.length > 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">🏆 Top Performers</h3>
                    <div className="space-y-2">
                      {insights.topPerformers.map((perf, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded"
                        >
                          <div>
                            <p className="font-semibold text-sm">{perf.name}</p>
                            <p className="text-xs text-slate-500">{perf.achievement}%</p>
                          </div>
                          <p className="font-bold text-green-600">{formatCurrency(perf.incentive)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Performers */}
                {insights.underPerformers.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">⚠️ Needs Support</h3>
                    <div className="space-y-2">
                      {insights.underPerformers.map((perf, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded"
                        >
                          <div>
                            <p className="font-semibold text-sm">{perf.name}</p>
                            <p className="text-xs text-slate-500">{perf.achievement}%</p>
                          </div>
                          <p className="font-bold text-orange-600">{formatCurrency(perf.incentive)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Recent Calculations */}
          {records.length > 0 && (
            <Card title="📋 Recent Calculations" icon="⏰">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-gray-700 bg-slate-50 dark:bg-gray-900">
                      <th className="text-left py-3 px-3">Staff</th>
                      <th className="text-right py-3 px-3">Sales</th>
                      <th className="text-right py-3 px-3">Achievement</th>
                      <th className="text-left py-3 px-3">Tier</th>
                      <th className="text-right py-3 px-3">Incentive</th>
                      <th className="text-left py-3 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.slice(-20).reverse().map((record) => (
                      <tr
                        key={record.id}
                        className="border-b border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="py-2 px-3 font-semibold">{record.staffName}</td>
                        <td className="py-2 px-3 text-right">{formatCurrency(record.sales)}</td>
                        <td className="py-2 px-3 text-right">{record.achievementPercent.toFixed(1)}%</td>
                        <td className="py-2 px-3">
                          <span className="inline-block bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 px-2 py-1 rounded text-xs font-semibold">
                            {record.tierName || 'None'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-green-600">
                          {formatCurrency(record.incentiveAmount)}
                        </td>
                        <td className="py-2 px-3 text-xs text-slate-500">
                          {new Date(record.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      ) : (
        <Alert type="info" title="No Data Yet">
          Start by making calculations in Individual or Bulk modes. Analytics will appear here automatically.
        </Alert>
      )}
    </div>
  );
}
