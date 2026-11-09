import { getScoreTier } from '../../utils/scoreUtils';

export default function ScoreBadge({ score }) {
  const tier = getScoreTier(score);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${tier.badgeClass || ''}`}
      style={!tier.badgeClass ? { backgroundColor: tier.bg, color: tier.text } : undefined}
    >
      {score}% • {tier.label}
    </span>
  );
}

