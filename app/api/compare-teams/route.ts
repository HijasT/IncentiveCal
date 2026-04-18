import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/compare-teams
 * Compares two teams and returns insights
 * 
 * Request body:
 * {
 *   teamA: { name: string, calculations: Array<...> },
 *   teamB: { name: string, calculations: Array<...> },
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamA, teamB } = body;

    // Validation
    if (!teamA || !teamB) {
      return NextResponse.json(
        { error: 'Both teams required for comparison' },
        { status: 400 }
      );
    }

    if (!teamA.calculations || !teamB.calculations) {
      return NextResponse.json(
        { error: 'Invalid calculation data' },
        { status: 400 }
      );
    }

    // Calculate metrics for team A
    const metricsA = calculateTeamMetrics(teamA.name, teamA.calculations);

    // Calculate metrics for team B
    const metricsB = calculateTeamMetrics(teamB.name, teamB.calculations);

    // Calculate differences
    const differences = {
      totalSalesDiff: metricsB.totalSales - metricsA.totalSales,
      totalIncentiveDiff: metricsB.totalIncentive - metricsA.totalIncentive,
      avgAchievementDiff: metricsB.averageAchievement - metricsA.averageAchievement,
      avgIncentiveDiff: metricsB.averageIncentive - metricsA.averageIncentive,
      staffCountDiff: metricsB.staffCount - metricsA.staffCount,
    };

    // Generate insights
    const insights = generateInsights(metricsA, metricsB, differences);

    return NextResponse.json(
      {
        success: true,
        comparison: {
          teamA: metricsA,
          teamB: metricsB,
          differences,
          insights,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Team comparison error:', error);
    return NextResponse.json(
      { error: 'Failed to compare teams', details: String(error) },
      { status: 500 }
    );
  }
}

function calculateTeamMetrics(teamName: string, calculations: any[]) {
  if (calculations.length === 0) {
    return {
      teamName,
      staffCount: 0,
      totalSales: 0,
      totalTarget: 0,
      teamAchievement: 0,
      totalIncentive: 0,
      averageIncentive: 0,
      averageAchievement: 0,
    };
  }

  const totalSales = calculations.reduce((sum, c) => sum + c.sales, 0);
  const totalTarget = calculations.reduce((sum, c) => sum + c.target, 0);
  const teamAchievement = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;
  const totalIncentive = calculations.reduce((sum, c) => sum + c.totalIncentive, 0);
  const averageIncentive = totalIncentive / calculations.length;
  const averageAchievement =
    calculations.reduce((sum, c) => sum + c.achievementPercent, 0) / calculations.length;

  return {
    teamName,
    staffCount: calculations.length,
    totalSales: Math.round(totalSales * 100) / 100,
    totalTarget: Math.round(totalTarget * 100) / 100,
    teamAchievement: Number(teamAchievement.toFixed(2)),
    totalIncentive: Math.round(totalIncentive * 100) / 100,
    averageIncentive: Math.round(averageIncentive * 100) / 100,
    averageAchievement: Number(averageAchievement.toFixed(2)),
  };
}

function generateInsights(
  metricsA: any,
  metricsB: any,
  differences: any
): string[] {
  const insights: string[] = [];

  // Sales comparison
  if (Math.abs(differences.totalSalesDiff) > 100000) {
    const leader = differences.totalSalesDiff > 0 ? metricsB.teamName : metricsA.teamName;
    const pctDiff = Math.abs(
      (differences.totalSalesDiff / Math.max(metricsA.totalSales, metricsB.totalSales)) * 100
    ).toFixed(1);
    insights.push(`${leader} has ${pctDiff}% higher sales`);
  }

  // Achievement comparison
  if (Math.abs(differences.avgAchievementDiff) > 5) {
    const leader = differences.avgAchievementDiff > 0 ? metricsB.teamName : metricsA.teamName;
    insights.push(
      `${leader} significantly outperforms on achievement (${differences.avgAchievementDiff > 0 ? metricsB.averageAchievement : metricsA.averageAchievement}% vs ${differences.avgAchievementDiff > 0 ? metricsA.averageAchievement : metricsB.averageAchievement}%)`
    );
  }

  // Team size comparison
  if (differences.staffCountDiff !== 0) {
    const leader = differences.staffCountDiff > 0 ? metricsB.teamName : metricsA.teamName;
    insights.push(`${leader} has ${Math.abs(differences.staffCountDiff)} more staff`);
  }

  // Efficiency comparison
  const efficiencyA =
    metricsA.totalSales > 0 ? (metricsA.totalIncentive / metricsA.totalSales) * 100 : 0;
  const efficiencyB =
    metricsB.totalSales > 0 ? (metricsB.totalIncentive / metricsB.totalSales) * 100 : 0;

  if (Math.abs(efficiencyB - efficiencyA) > 0.1) {
    const leader = efficiencyB > efficiencyA ? metricsB.teamName : metricsA.teamName;
    insights.push(`${leader} has higher incentive efficiency per AED of sales`);
  }

  // Average incentive
  if (differences.avgIncentiveDiff > 0) {
    insights.push(
      `${metricsB.teamName} has higher average incentive per staff (${metricsB.averageIncentive.toFixed(2)} vs ${metricsA.averageIncentive.toFixed(2)})`
    );
  }

  if (insights.length === 0) {
    insights.push('Teams are performing similarly across all metrics');
  }

  return insights;
}
