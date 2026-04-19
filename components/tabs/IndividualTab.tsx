'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTiers } from '@/hooks/useTiers';
import { calculateIndividual, calculateReverse, formatCurrency } from '@/lib/calculations';
import { IndividualCalculation } from '@/types/calculator';

export function IndividualTab() {
  const { tiers } = useTiers();
  const [mode, setMode] = useState<'forward' | 'reverse'>('forward');
  
  // Forward calculation inputs
  const [target, setTarget] = useState<number>(0);
  const [mySales, setMySales] = useState<number>(0);
  const [teamSales, setTeamSales] = useState<number>(0);
  const [packages, setPackages] = useState<number>(0);
  const [staffCount, setStaffCount] = useState<number>(1);
  const [p1Split, setP1Split] = useState<number>(60);
  
  // Reverse calculation inputs
  const [targetPercentage, setTargetPercentage] = useState<number>(85);
  
  // Results
  const [result, setResult] = useState<IndividualCalculation | null>(null);
  const [reverseResult, setReverseResult] = useState<{ requiredSales: number; newIncentive: number } | null>(null);

  const handleForwardCalculate = () => {
    if (!target || !teamSales || !staffCount) {
      alert('Please fill in all required fields');
      return;
    }

    const calc = calculateIndividual(target, mySales, teamSales, packages, staffCount, p1Split, tiers);
    setResult(calc);
  };

  const handleReverseCalculate = () => {
    if (!target || !teamSales || !staffCount) {
      alert('Please fill in all required fields');
      return;
    }

    const calc = calculateReverse(targetPercentage, teamSales, staffCount, target, p1Split, tiers);
    setReverseResult(calc);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <Card>
        <div className="flex gap-4">
          <Button
            variant={mode === 'forward' ? 'primary' : 'secondary'}
            onClick={() => setMode('forward')}
          >
            💰 Calculate My Incentive
          </Button>
          <Button
            variant={mode === 'reverse' ? 'primary' : 'secondary'}
            onClick={() => setMode('reverse')}
          >
            🎯 Reverse Calculate
          </Button>
        </div>
      </Card>

      {mode === 'forward' ? (
        <>
          {/* Forward Calculation Form */}
          <Card title="Input Your Data">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                label="Team Target (AED)"
                value={target || ''}
                onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 650000"
              />
              <Input
                type="number"
                label="My Sales (AED)"
                value={mySales || ''}
                onChange={(e) => setMySales(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 45000"
              />
              <Input
                type="number"
                label="Team Total Sales (AED)"
                value={teamSales || ''}
                onChange={(e) => setTeamSales(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 550000"
              />
              <Input
                type="number"
                label="My Packages"
                value={packages || ''}
                onChange={(e) => setPackages(parseInt(e.target.value) || 0)}
                placeholder="e.g., 35"
              />
              <Input
                type="number"
                label="Total Staff Count"
                value={staffCount || ''}
                onChange={(e) => setStaffCount(parseInt(e.target.value) || 1)}
                placeholder="e.g., 29"
                min={1}
              />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  P1/P2 Split: {p1Split}% / {100 - p1Split}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={p1Split}
                  onChange={(e) => setP1Split(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <Button
              variant="primary"
              onClick={handleForwardCalculate}
              className="mt-6"
              fullWidth
            >
              Calculate Incentive
            </Button>
          </Card>

          {/* Forward Results */}
          {result && (
            <Card title="Your Incentive Breakdown">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                  <div className="text-text-muted text-sm mb-1">Achievement</div>
                  <div className="text-2xl font-bold text-primary">
                    {result.achievement.toFixed(2)}%
                  </div>
                </div>
                <div className="stat-card">
                  <div className="text-text-muted text-sm mb-1">Tier</div>
                  <div className="text-2xl font-bold" style={{ color: result.tier.color }}>
                    {result.tier.name}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="text-text-muted text-sm mb-1">Total Incentive</div>
                  <div className="text-2xl font-bold text-success">
                    AED {formatCurrency(result.totalIncentive)}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="text-text-muted text-sm mb-1">Contribution</div>
                  <div className="text-2xl font-bold text-text-primary">
                    {result.individualPercent.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="bg-background-tertiary p-4 rounded-lg">
                <h4 className="font-semibold text-text-primary mb-3">Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">P1 (Equal Share):</span>
                    <span className="font-mono text-text-primary">AED {formatCurrency(result.p1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">P2 (Performance Share):</span>
                    <span className="font-mono text-text-primary">AED {formatCurrency(result.p2)}</span>
                  </div>
                  <div className="border-t border-border-color pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-text-primary">Total:</span>
                      <span className="font-mono text-success">AED {formatCurrency(result.totalIncentive)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <>
          {/* Reverse Calculation Form */}
          <Card title="Reverse Calculator">
            <p className="text-text-secondary mb-6">
              Calculate how much additional sales you need to reach a specific tier.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                label="Team Target (AED)"
                value={target || ''}
                onChange={(e) => setTarget(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 650000"
              />
              <Input
                type="number"
                label="Current Team Sales (AED)"
                value={teamSales || ''}
                onChange={(e) => setTeamSales(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 550000"
              />
              <Input
                type="number"
                label="Total Staff Count"
                value={staffCount || ''}
                onChange={(e) => setStaffCount(parseInt(e.target.value) || 1)}
                placeholder="e.g., 29"
                min={1}
              />
              <Input
                type="number"
                label="Target Achievement %"
                value={targetPercentage || ''}
                onChange={(e) => setTargetPercentage(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 85"
                helperText="Enter 75, 85, 101, or 111 for different tiers"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleReverseCalculate}
              className="mt-6"
              fullWidth
            >
              Calculate Required Sales
            </Button>
          </Card>

          {/* Reverse Results */}
          {reverseResult && (
            <Card title="Required to Reach Target">
              <div className="bg-primary/10 border border-primary p-6 rounded-lg text-center">
                <div className="text-text-secondary mb-2">You need to sell an additional:</div>
                <div className="text-4xl font-bold text-primary mb-4">
                  AED {formatCurrency(reverseResult.requiredSales)}
                </div>
                <div className="text-text-secondary text-sm">
                  Your new incentive would be: <span className="font-semibold text-success">AED {formatCurrency(reverseResult.newIncentive)}</span>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
