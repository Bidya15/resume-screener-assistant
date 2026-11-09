export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-[#F0EDFF] dark:bg-[#2A1F5A]',
  iconColor = 'text-[#5935E8]',
}) {
  return (
    <div className="card p-5 hover:shadow-card-hover transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#9AA3B2] dark:text-[#687386]">
          {title}
        </span>
        {Icon && (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-black text-[#172033] dark:text-white tabular-nums">
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-[#687386] dark:text-[#9AA3B2]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

