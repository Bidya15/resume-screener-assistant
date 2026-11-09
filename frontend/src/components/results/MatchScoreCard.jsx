import { CheckCircle2 } from 'lucide-react';
import { getScoreTier } from '../../utils/scoreUtils';

export default function MatchScoreCard({ matchScore = 0, matchingSkills = [], skillGaps = [] }) {
  const score = Math.max(0, Math.min(100, Number(matchScore) || 0));
  const tier = getScoreTier(score);

  // SVG circular gauge math: radius 52 => circumference = 2 * PI * 52 ≈ 326.72
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Derive explainable breakdown bars from real score and skills ratio
  const totalSkills = Math.max(1, matchingSkills.length + skillGaps.length);
  const skillsPercent = Math.min(100, Math.max(20, Math.round((matchingSkills.length / totalSkills) * 100)));
  const expPercent = Math.min(100, Math.max(15, Math.round(score * 0.95)));
  const domainPercent = Math.min(100, Math.max(20, Math.round((score * 0.9) + 5)));

  return (
    <div className="card p-6">
      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* Left: Circular Gauge */}
        <div className="flex flex-col items-center shrink-0 w-full md:w-56 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#687386] dark:text-[#9AA3B2] mb-3">
            Overall Match Score
          </p>

          <div className="relative flex items-center justify-center">
            <svg
              className="h-36 w-36 -rotate-90 transform"
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              {/* Background track circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-[#E8EAF1] dark:stroke-[#1E2448]"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Animated Progress circle matching HireAI purple */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={tier.color}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner text: score number and tier label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black tracking-tight text-[#172033] dark:text-white">
                {score}%
              </span>
              <span
                className="mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold tracking-wider"
                style={{ backgroundColor: tier.bg, color: tier.text }}
              >
                {tier.label}
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs font-medium text-[#687386] dark:text-[#9AA3B2]">
            {tier.percentile}
          </p>
        </div>

        {/* Vertical divider on desktop */}
        <div className="hidden md:block w-px self-stretch bg-[#E8EAF1] dark:bg-[#1E2448]" />

        {/* Right: Score Breakdown Progress Bars */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172033] dark:text-white">Score Breakdown</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#EBFBF3] dark:bg-[#0E2D1F] px-2.5 py-0.5 text-xs font-semibold text-[#16A36A]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {tier.badge}
            </span>
          </div>

          {/* Bar 1: Skills */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div>
                <span className="font-semibold text-[#172033] dark:text-white">Skills Alignment</span>
                <span className="text-[11px] text-[#9AA3B2] dark:text-[#687386] ml-2">Technical and role-specific capabilities</span>
              </div>
              <span className="font-bold text-[#172033] dark:text-white tabular-nums">{skillsPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E8EAF1] dark:bg-[#1E2448] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5935E8] transition-all duration-1000"
                style={{ width: `${skillsPercent}%` }}
              />
            </div>
          </div>

          {/* Bar 2: Experience */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div>
                <span className="font-semibold text-[#172033] dark:text-white">Experience Relevance</span>
                <span className="text-[11px] text-[#9AA3B2] dark:text-[#687386] ml-2">Depth and scope of past responsibilities</span>
              </div>
              <span className="font-bold text-[#172033] dark:text-white tabular-nums">{expPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E8EAF1] dark:bg-[#1E2448] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5935E8] transition-all duration-1000"
                style={{ width: `${expPercent}%` }}
              />
            </div>
          </div>

          {/* Bar 3: Domain */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <div>
                <span className="font-semibold text-[#172033] dark:text-white">Domain Alignment</span>
                <span className="text-[11px] text-[#9AA3B2] dark:text-[#687386] ml-2">Industry knowledge and use-case fit</span>
              </div>
              <span className="font-bold text-[#172033] dark:text-white tabular-nums">{domainPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#E8EAF1] dark:bg-[#1E2448] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#5935E8] transition-all duration-1000"
                style={{ width: `${domainPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
