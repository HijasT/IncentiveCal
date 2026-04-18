'use client';

import { useState, useEffect } from 'react';
import { Config, CalculationResult } from '@/lib/types';
import { TierManager } from '@/lib/TierManager';
import { AnalyticsTracker } from '@/lib/AnalyticsTracker';
import { formatCurrency, formatPercentage, validateNumber } from '@/lib/utils';

interface Props {
  config: Config;
  onToast: (message: string, type?: 'success' | 'error') => void;
}

export default function IndividualTab({ config, onToast }: Props) {
  const [staffName, setStaffName] = useState('');
  const [staffSales, setStaffSales] = useState('0');
  const [totalSales, setTotalSales] = useState('0');
  const [target, setTarget] = useState('0');
  const [numStaff, setNumStaff] = useState('29');
  const [split, setSplit] = useState(config.defaultSplit);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const staffVal = validateNumber(staffSales, 0).value;
    const totalVal = validateNumber(totalSales, 0).value;
    const targetVal = validateNumber(target, 1).value;
    const staffCountVal = validateNumber(numStaff, 1).value;

    if (targetVal > 0) {
      const calc = TierManager.calculate(staffVal, totalVal, targetVal, staffCountVal, split);
      setResult(calc);
    }
  }, [staffSales, totalSales, target, numStaff, split]);

  const handleCopy = () => {
    if (!result || !staffName) {
      onToast('Fill in staff name and all data', 'error');
      return;
    }

    const staffVal = validateNumber(staffSales, 0).value;
    const totalVal = validateNumber(totalSales, 0).value;
    const targetVal = validateNumber(target, 0).value;
    const staffCountVal = validateNumber(numStaff, 1).value;

    const p1Individual = result.p1Share / staffCountVal;
    const salesRatio = totalVal > 0 ? staffVal / totalVal : 0;
    const p2Individual = salesRatio * result.p2Share;
    const totalIndividual = p1Individual + p2Individual;

    const text = `Smart Incentive Calculator v5.0
═══════════════════════════════════
Staff: ${staffName}
Staff Sales: ${formatCurrency(staffVal)}
Total Pool Sales: ${formatCurrency(totalVal)}
Pool Target: ${formatCurrency(targetVal)}

Pool Achievement: ${formatPercentage(result.achievement)}
Tier: ${result.tier.name}

P1 Share (Equal): ${formatCurrency(p1Individual)} (${formatCurrency(result.p1Share)} ÷ ${staffCountVal})
P2 Share (Personal): ${formatCurrency(p2Individual)} (${formatPercentage(salesRatio)} of ${formatCurrency(result.p2Share)})

Individual Total Incentive: ${formatCurrency(totalIndividual)}`;

    navigator.clipboard.writeText(text);
    onToast('✓ Copied to clipboard');

    AnalyticsTracker.track(
      'individual',
      staffName,
      staffVal,
      totalVal,
      targetVal,
      result.achievement,
      result.tier.name,
      totalIndividual
    );
  };

  const handleSliderChange = (val: number) => {
    setSplit({ equal: val, personal: 100 - val });
  };

  return (
    <div className="card">
      <h2>👤 Individual Calculation</h2>
      <p className="note">Calculate incentive for a single staff member based on pool performance</p>

      <div className="grid">
        <div>
          <label>Staff Name *</label>
          <input
            type="text"
            value={staffName}
            onChange={(e) => setStaffName(e.target.value)}
            placeholder="e.g., Lana Farhoude"
          />
        </div>

        <div>
          <label>Staff Sales (AED) *</label>
          <input
            type="number"
            value={staffSales}
            onChange={(e) => setStaffSales(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label>Total Pool Sales (AED) *</label>
          <input
            type="number"
            value={totalSales}
            onChange={(e) => setTotalSales(e.target.value)}
            placeholder="0"
            min="0"
          />
        </div>

        <div>
          <label>Pool Target (AED) *</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="0"
            min="1"
          />
        </div>

        <div>
          <label>Number of Staff *</label>
          <input
            type="number"
            value={numStaff}
            onChange={(e) => setNumStaff(e.target.value)}
            placeholder="29"
            min="1"
          />
        </div>

        <div />
      </div>

      {result && (
        <div className="split-section">
          <div className="split-header">
            <span className="split-label">Pool Split</span>
            <div className="split-badges">
              <span className="badge badge-equal">P1: {split.equal}%</span>
              <span className="badge-sep">/</span>
              <span className="badge badge-personal">P2: {split.personal}%</span>
            </div>
          </div>
          <div className="slider-wrap">
            <input
              type="range"
              min="0"
              max="100"
              value={split.equal}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              style={{
                background: `linear-gradient(to right, var(--darkblue) ${split.equal}%, rgba(150,150,150,0.3) ${split.equal}%)`,
              }}
            />
            <div className="slider-ticks">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="grid" style={{ marginTop: '20px' }}>
          <div className="result-box">
            <div className="rb-label">Pool Achievement</div>
            <div className="rb-val">{formatPercentage(result.achievement)}</div>
          </div>
          <div className="result-box">
            <div className="rb-label">Tier</div>
            <div className="rb-val">{result.tier.name}</div>
          </div>
          <div className="result-box">
            <div className="rb-label">Individual Total</div>
            <div className="rb-val">{formatCurrency(
              (result.p1Share / validateNumber(numStaff, 1).value) +
              ((validateNumber(staffSales, 0).value / Math.max(validateNumber(totalSales, 0).value, 1)) * result.p2Share)
            )}</div>
          </div>
        </div>
      )}

      <button className="btn-primary" onClick={handleCopy} style={{ marginTop: '20px', width: '100%' }}>
        📋 Copy Results
      </button>
    </div>
  );
}
