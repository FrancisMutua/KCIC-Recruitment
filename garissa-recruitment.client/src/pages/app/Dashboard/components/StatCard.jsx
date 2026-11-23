// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, lightColorClass, chartColor }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
    {/* Accent bar in the logo colours */}
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-green via-brand-lime to-brand-gold opacity-80" aria-hidden="true" />

    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">{value}</p>
      </div>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${lightColorClass}`}>
        <Icon size={24} className={chartColor} />
      </div>
    </div>

    <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">Overall status</p>
  </div>
);

export default StatCard;
