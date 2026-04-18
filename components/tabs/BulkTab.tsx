'use client';

import { Config } from '@/lib/types';
import { useState } from 'react';
import { TierManager } from '@/lib/TierManager';
import { AnalyticsTracker } from '@/lib/AnalyticsTracker';
import { formatCurrency } from '@/lib/utils';

interface Props {
  config: Config;
  onToast: (message: string, type?: 'success' | 'error') => void;
}

export default function BulkTab({ config, onToast }: Props) {
  const [results, setResults] = useState<any[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const wb = XLSX.read(buffer, { type: 'array' });
      
      const newResults: any[] = [];
      
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        if (!ws) continue;
        
        // Convert sheet to JSON (simplified parsing)
        const data = XLSX.utils.sheet_to_json(ws) as any[];
        
        // Process rows
        for (const row of data) {
          if (row['Staff Name'] || row['Name']) {
            newResults.push({
              name: row['Staff Name'] || row['Name'] || 'Unknown',
              sales: row['Sales'] || 0,
              achievement: row['Achievement'] || 0,
              incentive: row['Incentive'] || 0,
            });
          }
        }
      }

      setResults(newResults);
      onToast(`✓ Processed ${newResults.length} records`, 'success');
    } catch (err) {
      onToast('Error processing file: ' + String(err), 'error');
    }
  };

  return (
    <div className="card">
      <h2>📊 Bulk Calculation</h2>
      <p className="note">Upload Excel file with multiple staff records</p>

      <div>
        <label>Upload Excel File</label>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: '20px', overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Staff Name</th>
                <th>Sales</th>
                <th>Achievement</th>
                <th>Incentive</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td>{r.name}</td>
                  <td>{formatCurrency(r.sales)}</td>
                  <td>{r.achievement.toFixed(2)}%</td>
                  <td>{formatCurrency(r.incentive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
