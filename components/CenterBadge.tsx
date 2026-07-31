'use client'
import { getStaffCenterTag } from '@/lib/utils'

interface CenterBadgeProps {
  name: string
  staffCenters?: Record<string, string>
}

// Small "C" / "I" / "D" tag shown next to a staff name, resolved from the
// employee code embedded in that name (see getStaffCenterTag). Renders
// nothing if the name has no code or the code isn't mapped to a center.
export function CenterBadge({ name, staffCenters }: CenterBadgeProps) {
  const tag = getStaffCenterTag(name, staffCenters)
  if (!tag) return null

  return (
    <span style={{
      marginLeft: '6px',
      padding: '1px 6px',
      fontSize: '10px',
      fontWeight: '700',
      color: 'var(--accent-primary)',
      border: '1px solid var(--accent-primary)',
      borderRadius: '4px',
      verticalAlign: 'middle',
      display: 'inline-block',
      lineHeight: '1.4',
    }}>
      {tag}
    </span>
  )
}
