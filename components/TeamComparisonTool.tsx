'use client';

import { useState } from 'react';
import { Card, Button, Alert, Input } from '@/components/common';
import { tierManager, teamComparison, configManager, formatCurrency, formatPercentage } from '@/lib';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface TeamComparisonResult {
  teamA: {
    name: string;
    totalSales: number;
    totalTarget: number;
    averageAchievement: number;
    totalIncentive: number;
    staffCount: number;
  };
  teamB: {
    name: string;
    totalSales: number;
    totalTarget: number;
    averageAchievement: number;
    totalIncentive: number;
    staffCount: number;
  };
  comparison: {
    salesDiff: number;
    salesDiffPercent: number;
    incentiveDiff: number;
    incentiveDiffPercent: number;
    winner: string;
  };
}

interface StaffInput {
  name: string;
  sales: number;
  target: number;
}

export default function TeamComparisonTool() {
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [teamAData, setTeamAData] = useState<StaffInput[]>([
    { name: 'Staff 1', sales: 15000, target: 12000 },
    { name: 'Staff 2', sales: 18000, target: 12000 },
  ]);
  const [teamBData, setTeamBData] = useState<StaffInput[]>([
    { name: 'Staff A', sales: 16000, target: 12000 },
    { name: 'Staff B', sales: 17000, target: 12000 },
  ]);
  const [result, setResult] = useState<TeamComparisonResult | null>(null);
  const [error, setError] = useState('');

  const handleCompare = () => {
    if (teamAData.length === 0 || teamBData.length === 0) {
      setError('Both teams must have at least one staff member');
      return;
    }

    try {
      const config = configManager.getConfig();
      const splitEqual = config.defaultSplit.equal;

      // Calculate incentives for both teams
      const calculationsA = tierManager.calculateBulkIncentives(
        teamAData.map(staff => ({
          name: staff.name,
          sales: staff.sales,
          target: staff.target,
        })),
        splitEqual,
        config.tiers
      );

      const calculationsB = tierManager.calculateBulkIncentives(
        teamBData.map(staff => ({
          name: staff.name,
          sales: staff.sales,
          target: staff.target,
        })),
        splitEqual,
        config.tiers
      );

      // Calculate totals
      const totalSalesA = calculationsA.reduce((sum, c) => sum + c.sales, 0);
      const totalTargetA = calculationsA.reduce((sum, c) => sum + c.target, 0);
      const totalIncentiveA = calculationsA.reduce((sum, c) => sum + c.totalIncentive, 0);
      const avgAchievementA = calculationsA.reduce((sum, c) => sum + c.achievementPercent, 0) / calculationsA.length;

      const totalSalesB = calculationsB.reduce((sum, c) => sum + c.sales, 0);
      const totalTargetB = calculationsB.reduce((sum, c) => sum + c.target, 0);
      const totalIncentiveB = calculationsB.reduce((sum, c) => sum + c.totalIncentive, 0);
      const avgAchievementB = calculationsB.reduce((sum, c) => sum + c.achievementPercent, 0) / calculationsB.length;

      // Calculate differences
      const salesDiff = totalSalesA - totalSalesB;
      const salesDiffPercent = totalSalesB !== 0 ? (salesDiff / totalSalesB) * 100 : 0;
      const incentiveDiff = totalIncentiveA - totalIncentiveB;
      const incentiveDiffPercent = totalIncentiveB !== 0 ? (incentiveDiff / totalIncentiveB) * 100 : 0;

      const winner = totalIncentiveA > totalIncentiveB ? teamAName : totalIncentiveB > totalIncentiveA ? teamBName : 'Tie';

      setResult({
        teamA: {
          name: teamAName,
          totalSales: totalSalesA,
          totalTarget: totalTargetA,
          averageAchievement: avgAchievementA,
          totalIncentive: totalIncentiveA,
          staffCount: calculationsA.length,
        },
        teamB: {
          name: teamBName,
          totalSales: totalSalesB,
          totalTarget: totalTargetB,
          averageAchievement: avgAchievementB,
          totalIncentive: totalIncentiveB,
          staffCount: calculationsB.length,
        },
        comparison: {
          salesDiff,
          salesDiffPercent,
          incentiveDiff,
          incentiveDiffPercent,
          winner,
        },
      });

      setError('');
    } catch (err) {
      setError(`Comparison failed: ${err}`);
    }
  };

  const updateTeamA = (index: number, field: keyof StaffInput, value: any) => {
    const updated = [...teamAData];
    updated[index] = { ...updated[index], [field]: value };
    setTeamAData(updated);
  };

  const updateTeamB = (index: number, field: keyof StaffInput, value: any) => {
    const updated = [...teamBData];
    updated[index] = { ...updated[index], [field]: value };
    setTeamBData(updated);
  };

  const addTeamAStaff = () => {
    setTeamAData([...teamAData, { name: `Staff ${teamAData.length + 1}`, sales: 10000, target: 10000 }]);
  };

  const addTeamBStaff = () => {
    setTeamBData([...teamBData, { name: `Staff ${teamBData.length + 1}`, sales: 10000, target: 10000 }]);
  };

  const removeTeamA = (index: number) => {
    setTeamAData(teamAData.filter((_, i) => i !== index));
  };

  const removeTeamB = (index: number) => {
    setTeamBData(teamBData.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Team Inputs */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Team A */}
        <Card title={`👥 ${teamAName}`} icon="👥">
          <div className="space-y-4">
            <Input
              label="Team Name"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              placeholder="Enter team name"
            />

            <div className="space-y-3">
              {teamAData.map((staff, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <Input
                    label="Name"
                    value={staff.name}
                    onChange={(e) => updateTeamA(idx, 'name', e.target.value)}
                    placeholder="Staff name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Sales"
                      type="number"
                      value={staff.sales}
                      onChange={(e) => updateTeamA(idx, 'sales', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="Target"
                      type="number"
                      value={staff.target}
                      onChange={(e) => updateTeamA(idx, 'target', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  {teamAData.length > 1 && (
                    <Button
                      onClick={() => removeTeamA(idx)}
                      variant="secondary"
                      className="w-full text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={addTeamAStaff} variant="secondary" className="w-full">
              + Add Staff
            </Button>
          </div>
        </Card>

        {/* Team B */}
        <Card title={`👥 ${teamBName}`} icon="👥">
          <div className="space-y-4">
            <Input
              label="Team Name"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              placeholder="Enter team name"
            />

            <div className="space-y-3">
              {teamBData.map((staff, idx) => (
                <div key={idx} className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                  <Input
                    label="Name"
                    value={staff.name}
                    onChange={(e) => updateTeamB(idx, 'name', e.target.value)}
                    placeholder="Staff name"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Sales"
                      type="number"
                      value={staff.sales}
                      onChange={(e) => updateTeamB(idx, 'sales', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      label="Target"
                      type="number"
                      value={staff.target}
                      onChange={(e) => updateTeamB(idx, 'target', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  {teamBData.length > 1 && (
                    <Button
                      onClick={() => removeTeamB(idx)}
                      variant="secondary"
                      className="w-full text-red-600"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Button onClick={addTeamBStaff} variant="secondary" className="w-full">
              + Add Staff
            </Button>
          </div>
        </Card>
      </div>

      {/* Compare Button */}
      <Button onClick={handleCompare} variant="primary" className="w-full text-lg py-3">
        🔍 Compare Teams
      </Button>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">{result.teamA.name}</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {formatCurrency(result.teamA.totalIncentive)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300">
                {result.teamA.staffCount} staff • {formatPercentage(result.teamA.averageAchievement)} avg
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">{result.teamB.name}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {formatCurrency(result.teamB.totalIncentive)}
              </p>
              <p className="text-xs text-green-600 dark:text-green-300">
                {result.teamB.staffCount} staff • {formatPercentage(result.teamB.averageAchievement)} avg
              </p>
            </Card>
          </div>

          {/* Winner */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 text-center">
            <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">🏆 Winner</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{result.comparison.winner}</p>
            <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
              Difference: {formatCurrency(Math.abs(result.comparison.incentiveDiff))} ({result.comparison.incentiveDiffPercent.toFixed(1)}%)
            </p>
          </Card>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Sales Comparison */}
            <Card title="📊 Sales Comparison" icon="📊">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Sales',
                      [result.teamA.name]: result.teamA.totalSales,
                      [result.teamB.name]: result.teamB.totalSales,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey={result.teamA.name} fill="#3b82f6" />
                  <Bar dataKey={result.teamB.name} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Incentive Comparison */}
            <Card title="💰 Incentive Comparison" icon="💰">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Incentive',
                      [result.teamA.name]: result.teamA.totalIncentive,
                      [result.teamB.name]: result.teamB.totalIncentive,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey={result.teamA.name} fill="#3b82f6" />
                  <Bar dataKey={result.teamB.name} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
