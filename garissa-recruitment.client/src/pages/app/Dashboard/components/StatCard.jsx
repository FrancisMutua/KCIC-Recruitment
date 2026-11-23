const TONES = {
  green: "bg-brand-green-50 text-brand-green-600",
  lime: "bg-brand-lime-50 text-brand-forest",
  gold: "bg-brand-gold-50 text-brand-brown-600",
};

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, tone = "green", loading = false }) => (
  <div className="card p-4 sm:p-5">
    <div className="flex items-center justify-between gap-2">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${TONES[tone]}`}><Icon size={18} /></span>
    </div>
    {loading ? (
      <div className="mt-3 h-8 w-12 animate-pulse rounded bg-slate-100" aria-label="Loading" />
    ) : (
      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{Number(value ?? 0).toLocaleString()}</p>
    )}
  </div>
);

export default StatCard;
