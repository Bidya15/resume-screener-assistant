/**
 * Explainable score tier calculation based on the assessment criteria.
 */
export function getScoreTier(score) {
  const num = Number(score) || 0;
  if (num >= 85) {
    return {
      label: 'EXCELLENT MATCH',
      badge: 'Strong Semantic Match',
      color: '#5935E8',
      bg: '#F0EDFF',
      text: '#5935E8',
      badgeClass: 'bg-[#F0EDFF] text-[#5935E8] dark:bg-[#2A1F5A] dark:text-[#C4B5FD]',
      badgeBg: '#EBFBF3',
      badgeText: '#16A36A',
      percentile: 'Top 8% of candidate pool',
    };
  }
  if (num >= 70) {
    return {
      label: 'GOOD MATCH',
      badge: 'Solid Capability Match',
      color: '#16A36A',
      bg: '#EBFBF3',
      text: '#16A36A',
      badgeClass: 'bg-[#EBFBF3] text-[#16A36A] dark:bg-[#064E3B]/60 dark:text-[#6EE7B7]',
      badgeBg: '#EBFBF3',
      badgeText: '#16A36A',
      percentile: 'Top 25% of candidate pool',
    };
  }
  if (num >= 50) {
    return {
      label: 'MODERATE MATCH',
      badge: 'Partial Fit with Gaps',
      color: '#E6A23C',
      bg: '#FEF7EC',
      text: '#E6A23C',
      badgeClass: 'bg-[#FEF7EC] text-[#E6A23C] dark:bg-[#78350F]/50 dark:text-[#FCD34D]',
      badgeBg: '#FEF7EC',
      badgeText: '#E6A23C',
      percentile: 'Average alignment',
    };
  }
  return {
    label: 'LOW MATCH',
    badge: 'Significant Skill Gaps',
    color: '#DC5555',
    bg: '#FDF2F2',
    text: '#DC5555',
    badgeClass: 'bg-[#FDF2F2] text-[#DC5555] dark:bg-[#4C0519]/60 dark:text-[#FDA4AF]',
    badgeBg: '#FDF2F2',
    badgeText: '#DC5555',
    percentile: 'Needs additional qualifications',
  };
}

/**
 * Format timestamp into readable date and time.
 */
export function formatFullDateTime(isoString) {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

