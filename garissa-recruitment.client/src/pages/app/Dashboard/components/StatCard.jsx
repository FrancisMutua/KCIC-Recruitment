import { 
  IconDots
} from "@tabler/icons-react";

// eslint-disable-next-line no-unused-vars
const StatCard = ({ title, value, icon: Icon, lightColorClass, chartColor }) => (
  <div className="bg-white p-6 rounded-2xl shadow-md shadow-slate-200/50 border border-slate-50 flex flex-col relative overflow-hidden group transition-all duration-300">
    {/* Top-Left Accent Shape */}
    <div className={`absolute top-0 left-6 w-10 h-4 ${lightColorClass} rounded-b-lg opacity-60`}></div>

    {/* Header: Icon + Title + Menu */}
    <div className="flex justify-between items-center mb-6 relative z-10">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-lg ${lightColorClass}`}>
          <Icon size={20} className={`${chartColor}`} />
        </div>
        <h4 className="font-medium text-slate-500 text-sm">{title}</h4>
      </div>
      <button className="text-slate-300 hover:text-slate-500 transition-colors p-1 border border-slate-50 rounded-full">
        <IconDots size={16} />
      </button>
    </div>

    {/* Main Stats: Value */}
    <div className="flex items-center gap-3 mb-1">
      <span className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</span>
    </div>
    
    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Overall status</p>
  </div>
);

export default StatCard;
