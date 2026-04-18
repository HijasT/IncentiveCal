import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/calculate-bulk
 * Calculates incentives for bulk staff data
 * 
 * Request body:
 * {
 *   staffData: Array<{ name: string, sales: number, target: number }>,
 *   splitEqual: number (0-100),
 *   tiers: Array<{ id: string, name: string, min: number, max: number|null, rate: number }>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { staffData, splitEqual, tiers } = body;

    // Validation
    if (!staffData || !Array.isArray(staffData)) {
      return NextResponse.json(
        { error: 'Invalid staff data format' },
        { status: 400 }
      );
    }

    if (staffData.length === 0) {
      return NextResponse.json(
        { error: 'No staff records provided' },
        { status: 400 }
      );
    }

    if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid tier configuration' },
        { status: 400 }
      );
    }

    if (typeof splitEqual !== 'number' || splitEqual < 0 || splitEqual > 100) {
      return NextResponse.json(
        { error: 'Invalid split percentage' },
        { status: 400 }
      );
    }

    // Validate staff data
    for (const staff of staffData) {
      if (!staff.name || typeof staff.sales !== 'number' || typeof staff.target !== 'number') {
        return NextResponse.json(
          { error: 'Invalid staff record format' },
          { status: 400 }
        );
      }

      if (staff.sales < 0 || staff.target < 0) {
        return NextResponse.json(
          { error: 'Negative values not allowed' },
          { status: 400 }
        );
      }
    }

    // Calculate total team sales
    const teamTotalSales = staffData.reduce((sum, s) => sum + s.sales, 0);
    const splitPersonal = 100 - splitEqual;

    // Calculate incentives for each staff
    const calculations = staffData.map((staff) => {
      const achievementPercent = staff.target > 0 ? (staff.sales / staff.target) * 100 : 0;

      // Find tier
      let selectedTier = null;
      for (const tier of tiers) {
        if (
          achievementPercent >= tier.min &&
          (tier.max === null || achievementPercent <= tier.max)
        ) {
          selectedTier = tier;
          break;
        }
      }

      if (!selectedTier) {
        return {
          staffName: staff.name,
          sales: staff.sales,
          target: staff.target,
          achievementPercent: Number(achievementPercent.toFixed(2)),
          tierName: null,
          baseIncentive: 0,
          p1Share: 0,
          p2Share: 0,
          totalIncentive: 0,
        };
      }

      const baseIncentive = (selectedTier.rate / 100) * staff.sales;
      const p1Share = (baseIncentive * splitEqual) / 100;
      const salesContribution = teamTotalSales > 0 ? staff.sales / teamTotalSales : 0;
      const p2Share = (baseIncentive * splitPersonal) / 100 * salesContribution;
      const totalIncentive = p1Share + p2Share;

      return {
        staffName: staff.name,
        sales: Math.round(staff.sales * 100) / 100,
        target: Math.round(staff.target * 100) / 100,
        achievementPercent: Number(achievementPercent.toFixed(2)),
        tierName: selectedTier.name,
        baseIncentive: Math.round(baseIncentive * 100) / 100,
        p1Share: Math.round(p1Share * 100) / 100,
        p2Share: Math.round(p2Share * 100) / 100,
        totalIncentive: Math.round(totalIncentive * 100) / 100,
      };
    });

    // Sort by total incentive descending
    calculations.sort((a, b) => b.totalIncentive - a.totalIncentive);

    // Calculate summary statistics
    const totalSales = calculations.reduce((sum, c) => sum + c.sales, 0);
    const totalIncentive = calculations.reduce((sum, c) => sum + c.totalIncentive, 0);
    const avgAchievement =
      calculations.reduce((sum, c) => sum + c.achievementPercent, 0) / calculations.length;

    return NextResponse.json(
      {
        success: true,
        calculations,
        summary: {
          totalStaff: calculations.length,
          totalSales: Math.round(totalSales * 100) / 100,
          totalIncentive: Math.round(totalIncentive * 100) / 100,
          avgAchievement: Number(avgAchievement.toFixed(2)),
          avgIncentive: Math.round((totalIncentive / calculations.length) * 100) / 100,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate incentives', details: String(error) },
      { status: 500 }
    );
  }
}
