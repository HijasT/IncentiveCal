import { jsPDF } from 'jspdf';
import { BulkCalculation } from '@/types/calculator';
import { formatCurrency } from './calculations';

export function generateCSV(data: BulkCalculation, viewTitle: string): string {
  let csv = 'Name,Total Incentives,No. of Packages,Sales,Individual Sales %,P1,P2\n';

  data.results.forEach((person) => {
    csv += `"${person.name}",${person.totalIncentive.toFixed(2)},${person.packages},${person.sales.toFixed(2)},${person.individualPercent.toFixed(2)},${person.p1.toFixed(2)},${person.p2.toFixed(2)}\n`;
  });

  csv += '\n';
  csv += `Team Target,${data.target}\n`;
  csv += `Team Sales,${data.teamSales.toFixed(2)}\n`;
  csv += `Team Achievement,${data.teamAchievement.toFixed(2)}%\n`;
  csv += `Current Tier,${data.tier.name}\n`;
  csv += `Tier Rate,${data.tier.rate}%\n`;
  csv += `Total Pool,${data.totalPool.toFixed(2)}\n`;
  csv += `Staff Count,${data.staffCount}\n`;

  return csv;
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePDF(data: BulkCalculation, viewTitle: string): jsPDF {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text('Smart Incentive Report', 105, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.text(viewTitle, 105, 25, { align: 'center' });

  let y = 35;

  // Team Summary
  doc.setFontSize(10);
  doc.text(`Team Target: AED ${formatCurrency(data.target)}`, 20, y);
  doc.text(`Team Sales: AED ${formatCurrency(data.teamSales)}`, 20, y + 6);
  doc.text(`Achievement: ${data.teamAchievement.toFixed(2)}%`, 20, y + 12);
  doc.text(`Tier: ${data.tier.name} (${data.tier.rate}%)`, 20, y + 18);
  doc.text(`Total Pool: AED ${formatCurrency(data.totalPool)}`, 20, y + 24);
  doc.text(`Staff Count: ${data.staffCount}`, 20, y + 30);

  y = 75;

  // Top Performers
  doc.setFontSize(12);
  doc.text('Top Performers', 20, y);

  y += 10;
  doc.setFontSize(9);

  data.results.slice(0, 10).forEach((person, index) => {
    const badge = index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`;
    const line = `${badge}. ${person.name} - AED ${formatCurrency(person.totalIncentive)} (Sales: ${formatCurrency(person.sales)})`;
    doc.text(line, 20, y);
    y += 6;
  });

  return doc;
}

export function downloadPDF(doc: jsPDF, filename: string): void {
  doc.save(filename);
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
